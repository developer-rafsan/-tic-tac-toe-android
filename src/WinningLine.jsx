import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

const THICKNESS = 5;

const WinningLine = ({ line, color, cellSize, gap }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 550,
      useNativeDriver: true,
    }).start();
  }, [anim, line]);

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

  return (
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
  );
};

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    height: THICKNESS,
    borderRadius: THICKNESS / 2,
    zIndex: 20,
    transformOrigin: 'left center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});

export default WinningLine;
