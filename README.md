## Description

Simple gallery website to publish images and videos. I want to keep this rather simple. At least nothing server side. Perhaps JavaScript can have more functionality. It should be very easy from having images to have some sort of image gallery on web.

## Demo

https://fluks.github.io/simple-www-gallery/gallery.html

## Requirements

Web server + autoindexing. Should work with at least Nginx and Apache.

Tested on:

    * Apache
    * nginx
    * mini_httpd
    * lighttpd
    * Python -m http.server
    * Caddy
    * ruby -run -e httpd . -p 8080
    * Busybox
```
mkdir cgi-bin
cat <<EOF > cgi-bin/index.cgi
#!/usr/bin/sh
echo -e 'Content-type: text/html\n\n'

echo '<html>
<body>'
for f in ../*; do
  echo "<a href="./\$f">\$f</a>"
done
echo '</body>
</html>'
EOF
chmod 775 cgi-bin/index.cgi
busybox httpd -vfp 8080
```

## Usage

* (Optional) Run auto-orient-medias.sh in same directory with media files to auto-orient them.
* Copy all images, videos and gallery.\* files to same directory to web server with autoindex on.

## License

GPL3
