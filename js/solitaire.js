let board;

const showBoard = () => document.body.style.opacity = 1;

const touchScreen = () => matchMedia('(hover: none)').matches;

const setTitle = () => {

    let title = document.querySelector('h1');
    let ua = navigator.userAgent;
    let safari = /Safari/.test(ua) && !/Chrome/.test(ua);

    try {

        let safariVer = safari ? ua.match(/Version\/([\d.]+)/)[1].split('.').map(Number) : null;

        if (safari && safariVer[0] < 14) title.classList.remove('rounded-corners');

    } catch(e) {}

    if (document.URL.startsWith('http://') || document.URL.startsWith('https://')) return;

    if (/(iPhone|iPod|iPad)/.test(ua)) {

        try {

            let osVer = ua.match(/OS ([\d_]+)/)[1].split('_').map(Number);
        
            if (osVer[0] < 14) title.classList.remove('rounded-corners');

        } catch(e) {}

        return;
    }

    try {

        let osVer = [...ua.match(/Mac OS X ([\d_]+)/)[1].split('_').map(Number), 0, 0, 0];

        if (osVer[0] == 10 && osVer[1] == 15 && osVer[2] <= 4) title.classList.remove('rounded-corners');
        
    } catch(e) {}    
}

const setBoardSize = () => {

    let minSide = screen.height > screen.width ? screen.width : window.innerHeight;
    let cssBoardSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--board-size'));
    let boardSize = Math.ceil(minSide * cssBoardSize / 7) * 7;

    document.documentElement.style.setProperty('--board-size', boardSize + 'px');
}

const fillBoard = () => {

    let i = 0;
    let places = document.querySelectorAll('.place');
    let pegs = document.querySelectorAll('.peg');
    
    for (let place of places) {

        if (place.classList.contains('empty')) continue;

        let rectPeg = pegs[i].getBoundingClientRect();
        let rectPlace = place.getBoundingClientRect();
        let offsetLeft =  rectPlace.left - rectPeg.left;
        let offsetTop =  rectPlace.top - rectPeg.top;

        pegs[i].style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;

        i++;
    }
}

const enableTouch = () => {

    let pegs = document.querySelectorAll('.peg');
    let event = touchScreen() ? 'touchstart' : 'mousedown';

    pegs.forEach(peg => peg.addEventListener(event, select));
}

const disableTouch = () => {

    let pegs = document.querySelectorAll('.peg');
    let event = touchScreen() ? 'touchstart' : 'mousedown';

    pegs.forEach(peg => peg.removeEventListener(event, select));
}

const disableTapZoom = () => {

    const preventDefault = (e) => e.preventDefault();
    let event = touchScreen() ? 'touchstart' : 'mousedown';

    document.body.addEventListener(event, preventDefault, {passive: false});
}

const init = () => {
    disableTapZoom();
    setTitle()
    setBoardSize();
    fillBoard();
    showBoard();
}

window.addEventListener('load', () => document.fonts.ready.then(init));