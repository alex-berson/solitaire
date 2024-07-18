
let size = 7;

const showBoard = () => document.body.style.opacity = 1;

const setBoardSize = () => {

    let minSide = screen.height > screen.width ? screen.width : window.innerHeight;
    let cssBoardSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--board-size')) / 100;
    let cssPegSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--peg-size'));
    let boardSize = Math.ceil(minSide * cssBoardSize / 7) * 7;
    let pegSize = Math.floor(boardSize / 7 * cssPegSize);

    document.documentElement.style.setProperty('--board-size', boardSize + 'px');
    document.documentElement.style.setProperty('--peg-size', pegSize + 'px');
}

const fillBoard = () => {

    let i = 0;
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

const newGame = () => {

    let h1 = document.querySelector('h1');
    let designed = document.querySelector('#designed');
    let pegs = document.querySelectorAll('.peg:not(.invisible)');
    let pegs2 = [...document.querySelectorAll('.peg.invisible')];
    let pegC = document.querySelector(`[data-n="${24}"]`);
    let places = document.querySelectorAll('.place');
    let squares = document.querySelectorAll('.square');
    let arrows = document.querySelector('.arrows');
    let body = document.body;
    let i = 0;

    if (pegs.length == 32) return;
    if (document.querySelector('.move') != null) return;

    if (pegC) {

        let board = document.querySelector('.board');
        let peg = document.createElement('div');
        let pegInner = document.createElement('div');

        peg.appendChild(pegInner);
        peg.classList.add('peg', 'invisible');
        board.appendChild(peg);
        pegs2.push(peg);
        pegC.classList.add('invisible');
        pegC.addEventListener('transitionend', e => e.currentTarget.remove(), {once: true});
    }

    for (let [n, square] of squares.entries()) {

        if (square.children.length == 0) continue;
        if (!square.firstChild.classList.contains('empty') || n == 24) continue;

        pegs2[i].classList.remove('removed');

        let rectPeg = pegs2[i].getBoundingClientRect();
        let rectPlace = square.firstChild.getBoundingClientRect();
        let offsetLeft =  rectPlace.left - rectPeg.left;
        let offsetTop =  rectPlace.top - rectPeg.top;

        pegs2[i].dataset.n = n;
        pegs2[i].style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;

        i++;
    }

    body.removeEventListener('touchstart', newGame);
    body.removeEventListener('mousedown', newGame);

    arrows.classList.add('blink');

    arrows.addEventListener('animationend', e => {
        
        let arrows = e.currentTarget;

        arrows.classList.remove('blink');       
        
    }, {once: true});

    body.classList.remove('selected');
    body.classList.remove('selected');
    h1.classList.remove('disable-text');
    designed.classList.remove('disable-text');

    pegs.forEach(peg => peg.firstChild.classList.remove('disable'));
    pegs2.forEach(peg => peg.classList.remove('removed','invisible'));
    places.forEach(place => place.classList.remove('disable-border'));
    places.forEach(place => place.classList.remove('empty'));

    places[16].classList.add('empty');

    demoMode() ? aiPlay() : enableTouch();
}

const gameOver = () => {

    let h1 = document.querySelector('h1');
    let designed = document.querySelector('#designed');
    let pegs = document.querySelectorAll('.peg:not(.invisible)');
    let places = document.querySelectorAll('.place');
    let body = document.body;

    body.classList.add('selected');
    h1.classList.add('disable-text');
    designed.classList.add('disable-text');

    pegs.forEach(peg => peg.firstChild.classList.add('disable'));
    places.forEach(place => place.classList.add('disable-border'));

    setTimeout(() => {
        body.addEventListener('touchstart', newGame);  
        body.addEventListener('mousedown', newGame);  
    }, 1000);
}

const won = () => {

    let pegs = document.querySelectorAll('.peg:not(.invisible)');

    // if (pegs.length == 30) gameOver();

    return pegs.length == 1;
}

const lost = () => {

    let pegsEl = document.querySelectorAll('.peg[data-n]');
    let pegs = Array.from(pegsEl).map(pegEl => Number(pegEl.dataset.n));
    let places = [...document.querySelectorAll('.square')].map(square => Boolean(square.querySelector('.empty')));

    // console.log(places);
    // console.log(pegs);
    // console.log(places[24]);
    // console.log(Math.abs(26 % 7 - (26 - 2) % 7) == 2, places[26 - 2], !places[26 - 1])

    // if (pegsEl.length == 29) return true; //

    for (let peg of pegs) {

        if (peg - 14 >= 0 && places[peg - 14] && !places[peg - 7]) return false;
        if (peg + 14 <= 48 && places[peg + 14] && !places[peg + 7]) return false;
        if (peg - 2 >= 0 && Math.abs(peg % 7 - (peg - 2) % 7) == 2 && places[peg - 2] && !places[peg - 1]) return false;
        if (peg + 2 <= 48 && Math.abs(peg % 7 - (peg + 2) % 7) == 2 && places[peg + 2] && !places[peg + 1]) return false;
    }

    return true;
}

const zoom = (peg) => {
    peg.firstChild.classList.add('zoom')
}

const removeZoom = (e) => {

    let peg = e.currentTarget;

    peg.firstChild.classList.remove('zoom')
}

const startMove = (e) => {

    if (document.querySelector('.move') != null) return;

    let peg = e.currentTarget;

    zoom(peg);

    peg.classList.add('move');

    if (e.type == 'touchstart') {

        let n = 0;

        while (e.currentTarget != e.touches[n].target && e.currentTarget != e.touches[n].target.parentElement) n++;

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

    for (let square of squares) {

        if (square.children.length == 0) continue;

        let rectSquare = square.getBoundingClientRect();

        if (rectPeg.right < rectSquare.left || rectPeg.left > rectSquare.right || rectPeg.bottom < rectSquare.top || rectPeg.top > rectSquare.bottom) continue;

        destinations.push(square);
    }

    console.log(destinations);

    return destinations;
}

const endMove = () => {

    let squaresEl = document.querySelectorAll('.square');
    let peg = document.querySelector('.move');
    let n = Number(peg.dataset.n);
    let squares = destSquares(peg);

    disableTouch();

    for (let square of squares) {

        let i = [...squaresEl].indexOf(square);

        console.log(i);


        if (square.firstChild.classList.contains('empty') &&
           (Math.abs(n - i) == 14 || Math.abs(n - i) == 2 && Math.abs(n % 7 - i % 7) == 2) &&
           !squaresEl[Math.abs(n - i) / 2 + Math.min(i, n)].firstChild.classList.contains('empty')) {

                let place = square.firstChild;

                returnPeg(place);

                peg.dataset.n = i;

                let i2 = Math.abs(n - i) / 2 + Math.min(i, n);
                let peg2 = document.querySelector(`[data-n="${i2}"]`);
                
                peg2.classList.add('invisible');
                // peg2.firstChild.classList.add('pop');
                peg2.removeAttribute('data-n');
                squaresEl[i].firstChild.classList.remove('empty');
                squaresEl[i2].firstChild.classList.add('empty');
                squaresEl[n].firstChild.classList.add('empty');

                peg2.addEventListener('transitionend', e => {

                    let peg = e.currentTarget;
            
                    peg.classList.add('removed');
                    // peg.firstChild.classList.remove('pop');


                    // peg.classList.remove('invisible');

                    peg.removeAttribute('style');
                        
                }, {once: true});

                return;
        }
    }

    returnPeg();
}

const returnPeg = (place = null) => {
        
    let peg = document.querySelector('.move');
    let n = Number(peg.dataset.n);

    // if (place == null) place = document.querySelectorAll('.square')[n].firstChild;

    place = place || document.querySelectorAll('.square')[n].firstChild;

    // if (place == null) {
    //     place = document.querySelectorAll('.square')[n].firstChild;
    //     peg.classList.add('return');        
    // } else {
    //     peg.classList.add('settle'); 
    // }
    
    peg.classList.add('return'); 

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

        // if (lost()) {

        //     console.log('OVER')

        //     gameOver();
        //     // return;
        // } else {

        //     console.log('ENABLE')
        //     enableTouch();
        // }

        enableTouch();

    }, {once: true});

    if (peg.dataset.x0 == peg.dataset.x && peg.dataset.y0 == peg.dataset.y) peg.dispatchEvent(event);
}

