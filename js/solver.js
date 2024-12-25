const getBoardHash = (board) => board.map(row => row.join('')).join('');

const initBoard = () => {
    
    return [[2, 2, 1, 1, 1, 2, 2],
            [2, 2, 1, 1, 1, 2, 2],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [2, 2, 1, 1, 1, 2, 2],
            [2, 2, 1, 1, 1, 2, 2]];
}

const getAvailableMoves = (board) => {

    let size = 7;
    let moves = [];
    let directions = [[-2, 0], [2, 0], [0, -2], [0, 2]];

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {

            if (board[r][c] != 1) continue;

            for (let [dr, dc] of directions) {

                let r2 = r + dr;
                let c2 = c + dc;

                if (r2 >= 0 && r2 < size && c2 >= 0 && c2 < size &&
                    board[r2][c2] == 0 && board[(r + r2) / 2][(c + c2) / 2] == 1) {

                    moves.push({from: {r, c}, to: {r: r2, c: c2}});
                }
            }
        }
    }

    return moves;
}

const makeMove = (board, move) => {

    let {from, to} = move;

    board[from.r][from.c] = 0;
    board[to.r][to.c] = 1;
    board[(from.r + to.r) / 2][(from.c + to.c) / 2] = 0;
}

const dfs = () => {

    let board = initBoard();
    let visited = new Set();
    let stack = [[board, []]];

    while (stack.length > 0) {

        let [board, path] = stack.pop();
        let boardHash = getBoardHash(board);

        if (visited.has(boardHash)) continue;

        visited.add(boardHash);

        let moves = getAvailableMoves(board);

        if (moves.length == 0) {

            let remainingPegs = board.flat().filter(hole => hole == 1).length;

            if (remainingPegs == 1 && board[3][3] == 1) return path;

            continue;
        }

        for (let move of moves) {

            let nextBoard = board.map(arr => arr.slice());

            makeMove(nextBoard, move);

            stack.push([nextBoard, path.concat(move)]);
        }
    }

    return null;
}

postMessage(dfs());