import { checkWinner, isBoardFull } from './gameLogic';

export const getAIMove = (board, aiSymbol) => {
  const opponent = aiSymbol === 'X' ? 'O' : 'X';
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = aiSymbol;
      const score = minimax(board, 0, false, aiSymbol, opponent);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
};

const minimax = (board, depth, isMaximizing, aiSymbol, opponent) => {
  const winner = checkWinner(board);
  if (winner === aiSymbol) return 10 - depth;
  if (winner === opponent) return depth - 10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = aiSymbol;
        const score = minimax(board, depth + 1, false, aiSymbol, opponent);
        board[i] = '';
        bestScore = Math.max(bestScore, score);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = opponent;
        const score = minimax(board, depth + 1, true, aiSymbol, opponent);
        board[i] = '';
        bestScore = Math.min(bestScore, score);
      }
    }
    return bestScore;
  }
};
