import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import Cell from './Cell';
import { createEmptyBoard, checkWinner, isBoardFull } from './gameLogic';

const X_COLOR = '#ff4757';
const O_COLOR = '#2ed573';

const BOARD_SIZE = Math.min(Dimensions.get('window').width - 56, 320);
const GAP = 6;
const CELL_SIZE = (BOARD_SIZE - GAP * 2) / 3;

const OnlineGame = ({ config, onBack }) => {
  const { send, close, symbol, isHost, onMessage } = config;
  const [board, setBoard] = useState(createEmptyBoard);
  const [currentTurn, setCurrentTurn] = useState('X');
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [connected, setConnected] = useState(true);

  const gameOver = winner !== null || isDraw;
  const opponentSymbol = symbol === 'X' ? 'O' : 'X';
  const myColor = symbol === 'X' ? X_COLOR : O_COLOR;
  const opponentColor = symbol === 'X' ? O_COLOR : X_COLOR;

  useEffect(() => {
    onMessage((data) => {
      switch (data.type) {
        case 'move_made':
          setBoard(data.board);
          setCurrentTurn(data.turn);
          break;
        case 'game_over':
          setWinner(data.winner);
          setIsDraw(!!data.draw);
          break;
        case 'restarted':
          setBoard(createEmptyBoard());
          setCurrentTurn('X');
          setWinner(null);
          setIsDraw(false);
          break;
        case 'opponent_disconnected':
          setConnected(false);
          Alert.alert('Disconnected', 'Opponent has left the game');
          break;
      }
    });
    return () => { try { close(); } catch (_) {} };
  }, [onMessage, close]);

  const handleMove = useCallback(
    (index) => {
      if (board[index] || gameOver || currentTurn !== symbol) return;
      const newBoard = [...board];
      newBoard[index] = symbol;
      const nextTurn = symbol === 'X' ? 'O' : 'X';
      send({ type: 'move_made', index, symbol, board: newBoard, turn: nextTurn });
      setBoard(newBoard);
      setCurrentTurn(nextTurn);
      const win = checkWinner(newBoard);
      if (win) { send({ type: 'game_over', winner: win, draw: false }); setWinner(win); return; }
      if (isBoardFull(newBoard)) { send({ type: 'game_over', winner: null, draw: true }); setIsDraw(true); }
    },
    [board, currentTurn, symbol, gameOver, send],
  );

  const restartGame = () => {
    setBoard(createEmptyBoard());
    setCurrentTurn('X');
    setWinner(null);
    setIsDraw(false);
    send({ type: 'restart' });
  };

  if (!connected) {
    return (
      <View style={styles.container}>
        <View style={styles.dcCard}>
          <View style={styles.dcIcon}>
            <Text style={styles.dcIconText}>!</Text>
          </View>
          <Text style={styles.modalTitle}>Disconnected</Text>
          <Text style={styles.modalSub}>Opponent left the game</Text>
          <TouchableOpacity style={styles.modalBtn} onPress={onBack}>
            <Text style={styles.modalBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={[styles.badge, currentTurn === symbol && { borderColor: myColor }]}>
          <View style={[styles.badgeDot, { backgroundColor: myColor }]}>
            <Text style={styles.badgeDotText}>{symbol}</Text>
          </View>
          <View>
            <Text style={styles.badgeTitle}>You{isHost ? ' (Host)' : ''}</Text>
            <Text style={styles.badgeSub}>{currentTurn === symbol ? 'Playing' : 'Waiting'}</Text>
          </View>
        </View>
        <View style={styles.vsBadge}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        <View style={[styles.badge, styles.badgeRight, currentTurn !== symbol && currentTurn !== '' && { borderColor: opponentColor }]}>
          <View style={[styles.badgeDot, opponentSymbol === 'X' ? styles.opponentDotX : styles.opponentDotO]}>
            <Text style={styles.badgeDotText}>{opponentSymbol}</Text>
          </View>
          <View>
            <Text style={styles.badgeTitle}>Opponent</Text>
            <Text style={styles.badgeSub}>{currentTurn === opponentSymbol ? 'Playing' : ''}</Text>
          </View>
        </View>
      </View>

      <View style={styles.boardWrap}>
        <View style={styles.boardBox}>
          <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
            {board.map((value, index) => (
              <Cell key={index} value={value} index={index} onPress={() => handleMove(index)} disabled={gameOver || currentTurn !== symbol} cellSize={CELL_SIZE} />
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.footer} onPress={onBack}>
        <Text style={styles.footerText}>← Leave</Text>
      </TouchableOpacity>

      {gameOver && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={[styles.modalIconWrap, isDraw ? styles.modalIconDrawBg : winner === symbol ? styles.modalIconWin : styles.modalIconLose]}>
              <Text style={styles.modalIcon}>{isDraw ? '—' : winner === symbol ? '★' : '○'}</Text>
            </View>
            <Text style={styles.modalTitle}>
              {isDraw ? "It's a Draw!" : winner === symbol ? 'You Win!' : 'You Lose'}
            </Text>
            <Text style={[styles.modalSub, styles.modalSubExtra]}>
              {isDraw ? 'Good game!' : winner === symbol ? 'Great play!' : 'Better luck next time'}
            </Text>
            <View style={styles.modalLine} />
            <TouchableOpacity style={styles.modalBtn} onPress={restartGame}>
              <Text style={styles.modalBtnText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onBack}>
              <Text style={styles.modalSecondary}>Leave</Text>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },
  badge: {
    flex: 1,
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
  badgeRight: {
    opacity: 0.85,
  },
  badgeDot: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  opponentDotX: {
    backgroundColor: X_COLOR,
    opacity: 0.55,
  },
  opponentDotO: {
    backgroundColor: O_COLOR,
    opacity: 0.55,
  },
  badgeDotText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  badgeSub: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.4)',
    marginTop: 1,
  },
  vsBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  vsText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.25)',
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
  modalIconWin: {
    backgroundColor: '#1a1a2e',
  },
  modalIconLose: {
    backgroundColor: '#ddd',
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
    marginBottom: 2,
  },
  modalSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  modalSubExtra: {
    marginBottom: 12,
  },
  modalLine: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.06)',
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
  dcCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 32,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  dcIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  dcIconText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
  },
});

export default OnlineGame;
