import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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

    return () => {
      try { close(); } catch (_) {}
    };
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
      if (win) {
        send({ type: 'game_over', winner: win, draw: false });
        setWinner(win);
        return;
      }

      if (isBoardFull(newBoard)) {
        send({ type: 'game_over', winner: null, draw: true });
        setIsDraw(true);
      }
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
      <LinearGradient colors={['#0F0C29', '#302B63']} style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.modalSymbol}>!</Text>
          <Text style={styles.modalTitle}>Disconnected</Text>
          <Text style={styles.modalSubtitle}>Opponent left the game</Text>
          <TouchableOpacity style={styles.modalBtn} onPress={onBack}>
            <Text style={styles.modalBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0F0C29', '#302B63']} style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.playerInfo}>
          <View style={[styles.avatar, { backgroundColor: symbol === 'X' ? X_COLOR : O_COLOR }]}>
            <Text style={styles.avatarText}>{symbol}</Text>
          </View>
          <View>
            <Text style={styles.playerLabel}>You {isHost && '(Host)'}</Text>
            <Text style={styles.opponentLabel}>vs {opponentSymbol}</Text>
          </View>
        </View>
        <View style={[styles.turnBadge, currentTurn === symbol ? (symbol === 'X' ? styles.turnActiveX : styles.turnActiveO) : styles.turnInactive]}>
          <Text style={styles.turnText}>
            {gameOver ? 'Done' : currentTurn === symbol ? 'Your turn' : 'Waiting'}
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
              disabled={gameOver || currentTurn !== symbol}
              cellSize={CELL_SIZE}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>⟵ Leave</Text>
      </TouchableOpacity>

      {gameOver && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalSymbol}>
              {isDraw ? '∅' : winner === symbol ? '★' : '○'}
            </Text>
            <Text style={styles.modalTitle}>
              {isDraw ? "It's a Draw!" : winner === symbol ? 'You Win!' : 'You Lose'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isDraw ? 'Good game!' : winner === symbol ? 'Great play!' : 'Better luck next time'}
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={restartGame}>
              <Text style={styles.modalBtnText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnSecondary} onPress={onBack}>
              <Text style={styles.modalBtnSecondaryText}>Leave</Text>
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
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  playerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  opponentLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  turnBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  turnActiveX: {
    borderColor: X_COLOR,
  },
  turnActiveO: {
    borderColor: O_COLOR,
  },
  turnInactive: {
    borderColor: 'rgba(255,255,255,0.1)',
  },
  turnText: {
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
    color: '#1a1a2e',
    marginBottom: 12,
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

export default OnlineGame;
