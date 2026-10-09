import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import { colors, theme } from '../theme';
import Icon from './Icon';
import AppButton from './AppButton';

// Confirmation for destructive / important actions. `children` can add extra
// content (e.g. a password field for account deletion).
const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Go back',
  destructive = false,
  loading = false,
  confirmDisabled = false,
  icon,
  onConfirm,
  onCancel,
  children,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={loading ? undefined : onCancel}>
    <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.dialog} accessibilityViewIsModal>
        <View style={[styles.iconCircle, destructive && styles.iconDanger]}>
          <Icon
            name={icon || (destructive ? 'alert-triangle' : 'info')}
            size={26}
            color={destructive ? colors.danger : colors.tealText}
          />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {children}
        <View style={styles.actions}>
          <AppButton title={cancelLabel} variant="secondary" onPress={onCancel} disabled={loading} style={styles.button} />
          <AppButton
            title={confirmLabel}
            variant={destructive ? 'danger' : 'primary'}
            onPress={onConfirm}
            loading={loading}
            disabled={confirmDisabled}
            style={[styles.button, styles.buttonGap]}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 20,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  iconDanger: {
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
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 18,
  },
  button: {
    flex: 1,
  },
  buttonGap: {
    marginLeft: 10,
  },
});

export default ConfirmDialog;
