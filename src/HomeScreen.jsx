import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const X_COLOR = '#ff4757';
const O_COLOR = '#2ed573';

const HomeScreen = ({ onOffline, onOnline }) => {
  return (
    <LinearGradient colors={['#0F0C29', '#302B63']} style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.iconRow}>
          <Text style={styles.iconCharX}>✕</Text>
          <Text style={styles.iconCharO}>○</Text>
        </View>
        <Text style={styles.title}>Tic Tac Toe</Text>
        <Text style={styles.subtitle}>Classic 2-Player Game</Text>
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.card}
          onPress={onOffline}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardIcon}>📱</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Offline Game</Text>
              <Text style={styles.cardDesc}>Play with a friend on this device</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={onOnline}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardIcon}>🌐</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Online Game</Text>
              <Text style={styles.cardDesc}>Play over WiFi or hotspot</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    opacity: 0.4,
  },
  iconCharX: {
    fontSize: 40,
    fontWeight: '800',
    color: X_COLOR,
    marginRight: 8,
  },
  iconCharO: {
    fontSize: 40,
    fontWeight: '800',
    color: O_COLOR,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  buttonSection: {
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  cardIcon: {
    fontSize: 26,
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 26,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '300',
    marginLeft: 8,
  },
});

export default HomeScreen;
