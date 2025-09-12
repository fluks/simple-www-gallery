#!/usr/bin/env bash

main() {
    local i=0
    for f in *.jpg; do
        mv "$f" $i.jpg
        mogrify -auto-orient "$i.jpg"
        i=$((i+1))
    done
}

main
