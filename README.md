<p align="center">
  <img src="./assets/banner.svg" width="100%" alt="Homeostudy" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-0D1117?style=for-the-badge&logo=javascript&logoColor=F7DF1E" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Python-0D1117?style=for-the-badge&logo=python&logoColor=3776AB" alt="Python" />
  <img src="https://img.shields.io/badge/HTML5-0D1117?style=for-the-badge&logo=html5&logoColor=E34F26" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-0D1117?style=for-the-badge&logo=css&logoColor=1572B6" alt="CSS3" />
</p>

<p align="center">
  <a href="https://alves-araujo.github.io/homeostudy/">
    <img src="https://img.shields.io/badge/%E2%86%92_Acessar_o_site-ff3ee0?style=for-the-badge&labelColor=0D1117" alt="Acessar o site" />
  </a>
</p>

> **Tudo que o corpo faz para não mudar.**

Site de estudo do **2º período de Medicina**, montado a partir dos PDFs das aulas.
Cada slide vira conteúdo navegável, com as figuras do próprio material, exercícios
com correção na hora e um simulado por matéria.

Sem back-end, sem login e sem instalação: é **um único arquivo HTML** servido pelo
GitHub Pages. Depois de aberto, funciona offline.

## O que tem dentro

| Matéria | Aulas | Exercícios | Simulado |
| --- | ---: | ---: | ---: |
| Pequenos grupos | 14 | 60 | 30 |
| Anatomia | 5 | 30 | 30 |
| Histologia | 5 | 30 | 30 |
| Grandes Grupos | 4 | 24 | 30 |
| Bioquímica | 3 | 28 | 30 |
| **Total** | **31** | **172** | **150** |

São **322 questões**, 625 páginas de slide, 852 seções e 148 figuras extraídas dos
PDFs originais.

## Como se estuda nele

| Recurso | O que faz |
| --- | --- |
| **📖&nbsp;Aulas** | O texto do slide, página a página, com as figuras no lugar. Índice lateral para pular direto ao tópico. |
| **✍️&nbsp;Exercícios** | Blocos por aula, com **dica** antes e **comentário do gabarito** depois. As abertas são corrigidas por critérios: o site procura as ideias esperadas no que você escreveu. |
| **🎯&nbsp;Simulado** | 30 questões por matéria — 25 de múltipla escolha e 5 abertas. Rota `#sim/<matéria>`. |
| **🧠&nbsp;Mapa&nbsp;mental** | Um por matéria, **escrito à mão**. Gerar a partir dos títulos do PDF não funciona: os slides trazem fórmulas e rótulos de diagrama que não são tópicos. |
| **🔎&nbsp;Tira-dúvidas** | Busca no texto das 31 aulas e devolve os trechos que respondem, com a página de origem e o link para a aula. **Sem internet e sem IA** — o que aparece está escrito no material da UC. |
| **📊&nbsp;Progresso** | O anel de cada matéria acompanha as questões acertadas. Fica no `localStorage` do navegador; nada é enviado para lugar nenhum. |

Cada aula lista ainda as **fontes** consultadas — 11 conjuntos de referências
externas, por tema.

## O que não está no repositório

Os PDFs das aulas, os `src/dados-*.js` e o `site.html` ficam **fora do Git**. São o
material do curso — texto e figuras dos slides — e passam de 350 MB. O repositório
guarda só o programa que monta o site.

Para montar localmente você precisa das pastas das matérias com os PDFs ao lado do
`build/`.

## Como o site é montado

```
PDFs das aulas
   │  build/montar.py      extrai texto e figuras (PyMuPDF + Pillow)
   ▼
src/dados-<matéria>.js     conteúdo de cada matéria (gerado)
   │  src/build.sh         concatena shell + dados + exercícios + app
   ▼
site.html                  arquivo único publicado
   │  src/publicar.sh
   ▼
branch gh-pages            só index.html + .nojekyll
```

A `main` guarda o código; o site publicado vive numa branch própria. O
`publicar.sh` monta o commit da `gh-pages` com comandos de baixo nível do git,
então **não troca a sua branch nem toca nos arquivos que você está editando**.

