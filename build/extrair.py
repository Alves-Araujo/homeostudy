"""Extrai texto e imagens dos PDFs do material para build/extraido/."""
import pymupdf, os, glob, json, hashlib, io, re
from PIL import Image

RAIZ  = '/Users/ms.andre/Projects/Homeostudy'
SAIDA = os.path.join(RAIZ, 'build', 'extraido')
PASTAS = ['Pequenos grupos', 'Anatomia', 'Grandes Grupos', 'Histologia', 'Bioquímica']

MIN_LADO   = 190     # descarta ícones e bullets decorativos
MIN_PIXELS = 90_000  # descarta faixas finas e divisórias
LARG_MAX   = 1000    # redimensiona para caber no artefato

def slug(s):
    s = re.sub(r'[^\w\s-]', '', s, flags=re.U).strip().lower()
    return re.sub(r'[\s_]+', '-', s)[:60]

os.makedirs(SAIDA, exist_ok=True)
indice, vistos = [], {}

for pasta in PASTAS:
    for caminho in sorted(glob.glob(os.path.join(RAIZ, pasta, '*.pdf'))):
        nome = os.path.basename(caminho)[:-4]
        sl   = slug(nome)
        dest = os.path.join(SAIDA, slug(pasta), sl)
        os.makedirs(os.path.join(dest, 'img'), exist_ok=True)
        try:
            doc = pymupdf.open(caminho)
        except Exception as e:
            print(f'!! {nome}: {e}'); continue

        paginas, figuras = [], []
        for n, pg in enumerate(doc, 1):
            paginas.append({'p': n, 'txt': pg.get_text().strip()})
            for im in pg.get_images(full=True):
                try:
                    bruto = doc.extract_image(im[0])
                except Exception:
                    continue
                w, h = bruto['width'], bruto['height']
                if w < MIN_LADO or h < MIN_LADO or w * h < MIN_PIXELS:
                    continue
                dig = hashlib.md5(bruto['image']).hexdigest()[:12]
                if dig in vistos:            # mesma figura repetida no PDF
                    continue
                vistos[dig] = True
                try:
                    img = Image.open(io.BytesIO(bruto['image']))
                    if img.mode in ('RGBA', 'LA', 'P'):
                        fundo = Image.new('RGB', img.size, (255, 255, 255))
                        img = img.convert('RGBA')
                        fundo.paste(img, mask=img.split()[-1])
                        img = fundo
                    else:
                        img = img.convert('RGB')
                    if img.width > LARG_MAX:
                        img = img.resize((LARG_MAX, round(img.height * LARG_MAX / img.width)), Image.LANCZOS)
                    arq = f'{dig}.jpg'
                    img.save(os.path.join(dest, 'img', arq), 'JPEG', quality=72, optimize=True)
                    figuras.append({'arq': arq, 'pag': n, 'w': img.width, 'h': img.height,
                                    'kb': round(os.path.getsize(os.path.join(dest, 'img', arq)) / 1024, 1)})
                except Exception:
                    continue

        with open(os.path.join(dest, 'texto.json'), 'w') as f:
            json.dump({'nome': nome, 'pasta': pasta, 'paginas': paginas, 'figuras': figuras}, f, ensure_ascii=False, indent=1)
        chars = sum(len(p['txt']) for p in paginas)
        indice.append({'pasta': pasta, 'nome': nome, 'slug': sl, 'paginas': len(paginas),
                       'chars': chars, 'figuras': len(figuras),
                       'kb_img': round(sum(f['kb'] for f in figuras), 1)})
        print(f'{pasta[:16]:<17} {nome[:44]:<46} {len(paginas):>3}p  {chars:>6}ch  {len(figuras):>3} figs  {round(sum(f["kb"] for f in figuras)):>5} KB')

with open(os.path.join(SAIDA, 'indice.json'), 'w') as f:
    json.dump(indice, f, ensure_ascii=False, indent=1)
print(f'\nTOTAL: {sum(i["figuras"] for i in indice)} figuras · {round(sum(i["kb_img"] for i in indice)/1024,1)} MB · {sum(i["chars"] for i in indice)} caracteres')
