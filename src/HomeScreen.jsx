import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const X_COLOR = '#ff4757';
const O_COLOR = '#2ed573';

const HomeScreen = ({ onOffline, onOnline }) => {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.symbolRow}>
          <View style={styles.symbolCircleX}>
            <Text style={[styles.symbolChar, styles.symbolX]}>✕</Text>
          </View>
          <View style={styles.symbolSpacer} />
          <View style={styles.symbolCircleO}>
            <Text style={[styles.symbolChar, styles.symbolO]}>○</Text>
          </View>
        </View>
        <Text style={styles.title}>Tic Tac Toe</Text>
        <Text style={styles.subtitle}>Classic 2-Player Game</Text>
      </View>

      <View style={styles.cardSection}>
        <TouchableOpacity
          style={styles.card}
          onPress={onOffline}
          activeOpacity={0.92}
        >
          <View style={[styles.cardStripe, { backgroundColor: X_COLOR }]} />
          <View style={styles.cardBody}>
            <Text style={styles.cardIcon}>📱</Text>
            <View style={styles.cardTextGroup}>
              <Text style={styles.cardTitle}>Offline Game</Text>
              <Text style={styles.cardDesc}>Play with a friend on this device</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={onOnline}
          activeOpacity={0.92}
        >
          <View style={[styles.cardStripe, { backgroundColor: O_COLOR }]} />
          <View style={styles.cardBody}>
            <Text style={styles.cardIcon}>🌐</Text>
            <View style={styles.cardTextGroup}>
              <Text style={styles.cardTitle}>Online Game</Text>
              <Text style={styles.cardDesc}>Play over WiFi or hotspot</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f5f9',
    paddingHorizontal: 24,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  symbolCircleX: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: X_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  symbolCircleO: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: O_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  symbolChar: {
    fontSize: 34,
    fontWeight: '800',
  },
  symbolX: {
    color: X_COLOR,
  },
  symbolO: {
    color: O_COLOR,
  },
  symbolSpacer: {
    width: 16,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.35)',
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  cardSection: {
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardStripe: {
    width: 5,
  },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingRight: 18,
    paddingLeft: 14,
  },
  cardIcon: {
    fontSize: 26,
    marginRight: 14,
  },
  cardTextGroup: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '500',
  },
});

export default HomeScreen;
