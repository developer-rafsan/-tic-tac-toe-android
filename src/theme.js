import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@tic_tac_toe_theme';

export const LightColors = {
  x: '#ff4757',
  o: '#22c55e',
  ai: '#7c5dfa',
  text: '#14142b',
  textDim: 'rgba(20,20,43,0.55)',
  textFaint: 'rgba(20,20,43,0.32)',
  bg: '#eef2f9',
  card: '#ffffff',
  cardAlt: '#f5f7fb',
  border: 'rgba(20,20,43,0.06)',
  borderStrong: 'rgba(20,20,43,0.1)',
  overlay: 'rgba(20,20,43,0.45)',
  shadow: '#000',
};

export const DarkColors = {
  x: '#ff6b81',
  o: '#2ed573',
  ai: '#a78bfa',
  text: '#f2f4fa',
  textDim: 'rgba(242,244,250,0.6)',
  textFaint: 'rgba(242,244,250,0.35)',
  bg: '#0b0f1a',
  card: '#161d2e',
  cardAlt: '#1d2537',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  overlay: 'rgba(0,0,0,0.62)',
  shadow: '#000',
};

export const LIGHT_GRADIENTS = {
  bg: ['#eef2f9', '#f8fafe'],
  card: ['#ffffff', '#f6f8fc'],
  hero: ['#ffffff', '#eef2fa'],
  board: ['#ffffff', '#f4f7fc'],
  btn: ['#ffffff', '#f2f5fa'],
};

export const DARK_GRADIENTS = {
  bg: ['#0b0f1a', '#141b30'],
  card: ['#161d2e', '#1c2440'],
  hero: ['#131a2c', '#0b0f1a'],
  board: ['#161d2e', '#1e2740'],
  btn: ['#1c2440', '#141b30'],
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((saved) => {
        if (saved === 'dark' || saved === 'light') setTheme(saved);
      })
      .catch(() => {});
  }, []);

  const value = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      theme,
      isDark,
      colors: isDark ? DarkColors : LightColors,
      gradients: isDark ? DARK_GRADIENTS : LIGHT_GRADIENTS,
      toggleTheme: () => {
        setTheme((current) => {
          const next = current === 'light' ? 'dark' : 'light';
          AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
          return next;
        });
      },
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: 'dark',
      isDark: true,
      colors: DarkColors,
      gradients: DARK_GRADIENTS,
      toggleTheme: () => {},
    };
  }
  return ctx;
};

// Backwards-compatible defaults for any code not using the hook.
export const COLORS = LightColors;
export const BG_GRADIENT = LIGHT_GRADIENTS.bg;
export const CARD_GRADIENT = LIGHT_GRADIENTS.card;
export const HOME_HERO_GRADIENT = LIGHT_GRADIENTS.hero;
