const size = 7;

const boardHash = (board) => board.map(r => r.join('')).join('');

// const hash = (board) => {

//     let str = '';

//     for (let r = 0; r < size; r++) {
//         for (let c = 0; c < size; c++) {
//             str += board[r][c];
//         }
//     }

//     return str;
// }

// const hash = (board) => {

//     let strs = []

//     let str = '';

//     for (let r = 0; r < size; r++) {
//         for (let c = 0; c < size; c++) {
//             str += board[r][c];
//         }
//     }

//     strs.push(str);

//     str = '';

//     for (let c = size - 1 ; c >= 0; c--) {
//         for (let r = 0; r < size; r++) {
//             str += board[r][c];
//         }
//     }

//     strs.push(str);

//     str = '';

//     for (let r = size - 1 ; r >= 0; r--) {
//         for (let c = size -1; c >= 0; c--) {
//             str += board[r][c];
//         }
//     }

//     str = '';

//     for (let c = 0 ; c < size; c++) {
//         for (let r = size - 1; r >= 0; r--) {
//             str += board[r][c];
//         }
//     }

//     strs.push(str);

//     return strs;
// }

const shuffle = (array) => {

    for (let i = array.length - 1; i > 0; i--) {

        let j = Math.trunc(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]]; 
    }

    return array;
}

const initBoard = () => {
    
    return [[0, 0, 1, 1, 1, 0, 0],                     
            [0, 0, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 2, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 0, 0]];
}

const availableMoves = (board) => {

    let moves = [];
    let dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];

    // let rows = shuffle([0,1,2,3,4,5,6]);
    // let cols = shuffle([0,1,2,3,4,5,6]);
    // dirs = shuffle(dirs);
    
    // for (let r of rows) {
    //     for (let c of cols) {

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {

            if (board[r][c] != 1) continue;

            for (let dir of dirs) {

                let r2 = r + dir[0];
                let c2 = c + dir[1];

                if (r2 >= 0 && r2 < size && c2 >= 0 && c2 < size &&
                    board[r2][c2] == 2 && board[(r + r2) / 2][(c + c2) / 2] == 1) {

                    moves.push([[r, c],[r2, c2]]);
                }
            }
        }
    }
    // return shuffle(moves);
    return moves;
}

const makeMove = (board, move) => {

    let [from, to] = move;

    board[from[0]][from[1]] = 2;
    board[to[0]][to[1]] = 1;
    board[(from[0] + to[0]) / 2][(from[1] + to[1]) / 2] = 2;
}

const dfs = () => {

    console.log('DFS');
        
    let board = initBoard();
    let visitedBoards = new Set();
    let stack = [[board, []]];
    // let startTime = Date.now();

    while (stack.length > 0) {

        let [board, moveSequence] = stack.pop();
        let hashKey = boardHash(board);

        // if (Date.now() - startTime >= 5000) return [];
        if (visitedBoards.has(hashKey)) continue;

        visitedBoards.add(hashKey);

        let moves = availableMoves(board);

        if (moves.length == 0) {

            let nPegs = board.flat().filter(x => x == 1).length;

            // let nPegs = 0;

            // for (let r = 0; r < size; r++) {
            //     for (let c = 0; c < size; c++) {
            //         if (board[r][c] == 1) nPegs++
            //     }
            // }

            if (nPegs == 1 && board[3][3] == 1) return moveSequence;
            // if (nPegs == 1) return moveSequence;

            continue;
        }

        for (let move of moves) {

            // let newBoard = board.map(row => [...row]);
            let newBoard = board.map(arr => arr.slice());

            makeMove(newBoard, move);

            let newMoveSequence = moveSequence.concat([move]);

            stack.push([newBoard, newMoveSequence]);
        }
    }

    return false;
}

postMessage(dfs());