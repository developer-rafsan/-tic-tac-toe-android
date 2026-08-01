import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, BG_GRADIENT, HOME_HERO_GRADIENT } from './theme';

const X_COLOR = COLORS.x;
const O_COLOR = COLORS.o;
const AI_COLOR = COLORS.ai;

const MenuCard = ({ icon, title, desc, color, delay, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 420,
      delay,
      useNativeDriver: true,
    }).start();
  }, [enter, delay]);

  const translateY = enter.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      friction: 7,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 160,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{ opacity: enter, transform: [{ translateY }] }}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={['#ffffff', '#fbfcfe']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <Pressable
            style={styles.cardTouch}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
          >
            <View style={styles.cardRow}>
              <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
                <Text style={styles.icon}>{icon}</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDesc}>{desc}</Text>
              </View>
              <View style={[styles.chevron, { borderColor: `${color}55` }]}>
                <Text style={[styles.chevronText, { color }]}>›</Text>
              </View>
            </View>
          </Pressable>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
};

const HomeScreen = ({ onOffline, onAutoPlay, onOnline, onHistory }) => {
  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heroAnim, {
      toValue: 1,
      friction: 5,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [heroAnim]);

  const heroScale = heroAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  return (
    <LinearGradient colors={BG_GRADIENT} style={styles.container}>
      <View style={styles.hero}>
        <Animated.View
          style={{ opacity: heroAnim, transform: [{ scale: heroScale }] }}
        >
          <LinearGradient
            colors={HOME_HERO_GRADIENT}
            style={styles.heroCard}
          >
            <View style={styles.symbolRow}>
              <View style={[styles.symbolCircle, styles.symbolCircleX]}>
                <Text style={[styles.symbolChar, styles.symbolX]}>✕</Text>
              </View>
              <View style={styles.symbolSpacer} />
              <View style={[styles.symbolCircle, styles.symbolCircleO]}>
                <Text style={[styles.symbolChar, styles.symbolO]}>○</Text>
              </View>
            </View>
            <Text style={styles.title}>Tic Tac Toe</Text>
            <Text style={styles.subtitle}>Classic 2-Player Game</Text>
          </LinearGradient>
        </Animated.View>
      </View>

      <View style={styles.cardSection}>
        <MenuCard
          icon="📱"
          title="Offline Game"
          desc="Play with a friend on this device"
          color={X_COLOR}
          delay={120}
          onPress={onOffline}
        />
        <MenuCard
          icon="🤖"
          title="Auto Play"
          desc="Play against the computer"
          color={AI_COLOR}
          delay={220}
          onPress={onAutoPlay}
        />
        <MenuCard
          icon="🌐"
          title="Online Game"
          desc="Play over WiFi or hotspot"
          color={O_COLOR}
          delay={320}
          onPress={onOnline}
        />
        <MenuCard
          icon="📜"
          title="History"
          desc="View your past games"
          color={COLORS.text}
          delay={420}
          onPress={onHistory}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 34,
    paddingHorizontal: 44,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  symbolCircle: {
    width: 72,
    height: 72,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolCircleX: {
    borderRadius: 20,
    shadowColor: X_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  symbolCircleO: {
    borderRadius: 36,
    shadowColor: O_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
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
    color: COLORS.text,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textFaint,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  cardSection: {
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardGradient: {
    borderRadius: 20,
  },
  cardTouch: {
    borderRadius: 20,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textDim,
    fontWeight: '500',
  },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronText: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: -1,
  },
});

export default HomeScreen;
