#!/usr/bin/env bash

main() {
    for f in *; do
        local type

        type=$(file --mime-type "$f" | grep --only-matching -e video -e image)
        if [ "$type" = video ]; then
            ffmpeg -i "$f" -vf "transpose=2" -metadata:s:v:0 rotate=0 -map_metadata 0 -c:v libx265 -crf 28 -preset medium -c:a aac "_$f"
        elif [ "$type" = image ]; then
            #mogrify -auto-orient "$i"
            # Command below is a lot faster than mogrify, use mogrify if you don't want to install libjpeg-turbo-progs.
            exifautotran "$f"
        fi
    done
}

main
