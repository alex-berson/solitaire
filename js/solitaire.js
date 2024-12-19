const showBoard = () => document.body.classList.add('visible');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const setBoardSize = () => {

    let minSide = screen.height > screen.width ? screen.width : window.innerHeight;
    let cssBoardSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--board-size')) / 100;
    let cssPegSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--peg-size'));
    let boardSize = Math.ceil(minSide * cssBoardSize / 7) * 7;
    let pegSize = Math.floor(boardSize / 7 * cssPegSize);
    let gapSize = Math.floor(boardSize / 7 * (1 - cssPegSize));

    document.documentElement.style.setProperty('--board-size', `${boardSize}px`);
    document.documentElement.style.setProperty('--peg-size', `${pegSize}px`);
    document.documentElement.style.setProperty('--gap-size', `${gapSize}px`);
}

const fillBoard = () => {

    let holes = document.querySelectorAll('.hole');
    let pegs = [...document.querySelectorAll('.peg')];

    for (let [n, hole] of holes.entries()) {

        if (hole.matches('.hidden, .empty')) continue;

        let peg = pegs.shift();
        let pegRect = peg.getBoundingClientRect();
        let holeRect = hole.getBoundingClientRect();
        let offsetLeft = holeRect.left - pegRect.left;
        let offsetTop = holeRect.top - pegRect.top;

        peg.dataset.n = n;

        peg.style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;
    }
}

const startMove = (e) => {

    let peg = e.currentTarget;

    if (peg.classList.contains('invisible') || document.querySelector('.move')) return;

    // if (peg.matches('.invisible, .settle') || document.querySelector('.move')) return;

    // disableReset();

    peg.classList.add('move', 'zoom');

    // peg.classList.add('move');

    peg.classList.remove('settle'); //
    // peg.firstChild.style.transform += 'scale(1.3)'; //


    if (e.type == 'touchstart') {

        let n = [...e.touches].findIndex(touch => e.currentTarget == touch.target);

        peg.dataset.x0 = peg.dataset.x = e.touches[n].clientX;
        peg.dataset.y0 = peg.dataset.y = e.touches[n].clientY;

        peg.addEventListener('touchmove', touchMove);
        peg.addEventListener('touchend', endMove);
        peg.addEventListener('touchcancel', endMove);

    } else {

        peg.dataset.x0 = peg.dataset.x = e.clientX
        peg.dataset.y0 = peg.dataset.y = e.clientY

        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', endMove);
    }
}

const touchMove = (e) => {

    let peg = e.currentTarget;
    let style = window.getComputedStyle(peg);
    let matrix = new DOMMatrix(style.transform);
    let n = [...e.touches].findIndex(touch => e.currentTarget == touch.target);
    let dx = e.touches[n].clientX - peg.dataset.x;
    let dy = e.touches[n].clientY - peg.dataset.y;

    peg.dataset.x = e.touches[n].clientX;
    peg.dataset.y = e.touches[n].clientY;

    peg.style.transform = `translate(${matrix.m41 + dx}px, ${matrix.m42 + dy}px)`;
}

const mouseMove = (e) => {

    let peg = document.querySelector('.move');
    let style = window.getComputedStyle(peg);
    let matrix = new DOMMatrix(style.transform);
    let dx = e.clientX - peg.dataset.x;
    let dy = e.clientY - peg.dataset.y;

    peg.dataset.x = e.clientX;
    peg.dataset.y = e.clientY;

    peg.style.transform = `translate(${matrix.m41 + dx}px, ${matrix.m42 + dy}px)`;
}

const getDestHoles = (peg) => {

    let destinations = [];
    let pegRect = peg.getBoundingClientRect();
    let holes = document.querySelectorAll('.hole');

    for (let hole of holes) {

        if (!hole.classList.contains('empty')) continue;

        let holeRect = hole.getBoundingClientRect();

        if (pegRect.right < holeRect.left ||
            pegRect.left > holeRect.right ||
            pegRect.bottom < holeRect.top ||
            pegRect.top > holeRect.bottom) continue;

        destinations.push(hole);
    }

    return destinations;
}

