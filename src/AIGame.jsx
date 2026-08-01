import React, { useState, useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Cell from './Cell';
import ResultModal from './ResultModal';
import WinningLine from './WinningLine';
import { checkWinner, getWinningLine, isBoardFull, createEmptyBoard } from './gameLogic';
import { getAIMove } from './ai';
import { COLORS, BG_GRADIENT } from './theme';
import { saveGameResult } from './history';

const X_COLOR = COLORS.x;
const O_COLOR = COLORS.o;

const BOARD_SIZE = Math.min(Dimensions.get('window').width - 56, 320);
const GAP = 6;
const CELL_SIZE = (BOARD_SIZE - GAP * 2) / 3;

const PlayerBadge = ({ symbol, label, active, score, thinking }) => {
  const isX = symbol === 'X';
  const color = isX ? X_COLOR : O_COLOR;
  const pulse = useRef(new Animated.Value(0)).current;

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
          <Animated.View style={[styles.thinkingDot, { opacity: pulse }]} />
        ) : (
          <Text style={[styles.badgeScore, { color }]}>{score} {active ? '●' : ''}</Text>
        )}
      </View>
    </View>
  );
};

const ScorePill = ({ label, value }) => (
  <View style={styles.scorePill}>
    <Text style={styles.scorePillLabel}>{label}</Text>
    <Text style={styles.scorePillValue}>{value}</Text>
  </View>
);

const AIGame = ({ onBack }) => {
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
      const t = setTimeout(() => setModalVisible(true), 700);
      return () => clearTimeout(t);
    }
    setModalVisible(false);
  }, [gameOver]);

  useEffect(() => {
    Animated.timing(boardAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [boardAnim]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
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
      }, 500);
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
    outputRange: [0.92, 1],
  });

  return (
    <LinearGradient colors={BG_GRADIENT} style={styles.container}>
      <View style={styles.topSection}>
        <PlayerBadge symbol="X" label="You" score={scores.X} active={currentTurn === 'X'} />
        <View style={styles.turnCenter}>
          <View style={[styles.turnDot, { backgroundColor: currentTurn === 'X' ? X_COLOR : O_COLOR }]} />
          <Text style={styles.turnText}>
            {currentTurn === 'X' ? 'Your Turn' : 'AI Thinking...'}
          </Text>
        </View>
        <PlayerBadge symbol="O" label="AI" score={scores.O} active={currentTurn === 'O'} thinking={aiThinking} />
      </View>

      <View style={styles.scoreRow}>
        <ScorePill label="You" value={scores.X} />
        <ScorePill label="Draw" value={scores.draws} />
        <ScorePill label="AI" value={scores.O} />
      </View>

      <Animated.View style={[styles.boardWrap, { transform: [{ scale: boardScale }] }]}>
        <View style={styles.boardBox}>
          <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
            {board.map((value, index) => (
              <Cell
                key={index}
                value={value}
                index={index}
                onPress={() => handleMove(index)}
                disabled={gameOver || aiThinking || currentTurn !== 'X'}
                winning={!!winningLine && winningLine.includes(index)}
                cellSize={CELL_SIZE}
              />
            ))}
            {winningLine && (
              <WinningLine
                line={winningLine}
                color={winner === 'X' ? X_COLOR : O_COLOR}
                cellSize={CELL_SIZE}
                gap={GAP}
              />
            )}
          </View>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetBtn} onPress={resetGame} activeOpacity={0.85}>
          <Text style={styles.resetBtnText}>↻ Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goHome} hitSlop={{ top: 10, bottom: 10 }}>
          <Text style={styles.footerText}>← Home</Text>
        </TouchableOpacity>
      </View>

      <ResultModal
        visible={modalVisible}
        icon={isDraw ? '—' : winner}
        iconBg={isDraw ? '#c9ccd6' : winner === 'X' ? X_COLOR : O_COLOR}
        title={isDraw ? "It's a Draw!" : winner === 'X' ? 'You Win!' : 'AI Wins!'}
        subtitle={isDraw ? 'No more moves left' : winner === 'X' ? 'Great play!' : 'Better luck next time'}
        primaryLabel="Play Again"
        onPrimary={resetGame}
        secondaryLabel="Main Menu"
        onSecondary={goHome}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
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
  badgeDotOff: {
    opacity: 0.3,
  },
  badgeDotText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  badgeScore: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  thinkingDot: {
    width: 18,
    height: 4,
    borderRadius: 2,
    backgroundColor: O_COLOR,
    marginTop: 3,
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
    color: COLORS.textDim,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  scorePill: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  scorePillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDim,
  },
  scorePillValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  boardWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardBox: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    alignContent: 'flex-start',
    position: 'relative',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 14,
    marginBottom: 30,
  },
  resetBtn: {
    backgroundColor: 'rgba(20,20,43,0.06)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textFaint,
    fontWeight: '500',
  },
});

export default AIGame;
