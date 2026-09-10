"""
Homeostudy — pipeline de conteúdo.

Lê os PDFs de cada pasta de matéria, limpa o texto dos slides, escolhe as
figuras mais didáticas e gera src/dados-<materia>.js com tudo embutido
(as imagens viram data URI porque o Artifact bloqueia hosts externos).

Uso:  build/montar.py            (via o venv com pymupdf + pillow)
"""
import pymupdf, os, glob, json, hashlib, io, re, base64, unicodedata
from PIL import Image

RAIZ = '/Users/ms.andre/Projects/Homeostudy'
SRC  = os.path.join(RAIZ, 'src')

MATERIAS = [
    ('pequenos-grupos', 'Pequenos grupos'),
    ('anatomia',        'Anatomia'),
    ('histologia',      'Histologia'),
    ('grandes-grupos',  'Grandes Grupos'),
    ('bioquimica',      'Bioquímica'),
]

# ─── figuras ────────────────────────────────────────────────────────────
MIN_LADO   = 200
MIN_PIXELS = 110_000
ASPECTO    = (0.22, 4.6)     # descarta faixas e colunas decorativas
LARG_MAX   = 660
QUALIDADE  = 64
LARG_SCAN  = 820             # PDFs que são só imagem: renderiza a página
QUAL_SCAN  = 66
MAX_SCAN   = 16              # teto de páginas renderizadas por PDF escaneado

# arquivos que não são material de estudo.
# 'Grandes Grupos' é o download do Canva que salvou só a capa: 2 páginas, zero
# texto — aparecia na lista como uma aula que não existe.
IGNORAR = {'Programação UC IV', 'Puran', 'Grandes Grupos'}

# nomes de arquivo genéricos → título real da aula, tema na grade e avisos
TITULOS = {
 'pequenos-grupos--grupo-2-1':   ('Sinais Vitais e Exame Físico Cardiovascular', 'Cardiovascular · Tema 4'),
 'pequenos-grupos--grupo-2':     ('Sinais Clínicos de Alterações Respiratórias, Renais e Digestivas', 'Resp./Renal/Digestório · Tema 4'),
 'pequenos-grupos--grupo-2-2':   ('Glândulas e seus Hormônios', 'Sistema endócrino · Tema 1'),
 'acidose-metabolica-queda-do-ph-735-por-acumulo-de-acidos':
                                 ('Regulação do Equilíbrio Ácido-Base e Hidroeletrolítico', 'Resp./Renal/Digestório · Tema 2'),
 'sistema-nervoso-como-integrador-da-homeostase':
                                 ('Sistema Nervoso como Integrador da Homeostase', 'Laboratório morfofuncional'),
 'sistemas-respiratorio-renal-e-digestorio':
                                 ('Sistemas Respiratório, Renal e Digestório', 'Laboratório morfofuncional'),
 'histologia-relacionada-ao-ritmo-circadiano':
                                 ('Histologia do Ritmo Circadiano', 'Laboratório morfofuncional'),
 'histologia-renal-no-equilibrio-hidroeletrolitico':
                                 ('Histologia Renal no Equilíbrio Hidroeletrolítico', 'Laboratório morfofuncional'),
 'regulacao-da-temperatura-corporal':
                                 ('Hipotálamo, Vasos e Pele na Regulação da Temperatura', 'Laboratório morfofuncional'),
 'sistema-respiratorio':         ('Histologia do Sistema Respiratório', 'Laboratório morfofuncional'),
 'fisiologia-digestiva':         ('Fisiologia Digestiva e Metabolismo Integrado', 'Aula do Prof. Ronaldo Baganha'),
 'sistema-cardiovascular':       ('Sistema Cardiovascular', 'Integração morfofuncional'),
 'sistema-endocrino':            ('Sistema Endócrino', 'Integração morfofuncional'),
 'sistema-endocrino-e-eixos-hormonais': ('Sistema Endócrino e Eixos Hormonais', 'Aula do Prof. Ronaldo Baganha'),
 'homeostase':                   ('Integração Estrutural e Homeostase', 'Tecidos epitelial, conjuntivo e glandular'),
 'Red and Beige Modern Medical Professional Cardiovascular Presentation':
                                 ('Anatomia e Fisiologia do Coração e Vasos', 'Cardiovascular · Tema 1'),
 'Osmolaridade-Temperatura-e-pH (1)': ('Controle do Meio Interno: Osmolaridade, Temperatura e pH', 'Homeostase · Tema 3'),
 'Mecanismos de ação hormonal e retroalimentação -UC 1, SEMANA 2':
                                 ('Mecanismos de Ação Hormonal e Retroalimentação', 'Sistema endócrino · Tema 2'),
 'Funções do organismo':         ('Funções do Organismo e Homeostase', 'Homeostase · Tema 1'),
 'Homeostase e Integração dos Sistemas': ('Homeostase e Integração dos Sistemas', 'Homeostase · fechamento'),
 'Homeostase e Integração dos Sistemas (1)': ('Homeostase e Integração dos Sistemas', 'Aula do Prof. Ronaldo Baganha'),
 'UC 4_260908_172832':           ('Anotações da UC IV', 'Fotos de aula digitalizadas'),
 'Siatema Cardiovascular':       ('Histologia Cardiovascular', 'Laboratório morfofuncional'),
 'Atividade Bioquímica - Paola': ('Atividade de pH e Equilíbrio Ácido-Base', 'Lista de exercícios da disciplina'),
 'Colesterol':                   ('Colesterol e o Estudo de Framingham', 'Bioquímica clínica'),
 'Urinálise':                    ('Urinálise', 'Slides digitalizados'),
 'Feedback (2)':                 ('Feedback', 'PDF incompleto'),
 'Homeostase (1)':               ('Homeostase', 'PDF incompleto'),
 'Sistema Cardiovascular (3)':   ('Sistema Cardiovascular', 'PDF incompleto'),
 'Sistemas respiratório, renal e digestório (4)': ('Sistemas Respiratório, Renal e Digestório', 'PDF incompleto'),
}


