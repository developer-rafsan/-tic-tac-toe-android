import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Cell from './Cell';
import { checkWinner, isBoardFull, getNextTurn, createEmptyBoard } from './gameLogic';

const X_COLOR = '#ff4757';
const O_COLOR = '#2ed573';

const BOARD_SIZE = Math.min(Dimensions.get('window').width - 56, 320);
const GAP = 6;
const CELL_SIZE = (BOARD_SIZE - GAP * 2) / 3;

const OfflineGame = ({ onBack }) => {
  const [board, setBoard] = useState(createEmptyBoard);
  const [currentTurn, setCurrentTurn] = useState('X');
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);

  const gameOver = winner !== null || isDraw;

  const handleMove = useCallback(
    (index) => {
      if (board[index] || gameOver) return;

      const newBoard = [...board];
      newBoard[index] = currentTurn;
      setBoard(newBoard);

      const win = checkWinner(newBoard);
      if (win) {
        setWinner(win);
        return;
      }

      if (isBoardFull(newBoard)) {
        setIsDraw(true);
        return;
      }

      setCurrentTurn(getNextTurn(currentTurn));
    },
    [board, currentTurn, gameOver],
  );

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentTurn('X');
    setWinner(null);
    setIsDraw(false);
  };

  return (
    <LinearGradient colors={['#0F0C29', '#302B63']} style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.playerGroup}>
          <View style={[styles.dot, styles.dotX, currentTurn !== 'X' && styles.dotInactive]}>
            <Text style={styles.dotText}>✕</Text>
          </View>
          <Text style={styles.vsText}>vs</Text>
          <View style={[styles.dot, styles.dotO, currentTurn !== 'O' && styles.dotInactive]}>
            <Text style={styles.dotText}>○</Text>
          </View>
        </View>
        <View style={styles.turnPill}>
          <Text style={styles.turnPillText}>
            {currentTurn === 'X' ? "✕'s Turn" : "○'s Turn"}
          </Text>
        </View>
      </View>

      <View style={styles.boardContainer}>
        <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
          {board.map((value, index) => (
            <Cell
              key={index}
              value={value}
              index={index}
              onPress={() => handleMove(index)}
              disabled={gameOver}
              cellSize={CELL_SIZE}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>⟵ Home</Text>
      </TouchableOpacity>

      {gameOver && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={[styles.modalSymbol, isDraw ? styles.modalSymbolDraw : winner === 'X' ? styles.modalSymbolX : styles.modalSymbolO]}>
              {isDraw ? '∅' : winner}
            </Text>
            <Text style={styles.modalTitle}>
              {isDraw ? "It's a Draw!" : `${winner} Wins!`}
            </Text>
            <Text style={styles.modalSubtitle}>Game Over</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={resetGame}>
              <Text style={styles.modalBtnText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnSecondary} onPress={onBack}>
              <Text style={styles.modalBtnSecondaryText}>Main Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  playerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotX: {
    backgroundColor: X_COLOR,
  },
  dotO: {
    backgroundColor: O_COLOR,
  },
  dotInactive: {
    opacity: 0.35,
  },
  dotText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  vsText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.35)',
  },
  turnPill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  turnPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    alignContent: 'flex-start',
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 36,
  },
  backBtnText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 15,
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modal: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 14,
  },
  modalSymbol: {
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 12,
  },
  modalSymbolX: {
    color: X_COLOR,
  },
  modalSymbolO: {
    color: O_COLOR,
  },
  modalSymbolDraw: {
    color: '#888',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 28,
  },
  modalBtn: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#302B63',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalBtnSecondary: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
});

export default OfflineGame;
