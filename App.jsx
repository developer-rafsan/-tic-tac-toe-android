import React, { useState, useEffect, useRef } from 'react';
import { Animated, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './src/HomeScreen';
import OfflineGame from './src/OfflineGame';
import OnlineSetup from './src/OnlineSetup';
import OnlineGame from './src/OnlineGame';
import AIGame from './src/AIGame';
import HistoryScreen from './src/HistoryScreen';

const SCREENS = {
  HOME: 'HOME',
  OFFLINE: 'OFFLINE',
  ONLINE_SETUP: 'ONLINE_SETUP',
  ONLINE_GAME: 'ONLINE_GAME',
  AI_GAME: 'AI_GAME',
  HISTORY: 'HISTORY',
};

const ScreenTransition = ({ screenKey, children }) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(14);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [screenKey, opacity, translateY]);

  const animatedStyle = { opacity, transform: [{ translateY }] };

  return (
    <Animated.View style={[styles.transition, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const App = () => {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
  const [onlineConfig, setOnlineConfig] = useState(null);

  const navigate = (screen, params) => {
    if (screen === SCREENS.ONLINE_GAME) {
      setOnlineConfig(params);
    }
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case SCREENS.OFFLINE:
        return <OfflineGame onBack={() => navigate(SCREENS.HOME)} />;
      case SCREENS.ONLINE_SETUP:
        return (
          <OnlineSetup
            onBack={() => navigate(SCREENS.HOME)}
            onStartGame={(config) => navigate(SCREENS.ONLINE_GAME, config)}
          />
        );
      case SCREENS.ONLINE_GAME:
        return (
          <OnlineGame
            config={onlineConfig}
            onBack={() => navigate(SCREENS.HOME)}
          />
        );
      case SCREENS.AI_GAME:
        return <AIGame onBack={() => navigate(SCREENS.HOME)} />;
      case SCREENS.HISTORY:
        return <HistoryScreen onBack={() => navigate(SCREENS.HOME)} />;
      default:
        return (
          <HomeScreen
            onOffline={() => navigate(SCREENS.OFFLINE)}
            onAutoPlay={() => navigate(SCREENS.AI_GAME)}
            onOnline={() => navigate(SCREENS.ONLINE_SETUP)}
            onHistory={() => navigate(SCREENS.HISTORY)}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#eef2f9" />
      <SafeAreaView style={styles.container}>
        <ScreenTransition screenKey={currentScreen}>
          {renderScreen()}
        </ScreenTransition>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f9',
  },
  transition: {
    flex: 1,
  },
});

export default App;
