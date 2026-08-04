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
import GameBoard from './GameBoard';
import ResultModal from './ResultModal';
import LightOrbs from './LightOrbs';
import ThemeToggle from './ThemeToggle';
import { createEmptyBoard, checkWinner, getWinningLine, isBoardFull } from './gameLogic';
import { useTheme } from './theme';
import { saveGameResult } from './history';

const BOARD_SIZE = Math.min(Dimensions.get('window').width - 56, 320);

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center' },
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
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 8,
      paddingHorizontal: 10,
      gap: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    badgeRight: { opacity: 0.85 },
    badgeDot: {
      width: 26,
      height: 26,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeDotText: { fontSize: 13, fontWeight: '800', color: '#fff' },
    badgeTitle: { fontSize: 12, fontWeight: '700', color: colors.text },
    badgeSub: { fontSize: 10, fontWeight: '500', color: colors.textFaint, marginTop: 1 },
    vsBadge: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    vsText: { fontSize: 10, fontWeight: '800', color: colors.textFaint },
    boardWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 24,
      paddingVertical: 14,
      marginBottom: 32,
    },
    footerText: { fontSize: 14, color: colors.textFaint, fontWeight: '500' },
    modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 2 },
    modalSub: { fontSize: 13, fontWeight: '600', color: colors.textDim },
    modalBtn: {
      width: '100%',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 16,
    },
    modalBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    dcCard: {
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 20,
      paddingVertical: 36,
      paddingHorizontal: 32,
      width: 280,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    dcIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: colors.borderStrong,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
    },
    dcIconText: { fontSize: 22, fontWeight: '800', color: colors.text },
  });

const OnlineGame = ({ config, onBack }) => {
  const { send, close, symbol, isHost, onMessage } = config;
  const { colors, gradients, isDark } = useTheme();
  const [board, setBoard] = useState(createEmptyBoard);
  const [currentTurn, setCurrentTurn] = useState('X');
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [connected, setConnected] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const gameOver = winner !== null || isDraw;
  const winningLine = winner ? getWinningLine(board) : null;
  const opponentSymbol = symbol === 'X' ? 'O' : 'X';
  const myColor = symbol === 'X' ? colors.x : colors.o;
  const opponentColor = symbol === 'X' ? colors.o : colors.x;

  useEffect(() => {
    if (gameOver) {
      const t = setTimeout(() => setModalVisible(true), 900);
      return () => clearTimeout(t);
    }
    setModalVisible(false);
  }, [gameOver]);

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
      if (win) {
        send({ type: 'game_over', winner: win, draw: false });
        setWinner(win);
        saveGameResult({ mode: 'Online', symbol: win, text: win === symbol ? 'You Win!' : 'You Lose' });
        return;
      }
      if (isBoardFull(newBoard)) {
        send({ type: 'game_over', winner: null, draw: true });
        setIsDraw(true);
        saveGameResult({ mode: 'Online', symbol: '—', text: "It's a Draw!" });
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

  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const youWon = winner === symbol;

  if (!connected) {
    return (
      <LinearGradient colors={gradients.bg} style={styles.container}>
        <LightOrbs />
        <View style={styles.dcCard}>
          <View style={styles.dcIcon}>
            <Text style={styles.dcIconText}>!</Text>
          </View>
          <Text style={styles.modalTitle}>Disconnected</Text>
          <Text style={styles.modalSub}>Opponent left the game</Text>
          <TouchableOpacity
            style={[styles.modalBtn, { backgroundColor: colors.text }]}
            onPress={onBack}
          >
            <Text style={styles.modalBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={gradients.bg} style={styles.container}>
      <LightOrbs />
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
          <View style={[styles.badgeDot, { backgroundColor: opponentColor, opacity: 0.6 }]}>
            <Text style={styles.badgeDotText}>{opponentSymbol}</Text>
          </View>
          <View>
            <Text style={styles.badgeTitle}>Opponent</Text>
            <Text style={styles.badgeSub}>{currentTurn === opponentSymbol ? 'Playing' : ''}</Text>
          </View>
        </View>
      </View>

      <View style={styles.boardWrap}>
        <GameBoard
          board={board}
          onCellPress={handleMove}
          disabled={gameOver || currentTurn !== symbol}
          winningLine={winningLine}
          size={BOARD_SIZE}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10 }}>
          <Text style={styles.footerText}>← Leave</Text>
        </TouchableOpacity>
        <ThemeToggle />
      </View>

      <ResultModal
        visible={modalVisible}
        icon={isDraw ? '—' : winner === symbol ? '★' : '✕'}
        iconBg={isDraw ? (isDark ? '#3a4258' : '#c9ccd6') : winner === symbol ? colors.text : (isDark ? '#6a7188' : '#9aa0ae')}
        accent={youWon ? myColor : colors.text}
        title={isDraw ? "It's a Draw!" : youWon ? 'You Win!' : 'You Lose'}
        subtitle={isDraw ? 'Good game!' : youWon ? 'Great play!' : 'Better luck next time'}
        primaryLabel="Play Again"
        onPrimary={restartGame}
        secondaryLabel="Leave"
        onSecondary={onBack}
        celebrate={youWon}
      />
    </LinearGradient>
  );
};

export default OnlineGame;