const aiPlay = () => {

    console.log('AI');

    const setVisibilityChange = () => window.addEventListener('visibilitychange', handleVisibilityChange);

    const removeVisibilityChange = () => window.removeEventListener('visibilitychange', handleVisibilityChange);

    const handleVisibilityChange = () => {

        if (document.hidden) {
            clearTimeout(timer);
            timer = null;
        } else {
            if (timer == null) makeMove();
        }
    }

    const getMoves = (solution) => {

        let moves = [];

        for (let i = 0; i < solution.length; i += 4) {

            let move = [
                [Number(solution[i]), Number(solution[i + 1])],
                [Number(solution[i + 2]), Number(solution[i + 3])]
            ];

            moves.push(move);
        }

        return moves;
    }

    const makeMove = () => {

        let squares = document.querySelectorAll('.square');

        if (moves.length == 0) console.timeEnd('timer2'); //

        if (document.hidden) return;

        // if (moves.length == 0) {
        //     removeVisibilityChange();
        //     enableReset();    
        //     return;
        // }

        let [from, to] = moves.shift();

        console.log(orientation);

        switch (orientation) {

            case 'rotate90':

                from[0] = size - 1 - from[0]; 
                to[0] = size - 1 - to[0]; 

                break;

            case 'rotate180':

                [from[0], from[1]] = [from[1], from[0]]; 
                [to[0], to[1]] = [to[1], to[0]]; 

                break;

            case 'rotate270':

                [from[0], from[1]] = [from[1], size - 1 - from[0]]; 
                [to[0], to[1]] = [to[1], size - 1 - to[0]]; 

                break;

            case 'flip':

                from[1] = size - 1 - from[1]; 
                to[1] = size - 1 - to[1]; 

                break;

            case 'flip90':

                from[1] = size - 1 - from[1]; 
                to[1] = size - 1 - to[1]; 

                from[0] = size - 1 - from[0]; 
                to[0] = size - 1 - to[0]; 

                break;

            case 'flip180':

                from[1] = size - 1 - from[1]; 
                to[1] = size - 1 - to[1];  

                [from[0], from[1]] = [from[1], from[0]]; 
                [to[0], to[1]] = [to[1], to[0]];

                break;

            case 'flip270':

                from[1] = size - 1 - from[1]; 
                to[1] = size - 1 - to[1]; 

                [from[0], from[1]] = [from[1], size - 1 - from[0]]; 
                [to[0], to[1]] = [to[1], size - 1 - to[0]]; 

                break;
                
            case 'original':
                break;
        }

        let peg = document.querySelector(`.peg[data-n='${from[0] * size + from[1]}']`);
        let peg2 = document.querySelector(`.peg[data-n='${(from[0] + to[0]) / 2 * size + (from[1] + to[1]) / 2}']`);
        let style = window.getComputedStyle(peg);
        let matrix = new DOMMatrix(style.transform);
        let rectPeg = peg.getBoundingClientRect();
        let rectPlace = squares[to[0] * size + to[1]].firstChild.getBoundingClientRect();

        peg.dataset.n = to[0] * size + to[1];
        peg.classList.add('move-ai');
        peg.firstElementChild.classList.add('zoom-ai');
        
        squares[to[0] * size + to[1]].firstChild.classList.remove('empty');
        squares[from[0] * size + from[1]].firstChild.classList.add('empty');
        squares[(from[0] + to[0]) / 2 * size + (from[1] + to[1]) / 2].firstChild.classList.add('empty');

        setTimeout(() => {
            peg2.classList.add('invisible');
            // peg2.firstChild.classList.add('pop');
        }, 220);

        peg.addEventListener('animationend', e => {

            let peg = e.currentTarget;
    
            peg.classList.remove('move-ai');
            peg.firstChild.classList.remove('zoom-ai');
            // peg2.classList.add('invisible');
            peg2.removeAttribute('data-n');

        }, {once: true});

        peg2.addEventListener('transitionend', e => {

            let peg = e.currentTarget;
            
            peg.classList.add('removed');
            peg.removeAttribute('style');

            // peg.firstChild.classList.remove('pop');
    
        }, {once: true});
    
        peg.style.transform = `translate(${Math.round(matrix.m41 - (rectPeg.left - rectPlace.left))}px, ${Math.round(matrix.m42 - (rectPeg.top - rectPlace.top))}px)`;

        if (moves.length == 0) {
            removeVisibilityChange();
            setTimeout(enableReset, 500);    
            return;
        }

        timer = setTimeout(() => makeMove(), 1000);
    }

    const initWorker = () => {

        webWorker = new Worker('./js/solver.js');

        webWorker.addEventListener('message', e => {

            webWorker.terminate();

            moves = e.data;
            aiPlay.savedMoves = [...moves];

            console.log(`Finished in ${(Date.now() - startTime) / 1000} seconds`);
            console.log(moves.length);
            console.log(moves);
            // alert(`Finished in ${(Date.now() - startTime) / 1000} seconds`);

            // setTimeout(makeMove, 1000 - (Date.now() - startTime));

            return moves;
        });
    }

    let startTime =  Date.now();
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let type = urlParams.get('type');
    let moves, webWorker, timer, orientation;
    let orientations = ['original', 'rotate90', 'rotate180', 'rotate270', 'flip', 'flip90', 'flip180', 'flip270'];
    let easySolution = '1333252304243414020404245434464443452646464441436242325264626242123220222321402020224341412121232325254545433335533332343533';
    let fastSolution = '3133523240424341454364443454626464442242022214343454545252323212204040424244262423254626262404020222212323252545454343231333';
    let solutions = {'easy':easySolution,'fast':fastSolution};

    document.documentElement.style.setProperty('--non-demo', 0);

    setVisibilityChange();
    disableReset();
    disableTouch();

    if (type == 'ai') {

        orientation = orientations[Math.floor(Math.random() * 8)];

        moves = aiPlay.savedMoves == undefined ? initWorker() : [...aiPlay.savedMoves];

    } else {

        orientation = orientations[0];

        moves = getMoves(solutions[type]);
    }

    setTimeout(makeMove, 1000 - (Date.now() - startTime));
}

