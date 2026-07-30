import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Cell from './Cell';
import { checkWinner, isBoardFull, getNextTurn, createEmptyBoard } from './gameLogic';

const X_COLOR = '#ff4757';
const O_COLOR = '#2ed573';

const BOARD_SIZE = Math.min(Dimensions.get('window').width - 56, 320);
const GAP = 6;
const CELL_SIZE = (BOARD_SIZE - GAP * 2) / 3;

const PlayerBadge = ({ symbol, label, active }) => {
  const isX = symbol === 'X';
  const color = isX ? X_COLOR : O_COLOR;
  return (
    <View style={[styles.badge, active && { borderColor: color }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }, !active && styles.badgeDotOff]}>
        <Text style={styles.badgeDotText}>{symbol}</Text>
      </View>
      <View>
        <Text style={styles.badgeLabel}>{label}</Text>
        {active && <Text style={[styles.badgeStatus, { color }]}>Playing</Text>}
      </View>
    </View>
  );
};

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
      if (win) { setWinner(win); return; }
      if (isBoardFull(newBoard)) { setIsDraw(true); return; }
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
    <View style={styles.container}>
      <View style={styles.topSection}>
        <PlayerBadge symbol="X" label="Player X" active={currentTurn === 'X'} />
        <View style={styles.turnCenter}>
          <View style={[styles.turnDot, { backgroundColor: currentTurn === 'X' ? X_COLOR : O_COLOR }]} />
          <Text style={styles.turnText}>{currentTurn}'s Turn</Text>
        </View>
        <PlayerBadge symbol="O" label="Player O" active={currentTurn === 'O'} />
      </View>

      <View style={styles.boardWrap}>
        <View style={styles.boardBox}>
          <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
            {board.map((value, index) => (
              <Cell key={index} value={value} index={index} onPress={() => handleMove(index)} disabled={gameOver} cellSize={CELL_SIZE} />
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.footer} onPress={onBack}>
        <Text style={styles.footerText}>← Home</Text>
      </TouchableOpacity>

      {gameOver && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={[styles.modalIconWrap, isDraw ? styles.modalIconDrawBg : winner === 'X' ? styles.modalIconX : styles.modalIconO]}>
              <Text style={styles.modalIcon}>{isDraw ? '—' : winner}</Text>
            </View>
            <Text style={styles.modalTitle}>{isDraw ? "It's a Draw!" : `${winner} Wins!`}</Text>
            <View style={styles.modalLine} />
            <TouchableOpacity style={styles.modalBtn} onPress={resetGame}>
              <Text style={styles.modalBtnText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onBack}>
              <Text style={styles.modalSecondary}>Main Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f5f9',
    alignItems: 'center',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeDot: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDotOff: {
    opacity: 0.25,
  },
  badgeDotText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  badgeStatus: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  turnCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  turnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  turnText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.5)',
  },
  boardWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    alignContent: 'flex-start',
  },
  footer: {
    paddingVertical: 14,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.3)',
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalIconX: {
    backgroundColor: X_COLOR,
  },
  modalIconO: {
    backgroundColor: O_COLOR,
  },
  modalIconDrawBg: {
    backgroundColor: '#eee',
  },
  modalIcon: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  modalLine: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginTop: 10,
    marginBottom: 24,
  },
  modalBtn: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
});

export default OfflineGame;
