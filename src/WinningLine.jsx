import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

const THICKNESS = 5;

const WinningLine = ({ line, color, cellSize, gap }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 550,
      useNativeDriver: true,
    }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, glow, line]);

  const center = (index) => ({
    x: (index % 3) * (cellSize + gap) + cellSize / 2,
    y: Math.floor(index / 3) * (cellSize + gap) + cellSize / 2,
  });

  const start = center(line[0]);
  const end = center(line[2]);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glowLine,
          {
            left: start.x,
            top: start.y,
            width: length,
            backgroundColor: color,
            opacity: glowOpacity,
            transform: [{ rotate: `${angle}deg` }, { scaleX: anim }],
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.line,
          {
            left: start.x,
            top: start.y,
            width: length,
            backgroundColor: color,
            transform: [{ rotate: `${angle}deg` }, { scaleX: anim }],
          },
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    height: THICKNESS,
    borderRadius: THICKNESS / 2,
    zIndex: 20,
    transformOrigin: 'left center',
  },
  glowLine: {
    position: 'absolute',
    height: THICKNESS + 12,
    marginTop: -6,
    borderRadius: (THICKNESS + 12) / 2,
    zIndex: 19,
    transformOrigin: 'left center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 5,
  },
});

export default WinningLine;
