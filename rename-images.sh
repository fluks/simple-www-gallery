#!/usr/bin/env bash

main() {
    local i=0
    for f in *; do
        file --mime-type "$f" | grep --quiet image
        [ "$?" -eq 0 ] || break;
        mv "$f" $i
        #mogrify -auto-orient "$i.jpg"
        i=$((i+1))
    done
}

main
