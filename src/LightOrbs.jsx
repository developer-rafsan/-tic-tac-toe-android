import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from './theme';

const LightOrbs = () => {
  const { colors, isDark } = useTheme();
  const seed = useRef([
    { top: -70, left: -90, size: 250, dx: [40, 150], dy: [30, 140], color: colors.ai },
    { top: '34%', left: '62%', size: 215, dx: [-30, 70], dy: [20, -50], color: colors.o },
    { top: '68%', left: -70, size: 195, dx: [60, 170], dy: [-20, 50], color: colors.x },
    { top: '6%', left: '54%', size: 150, dx: [0, -90], dy: [60, 170], color: colors.x },
  ]);
  const orbs = useRef(seed.current.map((o) => ({ ...o, anim: new Animated.Value(0) })));

  useEffect(() => {
    const loops = orbs.current.map((o, i) => {
      o.anim.setValue(i * 0.25);
      return Animated.loop(
        Animated.timing(o.anim, {
          toValue: 1,
          duration: 11000 + i * 2400,
          easing: (v) => (Math.sin(v * Math.PI * 2) + 1) / 2,
          useNativeDriver: true,
        }),
      );
    });
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {orbs.current.map((o, i) => {
        const translateX = o.anim.interpolate({ inputRange: [0, 1], outputRange: o.dx });
        const translateY = o.anim.interpolate({ inputRange: [0, 1], outputRange: o.dy });
        const scale = o.anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.2, 1] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.orb,
              {
                top: o.top,
                left: o.left,
                width: o.size,
                height: o.size,
                borderRadius: o.size / 2,
                backgroundColor: o.color,
                opacity: isDark ? 0.17 : 0.13,
                transform: [{ translateX }, { translateY }, { scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
  },
});

export default LightOrbs;
