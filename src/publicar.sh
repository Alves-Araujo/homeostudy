#!/bin/sh
# Publica o site.html no GitHub Pages (https://alves-araujo.github.io/homeostudy/).
#
# O site vive numa branch própria, gh-pages, que contém só o index.html montado
# — a main continua com o código e sem nada do material das aulas. Este script
# monta o commit dessa branch com comandos de baixo nível do git, então ele não
# troca a sua branch atual nem mexe nos arquivos que você está editando.
#
# Uso: sh src/publicar.sh   (a partir da raiz do projeto)

set -e
cd "$(dirname "$0")/.."

[ -f site.html ] || { echo "site.html não existe — rode 'sh src/build.sh' antes."; exit 1; }

echo "Enviando $(du -h site.html | cut -f1) para a branch gh-pages..."

blob=$(git hash-object -w site.html)
vazio=$(printf '' | git hash-object -w --stdin)
tree=$(printf '100644 blob %s\tindex.html\n100644 blob %s\t.nojekyll\n' "$blob" "$vazio" | git mktree)

# -p amarra o commit no anterior, preservando o histórico da branch.
pai=$(git rev-parse --verify --quiet refs/heads/gh-pages || true)
if [ -n "$pai" ]; then
    commit=$(echo "Atualiza o site publicado" | git commit-tree "$tree" -p "$pai")
else
    commit=$(echo "Publica o site" | git commit-tree "$tree")
fi

git update-ref refs/heads/gh-pages "$commit"
git push origin gh-pages

echo
echo "Pronto. O GitHub leva cerca de um minuto para atualizar:"
echo "  https://alves-araujo.github.io/homeostudy/"
