const
    CLASS_FULLSCREEN = 'fullscreen',
    CLASS_FULLSCREEN_ON = 'fullscreen-on',
    g_imagesContainer = document.querySelector('#images-container');
let g_isMouseTimeoutSet = false,
    g_mouseTimeout;

function getFilename(url) {
    const urlParts = url.pathname.split('/');

    return urlParts[urlParts.length - 1];
}

function createMedia(media, width) {
    const div = document.createElement('div');
    let element;
    if (media.type === 'image') {
        element = document.createElement('img');
        element.src = media.url;
    }
    else {
        element = document.createElement('video');
        element.src = media.url;
        element.setAttribute('controls', '');
    }
    element.classList.add('media');
    element.setAttribute('data-filename', getFilename(new URL(media.url)));
    if (width) {
        element.style.width = `${width}px`;
    }
    div.appendChild(element);

    return div;
}

function getBaseURL(url) {
    const paths = url.pathname.split('/');
    paths.pop();

    return paths.join('/') + '/';
}

async function getLinks(baseURL) {
    const res = await fetch(baseURL, { method: 'GET', });
    if (!res.ok) {
        throw new Error(`Fetching URL ${baseURL} failed: ${res.status}`);
    }
    const html = await res.text();
    const _document = (new DOMParser()).parseFromString(html, 'text/html');

    return Array.from(_document.querySelectorAll('a')).map(a => a.href);
}

async function getMedias(links) {
    let medias = links.map(async l => {
        try {
            const res = await fetch(l, { method: 'HEAD', });
            if (!res.ok) {
                throw new Error(`Fetching URL ${l} failed. Status: ${res.status}`);
            }
            const type = res.headers.get('content-type').split('/')[0];
            if ([ 'image', 'video' ].includes(type)) {
                return { type: type, url: l, };
            }
        }
        catch (e) {
            console.log(e);
        }
    });
    medias = await Promise.all(medias);

    return medias.filter(l => l);
}

async function loadMedias(url, mediaWidth) {
    const baseURL = getBaseURL(url);
    const links = await getLinks(baseURL);
    const medias = await getMedias(links);

    medias.forEach(m => {
        const media = createMedia(m, mediaWidth);
        g_imagesContainer.appendChild(media);
    });
}

function linkClickHandler(ev, elem) {
    ev.preventDefault();

    document.querySelector(`.${CLASS_FULLSCREEN}`).classList.remove(CLASS_FULLSCREEN);
    const filename = getFilename(new URL(elem.src));
    document.querySelector(`[data-filename="${filename}"]`).classList.add(CLASS_FULLSCREEN);

    const url = new URL(location);
    url.searchParams.set('media', filename);
    history.pushState({}, '', url);

    addLinksToButtons(elem);
}

function _fadeButtons() {
    const links = Array.from(document.querySelectorAll('a'));

    links.forEach(el => {
        el.style.opacity = 1;
    });

    clearTimeout(g_mouseTimeout);
    g_mouseTimeout = setTimeout(() => {
        links.forEach(el => {
            el.style = 'animation: 1s fadeOut ease';
        });
    }, 1000);
}

function fadeButtons() {
    g_isMouseTimeoutSet = true;
    document.addEventListener('mousemove', _fadeButtons);
}

function getSibling(filename, direction) {
    const medias = Array.from(document.querySelectorAll('[data-filename]'));
    const i = medias.findIndex(m => m.getAttribute('data-filename') === filename);

    if (direction === -1) {
        return i === 0 ? medias[medias.length - 1] : medias[i - 1];
    }
    else {
        return i === medias.length - 1 ? medias[0] : medias[i + 1];
    }
}

function addLinksToButtons(elem) {
    const previousImage = document.querySelector('#previous-image');
    const nextImage = document.querySelector('#next-image');

    // Remove any existing listeners first
    previousImage.replaceWith(previousImage.cloneNode(true));
    nextImage.replaceWith(nextImage.cloneNode(true));

    // Get fresh references after clone
    const newPrevious = document.querySelector('#previous-image');
    const newNext = document.querySelector('#next-image');

    const filename = getFilename(new URL(elem.src));
    const previousElem = getSibling(filename, -1);
    newPrevious.addEventListener('click', ev => linkClickHandler(ev, previousElem),
        { once: true });
    const nextElem = getSibling(filename, 1);
    newNext.addEventListener('click', ev => linkClickHandler(ev, nextElem),
        { once: true });

     // Has mouse
    if (!window.matchMedia("(any-hover: none)").matches) {
        if (!g_isMouseTimeoutSet) {
            fadeButtons();
        }
    }
}

async function load() {
    const url = new URL(location);
    const params = url.searchParams;
    const mediaWidth = params.get('width');
    await loadMedias(url, mediaWidth);

    const filename = params.get('media');
    if (filename) {
        const elem = document.querySelector(`[data-filename="${filename}"]`);
        if (elem) {
            elem.classList.add(CLASS_FULLSCREEN);
            g_imagesContainer.classList.add(CLASS_FULLSCREEN_ON);
            addLinksToButtons(elem);
        }
    }
}

function imageClickHandler(e) {
    const el = e.target;

    if (!(el.classList.contains('media'))) {
        return;
    }

    const url = new URL(location);
    if (el.classList.contains(CLASS_FULLSCREEN)) {
        el.classList.remove(CLASS_FULLSCREEN);
        g_imagesContainer.classList.remove(CLASS_FULLSCREEN_ON);

        document.removeEventListener('mousemove', _fadeButtons);
        g_isMouseTimeoutSet = false;

        url.searchParams.delete('media');

        el.scrollIntoView();
    }
    else {
        el.classList.add(CLASS_FULLSCREEN);
        g_imagesContainer.classList.add(CLASS_FULLSCREEN_ON);

        const filename = getFilename(new URL(el.src));
        url.searchParams.set('media', filename);

        addLinksToButtons(el);
    }
    history.pushState({}, '', url);
}

function keydownHandler(ev) {
    if (!g_imagesContainer.classList.contains(CLASS_FULLSCREEN_ON)) {
        return;
    }

    const click = new CustomEvent('click');
    if (ev.key === 'ArrowLeft') {
        document.querySelector('#previous-image').dispatchEvent(click);
    }
    else if (ev.key === 'ArrowRight') {
        document.querySelector('#next-image').dispatchEvent(click);
    }
    else if (ev.key === 'Escape') {
        const filename = (new URL(location)).searchParams.get('media');
        const elem = document.querySelector(`[data-filename="${filename}"]`);
        // Need to do this since imageClickHandler is an event handler and it takes an EventTarget as argument.
        const eventTarget = { target: elem, };
        imageClickHandler(eventTarget);
    }
}

document.addEventListener('DOMContentLoaded', load);
g_imagesContainer.addEventListener('click', imageClickHandler);
document.addEventListener('keydown', keydownHandler);
