import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Text, View } from 'react-native';

const X_COLOR = '#ff4757';
const O_COLOR = '#2ed573';

const Cell = ({ value, onPress, disabled, cellSize }) => {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: value ? 1 : 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [value, flipAnim]);

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
              { transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
            ]}
          >
            <Text style={[styles.text, value === 'X' ? styles.x : styles.o]}>
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
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    borderRadius: 14,
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
  text: {
    fontSize: 44,
    fontWeight: '800',
  },
  x: {
    color: X_COLOR,
    textShadowColor: X_COLOR,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  o: {
    color: O_COLOR,
    textShadowColor: O_COLOR,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

export default Cell;
