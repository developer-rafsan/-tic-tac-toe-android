import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { COLORS } from './theme';

const Cell = ({ value, onPress, disabled, cellSize, winning }) => {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const winAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: value ? 1 : 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [value, flipAnim]);

  useEffect(() => {
    if (winning) {
      Animated.spring(winAnim, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }).start();
    } else {
      winAnim.setValue(0);
    }
  }, [winning, winAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      friction: 8,
      tension: 150,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 150,
    }).start();
  };

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const winScale = winAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const glowOpacity = winAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const glowColor = value === 'X' ? COLORS.x : COLORS.o;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || !!value}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.cell,
          { width: cellSize, height: cellSize, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.inner}>
          <Animated.View
            style={[
              styles.face,
              styles.front,
              { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
            ]}
          />
          <Animated.View
            style={[
              styles.face,
              styles.back,
              {
                transform: [
                  { perspective: 1000 },
                  { rotateY: backRotate },
                  { scale: winScale },
                ],
              },
            ]}
          >
            {winning ? (
              <Animated.View
                style={[
                  styles.glow,
                  {
                    backgroundColor: glowColor,
                    opacity: glowOpacity,
                  },
                ]}
              />
            ) : null}
            <Text
              style={[
                styles.text,
                value === 'X' ? styles.x : styles.o,
                winning && styles.winningText,
              ]}
            >
              {value}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inner: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  face: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  front: {
    backgroundColor: '#fff',
  },
  back: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    opacity: 0.12,
  },
  text: {
    fontSize: 44,
    fontWeight: '800',
  },
  winningText: {
    fontSize: 48,
  },
  x: {
    color: COLORS.x,
    textShadowColor: COLORS.x,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  o: {
    color: COLORS.o,
    textShadowColor: COLORS.o,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

export default Cell;
