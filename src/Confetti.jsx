import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Easing } from 'react-native';
import { useTheme } from './theme';

const BASE_FALL = 2400;

const Confetti = ({ count = 48, active }) => {
  const { colors } = useTheme();
  const particles = useRef([]);

  if (particles.current.length === 0) {
    const palette = [
      colors.x,
      colors.o,
      colors.ai,
      '#ffd93d',
      '#4ecdc4',
      '#ff9f43',
      '#ff6b81',
      '#f8f9ff',
    ];
    for (let i = 0; i < count; i++) {
      particles.current.push({
        progress: new Animated.Value(0),
        left: Math.random() * 100,
        size: 6 + Math.random() * 7,
        height: 8 + Math.random() * 11,
        color: palette[Math.floor(Math.random() * palette.length)],
        delay: Math.random() * 1100,
        duration: BASE_FALL + Math.random() * 1300,
        spin: `${Math.random() * 1080 - 540}deg`,
        drift: (Math.random() - 0.5) * 140,
        round: Math.random() < 0.3,
      });
    }
  }

  useEffect(() => {
    if (!active) return;
    const loops = particles.current.map((p) => {
      p.progress.setValue(0);
      return Animated.loop(
        Animated.timing(p.progress, {
          toValue: 1,
          duration: p.duration,
          delay: p.delay,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      );
    });
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [active]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.current.map((p, i) => {
        const translateY = p.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-70, 780],
        });
        const translateX = p.progress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, p.drift / 2, p.drift],
        });
        const rotate = p.progress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', p.spin],
        });
        const opacity = p.progress.interpolate({
          inputRange: [0, 0.08, 0.85, 1],
          outputRange: [0, 1, 1, 0],
        });
        return (
          <Animated.View
            key={i}
            style={[
              p.round ? styles.round : styles.rect,
              {
                left: `${p.left}%`,
                width: p.size,
                height: p.round ? p.size : p.height,
                backgroundColor: p.color,
                opacity,
                transform: [{ translateX }, { translateY }, { rotate }],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  rect: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
  round: {
    position: 'absolute',
    top: 0,
    borderRadius: 99,
  },
});

export default Confetti;
