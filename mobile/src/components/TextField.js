import React, { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, theme } from '../theme';
import Icon from './Icon';

// Labelled input with an inline error message under the field
const TextField = forwardRef(
  ({ label, error, hint, icon, secure = false, style, inputStyle, ...inputProps }, ref) => {
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(secure);

    return (
      <View style={[styles.wrapper, style]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View style={[styles.inputRow, focused && styles.focused, error && styles.errorBorder]}>
          {icon ? <Icon name={icon} size={18} color={colors.secondaryText} /> : null}
          <TextInput
            {...inputProps}
            ref={ref}
            style={[styles.input, icon && styles.inputWithIcon, inputStyle]}
            placeholderTextColor="#8A94A6"
            secureTextEntry={hidden}
            onFocus={(e) => {
              setFocused(true);
              inputProps.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              inputProps.onBlur?.(e);
            }}
            accessibilityLabel={inputProps.accessibilityLabel || label}
            accessibilityHint={error || hint}
          />
          {secure ? (
            <TouchableOpacity
              onPress={() => setHidden((h) => !h)}
              style={styles.eye}
              accessibilityRole="button"
              accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            >
              <Icon name={hidden ? 'eye' : 'eye-off'} size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          ) : null}
        </View>
        {error ? (
          <View style={styles.messageRow} accessibilityLiveRegion="polite">
            <Icon name="alert-circle" size={14} color={colors.danger} />
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : hint ? (
          <Text style={styles.hint}>{hint}</Text>
        ) : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: theme.touch,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.button,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
  },
  focused: {
    borderColor: colors.tealCyan,
  },
  errorBorder: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.primaryText,
    paddingVertical: 10,
  },
  inputWithIcon: {
    marginLeft: 8,
  },
  eye: {
    width: theme.touch,
    height: theme.touch,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    flex: 1,
  },
  hint: {
    color: colors.secondaryText,
    fontSize: 12,
    marginTop: 6,
  },
});

export default TextField;
