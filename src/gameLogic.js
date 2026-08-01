export const WIN_CONDITIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const getWinningLine = (board) => {
  for (const cond of WIN_CONDITIONS) {
    if (board[cond[0]] && board[cond[0]] === board[cond[1]] && board[cond[0]] === board[cond[2]]) {
      return cond;
    }
  }
  return null;
};

export const checkWinner = (board) => {
  const line = getWinningLine(board);
  return line ? board[line[0]] : null;
};

export const isBoardFull = (board) => board.every((cell) => cell !== '');

export const getNextTurn = (current) => (current === 'X' ? 'O' : 'X');

export const createEmptyBoard = () => Array(9).fill('');
