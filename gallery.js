const
    CLASS_FULLSCREEN = 'fullscreen',
    CLASS_FULLSCREEN_ON = 'fullscreen-on';

function createImage(file, i) {
    const div = document.createElement('div');
    const img = document.createElement('img');   
    img.src = file;
    img.setAttribute('data-index', i);
    div.appendChild(img);

    return div;
}

async function loadImages(params) {
    const container = document.querySelector('#images-container');
    for (let i = 0;; i++) {
        const file = `./${i}.jpg`;
        try {
            const res = await fetch(file);
            if (!res.ok) {
                console.log(`Fetching file ${file} failed. Status: ${res.status}`);
                return;
            }
            const img = createImage(file, i);
            container.appendChild(img);
        }
        catch (e) {
            console.log(`Fetching file ${file} failed. ${e}`);
            return;
        }
    }
}

function linkClickHandler(ev, i, el) {
    ev.preventDefault();

    document.querySelector(`.${CLASS_FULLSCREEN}`).classList.remove(CLASS_FULLSCREEN);
    document.querySelector(`img[data-index="${i}"]`).classList.add(CLASS_FULLSCREEN);

    const url = new URL(location);
    url.searchParams.set('img', `${i}.jpg`);
    history.pushState({}, '', url);

    addLinksToButtons(i);
}

let g_isMouseTimeoutSet = false,
    mouseTimeout;
function fadeButtons() {
    g_isMouseTimeoutSet = true;

    document.addEventListener('mousemove', () => {
        const links = Array.from(document.querySelectorAll('a'));

        links.forEach(el => {
            el.style.opacity = 1;
        });

        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
            links.forEach(el => {
                el.style = 'animation: 1s fadeOut ease';
            });
        }, 1000);
    });
}

function addLinksToButtons(i) {
    const nImages = Array.from(document.querySelectorAll('img')).length;
    const iPrevious = i - 1 < 0 ? nImages - 1 : i - 1;
    const iNext = i + 1 > nImages - 1 ? 0 : i + 1;

    const previousImage = document.querySelector('#previous-image');
    const nextImage = document.querySelector('#next-image');

    // Remove any existing listeners first
    previousImage.replaceWith(previousImage.cloneNode(true));
    nextImage.replaceWith(nextImage.cloneNode(true));

    // Get fresh references after clone
    const newPrevious = document.querySelector('#previous-image');
    const newNext = document.querySelector('#next-image');

    newPrevious.addEventListener('click',
        ev => linkClickHandler(ev, iPrevious, newNext),
        { once: true });
    newNext.addEventListener('click',
        ev => linkClickHandler(ev, iNext, newPrevious),
        { once: true });

    // Has mouse
    if (!window.matchMedia("(any-hover: none)").matches) {
        if (!g_isMouseTimeoutSet) {
            fadeButtons();
        }
    }
}

async function load() {
    const params = new URL(location).searchParams;
    await loadImages(params);

    let i;
    if ((i = params.get('img'))) {
        const img = Array.from(document.querySelectorAll('img')).find(el => el.src.endsWith(i));
        if (img) {
            img.classList.add(CLASS_FULLSCREEN);
            document.querySelector('#images-container').classList.add(CLASS_FULLSCREEN_ON);
            addLinksToButtons(parseInt(i));
        }
    }
}

function imageClickHandler(e) {
    const el = e.target;

    if (el.nodeName !== 'IMG') {
        return;
    }

    const url = new URL(location);
    const container = document.querySelector('#images-container');
    if (el.classList.contains(CLASS_FULLSCREEN)) {
        el.classList.remove(CLASS_FULLSCREEN);
        container.classList.remove(CLASS_FULLSCREEN_ON);

        url.searchParams.delete('img');
    }
    else {
        el.classList.add(CLASS_FULLSCREEN);
        container.classList.add(CLASS_FULLSCREEN_ON);

        const urlParts = el.src.split('/');
        const filename = urlParts[urlParts.length - 1];
        url.searchParams.set('img', filename);

        addLinksToButtons(parseInt(filename));
    }
    history.pushState({}, '', url);
}

document.addEventListener('DOMContentLoaded', load);
document.querySelector('#images-container').addEventListener('click', imageClickHandler);
