import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from './theme';
import ThemeToggle from './ThemeToggle';
import LightOrbs from './LightOrbs';

const GameTile = ({ icon, title, desc, color, delay, tag, onPress }) => {
  const { colors, gradients } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const enter = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1,
      friction: 6,
      tension: 70,
      delay,
      useNativeDriver: true,
    }).start();
  }, [enter, delay]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);

  const enterScale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] });
  const enterTranslateY = enter.interpolate({ inputRange: [0, 1], outputRange: [22, 0] });
  const shadowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.32] });

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      friction: 7,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 170,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.tileOuter,
        {
          opacity: enter,
          transform: [{ translateY: enterTranslateY }, { scale: enterScale }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.tile,
          {
            shadowColor: color,
            shadowOpacity,
            shadowRadius: 18,
            elevation: 6,
            transform: [{ scale }],
          },
        ]}
      >
        <LinearGradient colors={gradients.card} style={styles.tileGradient}>
          <Pressable
            style={styles.tileTouch}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
          >
            <View style={[styles.iconBadge, { backgroundColor: `${color}22` }]}>
              <Text style={[styles.icon, { color }]}>{icon}</Text>
            </View>
            <View style={styles.tileTag}>
              <Text style={[styles.tileTagText, { color }]}>{tag}</Text>
            </View>
            <Text style={[styles.tileTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.tileDesc, { color: colors.textDim }]}>{desc}</Text>
            <View style={styles.tileFooter}>
              <Text style={[styles.tilePlay, { color }]}>Play</Text>
              <View style={[styles.tileArrow, { backgroundColor: `${color}1f` }]}>
                <Text style={[styles.tileArrowText, { color }]}>→</Text>
              </View>
            </View>
          </Pressable>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
};

