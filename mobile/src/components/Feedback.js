// Loading / empty / error building blocks used by every data screen
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { colors, theme } from '../theme';
import Icon from './Icon';
import AppButton from './AppButton';

export const Skeleton = ({ width = '100%', height = 14, radius = 8, style }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: colors.border, opacity }, style]} />;
};

// Placeholder shaped like a ticket card while the list loads
export const SkeletonCard = () => (
  <View style={styles.skeletonCard} accessibilityLabel="Loading" accessible>
    <Skeleton width="55%" height={16} />
    <Skeleton width="35%" height={12} style={styles.gap} />
    <Skeleton width="80%" height={12} style={styles.gapLg} />
    <Skeleton width="100%" height={44} radius={12} style={styles.gapLg} />
  </View>
);

export const SkeletonList = ({ count = 3 }) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
);

export const LoadingView = ({ message = 'Loading...' }) => (
  <View style={styles.center} accessibilityLiveRegion="polite">
    <ActivityIndicator size="large" color={colors.tealCyan} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

export const EmptyState = ({ icon = 'ticket', title, message, actionLabel, onAction }) => (
  <View style={styles.center}>
    <View style={styles.iconCircle}>
      <Icon name={icon} size={30} color={colors.tealText} />
    </View>
    <Text style={styles.title} accessibilityRole="header">
      {title}
    </Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}
    {actionLabel ? <AppButton title={actionLabel} onPress={onAction} style={styles.action} /> : null}
  </View>
);

export const ErrorState = ({ message, onRetry }) => (
  <View style={styles.center} accessibilityLiveRegion="polite">
    <View style={[styles.iconCircle, styles.errorCircle]}>
      <Icon name={/connect|Wi-Fi/i.test(message || '') ? 'wifi-off' : 'alert-triangle'} size={30} color={colors.danger} />
    </View>
    <Text style={styles.title}>Something went wrong</Text>
    <Text style={styles.message}>{message || 'Please try again.'}</Text>
    {onRetry ? <AppButton title="Try again" icon="refresh" onPress={onRetry} style={styles.action} /> : null}
  </View>
);

// Inline banner (e.g. a failed refresh above existing content)
export const Banner = ({ type = 'error', message, actionLabel, onAction }) => {
  const palette = {
    error: { bg: colors.dangerBg, fg: colors.danger, icon: 'alert-circle' },
    warning: { bg: colors.warningBg, fg: colors.warning, icon: 'alert-triangle' },
    info: { bg: colors.tealTint, fg: colors.tealText, icon: 'info' },
    success: { bg: colors.successBg, fg: colors.success, icon: 'check-circle' },
  }[type];
  return (
    <View style={[styles.banner, { backgroundColor: palette.bg }]} accessibilityLiveRegion="polite">
      <Icon name={palette.icon} size={18} color={palette.fg} />
      <Text style={[styles.bannerText, { color: palette.fg }]}>{message}</Text>
      {actionLabel ? <AppButton title={actionLabel} onPress={onAction} variant="ghost" compact /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gap: { marginTop: 8 },
  gapLg: { marginTop: 14 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: colors.secondaryText,
    fontSize: 14,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  errorCircle: {
    backgroundColor: colors.dangerBg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDarkNavy,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  action: {
    marginTop: 18,
    alignSelf: 'stretch',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.button,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  bannerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
});