def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^\w\s-]', '', s).strip().lower()
    return re.sub(r'[\s_]+', '-', s)[:56].strip('-')


# ─── leitura estruturada dos slides ────────────────────────────────────
LIXO = re.compile(r'^(?:\d{1,3}|\d{2}/\d{2}/\d{4}|[ivxIVX]{1,5}|[-–—•·]+)$')
MARCADOR = re.compile(r'^[•·▪◦‣●○–-]\s+')
FIM_FRASE = re.compile(r'[.:;!?]$')

# uma linha de alternativas ("A) 1  B) 2  C) 3") ou um enunciado numerado
ALTERNATIVA = re.compile(r'^[A-Ea-e]\)\s')
ENUNCIADO = re.compile(r'^Quest(ão|ao)\s*\d+', re.I)
# começa em minúscula: é continuação da linha anterior, não frase nova
CONTINUA = re.compile(r'^[a-zàáâãéêíóôõúç(]')


def parece_titulo_em_caixa_alta(txt):
    """`str.isupper()` mente para fórmulas e gabaritos.

    "CO₂ + H₂O ⇌ H₂CO₃" e "A) 1  B) 2  C) 3" respondem True porque dígitos,
    parênteses e subscritos não têm caixa — só as poucas letras contam. Um
    título de verdade é majoritariamente feito de letras.
    """
    if not txt.isupper() or len(txt) <= 3:
        return False
    if ALTERNATIVA.match(txt):
        return False
    letras = sum(c.isalpha() for c in txt)
    return letras >= 4 and letras / len(txt) >= 0.55


