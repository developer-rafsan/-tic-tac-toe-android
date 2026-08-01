import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, CARD_GRADIENT } from './theme';

const ResultModal = ({
  visible,
  icon,
  iconBg,
  title,
  subtitle,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}) => {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.7)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      overlayOpacity.setValue(0);
      modalScale.setValue(0.7);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconPulse, {
            toValue: 1.12,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(iconPulse, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      iconPulse.stopAnimation();
    }
    return () => iconPulse.stopAnimation();
  }, [visible, overlayOpacity, modalScale, iconPulse]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <Animated.View style={[styles.modal, { transform: [{ scale: modalScale }] }]}>
        <LinearGradient colors={CARD_GRADIENT} style={styles.modalGradient}>
          <Animated.View
            style={[
              styles.iconWrap,
              { backgroundColor: iconBg || '#eee', transform: [{ scale: iconPulse }] },
            ]}
          >
            <Text style={styles.icon}>{icon || '✓'}</Text>
          </Animated.View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <View style={styles.line} />
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onPrimary}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryText}>{primaryLabel || 'OK'}</Text>
          </TouchableOpacity>
          {secondaryLabel ? (
            <TouchableOpacity onPress={onSecondary} hitSlop={{ top: 10, bottom: 10 }}>
              <Text style={styles.secondaryText}>{secondaryLabel}</Text>
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
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modal: {
    width: 284,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 16,
  },
  modalGradient: {
    paddingVertical: 34,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDim,
    marginTop: 4,
    textAlign: 'center',
  },
  line: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(20,20,43,0.06)',
    marginTop: 14,
    marginBottom: 22,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: COLORS.text,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textFaint,
  },
});

export default ResultModal;
