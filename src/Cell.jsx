import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useTheme } from './theme';

const Cell = ({ value, onPress, disabled, cellSize, winning }) => {
  const { colors } = useTheme();
  const appear = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value) {
      appear.setValue(0);
      pop.setValue(0);
      Animated.timing(appear, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
      Animated.spring(pop, {
        toValue: 1,
        friction: 4,
        tension: 170,
        useNativeDriver: true,
      }).start();
    } else {
      appear.setValue(0);
      pop.setValue(0);
    }
  }, [value, appear, pop]);

  useEffect(() => {
    if (winning) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulse.setValue(0);
  }, [winning, pulse]);

  const handlePressIn = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  };

  const glowColor = value === 'X' ? colors.x : colors.o;

  const valueOpacity = appear.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const valueScale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
  const valueRotateY = appear.interpolate({ inputRange: [0, 1], outputRange: ['80deg', '0deg'] });
  const winOpa = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.14, 0.3] });
  const textGlow = pulse.interpolate({ inputRange: [0, 1], outputRange: [12, 28] });
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const ringOpa = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  const inner = cellSize * 0.74;
  const radius = inner * 0.32;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || !!value}
      activeOpacity={1}
      style={[styles.cell, { width: cellSize, height: cellSize }]}
    >
      <Animated.View
        style={[styles.pressBg, { backgroundColor: colors.text, opacity: pressAnim }]}
      />
      {winning ? (
        <>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.winFill,
              {
                width: inner,
                height: inner,
                borderRadius: radius,
                backgroundColor: glowColor,
                opacity: winOpa,
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ring,
              {
                width: inner,
                height: inner,
                borderRadius: radius,
                borderColor: glowColor,
                transform: [{ scale: ringScale }],
                opacity: ringOpa,
              },
            ]}
          />
        </>
      ) : null}
      <Animated.View
        style={[
          styles.valueWrap,
          {
            opacity: valueOpacity,
            transform: [
              { perspective: 800 },
              { rotateY: valueRotateY },
              { scale: valueScale },
            ],
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            winning && styles.winningText,
            {
              color: glowColor,
              textShadowColor: glowColor,
              textShadowRadius: winning ? textGlow : 10,
            },
          ]}
        >
          {value}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressBg: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: 14,
  },
  winFill: {
    position: 'absolute',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2.5,
  },
  valueWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 46,
    fontWeight: '800',
    textShadowOffset: { width: 0, height: 0 },
  },
  winningText: {
    fontSize: 50,
  },
});

export default Cell;
