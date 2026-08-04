import React, { useState, useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import GameBoard from './GameBoard';
import ResultModal from './ResultModal';
import LightOrbs from './LightOrbs';
import ThemeToggle from './ThemeToggle';
import { checkWinner, getWinningLine, isBoardFull, createEmptyBoard } from './gameLogic';
import { getAIMove } from './ai';
import { useTheme } from './theme';
import { saveGameResult } from './history';
import { startBackgroundMusic, stopBackgroundMusic } from './music';

const BOARD_SIZE = Math.min(Dimensions.get('window').width - 56, 320);

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center' },
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
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.border,
      paddingVertical: 8,
      paddingHorizontal: 10,
      gap: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    badgeDot: {
      width: 26,
      height: 26,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeDotOff: { opacity: 0.35 },
    badgeDotText: { fontSize: 13, fontWeight: '800', color: '#fff' },
    badgeLabel: { fontSize: 12, fontWeight: '700', color: colors.text },
    badgeScore: { fontSize: 11, fontWeight: '700', marginTop: 2 },
    thinkingDot: { width: 18, height: 4, borderRadius: 2, marginTop: 3 },
    turnCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    turnDot: { width: 8, height: 8, borderRadius: 4 },
    turnText: { fontSize: 13, fontWeight: '700', color: colors.textDim },
    scoreRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    scorePill: {
      backgroundColor: colors.card,
      borderRadius: 20,
      paddingVertical: 5,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    scorePillLabel: { fontSize: 12, fontWeight: '600', color: colors.textDim },
    scorePillValue: { fontSize: 13, fontWeight: '800', color: colors.text },
    boardWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      paddingVertical: 14,
      marginBottom: 30,
    },
    resetBtn: {
      backgroundColor: colors.borderStrong,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    resetBtnText: { fontSize: 14, fontWeight: '700', color: colors.text },
    footerText: { fontSize: 14, color: colors.textFaint, fontWeight: '500' },
  });

const AIGame = ({ onBack }) => {
  const { colors, gradients, isDark } = useTheme();
  const [board, setBoard] = useState(createEmptyBoard);
  const [currentTurn, setCurrentTurn] = useState('X');
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const timerRef = useRef(null);
  const boardAnim = useRef(new Animated.Value(0)).current;

  const gameOver = winner !== null || isDraw;
  const winningLine = winner ? getWinningLine(board) : null;

  useEffect(() => {
    if (gameOver) {
      const t = setTimeout(() => setModalVisible(true), 900);
      return () => clearTimeout(t);
    }
    setModalVisible(false);
  }, [gameOver]);

  useEffect(() => {
    Animated.spring(boardAnim, {
      toValue: 1,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [boardAnim]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    startBackgroundMusic();
    return () => stopBackgroundMusic();
  }, []);

  useEffect(() => {
    if (currentTurn === 'O' && !gameOver) {
      setAiThinking(true);
      timerRef.current = setTimeout(() => {
        const boardCopy = [...board];
        const aiIndex = getAIMove(boardCopy, 'O');
        if (aiIndex === -1) { setAiThinking(false); return; }
        const newBoard = [...board];
        newBoard[aiIndex] = 'O';
        setBoard(newBoard);
        const win = checkWinner(newBoard);
        if (win) { setWinner(win); setScores((s) => ({ ...s, O: s.O + 1 })); saveGameResult({ mode: 'Auto Play', symbol: 'O', text: 'AI Wins!' }); setAiThinking(false); return; }
        if (isBoardFull(newBoard)) { setIsDraw(true); setScores((s) => ({ ...s, draws: s.draws + 1 })); saveGameResult({ mode: 'Auto Play', symbol: '—', text: "It's a Draw!" }); setAiThinking(false); return; }
        setCurrentTurn('X');
        setAiThinking(false);
      }, 550);
    }
  }, [currentTurn, gameOver, board]);

  const handleMove = (index) => {
    if (board[index] || gameOver || aiThinking || currentTurn !== 'X') return;
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    const win = checkWinner(newBoard);
    if (win) { setWinner(win); setScores((s) => ({ ...s, X: s.X + 1 })); saveGameResult({ mode: 'Auto Play', symbol: 'X', text: 'You Win!' }); return; }
    if (isBoardFull(newBoard)) { setIsDraw(true); setScores((s) => ({ ...s, draws: s.draws + 1 })); saveGameResult({ mode: 'Auto Play', symbol: '—', text: "It's a Draw!" }); return; }
    setCurrentTurn('O');
  };

  const resetGame = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setBoard(createEmptyBoard());
    setCurrentTurn('X');
    setWinner(null);
    setIsDraw(false);
    setAiThinking(false);
  };

  const goHome = () => {
    resetGame();
    onBack();
  };

  const boardScale = boardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const X_COLOR = colors.x;
  const O_COLOR = colors.o;
  const winnerColor = winner === 'X' ? X_COLOR : O_COLOR;
  const youWon = winner === 'X';

  return (
    <LinearGradient colors={gradients.bg} style={styles.container}>
      <LightOrbs />
      <View style={styles.topSection}>
        <PlayerBadge symbol="X" label="You" score={scores.X} active={currentTurn === 'X'} colors={colors} />
        <View style={styles.turnCenter}>
          <View style={[styles.turnDot, { backgroundColor: currentTurn === 'X' ? X_COLOR : O_COLOR }]} />
          <Text style={styles.turnText}>
            {currentTurn === 'X' ? 'Your Turn' : 'AI Thinking...'}
          </Text>
        </View>
        <PlayerBadge
          symbol="O"
          label="AI"
          score={scores.O}
          active={currentTurn === 'O'}
          thinking={aiThinking}
          colors={colors}
        />
      </View>

      <View style={styles.scoreRow}>
        <ScorePill label="You" value={scores.X} styles={styles} />
        <ScorePill label="Draw" value={scores.draws} styles={styles} />
        <ScorePill label="AI" value={scores.O} styles={styles} />
      </View>

      <Animated.View style={[styles.boardWrap, { transform: [{ scale: boardScale }] }]}>
        <GameBoard
          board={board}
          onCellPress={handleMove}
          disabled={gameOver || aiThinking || currentTurn !== 'X'}
          winningLine={winningLine}
          size={BOARD_SIZE}
        />
      </Animated.View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetBtn} onPress={resetGame} activeOpacity={0.85}>
          <Text style={styles.resetBtnText}>↻ Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goHome} hitSlop={{ top: 10, bottom: 10 }}>
          <Text style={styles.footerText}>← Home</Text>
        </TouchableOpacity>
        <ThemeToggle />
      </View>

      <ResultModal
        visible={modalVisible}
        icon={isDraw ? '—' : winner}
        iconBg={isDraw ? (isDark ? '#3a4258' : '#c9ccd6') : winnerColor}
        accent={youWon ? X_COLOR : O_COLOR}
        title={isDraw ? "It's a Draw!" : youWon ? 'You Win!' : 'AI Wins!'}
        subtitle={isDraw ? 'No more moves left' : youWon ? 'Great play!' : 'Better luck next time'}
        primaryLabel="Play Again"
        onPrimary={resetGame}
        secondaryLabel="Main Menu"
        onSecondary={goHome}
        celebrate={!isDraw && youWon}
      />
    </LinearGradient>
  );
};

const PlayerBadge = ({ symbol, label, active, score, colors, thinking }) => {
  const isX = symbol === 'X';
  const color = isX ? colors.x : colors.o;
  const pulse = useRef(new Animated.Value(0)).current;
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => {
    if (thinking) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [thinking, pulse]);

  return (
    <View style={[styles.badge, active && { borderColor: color, shadowColor: color }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }, !active && styles.badgeDotOff]}>
        <Text style={styles.badgeDotText}>{symbol}</Text>
      </View>
      <View>
        <Text style={styles.badgeLabel}>{label}</Text>
        {thinking ? (
          <Animated.View style={[styles.thinkingDot, { backgroundColor: color, opacity: pulse }]} />
        ) : (
          <Text style={[styles.badgeScore, { color }]}>{score} {active ? '●' : ''}</Text>
        )}
      </View>
    </View>
  );
};

const ScorePill = ({ label, value, styles }) => (
  <View style={styles.scorePill}>
    <Text style={styles.scorePillLabel}>{label}</Text>
    <Text style={styles.scorePillValue}>{value}</Text>
  </View>
);

export default AIGame;