const endMove = () => {

    let holes = document.querySelectorAll('.hole');
    let peg = document.querySelector('.move');
    let i1 = Number(peg.dataset.n);
    let destHoles = getDestHoles(peg);


    // disableTouch();

    for (let hole of destHoles) {

        let i2 = [...holes].indexOf(hole);
        let i0 = Math.abs(i1 - i2) / 2 + Math.min(i1, i2);
        let peg0 = document.querySelector(`[data-n="${i0}"]`);

        if ((Math.abs(i1 - i2) == 14 ||
            (Math.abs(i1 - i2) == 2 && Math.abs(i1 % 7 - i2 % 7) == 2)) &&
            peg0 != null) {

            // placePeg(hole);

            peg.dataset.n = i2;
            peg0.classList.add('invisible');
            peg0.removeAttribute('data-n');

            holes[i0].classList.add('empty');
            holes[i1].classList.add('empty');
            holes[i2].classList.remove('empty');
            
            peg0.addEventListener('transitionend', () => {
        
                peg0.classList.add('hidden');
                peg0.removeAttribute('style');

                // if (!gameWon() && !gameLost()) enableReset();
                    
            }, {once: true});

            placePeg(hole, gameLost() || gameWon());

            // if (gameLost() || gameWon()) disableTouch(); //

            // placePeg(hole);

            // console.log(gameLost(), gameWon());

            // if (gameLost() || gameWon())  endGame();

            return;
        }
    }

    placePeg();

    // await placePeg();
    // enableReset();
}

const placePeg = async (hole = null, end = false) => {

    let peg = document.querySelector('.move, .zoom');

    if (peg == null) return;
    if (end) disableTouch();

    let n = Number(peg.dataset.n);
    let hole0 = document.querySelectorAll('.hole')[n];

    if (hole == null || hole instanceof Event) hole = hole0;

    // console.log(gameLost(), gameWon());

    peg.classList.add('settle'); 
    peg.classList.remove('zoom', 'move');

    // console.log(peg.firstChild.style.transform);

    // peg.firstChild.style.transform = peg.firstChild.style.transform.replace('scale(1.3)', '');

    // peg.classList.remove('move'); //

    // if (!gameWon() && !gameLost()) enableTouch(); //

    let style = window.getComputedStyle(peg);
    let matrix = new DOMMatrix(style.transform);
    let pegRect = peg.getBoundingClientRect();
    let holeRect = hole.getBoundingClientRect();
    let offsetLeft = pegRect.left - holeRect.left;
    let offsetTop = pegRect.top - holeRect.top;

    peg.removeEventListener('touchmove', touchMove);
    document.removeEventListener('mousemove', mouseMove);

    peg.removeEventListener('touchend', endMove);
    peg.removeEventListener('touchcancel', endMove);
    document.removeEventListener('mouseup', endMove);

    peg.style.transform = `translate(${matrix.m41 - offsetLeft}px, ${matrix.m42 - offsetTop}px)`;

    // await new Promise(resolve => {

        peg.addEventListener('transitionend', () => {

            // peg.classList.remove('settle', 'move');
            peg.classList.remove('settle');

            if (end) endGame();

            // if (!gameWon() && !gameLost()) enableReset();

            // resolve();
    
            // (gameLost() || gameWon()) ? endGame() : enableTouch();

            // console.log(gameLost(), gameWon());

            // console.log(gameLost(), gameWon());

            // if (gameLost() || gameWon())  endGame();

        }, {once: true});
    // });
}

const gameWon = () => {

    let pegs = document.querySelectorAll('.peg:not(.invisible)');

    return pegs.length == 1;

    // return true;
}

const gameLost = () => {

    // let pegsEl = [...document.querySelectorAll('.peg[data-n]')];
    let pegsEl = [...document.querySelectorAll('.peg[data-n]:not(.invisible)')];
    let pegs = pegsEl.map(pegEl => Number(pegEl.dataset.n));
    let holesEl = [...document.querySelectorAll('.hole')];
    let holes = holesEl.map(hole => Boolean(hole.classList.contains('empty')));

    // return true;

    for (let peg of pegs) {

        if ((peg - 14 >= 0 && holes[peg - 14] && !holes[peg - 7]) ||
            (peg + 14 <= 48 && holes[peg + 14] && !holes[peg + 7]) ||
            (peg - 2 >= 0 && Math.abs(peg % 7 - (peg - 2) % 7) == 2 && 
                holes[peg - 2] && !holes[peg - 1]) ||
            (peg + 2 <= 48 && Math.abs(peg % 7 - (peg + 2) % 7) == 2 &&
                holes[peg + 2] && !holes[peg + 1])) return false;
    }

    return pegsEl.length != 1;
}

const endGame = async () => {

    let peg = document.querySelector('.peg:not(.invisible)');

    if (gameLost()) {

        document.body.classList.add('lost');

        peg.addEventListener('transitionend', () => {

            document.body.addEventListener('touchstart', resetGame);
            document.body.addEventListener('mousedown', resetGame);

            enableReset();

        }, {once: true});

    } else {

        await sleep(200);

        peg.classList.add('zoom-win')

        peg.addEventListener('animationend', () => {
            
            document.body.addEventListener('touchstart', resetGame);
            document.body.addEventListener('mousedown', resetGame);
            
            peg.classList.remove('zoom-win');
            
            enableReset();


            let event = new Event('touchstart', {bubbles: true, cancelable: true}); //

            setTimeout(() => document.body.dispatchEvent(event), 1500); //
            
        }, {once: true});
    }
}

