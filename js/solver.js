const size = 7;

const hash = (board) => board.map(r => r.join('')).join('');

const initBoard = () => {
    
    return [[0, 0, 1, 1, 1, 0, 0],                     
            [0, 0, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 2, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 0, 0]];
}

const shuffle = (array) => {

    for (let i = array.length - 1; i > 0; i--) {

        let j = Math.trunc(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]]; 
    }

    return array;
}

const validMoves = (board) => {

    let moves = [];
    let dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];
    
    for (let r = 0; r < size; r++) {

        for (let c = 0; c < size; c++) {

            if (board[r][c] != 1) continue;

            dirs.forEach(dir => {

                let r2 = r + dir[0];
                let c2 = c + dir[1];

                if (r2 >= 0 && r2 < size && c2 >= 0 && c2 < size &&
                    board[r2][c2] == 2 && board[(r + r2) / 2][(c + c2) / 2] == 1) {

                    moves.push([[r, c],[r2, c2]]);
                }
            });
        }
    }
    // return shuffle(moves);
    return moves;
}

const makeMove = (board, move) => {

    let from = move[0];
    let to = move[1];

    board[from[0]][from[1]] = 2;
    board[to[0]][to[1]] = 1;
    board[(from[0] + to[0]) / 2][(from[1] + to[1]) / 2] = 2;
}

const dfs = () => {
        
    let board = initBoard();
    let visited = new Set();
    let stack = [{board, moveSequence: []}];

    while (stack.length > 0) {

        let {board, moveSequence} = stack.pop();
        let boardHash = hash(board);

        if (visited.has(boardHash)) continue;

        visited.add(boardHash);

        let moves = validMoves(board);

        if (moves.length == 0) {

            const nPegs = board.flat().filter(x => x == 1).length;

            if (nPegs == 1 && board[3][3] == 1) return moveSequence;

            continue;
        }

        for (let move of moves) {

            let newBoard = board.map(row => [...row]);

            makeMove(newBoard, move);

            let newMoveSequence = moveSequence.concat([move]);

            stack.push({board: newBoard, moveSequence: newMoveSequence});
        }
    }

    return false;
}
//     if (isBoardSeen(board)) {
//         return false;
//     }

//     markBoardAsSeen(board);

//     const moves = getValidMoves(board);
//     if (moves.length === 0) {
//         let pegCount = 0;

//         for (let row = 0; row < board.length; row++) {
//             for (let col = 0; col < board[row].length; col++) {
//                 if (board[row][col] == 1) pegCount++;
//             }
//         }

//         if (pegCount === 1 && board[3][3] === 1) { // Added condition to check if the last peg is at the center
//             console.table(board);  // Log the final board state
//             console.log('Move sequence:', moveSequence);  // Log the move sequence leading to this solution
//             return true;
//         }
//         return false;
//     }

//     for (const move of moves) {

//         let newBoard = [[],[],[],[],[],[],[]];

//         for (let row = 0; row < board.length; row++) {
//             for (let col = 0; col < board[row].length; col++) {
//                 newBoard[row][col] = board[row][col];
//             }
//         }

//         applyMove(newBoard, move);
//         const newMoveSequence = moveSequence.concat([move]);  // Keep track of the move sequence
//         if (solve(newBoard, newMoveSequence)) {
//             return true;
//         }
//     }
    
//     return false;
// }    