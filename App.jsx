import React, { useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './src/HomeScreen';
import OfflineGame from './src/OfflineGame';
import OnlineSetup from './src/OnlineSetup';
import OnlineGame from './src/OnlineGame';

const SCREENS = {
  HOME: 'HOME',
  OFFLINE: 'OFFLINE',
  ONLINE_SETUP: 'ONLINE_SETUP',
  ONLINE_GAME: 'ONLINE_GAME',
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
      default:
        return (
          <HomeScreen
            onOffline={() => navigate(SCREENS.OFFLINE)}
            onOnline={() => navigate(SCREENS.ONLINE_SETUP)}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f5f9" />
      <SafeAreaView style={styles.container}>
        {renderScreen()}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f5f9',
  },
});

export default App;