const resetGame = (e) => {

    const enabled = () => {

        let invisible = document.querySelector('.peg.invisible:not(.hidden)');
        let hidden = document.querySelector('.peg.hidden');
        let move = document.querySelector('.move, .settle');

        if (invisible || !hidden || move) return false;

        return true;
    } 

    let arrows = document.querySelector('.arrows');
    let holes = document.querySelectorAll('.hole');
    let pegs = [...document.querySelectorAll('.peg.invisible')];
    let centralPeg = document.querySelector(`[data-n="${24}"]`);

    if (!enabled()) return;

    // if (pegs.length == 0) return;

    if (e.currentTarget.classList.contains('reset') && !demoMode()) {

        arrows.classList.add('blink');

        arrows.addEventListener('animationend', () => arrows.classList.remove('blink'), {once: true});
    }

    if (centralPeg != null) {

        let board = document.querySelector('.board');
        let peg = document.createElement('div');
        let div = document.createElement('div');

        peg.appendChild(div);
        peg.classList.add('peg', 'invisible');
        board.appendChild(peg);
        pegs.push(peg);

        centralPeg.classList.add('invisible');
        centralPeg.addEventListener('transitionend', () => centralPeg.remove(), {once: true});

        holes[24].classList.add('empty');
    }

    for (let [n, hole] of holes.entries()) {

        if (n == 24 || !hole.classList.contains('empty')) continue;

        let peg = pegs.shift();
        let pegRect = peg.getBoundingClientRect();
        let holeRect = hole.getBoundingClientRect();
        let offsetLeft = holeRect.left - pegRect.left;
        let offsetTop = holeRect.top - pegRect.top;

        peg.classList.remove('hidden', 'invisible');

        peg.dataset.n = n;
        peg.style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;

        hole.classList.remove('empty');
    }

    document.body.removeEventListener('touchstart', resetGame);
    document.body.removeEventListener('mousedown', resetGame);

    document.body.classList.remove('lost');

    if (demoMode()) {

        disableReset();
        aiPlay(false);

        return;
    }

    enableTouch();
}

