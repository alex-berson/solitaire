let board;

const showBoard = () => document.body.style.opacity = 1;

const touchScreen = () => matchMedia('(hover: none)').matches;

const setBoardSize = () => {

    let minSide = screen.height > screen.width ? screen.width : window.innerHeight;
    let cssBoardSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--board-size'));
    let boardSize = Math.ceil(minSide * cssBoardSize / 7) * 7;

    document.documentElement.style.setProperty('--board-size', boardSize + 'px');
}

const init = () => {
    setBoardSize();
    showBoard();
}

window.addEventListener('load', () => document.fonts.ready.then(init));