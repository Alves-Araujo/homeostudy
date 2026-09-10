#!/bin/sh
# Junta os fontes em site.html, que é o arquivo publicado como Artifact.
# Regenerar os dados a partir dos PDFs:  python build/montar.py
# Uso: sh src/build.sh   (a partir da raiz do projeto)
set -e
cd "$(dirname "$0")"
cat 01-shell.html \
    dados-pequenos-grupos.js \
    dados-anatomia.js \
    dados-histologia.js \
    dados-grandes-grupos.js \
    dados-bioquimica.js \
    mapas.js \
    exercicios-1.js \
    exercicios-2.js \
    exercicios-3.js \
    simulado-1.js \
    simulado-2.js \
    simulado-3.js \
    simulado-4.js \
    simulado-5.js \
    06-app.js > ../site.html
echo "site.html gerado — $(du -h ../site.html | cut -f1)"
