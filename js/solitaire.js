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
    // let places = document.querySelectorAll('.place');
    let squares = document.querySelectorAll('.square');
    let pegs = document.querySelectorAll('.peg');
    
    for (let [n, square] of squares.entries()) {

        if (square.children.length == 0) continue;

        let place = square.firstChild;

        if (place.classList.contains('empty')) continue;

        let rectPeg = pegs[i].getBoundingClientRect();
        let rectPlace = place.getBoundingClientRect();
        let offsetLeft =  rectPlace.left - rectPeg.left;
        let offsetTop =  rectPlace.top - rectPeg.top;

        pegs[i].dataset.n = n;

        pegs[i].style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;

        i++;
    }
}

const zoom = (peg) => {
    // peg.firstChild.style.transition = 'transform 0.15s ease-in-out';
    // peg.firstChild.style.transform += "scale(1.3)";

    peg.firstChild.classList.add('zoom')
}

const removeZoom = (e) => {

    let peg = e.currentTarget;

    // peg.firstChild.style.transform = peg.firstChild.style.transform.replace("scale(1.3)", "");

    peg.firstChild.classList.remove('zoom')

}

const select = (e) => {

    let peg = e.currentTarget;

    console.log(peg);

    zoom(peg);
}

const startMove = (e) => {

    // console.clear();

    if (document.querySelector('.move') != null) return;

    let peg = e.currentTarget;

    // if (peg.classList.contains('removed')) return;

    zoom(peg);

    peg.classList.add('move');

    if (e.type == 'touchstart') {

        let n = 0;

        console.log(e.currentTarget);

        console.log(e.touches);

        console.log(e.touches[0].target);

        console.log(e.touches[n].target.parentElement);


        while (e.currentTarget != e.touches[n].target && e.currentTarget != e.touches[n].target.parentElement) {
            
            console.log(n);

            n++;
        }

        peg.dataset.x0 = peg.dataset.x = e.touches[n].clientX;
        peg.dataset.y0 = peg.dataset.y = e.touches[n].clientY;

        // piece.addEventListener('pointermove', mouseMove);

        peg.addEventListener('touchmove', touchMove);
        peg.addEventListener('touchend', endMove);
        peg.addEventListener('touchcancel', endMove);

    } else {


        peg.dataset.x0 = peg.dataset.x = e.clientX
        peg.dataset.y0 = peg.dataset.y = e.clientY

        // document.addEventListener('pointermove', mouseMove);

        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', endMove);
    }
}

const touchMove = (e) => {

    let peg = e.currentTarget;
    let style = window.getComputedStyle(peg);
    let matrix = new DOMMatrix(style.transform);

    let n = 0;
    
    while (e.currentTarget != e.touches[n].target && e.currentTarget != e.touches[n].target.parentElement) n++;

    let dx = e.touches[n].clientX - peg.dataset.x;
    let dy = e.touches[n].clientY - peg.dataset.y;

    peg.dataset.x = e.touches[n].clientX;
    peg.dataset.y = e.touches[n].clientY;

    // let offsetLeft =  piece.dataset.x - piece.dataset.x0;
    // let offsetTop =  piece.dataset.y - piece.dataset.y0;

    // piece.style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;

    peg.style.transform = `translate(${matrix.m41 + dx}px, ${matrix.m42 + dy}px)`;
}

const mouseMove = (e) => {

    // let squares = document.querySelectorAll('.square');

    let peg = document.querySelector('.move');

    let style = window.getComputedStyle(peg);
    let matrix = new DOMMatrix(style.transform);
    let dx = e.clientX - peg.dataset.x;
    let dy = e.clientY - peg.dataset.y;

    // console.log(e.clientX,e.clientY);
    // console.log(dx,dy);
    // console.log(matrix.m41, matrix.m42)


    peg.dataset.x = e.clientX;
    peg.dataset.y = e.clientY;

    peg.style.transform = `translate(${matrix.m41 + dx}px, ${matrix.m42 + dy}px)`;

    // let offsetLeft =  piece.dataset.x - piece.dataset.x0;
    // let offsetTop =  piece.dataset.y - piece.dataset.y0;
    // piece.style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;


    // let rectPiece = piece.getBoundingClientRect();
    // let rectSquare = squares[0].getBoundingClientRect();

    // console.log(rectSquare.left, rectSquare.top);
    // console.log(rectPiece.left, rectPiece.top);
}

