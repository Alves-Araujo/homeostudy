# Homeostudy

**No ar em https://alves-araujo.github.io/homeostudy/**

Site de estudo gerado a partir dos PDFs das aulas. Cada matéria é uma pasta na
raiz do projeto; cada PDF dentro dela vira uma aula no site, com o texto e as
figuras do próprio material, mais três blocos de exercícios. No fim da página de
cada matéria há um simulado de 30 questões (25 de múltipla escolha + 5 abertas).

## Quando o PDF veio incompleto

Se o download do Canva salvou só a capa, dá para escrever o conteúdo à mão num
arquivo `.md` dentro da pasta da matéria. Cada aula é uma seção `# <nome do
arquivo>.pdf`, e dentro dela `## <título>` vira seção e `- item` vira lista:

```markdown
# Homeostase (1).pdf

## Compartimentos líquidos
O LIC corresponde a 2/3 da água corporal...
- LIC: 2/3
- LEC: 1/3
```

`montar.py` usa esse texto só quando o PDF não tem texto próprio
(`Pequenos grupos/Transcricao_Completa_PDFs.md` já cobre quatro aulas).

## O que não está no repositório

Os PDFs das aulas, os `src/dados-*.js` e o `site.html` ficam fora do Git: são o
material do curso (texto e figuras dos slides) e passam de 350 MB. O repositório
guarda só o programa. Para montar o site você precisa das pastas das matérias
com os PDFs ao lado do `build/`, e então rodar os dois comandos abaixo.

## Como adicionar ou atualizar material

1. Coloque o PDF na pasta da matéria (`Anatomia/`, `Bioquímica/`,
   `Grandes Grupos/`, `Histologia/`, `Pequenos grupos/`).
2. Regere os dados e o site:

   ```sh
   python build/montar.py     # lê os PDFs → src/dados-<materia>.js
   sh src/build.sh            # junta os fontes → site.html
   ```

3. Publique:

   ```sh
   sh src/publicar.sh         # envia o site para o GitHub Pages
   ```

## Onde o site fica publicado

Em dois lugares, a partir do mesmo `site.html`:

| endereço | quem abre | tira-dúvidas |
|---|---|---|
| [alves-araujo.github.io/homeostudy](https://alves-araujo.github.io/homeostudy/) | qualquer pessoa, sem login | não |
| Artifact no claude.ai | quem tiver o link e estiver logado | sim |

O tira-dúvidas depende da IA da Claude (`claude.use('sample')`), que só existe
dentro do claude.ai. Fora dali o site detecta a ausência e mostra um link para a
outra versão; todo o resto — conteúdo, figuras, exercícios, dicas, gabaritos e
correção — roda offline, sem conta nenhuma.

O GitHub Pages serve a branch `gh-pages`, que tem só o `index.html` montado. A
`main` continua sendo o código. É o `src/publicar.sh` que cuida dessa separação:
ele monta o commit da `gh-pages` com comandos de baixo nível do git, sem trocar
a sua branch atual nem tocar nos arquivos que você está editando.

Para atualizar o Artifact, peça ao Claude Code — precisa estar logado com a
conta claude.ai (sem `ANTHROPIC_BASE_URL`/`ANTHROPIC_AUTH_TOKEN` no
`~/.claude/settings.json`).

O `montar.py` precisa de `pymupdf` e `pillow`:

```sh
python3 -m venv venv && ./venv/bin/pip install pymupdf pillow
./venv/bin/python build/montar.py
```

## Estrutura

```
Homeostudy/
├── Anatomia/ Bioquímica/ Grandes Grupos/ Histologia/ Pequenos grupos/
│                          PDFs das aulas — a fonte de tudo
├── build/
│   ├── montar.py           extrai texto e figuras dos PDFs
│   └── extraido/           dump intermediário (texto + imagens soltas)
├── src/
│   ├── 01-shell.html       CSS, paleta, cabeçalho e rodapé
│   ├── dados-*.js          conteúdo e figuras de cada matéria (gerados)
│   ├── exercicios-1..3.js  questões por aula (escritas à mão)
│   ├── simulado-1..5.js    simulado de cada matéria, 30 questões cada
│   ├── 06-app.js           navegação, quiz, correção e tira-dúvidas
│   ├── build.sh            junta tudo em site.html
│   └── publicar.sh         envia o site.html para o GitHub Pages
└── site.html               arquivo publicado (não edite: é gerado)
```

Edite `src/`, nunca `site.html` — ele é sobrescrito a cada build.
Os arquivos `dados-*.js` também são gerados: para mudar conteúdo, troque o PDF.

## Onde mexer nos exercícios

Em `src/exercicios-1.js` a `exercicios-3.js`, indexados por
`'<matéria>/<slug-da-aula>'`. Os slugs saem do nome do arquivo PDF e aparecem
na URL do site (`#a/histologia/sistema-respiratorio/exercicios/ia`).

Formato de cada questão:

```js
// múltipla escolha
{t:'me', f:'fonte', e:'enunciado', a:['alt A','alt B'], ok:1,
 d:'dica', w:'comentário do gabarito'}

// aberta, corrigida por critérios
{t:'ab', e:'enunciado', d:'dica', g:'gabarito completo',
 c:[{p:'ponto esperado', k:['palavra','sinônimo']}]}
```

A correção da questão aberta procura as palavras de `k` no texto digitado,
ignorando acentos e maiúsculas, e marca o ponto como atingido.

Os simulados usam o mesmo formato, em `src/simulado-1.js` a `simulado-5.js`,
indexados só pela matéria (`SIM['histologia'] = [ ... ]`). São arrays de 30
questões; `simulado-1.js` declara `window.SIM` e por isso vem primeiro no
`build.sh`. A rota é `#sim/<matéria>`.

## Limites conhecidos

- **Imagens**: só entram as do próprio material. O limite da página publicada é
  16 MB, então `montar.py` seleciona as maiores figuras de cada aula
  (`LARG_MAX`, `QUALIDADE` e o teto por aula ficam no topo do arquivo).
- **PDFs incompletos**: cinco arquivos vieram com 2 a 4 páginas e nenhum texto —
  o download do Canva salvou só a capa. Quatro já foram recuperados pelo `.md`
  de transcrição; só `Grandes Grupos/Grandes Grupos .pdf` continua incompleto e
  aparece marcado na lista da matéria.
- **PDFs digitalizados** (Urinálise, Anotações da UC IV): não têm texto
  selecionável, então cada página vira uma imagem.
- **Tira-dúvidas**: é o único recurso que depende de IA ao vivo e da conta de
  quem abre a página. Todo o resto — conteúdo, figuras, exercícios, dicas e
  correção — funciona offline, sem login.
