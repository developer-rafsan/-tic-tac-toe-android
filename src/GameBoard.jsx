import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Cell from './Cell';
import WinningLine from './WinningLine';
import { useTheme } from './theme';

const GameBoard = ({ board, onCellPress, disabled, winningLine, size }) => {
  const { colors, gradients, isDark } = useTheme();
  const cellSize = size / 3;
  const lineWidth = isDark ? 2 : 2.5;
  const winner = winningLine ? board[winningLine[0]] : null;
  const winnerColor = winner === 'X' ? colors.x : colors.o;
  const positions = [1 / 3, 2 / 3];

  return (
    <Animated.View
      style={[
        styles.shadowWrap,
        {
          width: size,
          height: size,
          borderRadius: 26,
          shadowColor: winningLine ? winnerColor : colors.ai,
        },
      ]}
    >
      <LinearGradient
        colors={gradients.board}
        style={[styles.board, { width: size, height: size, borderRadius: 26 }]}
      >
        {positions.map((p) => (
          <React.Fragment key={p}>
            <View
              pointerEvents="none"
              style={[
                styles.vLine,
                {
                  left: size * p - lineWidth / 2,
                  width: lineWidth,
                  borderRadius: lineWidth / 2,
                  backgroundColor: colors.borderStrong,
                },
              ]}
            />
            <View
              pointerEvents="none"
              style={[
                styles.hLine,
                {
                  top: size * p - lineWidth / 2,
                  height: lineWidth,
                  borderRadius: lineWidth / 2,
                  backgroundColor: colors.borderStrong,
                },
              ]}
            />
          </React.Fragment>
        ))}

        {board.map((value, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          return (
            <View
              key={index}
              style={[
                styles.slot,
                { width: cellSize, height: cellSize, left: col * cellSize, top: row * cellSize },
              ]}
            >
              <Cell
                value={value}
                onPress={() => onCellPress(index)}
                disabled={disabled}
                winning={!!winningLine && winningLine.includes(index)}
                cellSize={cellSize}
              />
            </View>
          );
        })}

        {winningLine ? (
          <WinningLine line={winningLine} color={winnerColor} cellSize={cellSize} gap={0} />
        ) : null}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadowWrap: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 10,
  },
  board: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(128,128,160,0.18)',
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  slot: {
    position: 'absolute',
  },
});

export default GameBoard;
