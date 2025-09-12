#!/usr/bin/env bash

i=0
for f in *.jpg; do
    mogrify -auto-orient "$f" &
    mv "$f" $i.jpg
    i=$((i+1))
done