const demoMode = () => {

    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let mode = urlParams.get('mode');
    
    return mode == 'demo';

    // return true;
}

const enableReset = () => {

    let button = document.querySelector('.reset');

    button.classList.add('enabled');
    button.addEventListener('touchstart', newGame);
    button.addEventListener('mousedown', newGame);
}

const disableReset = () => {

    let button = document.querySelector('.reset');

    button.classList.remove('enabled');
    button.removeEventListener('touchstart', newGame);
    button.removeEventListener('mousedown', newGame);
}

const enableTouch = () => {

    let pegs = document.querySelectorAll('.peg');
    
    pegs.forEach(peg => {

        peg.addEventListener('touchstart', startMove);
        peg.addEventListener('touchend', removeZoom);
        // peg.addEventListener('touchcancel', removeZoom);

        peg.addEventListener('mousedown', startMove);
        peg.addEventListener('mouseup', removeZoom);
        // peg.addEventListener('mouseleave', removeZoom);
    });
}

const disableTouch = () => {

    let pegs = document.querySelectorAll('.peg');

    pegs.forEach(peg => {
        peg.removeEventListener('touchstart', startMove);
        peg.removeEventListener('touchend', removeZoom);
        // peg.removeEventListener('touchcancel', removeZoom);

        peg.removeEventListener('mousedown', startMove);
        peg.removeEventListener('mouseup', removeZoom);
        // peg.removeEventListener('mouseleave', removeZoom);
    });
}

const disableTapZoom = () => {

    const preventDefault = (e) => e.preventDefault();

    document.body.addEventListener('touchstart', preventDefault, {passive: false});
    document.body.addEventListener('mousedown', preventDefault, {passive: false});
}

const init = () => {

    disableTapZoom();
    setBoardSize();
    fillBoard();
    showBoard();
    enableReset();
    enableTouch();

    console.log(demoMode());

    if (demoMode()) setTimeout(aiPlay, 0);
}

window.onload = () => document.fonts.ready.then(init);