import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, theme } from '../theme';
import Icon from './Icon';

// Navy text on teal keeps the brand colour but passes WCAG AA contrast
const VARIANTS = {
  primary: { bg: colors.tealCyan, fg: colors.primaryDarkNavy, border: colors.tealCyan },
  navy: { bg: colors.primaryDarkNavy, fg: colors.white, border: colors.primaryDarkNavy },
  secondary: { bg: colors.white, fg: colors.primaryDarkNavy, border: colors.tealCyan },
  danger: { bg: colors.danger, fg: colors.white, border: colors.danger },
  dangerOutline: { bg: colors.white, fg: colors.danger, border: colors.danger },
  ghost: { bg: 'transparent', fg: colors.tealText, border: 'transparent' },
};

const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  compact = false,
}) => {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.button,
        compact && styles.compact,
        { backgroundColor: v.bg, borderColor: v.border },
        variant === 'primary' && theme.shadows.button,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={18} color={v.fg} /> : null}
          <Text style={[styles.text, { color: v.fg }, icon && styles.textWithIcon]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: theme.touch,
    borderRadius: theme.borderRadius.button,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: {
    paddingHorizontal: 12,
  },
  disabled: {
    opacity: 0.55,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
  },
  textWithIcon: {
    marginLeft: 8,
  },
});

export default AppButton;