const HomeScreen = ({ onOffline, onAutoPlay, onOnline, onHistory }) => {
  const { colors, gradients, isDark } = useTheme();
  const heroAnim = useRef(new Animated.Value(0)).current;
  const floatX = useRef(new Animated.Value(0)).current;
  const floatO = useRef(new Animated.Value(0)).current;
  const ringX = useRef(new Animated.Value(0)).current;
  const ringO = useRef(new Animated.Value(0)).current;
  const scan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heroAnim, {
      toValue: 1,
      friction: 5,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [heroAnim]);

  useEffect(() => {
    const lx = Animated.loop(
      Animated.timing(floatX, {
        toValue: 1,
        duration: 2300,
        easing: (v) => (Math.sin(v * Math.PI * 2) + 1) / 2,
        useNativeDriver: true,
      }),
    );
    const lo = Animated.loop(
      Animated.timing(floatO, {
        toValue: 1,
        duration: 2600,
        delay: 300,
        easing: (v) => (Math.sin(v * Math.PI * 2) + 1) / 2,
        useNativeDriver: true,
      }),
    );
    const rx = Animated.loop(
      Animated.sequence([
        Animated.timing(ringX, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(ringX, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ]),
    );
    const ro = Animated.loop(
      Animated.sequence([
        Animated.timing(ringO, { toValue: 1, duration: 1300, delay: 400, useNativeDriver: true }),
        Animated.timing(ringO, { toValue: 0, duration: 1300, useNativeDriver: true }),
      ]),
    );
    const ls = Animated.loop(
      Animated.timing(scan, {
        toValue: 1,
        duration: 3600,
        easing: (v) => v,
        useNativeDriver: true,
      }),
    );
    lx.start();
    lo.start();
    rx.start();
    ro.start();
    ls.start();
    return () => {
      lx.stop();
      lo.stop();
      rx.stop();
      ro.stop();
      ls.stop();
    };
  }, [floatX, floatO, ringX, ringO, scan]);

  const heroScale = heroAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });
  const heroOpacity = heroAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const xFloat = floatX.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const oFloat = floatO.interpolate({ inputRange: [0, 1], outputRange: [0, 9] });
  const ringXScale = ringX.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const ringXOpa = ringX.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const ringOScale = ringO.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const ringOOpa = ringO.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const scanX = scan.interpolate({ inputRange: [0, 1], outputRange: [-140, 320] });

  return (
    <LinearGradient colors={gradients.bg} style={styles.container}>
      <LightOrbs />

      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={[styles.brandMark, { backgroundColor: colors.card }]}>
            <Text style={[styles.brandX, { color: colors.x }]}>✕</Text>
            <Text style={[styles.brandO, { color: colors.o }]}>○</Text>
          </View>
          <View>
            <Text style={[styles.brandTitle, { color: colors.text }]}>TicTacToe</Text>
            <Text style={[styles.brandSub, { color: colors.textFaint }]}>Classic Puzzle Game</Text>
          </View>
        </View>
        <ThemeToggle />
      </View>

      <Animated.View
        style={[
          styles.heroCard,
          {
            opacity: heroOpacity,
            transform: [{ scale: heroScale }],
            shadowColor: colors.ai,
          },
        ]}
      >
        <LinearGradient colors={gradients.hero} style={styles.heroGradient}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.scanLine,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.8)' },
              { transform: [{ translateX: scanX }] },
            ]}
          />
          <View style={styles.heroTop}>
            <Text style={[styles.heroKicker, { color: colors.textFaint }]}>XO • TWO PLAYERS • FUN</Text>
          </View>
          <View style={styles.symbolRow}>
            <Animated.View
              style={[
                styles.symbolX,
                {
                  shadowColor: colors.x,
                  transform: [{ translateY: xFloat }],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.pulseRing,
                  {
                    borderColor: colors.x,
                    transform: [{ scale: ringXScale }],
                    opacity: ringXOpa,
                  },
                ]}
              />
              <Text style={[styles.symbolChar, { color: colors.x }]}>✕</Text>
            </Animated.View>
            <Text style={[styles.heroVs, { color: colors.textFaint }]}>vs</Text>
            <Animated.View
              style={[
                styles.symbolO,
                {
                  shadowColor: colors.o,
                  transform: [{ translateY: oFloat }],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.pulseRing,
                  styles.pulseRingRound,
                  {
                    borderColor: colors.o,
                    transform: [{ scale: ringOScale }],
                    opacity: ringOOpa,
                  },
                ]}
              />
              <Text style={[styles.symbolChar, { color: colors.o }]}>○</Text>
            </Animated.View>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Tic Tac Toe</Text>
          <Text style={[styles.heroSub, { color: colors.textDim }]}>
            Pick a mode and start playing
          </Text>
        </LinearGradient>
      </Animated.View>

      <View style={styles.grid}>
        <GameTile
          icon="✕"
          title="Offline Game"
          desc="Play 2-player on one device"
          tag="2 PLAYERS"
          color={colors.x}
          delay={140}
          onPress={onOffline}
        />
        <GameTile
          icon="🤖"
          title="Auto Play"
          desc="Challenge the smart AI"
          tag="VS COMPUTER"
          color={colors.ai}
          delay={230}
          onPress={onAutoPlay}
        />
        <GameTile
          icon="🌐"
          title="Online Game"
          desc="Compete over WiFi"
          tag="MULTIPLAYER"
          color={colors.o}
          delay={320}
          onPress={onOnline}
        />
        <GameTile
          icon="📜"
          title="History"
          desc="Review past matches"
          tag="RECORDS"
          color={isDark ? '#9aa3c0' : '#5b647a'}
          delay={410}
          onPress={onHistory}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    marginBottom: 18,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  brandX: { fontSize: 20, fontWeight: '800' },
  brandO: { fontSize: 18, fontWeight: '800' },
  brandTitle: { fontSize: 17, fontWeight: '800' },
  brandSub: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  heroCard: {
    borderRadius: 26,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 8,
    overflow: 'hidden',
  },
  heroGradient: {
    borderRadius: 26,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128,128,160,0.18)',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 90,
    opacity: 0.5,
  },
  heroTop: { marginBottom: 6 },
  heroKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 8,
    marginBottom: 10,
  },
  symbolX: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },
  symbolO: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },
  symbolChar: { fontSize: 34, fontWeight: '800' },
  pulseRing: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 20,
    borderWidth: 2,
  },
  pulseRingRound: {
    borderRadius: 33,
  },
  heroVs: { fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { fontSize: 30, fontWeight: '800', marginBottom: 4 },
  heroSub: { fontSize: 13, fontWeight: '500' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
    marginTop: 18,
    paddingBottom: 30,
  },
  tileOuter: { width: '47%' },
  tile: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  tileGradient: { borderRadius: 22 },
  tileTouch: {
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 176,
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: { fontSize: 24, fontWeight: '800' },
  tileTag: {
    position: 'absolute',
    top: 14,
    right: 12,
  },
  tileTagText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  tileTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  tileDesc: { fontSize: 12, fontWeight: '500', lineHeight: 16, flex: 1 },
  tileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  tilePlay: { fontSize: 13, fontWeight: '800' },
  tileArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileArrowText: { fontSize: 15, fontWeight: '800' },
});

export default HomeScreen;