def blocos_brutos(pg):
    """Lê a página como blocos, preservando o tamanho de fonte de cada linha.

    Usar a estrutura do PDF (e não só as quebras de linha) é o que evita
    picotar um título longo em vários pedaços.
    """
    try:
        dados = pg.get_text('dict')
    except Exception:
        return [], 12.0

    tamanhos, blocos = [], []
    for bl in dados.get('blocks', []):
        if bl.get('type') != 0:
            continue
        linhas = []
        for ln in bl.get('lines', []):
            txt = ''.join(sp.get('text', '') for sp in ln.get('spans', []))
            txt = txt.replace('\xa0', ' ').strip()
            if not txt or LIXO.match(txt) or re.fullmatch(r'\d{2}/\d{2}/\d{4}\s*\d*', txt):
                continue
            tam = max((sp.get('size', 0) for sp in ln.get('spans', [])), default=0)
            tamanhos += [round(tam, 1)] * len(txt)
            linhas.append({'x': txt, 'tam': tam})
        if linhas:
            bb = bl.get('bbox', [0, 0, 0, 0])
            blocos.append({'linhas': linhas, 'x0': bb[0], 'y': bb[1],
                           'tam': max(l['tam'] for l in linhas)})

    ordenar_por_coluna(blocos)
    tamanhos.sort()
    corpo = tamanhos[len(tamanhos) // 2] if tamanhos else 12.0
    return blocos, corpo


def ordenar_por_coluna(blocos):
    """Ordena os blocos na ordem de leitura, respeitando colunas.

    Slides do Gamma e do Canva usam duas ou tres colunas lado a lado; ordenar
    so pela altura embaralharia as frases de colunas diferentes.
    """
    if not blocos:
        return
    xs = sorted({round(b['x0']) for b in blocos})
    grupos = []
    for x in xs:
        if grupos and x - grupos[-1][-1] <= 40:
            grupos[-1].append(x)
        else:
            grupos.append([x])
    coluna = {x: i for i, g in enumerate(grupos) for x in g}
    blocos.sort(key=lambda b: (coluna[round(b['x0'])], b['y']))


def unir_linhas(linhas):
    """Junta linhas quebradas pelo layout, mantendo marcadores separados."""
    saida = []
    for ln in linhas:
        marcador = bool(MARCADOR.match(ln['x']))
        texto = MARCADOR.sub('', ln['x']).strip()
        if not texto:
            continue
        if saida and not marcador:
            ant = saida[-1]
            mesmo_tam = abs(ant['tam'] - ln['tam']) < 0.6
            # Dentro de um bloco, uma linha que começa em minúscula é sempre a
            # continuação da anterior — mesmo em corpo diferente, como no
            # "Questão 1 —" em negrito seguido do enunciado em tamanho normal.
            continuacao = mesmo_tam or CONTINUA.match(texto)
            if not FIM_FRASE.search(ant['x']) and continuacao:
                ant['x'] = (ant['x'] + ' ' + texto).strip()
                continue
        saida.append({'m': marcador, 'x': texto, 'tam': ln['tam']})
    return saida


def eh_lista_de_exercicios(secoes):
    """O PDF é a própria prova, não material de estudo?

    Reconhece pelos enunciados numerados somados às linhas de alternativas —
    dois ou três "Questão N" perdidos no meio de uma aula não bastam.
    """
    enunciados = alternativas = 0
    for sec in secoes:
        for bl in sec['b']:
            for txt in (bl['x'] if bl['t'] == 'ul' else [bl['x']]):
                if ENUNCIADO.match(txt):
                    enunciados += 1
                if ALTERNATIVA.match(txt):
                    alternativas += 1
    return enunciados >= 4 and alternativas >= enunciados


def secoes_da_pagina(pg):
    """Devolve a página como uma lista de seções {h, b:[{t,x}]}."""
    blocos, corpo = blocos_brutos(pg)
    secoes, atual = [], {'h': None, 'b': []}

    def fechar():
        if atual['h'] or atual['b']:
            secoes.append({'h': atual['h'], 'b': atual['b']})

    anterior = None
    for bl in blocos:
        itens = unir_linhas(bl['linhas'])
        if not itens:
            continue
        # Frase que vazou de um bloco para o seguinte, na mesma coluna.
        # A margem de x0 é estreita para rótulos soltos de diagrama (que não
        # devem virar frase) e larga quando o texto anterior já é uma frase
        # longa cortada no meio — aí a continuação é praticamente certa.
        if anterior and atual['b'] and atual['b'][-1]['t'] == 'p':
            resto = atual['b'][-1]['x']
            frase_longa = len(resto) >= 40 and CONTINUA.match(itens[0]['x'] or ' ')
            margem = 30 if frase_longa else 8
            vazou = (not itens[0]['m'] and abs(bl['x0'] - anterior['x0']) < margem
                     and abs(bl['tam'] - anterior['tam']) < 0.6
                     and not FIM_FRASE.search(resto))
        else:
            vazou = False
        if vazou:
            atual['b'][-1]['x'] = (atual['b'][-1]['x'] + ' ' + itens[0]['x']).strip()
            itens = itens[1:]
            anterior = bl
            if not itens:
                continue
        anterior = bl
        primeiro = itens[0]
        grande = bl['tam'] >= corpo * 1.14
        caixa_alta = parece_titulo_em_caixa_alta(primeiro['x'])
        curto = len(primeiro['x']) <= 96
        # gabarito e enunciado de questão nunca são título de seção
        de_prova = ALTERNATIVA.match(primeiro['x']) or ENUNCIADO.match(primeiro['x'])
        # o bloco começa com título quando a primeira linha se destaca
        if (not primeiro['m'] and curto and (grande or caixa_alta) and not de_prova
                and not FIM_FRASE.search(primeiro['x'].rstrip(':'))):
            fechar()
            atual = {'h': primeiro['x'].rstrip(' :'), 'b': []}
            itens = itens[1:]

        lista = []
        for it in itens:
            if it['m']:
                lista.append(it['x'])
                continue
            if lista:
                atual['b'].append({'t': 'ul', 'x': lista}); lista = []
            atual['b'].append({'t': 'p', 'x': it['x']})
        if lista:
            atual['b'].append({'t': 'ul', 'x': lista})
    fechar()

    # título isolado num bloco + texto isolado no bloco seguinte viram um só
    juntas = []
    for sec in secoes:
        if (juntas and juntas[-1]['h'] and not juntas[-1]['b']
                and not sec['h'] and sec['b']):
            juntas[-1]['b'] = sec['b']
            continue
        juntas.append(sec)
    secoes = juntas

    # remove seções repetidas na mesma página (exports duplicam títulos)
    limpas, vistos = [], set()
    for s in secoes:
        chave = (s['h'] or '') + '|' + '|'.join(
            b['x'] if b['t'] == 'p' else ' '.join(b['x']) for b in s['b'])
        if chave in vistos or not chave.strip('|'):
            continue
        vistos.add(chave)
        limpas.append(s)
    return limpas


# ─── imagens ────────────────────────────────────────────────────────────
def para_jpeg(img, larg, qual):
    if img.mode in ('RGBA', 'LA', 'P'):
        fundo = Image.new('RGB', img.size, (255, 255, 255))
        img = img.convert('RGBA')
        fundo.paste(img, mask=img.split()[-1])
        img = fundo
    else:
        img = img.convert('RGB')
    if img.width > larg:
        img = img.resize((larg, max(1, round(img.height * larg / img.width))), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, 'JPEG', quality=qual, optimize=True, progressive=True)
    return buf.getvalue(), img.width, img.height


def uri(dados):
    return 'data:image/jpeg;base64,' + base64.b64encode(dados).decode()


def figuras_do_doc(doc, texto_total, titulos_por_pagina, teto):
    """Devolve as melhores figuras. Se o PDF é só imagem, renderiza as páginas."""
    if texto_total < 600:                       # slide escaneado: a página é a figura
        out = []
        passo = max(1, round(doc.page_count / MAX_SCAN))
        for n, pg in enumerate(doc, 1):
            if (n - 1) % passo:
                continue
            pm = pg.get_pixmap(dpi=110)
            img = Image.open(io.BytesIO(pm.tobytes('png')))
            b, w, h = para_jpeg(img, LARG_SCAN, QUAL_SCAN)
            out.append({'src': uri(b), 'pag': n, 'w': w, 'h': h, 'kb': len(b) / 1024,
                        'leg': f'Slide {n} do material'})
        return out

    cand, vistos = [], set()
    for n, pg in enumerate(doc, 1):
        for im in pg.get_images(full=True):
            try:
                cru = doc.extract_image(im[0])
            except Exception:
                continue
            w, h = cru['width'], cru['height']
            if w < MIN_LADO or h < MIN_LADO or w * h < MIN_PIXELS:
                continue
            if not (ASPECTO[0] <= w / h <= ASPECTO[1]):
                continue
            dig = hashlib.md5(cru['image']).hexdigest()[:12]
            if dig in vistos:
                continue
            vistos.add(dig)
            cand.append({'pag': n, 'bytes': cru['image'], 'area': w * h, 'dig': dig})

    cand.sort(key=lambda c: -c['area'])
    escolhidas, por_pagina = [], {}
    for c in cand:
        if len(escolhidas) >= teto:
            break
        if por_pagina.get(c['pag'], 0) >= 2:     # espalha pelas páginas
            continue
        try:
            img = Image.open(io.BytesIO(c['bytes']))
            b, w, h = para_jpeg(img, LARG_MAX, QUALIDADE)
        except Exception:
            continue
        por_pagina[c['pag']] = por_pagina.get(c['pag'], 0) + 1
        escolhidas.append({'src': uri(b), 'pag': c['pag'], 'w': w, 'h': h, 'kb': len(b) / 1024,
                           'leg': titulos_por_pagina.get(c['pag']) or f'Material, página {c["pag"]}'})
    escolhidas.sort(key=lambda f: f['pag'])
    return escolhidas


# ─── transcrições complementares (.md) ─────────────────────────────────
def carregar_transcricoes():
    """Lê os .md das pastas e devolve {nome-do-pdf: [seções]}.

    Serve para os PDFs que vieram só com a capa: o texto das aulas foi
    transcrito à mão e mora num arquivo markdown ao lado deles.
    """
    fonte = {}
    for pasta in [p for _, p in MATERIAS]:
        for caminho in sorted(glob.glob(os.path.join(RAIZ, pasta, '*.md'))):
            bruto = unicodedata.normalize('NFC', open(caminho, encoding='utf-8').read())
            atual = None
            for parte in re.split(r'^#\s+', bruto, flags=re.M)[1:]:
                linhas = parte.split('\n')
                nome = linhas[0].strip()
                if nome.lower().endswith('.pdf'):
                    nome = nome[:-4].strip()
                fonte[nome] = secoes_do_md(linhas[1:])
            del atual
    return fonte


def secoes_do_md(linhas):
    """Converte o texto corrido do markdown em seções {h, b}."""
    secoes, atual = [], {'h': None, 'b': []}
    lista = []

    def fecha_lista():
        nonlocal lista
        if lista:
            atual['b'].append({'t': 'ul', 'x': lista})
            lista = []

    def fecha_secao():
        fecha_lista()
        if atual['h'] or atual['b']:
            secoes.append({'h': atual['h'], 'b': atual['b'], 'p': 1})

    limpas = [l.rstrip() for l in linhas if l.strip() not in ('', '---')]
    for i, ln in enumerate(limpas):
        marcador = bool(re.match(r'^\s*(?:[•·▪-]|->|→)\s*', ln))
        texto = re.sub(r'^\s*(?:[•·▪-]|->|→)\s*', '', ln).strip()
        if not texto:
            continue
        prox = limpas[i + 1] if i + 1 < len(limpas) else ''
        titulo = (not marcador and len(texto) <= 68 and not texto.endswith(('.', ',', ':'))
                  and len(prox.strip()) > len(texto) + 10)
        if titulo:
            fecha_secao()
            atual = {'h': texto, 'b': []}
            continue
        if marcador:
            lista.append(texto)
            continue
        fecha_lista()
        atual['b'].append({'t': 'p', 'x': texto})
    fecha_secao()
    return secoes


# ─── montagem ───────────────────────────────────────────────────────────
def main():
    os.makedirs(SRC, exist_ok=True)
    transcricoes = carregar_transcricoes()
    if transcricoes:
        print('Transcrições .md encontradas: ' + ', '.join(sorted(transcricoes)) + '\n')
    resumo = []
    for chave, pasta in MATERIAS:
        aulas, usados = [], set()
        for caminho in sorted(glob.glob(os.path.join(RAIZ, pasta, '*.pdf'))):
            nome = unicodedata.normalize('NFC', os.path.basename(caminho)[:-4]).strip()
            if nome in IGNORAR:
                continue
            try:
                doc = pymupdf.open(caminho)
            except Exception as e:
                print(f'!! {nome}: {e}')
                continue

            sl = slug(nome) or 'aula'
            base = sl
            k = 2
            while sl in usados:
                sl = f'{base}-{k}'
                k += 1
            usados.add(sl)

            secoes, titulos_pag, total = [], {}, 0
            for n, pg in enumerate(doc, 1):
                total += len(pg.get_text().strip())
                for sec in secoes_da_pagina(pg):
                    sec['p'] = n
                    secoes.append(sec)
                    if sec['h'] and n not in titulos_pag:
                        titulos_pag[n] = sec['h']

            if not secoes and nome in transcricoes:
                secoes = [dict(sec) for sec in transcricoes[nome]]
                total = sum(len(b.get('x', '')) for sec in secoes for b in sec['b'])
                print(f'   ↳ texto de {nome} veio da transcrição .md')

            teto = min(6, max(3, round(doc.page_count / 4.5)))
            figs = figuras_do_doc(doc, total, titulos_pag, teto)

            chave_tit = sl if sl in TITULOS else nome
            titulo, tema = TITULOS.get(chave_tit, TITULOS.get(nome, (nome, '')))
            incompleto = tema == 'PDF incompleto' and not secoes
            if secoes and tema == 'PDF incompleto':
                tema = 'Transcrição do grupo'
            aula = {'slug': sl, 'titulo': titulo, 'arquivo': nome + '.pdf', 'tema': tema,
                    'paginas': doc.page_count, 'secoes': secoes, 'figuras': figs,
                    'incompleto': incompleto}
            if eh_lista_de_exercicios(secoes):
                # o PDF é a própria prova: mostrar como "conteúdo" só repete as
                # questões picotadas, então o site manda para a aba Exercícios
                aula['prova'] = True
            aulas.append(aula)
            kb = sum(f['kb'] for f in figs)
            resumo.append((pasta, nome, doc.page_count, len(secoes), len(figs), kb))
            print(f'{pasta[:15]:<16} {nome[:42]:<44} {doc.page_count:>3}p {len(secoes):>4} seções {len(figs):>3} figs {kb:>7.0f} KB')

        for a in aulas:
            for f in a['figuras']:
                f.pop('kb', None)
        arq = os.path.join(SRC, f'dados-{chave}.js')
        with open(arq, 'w') as f:
            f.write('<script>\nwindow.MATERIAL = window.MATERIAL || {};\n')
            f.write(f'window.MATERIAL[{json.dumps(chave)}] = ')
            json.dump({'nome': pasta, 'aulas': aulas}, f, ensure_ascii=False, separators=(',', ':'))
            f.write(';\n</script>\n')
        print(f'   → {arq}  {os.path.getsize(arq)/1024/1024:.2f} MB\n')

    print(f'\nTOTAL imagens: {sum(r[5] for r in resumo)/1024:.1f} MB em {sum(r[4] for r in resumo)} figuras')


if __name__ == '__main__':
    main()