const aiPlay = async (init = true) => {

    // const setVisibilityChange = () => {
    //     window.addEventListener('visibilitychange', handleVisibilityChange);
    // }

    // const removeVisibilityChange = () => {
    //     window.removeEventListener('visibilitychange', handleVisibilityChange);
    
    // }

    // const handleVisibilityChange = () => {

    //     if (document.hidden) {

    //         clearTimeout(timer);
    //         timer = null;

    //         return;
    //     } 
            
    //     if (timer == null) makeMove();
    // }

    const getMoves = (solution) => {

        let moves = [];

        for (let i = 0; i < solution.length; i += 4) {

            let move = {
                from: {r: Number(solution[i]), c: Number(solution[i + 1])},
                to: {r: Number(solution[i + 2]), c: Number(solution[i + 3])}
            };

            moves.push(move);
        }

        return moves;
    }

    const makeMove = () => {

        let size = 7;
        let holes = document.querySelectorAll('.hole');

        // if (document.hidden) return;

        let {from, to} = moves.shift();

        switch (orientation) {

            case 'rotate90':

                from.r = size - 1 - from.r; 
                to.r = size - 1 - to.r; 

                break;

            case 'rotate180':

                [from.r, from.c] = [from.c, from.r]; 
                [to.r, to.c] = [to.c, to.r]; 


                break;

            case 'rotate270':

                [from.r, from.c] = [from.c, size - 1 - from.r]; 
                [to.r, to.c] = [to.c, size - 1 - to.r]; 

                break;

            case 'flip':

                from.c = size - 1 - from.c; 
                to.c = size - 1 - to.c; 

                break;

            case 'flip90':

                from.c = size - 1 - from.c; 
                to.c = size - 1 - to.c; 

                from.r = size - 1 - from.r; 
                to.r = size - 1 - to.r; 

                break;

            case 'flip180':

                from.c = size - 1 - from.c; 
                to.c = size - 1 - to.c;

                [from.r, from.c] = [from.c, from.r]; 
                [to.r, to.c] = [to.c, to.r];

                break;

            case 'flip270':

                from.c = size - 1 - from.c; 
                to.c = size - 1 - to.c; 

                [from.r, from.c] = [from.c, size - 1 - from.r]; 
                [to.r, to.c] = [to.c, size - 1 - to.r]; 

                break;
                
            default:
                break;
        }

        let peg = document.querySelector(`.peg[data-n='${from.r * size + from.c}']`);
        let peg0 = document.querySelector(`.peg[data-n='${(from.r + to.r) / 2 * size + (from.c + to.c) / 2}']`);
        let style = window.getComputedStyle(peg);
        let matrix = new DOMMatrix(style.transform);
        let pegRect = peg.getBoundingClientRect();
        let holeRect = holes[to.r * size + to.c].getBoundingClientRect();
        let offsetLeft = pegRect.left - holeRect.left;
        let offsetTop = pegRect.top - holeRect.top;

        holes[to.r * size + to.c].classList.remove('empty');
        holes[from.r * size + from.c].classList.add('empty');
        holes[(from.r + to.r) / 2 * size + (from.c + to.c) / 2].classList.add('empty');

        peg.dataset.n = to.r * size + to.c;
        peg.classList.add('move-ai');
        peg0.classList.add('invisible-ai');

        peg.addEventListener('animationend', async () => {
    
            peg.classList.remove('move-ai');
            peg0.removeAttribute('data-n');

            if (moves.length == 0) {

                // removeVisibilityChange();
                endGame(); 

                return;
            }

            moves.length == 25 || moves.length == 10 ? await sleep(1500) : await sleep(500);

            // await sleep(500);
            makeMove(); 

            // timer = setTimeout(makeMove, 500);

        }, {once: true});
        
        peg0.addEventListener('transitionend', () => {
            
            peg0.classList.add('hidden', 'invisible');
            peg0.classList.remove('invisible-ai');
            peg0.removeAttribute('style');
    
        }, {once: true});


        peg.style.transform = `translate(${matrix.m41 - offsetLeft}px, ${matrix.m42 - offsetTop}px)`;
    }

    const initWorker = async () => {

        try {

            let worker = new Worker('./js/solver.js');

            worker.addEventListener('message', async (e) => {

                worker.terminate();

                moves = e.data;
                
                aiPlay.savedMoves = [...moves];

                await sleep(timeDelay - (Date.now() - startTime));

                makeMove();
            });

        } catch (e) {

            moves = [...aiPlay.savedMoves];
    
            await sleep(timeDelay - (Date.now() - startTime));

            makeMove();
        } 
    }

    let startTime = Date.now();
    // let type = demoMode();
    let mode = demoMode();
    let timeDelay = init ? 2000 : 1000;
    let moves, orientation;
    let orientations = ['original', 'rotate90', 'rotate180', 'rotate270', 'flip', 'flip90', 'flip180', 'flip270'];
    let solution = '1333252304243414020404245434464443452646464441436242325264626242123220222321402020224341412121232325254545433335533332343533';
    // let fastSolution = '3133523240424341454364443454626464442242022214343454545252323212204040424244262423254626262404020222212323252545454343231333';
    // let solutions = {'easy':easySolution,'fast':fastSolution};

    // setVisibilityChange();
    disableReset();
    disableTouch();

    if (mode == 'ai') {

        orientation = orientations[Math.floor(Math.random() * 8)];

        initWorker();

    } else {

        orientation = 'original';

        // moves = getMoves(solutions[type]);
        moves = getMoves(solution);

        await sleep(timeDelay - (Date.now() - startTime));

        makeMove();
    }
}

const demoMode = () => {

    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    // let demo = urlParams.get('mode') == 'demo';
    // let type = urlParams.get('type');

    let mode = urlParams.get('mode');

    // return demo ? type : null;

    // return mode == 'ai' || mode == 'easy' ? mode : null;

    return true;
}

const enableReset = () => {

    let button = document.querySelector('.reset');

    button.classList.add('enabled');
    button.addEventListener('touchstart', resetGame);
    button.addEventListener('mousedown', resetGame);

    console.log('enableReset');
}

const disableReset = () => {

    let button = document.querySelector('.reset');

    // if (demoMode()) button.classList.remove('enabled');

    button.removeEventListener('touchstart', resetGame);
    button.removeEventListener('mousedown', resetGame);

    console.log('disableReset');
}

const enableTouch = () => {

    let pegs = document.querySelectorAll('.peg');
    
    pegs.forEach(peg => {
        peg.addEventListener('touchstart', startMove);
        peg.addEventListener('mousedown', startMove);
    });

    window.addEventListener('orientationchange', placePeg);
}

const disableTouch = () => {

    let pegs = document.querySelectorAll('.peg');

    pegs.forEach(peg => {
        peg.removeEventListener('touchstart', startMove);
        peg.removeEventListener('mousedown', startMove);
    });
}

const disableScreen = () => {

    const preventDefault = (e) => e.preventDefault();

    document.addEventListener('touchstart', preventDefault, {passive: false});
    document.addEventListener('mousedown', preventDefault, {passive: false});
}

const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
}

const init = () => {

    // registerServiceWorker();
    disableScreen();
    setBoardSize();
    fillBoard();
    showBoard();
    enableTouch();

    enableReset(); //

    demoMode() ? aiPlay() : enableReset();
}

window.onload = () => document.fonts.ready.then(init);