const destSquares = (peg) => {

    let destinations = [];
    let squares = document.querySelectorAll('.square');
    let rectPeg = peg.getBoundingClientRect();
    // let ox = rectPiece.left + rectPiece.width / 2;
    // let oy = rectPiece.top + rectPiece.height / 2;

    for (let [i, square] of squares.entries()) {

        if (square.children.length == 0) continue;

        let rectSquare = square.getBoundingClientRect();

        if (rectPeg.right < rectSquare.left || rectPeg.left > rectSquare.right || rectPeg.bottom < rectSquare.top || rectPeg.top > rectSquare.bottom) continue;

        destinations.push(square);
    }

    return destinations;
}

const endMove = () => {

    let squaresEl = document.querySelectorAll('.square');
    let peg = document.querySelector('.move');
    let n = Number(peg.dataset.n);
    let squares = destSquares(peg);
    let place;

    disableTouch();

    for (let square of squares) {

        let i = [...squaresEl].indexOf(square);

        if (square.firstChild.classList.contains('empty') &&
           (Math.abs(n - i) == 14 || Math.abs(n - i) == 2 && Math.abs(n % 7 - i % 7) == 2) &&
           !squaresEl[Math.abs(n - i) / 2 + Math.min(i, n)].firstChild.classList.contains('empty')) {

                place = square.firstChild;

                returnPeg(place);

                peg.dataset.n = i;

                let i2 = Math.abs(n - i) / 2 + Math.min(i, n);
                let peg2 = document.querySelector(`[data-n="${i2}"]`);
                
                peg2.classList.add('invisible');
                peg2.removeAttribute('data-n');
                squaresEl[i].firstChild.classList.remove('empty');
                squaresEl[i2].firstChild.classList.add('empty');
                squaresEl[n].firstChild.classList.add('empty');

                peg2.addEventListener('transitionend', e => {

                    let peg = e.currentTarget;
            
                    peg.classList.add('removed');
                        
                }, {once: true});

                return;
        }
    }

    if (place == undefined) {
        returnPeg();
    }
}

const returnPeg = (place = null) => {
        
    let peg = document.querySelector('.move');
    let n = Number(peg.dataset.n);

    if (place == null) {
        place = document.querySelectorAll('.square')[n].firstChild;
        peg.classList.add('return');        
    } else {
        peg.classList.add('settle'); 
    }

    let event = new Event('transitionend');
    let style = window.getComputedStyle(peg);
    let matrix = new DOMMatrix(style.transform);
    let rectPeg = peg.getBoundingClientRect();
    let rectPlace = place.getBoundingClientRect();

    peg.removeEventListener('touchmove', touchMove);
    document.removeEventListener('mousemove', mouseMove);

    peg.removeEventListener('touchend', endMove);
    peg.removeEventListener('touchcancel', endMove);
    document.removeEventListener('mouseup', endMove);

    peg.style.transform = `translate(${Math.round(matrix.m41 - (rectPeg.left - rectPlace.left))}px, ${Math.round(matrix.m42 - (rectPeg.top - rectPlace.top))}px)`;

    peg.addEventListener('transitionend', e => {

        let peg = e.currentTarget;

        peg.classList.remove('settle', 'return', 'move');

        enableTouch();

    }, {once: true});

    if (peg.dataset.x0 == peg.dataset.x && peg.dataset.y0 == peg.dataset.y) peg.dispatchEvent(event);
}

const enableTouch = () => {

    let pegs = document.querySelectorAll('.peg');
    let events = touchScreen() ? ['touchstart', 'touchend', 'touchcancel'] 
                               : ['mousedown', 'mouseup', 'mouseleave'];

    pegs.forEach(peg => {
        peg.addEventListener(events[0], startMove);
        peg.addEventListener(events[1], removeZoom);
        // peg.addEventListener(events[2], removeZoom);
    });
}

const disableTouch = () => {

    let pegs = document.querySelectorAll('.peg');
    let events = touchScreen() ? ['touchstart', 'touchend', 'touchcancel'] 
                               : ['mousedown', 'mouseup', 'mouseleave'];

    pegs.forEach(peg => {
        peg.removeEventListener(events[0], startMove);
        peg.removeEventListener(events[1], removeZoom);
        // peg.removeEventListener(events[2], removeZoom);
    });
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
    enableTouch();
}

window.addEventListener('load', () => document.fonts.ready.then(init));