import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Text, View, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from './theme';
import Confetti from './Confetti';

const ResultModal = ({
  visible,
  icon,
  iconBg,
  accent,
  title,
  subtitle,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  celebrate = true,
}) => {
  const { colors, gradients } = useTheme();
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.6)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;
  const rayRotate = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    overlayOpacity.setValue(0);
    modalScale.setValue(0.6);
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.spring(modalScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, { toValue: 1.14, duration: 520, useNativeDriver: true }),
        Animated.timing(iconPulse, { toValue: 1, duration: 520, useNativeDriver: true }),
      ]),
    );
    const rays = Animated.loop(
      Animated.timing(rayRotate, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    const shimmerLoop = celebrate
      ? Animated.loop(
          Animated.sequence([
            Animated.timing(shimmer, {
              toValue: 1,
              duration: 1700,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(shimmer, {
              toValue: 0,
              duration: 1700,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        )
      : null;

    pulse.start();
    rays.start();
    glow.start();
    if (shimmerLoop) shimmerLoop.start();

    return () => {
      pulse.stop();
      rays.stop();
      glow.stop();
      if (shimmerLoop) shimmerLoop.stop();
    };
  }, [visible, celebrate, overlayOpacity, modalScale, iconPulse, rayRotate, shimmer, glowPulse]);

  if (!visible) return null;

  const accentColor = accent || iconBg || colors.ai;
  const rayRotateDeg = rayRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const shimmerX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });
  const glowScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });
  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 0],
  });

  return (
    <Animated.View
      style={[styles.overlay, { backgroundColor: colors.overlay, opacity: overlayOpacity }]}
    >
      <Confetti active={celebrate} />
      <Animated.View style={[styles.modal, { transform: [{ scale: modalScale }] }]}>
        <LinearGradient colors={gradients.card} style={styles.modalGradient}>
          <View style={styles.iconArea}>
            {celebrate ? (
              <Animated.View
                style={[
                  styles.rays,
                  { opacity: 0.5, transform: [{ rotate: rayRotateDeg }] },
                ]}
              >
                {[0, 45, 90, 135].map((deg) => (
                  <View
                    key={deg}
                    style={[styles.ray, { backgroundColor: accentColor, transform: [{ rotate: `${deg}deg` }] }]}
                  />
                ))}
              </Animated.View>
            ) : null}
            <Animated.View
              style={[
                styles.glowRing,
                {
                  borderColor: accentColor,
                  opacity: glowOpacity,
                  transform: [{ scale: glowScale }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: iconBg || '#eee',
                  shadowColor: accentColor,
                  transform: [{ scale: iconPulse }],
                },
              ]}
            >
              <Text style={styles.icon}>{icon || '✓'}</Text>
            </Animated.View>
          </View>

          <View style={styles.titleWrap}>
            {celebrate ? (
              <Animated.View
                style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}
              />
            ) : null}
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          </View>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textDim }]}>{subtitle}</Text>
          ) : null}
          <View style={[styles.line, { backgroundColor: colors.borderStrong }]} />
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: accentColor }]}
            onPress={onPrimary}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryText}>{primaryLabel || 'OK'}</Text>
          </TouchableOpacity>
          {secondaryLabel ? (
            <TouchableOpacity onPress={onSecondary} hitSlop={{ top: 10, bottom: 10 }}>
              <Text style={[styles.secondaryText, { color: colors.textFaint }]}>
                {secondaryLabel}
              </Text>
            </TouchableOpacity>
          ) : null}
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    overflow: 'hidden',
  },
  modal: {
    width: 300,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 30,
    elevation: 20,
  },
  modalGradient: {
    paddingVertical: 34,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  iconArea: {
    width: 170,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  rays: {
    position: 'absolute',
    width: 170,
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ray: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 83,
    height: 4,
    borderRadius: 2,
    opacity: 0.55,
  },
  glowRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  icon: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
  },
  titleWrap: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 90,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  line: {
    width: 32,
    height: 3,
    borderRadius: 2,
    marginTop: 14,
    marginBottom: 22,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ResultModal;