## Rodar e publicar

O `montar.py` precisa de `pymupdf` e `pillow`:

```sh
python3 -m venv venv && ./venv/bin/pip install pymupdf pillow
```

Depois de trocar ou acrescentar um PDF na pasta da matéria:

```sh
./venv/bin/python build/montar.py   # PDFs → src/dados-<materia>.js
sh src/build.sh                     # fontes → site.html
sh src/publicar.sh                  # site.html → GitHub Pages
```

Edite `src/`, **nunca** `site.html` — ele é sobrescrito a cada build. Os
`dados-*.js` também são gerados: para mudar conteúdo, troque o PDF.

### Quando o PDF vem incompleto

Se o download do Canva salvou só a capa, dá para escrever o conteúdo à mão num
`.md` dentro da pasta da matéria. Cada aula é uma seção `# <nome do arquivo>.pdf`;
dentro dela `## <título>` vira seção e `- item` vira lista:

```markdown
# Homeostase (1).pdf

## Compartimentos líquidos
O LIC corresponde a 2/3 da água corporal...
- LIC: 2/3
- LEC: 1/3
```

O `montar.py` usa esse texto **só** quando o PDF não tem texto próprio.

## Estrutura

```
.
├── assets/banner.svg
├── build/
│   ├── extrair.py          texto e figuras dos PDFs
│   ├── montar.py           monta os dados-*.js
│   └── extraido/           dump intermediário (fora do Git)
├── src/
│   ├── 01-shell.html       CSS, paleta, cabeçalho e rodapé
│   ├── dados-*.js          conteúdo de cada matéria (gerados)
│   ├── exercicios-1..3.js  questões por aula (escritas à mão)
│   ├── simulado-1..5.js    simulado de cada matéria, 30 questões
│   ├── mapas.js            mapa mental de cada matéria
│   ├── 06-app.js           navegação, quiz, correção e tira-dúvidas
│   ├── build.sh            junta tudo em site.html
│   └── publicar.sh         envia para a branch gh-pages
└── site.html               publicado (gerado — não edite)
```

## Onde mexer nos exercícios

Em `src/exercicios-1.js` a `exercicios-3.js`, indexados por
`'<matéria>/<slug-da-aula>'`. Os slugs saem do nome do PDF e aparecem na URL
(`#a/histologia/sistema-respiratorio/exercicios`).

```js
// múltipla escolha
{t:'me', f:'fonte', e:'enunciado', a:['alt A','alt B'], ok:1,
 d:'dica', w:'comentário do gabarito'}

// aberta, corrigida por critérios
{t:'ab', e:'enunciado', d:'dica', g:'gabarito completo',
 c:[{p:'ponto esperado', k:['palavra','sinônimo']}]}
```

A correção da aberta procura as palavras de `k` no texto digitado, ignorando
acentos e maiúsculas, e marca o ponto como atingido.

Os simulados usam o mesmo formato, indexados só pela matéria
(`SIM['histologia'] = [ ... ]`). O `simulado-1.js` declara `window.SIM` e por isso
vem primeiro no `build.sh`.

## Limites conhecidos

- **Imagens** — só entram as do próprio material. O teto da página publicada é
  16 MB, então o `montar.py` seleciona as maiores figuras de cada aula
  (`LARG_MAX`, `QUALIDADE` e o limite por aula ficam no topo do arquivo).
- **PDFs digitalizados** (Urinálise, anotações da UC IV) não têm texto
  selecionável: cada página vira imagem, e o tira-dúvidas não alcança esse texto.
- **Quatro aulas de Pequenos grupos ainda não têm exercícios** — Feedback,
  Homeostase, Sistema Cardiovascular e Sistemas Respiratório/Renal/Digestório. O
  conteúdo delas está no site; só o bloco de questões falta.

## Aviso

As questões marcadas como **adaptadas** ou **geradas por IA** não são de provas
oficiais, e valores de referência variam entre laboratórios. Confira sempre o
material da sua faculdade antes da prova.

Conteúdo e figuras pertencem aos autores dos slides da UC. Material de estudo
pessoal, sem fins comerciais.
