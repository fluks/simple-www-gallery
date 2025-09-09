const
    CLASS_FULLSCREEN = 'fullscreen',
    CLASS_FULLSCREEN_ON = 'fullscreen-on';

function createImage(file) {
    const div = document.createElement('div');
    const img = document.createElement('img');   
    img.src = file;
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
            const img = createImage(file);
            container.appendChild(img);
        }
        catch (e) {
            console.log(`Fetching file ${file} failed. ${e}`);
            return;
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
    }
    history.pushState({}, '', url);
}

document.addEventListener('DOMContentLoaded', load);
document.querySelector('#images-container').addEventListener('click', imageClickHandler);
