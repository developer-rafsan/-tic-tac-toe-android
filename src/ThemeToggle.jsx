import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from './theme';

const ThemeToggle = ({ style }) => {
  const { isDark, toggleTheme, gradients } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.wrap, style]}
      onPress={toggleTheme}
      activeOpacity={0.85}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <LinearGradient colors={gradients.btn} style={styles.inner}>
        <Text style={styles.icon}>{isDark ? '☀️' : '🌙'}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  inner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128,128,160,0.25)',
  },
  icon: {
    fontSize: 18,
  },
});

export default ThemeToggle;
