import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, theme } from '../../theme';
import { useToast } from '../../context/ToastContext';
import AppButton from '../../components/AppButton';
import Icon from '../../components/Icon';
import ReceiptCard from '../../components/ReceiptCard';
import { formatLKR } from '../../utils/format';

const PaymentResultScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { success, message, payment, ticket, fieldErrors } = route.params;
  const isCash = payment?.method === 'CASH_ON_BOARD';

  useEffect(() => {
    if (success) toast.show(isCash ? 'Ticket reserved' : 'Payment successful', 'success');
  }, [success, isCash, toast]);

  // Clear checkout screens from history so "back" cannot pay the same ticket twice
  const resetTo = (extra) =>
    navigation.reset({
      index: extra ? 1 : 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Tickets' } }, ...(extra ? [extra] : [])],
    });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}>
        <View style={[styles.iconCircle, { backgroundColor: success ? colors.successBg : colors.dangerBg }]}>
          <Icon name={success ? 'check-circle' : 'x-circle'} size={44} color={success ? colors.success : colors.danger} />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {success ? (isCash ? 'Ticket reserved' : 'Payment successful') : 'Payment failed'}
        </Text>
        <Text style={styles.message} accessibilityLiveRegion="assertive">
          {success
            ? isCash
              ? `Show your QR pass and pay ${formatLKR(payment.amount)} to the conductor.`
              : 'Your ticket is active. Show the QR pass when you board.'
            : message}
        </Text>

        {!success && fieldErrors ? (
          <View style={styles.errorList}>
            {Object.values(fieldErrors).map((m) => (
              <Text key={m} style={styles.errorItem}>
                • {m}
              </Text>
            ))}
          </View>
        ) : null}

        {!success ? (
          <View style={styles.reassure}>
            <Icon name="shield" size={18} color={colors.tealText} />
            <Text style={styles.reassureText}>No money was taken. Your ticket is saved as "Awaiting payment" in My Tickets.</Text>
          </View>
        ) : null}

        {payment ? <ReceiptCard payment={payment} ticket={ticket} /> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {success ? (
          <>
            <AppButton
              title="Show QR pass"
              icon="qr"
              onPress={() => resetTo({ name: 'DigitalQRPass', params: { ticketId: ticket._id } })}
            />
            <AppButton title="Done" variant="secondary" onPress={() => resetTo()} style={styles.gap} />
          </>
        ) : (
          <>
            <AppButton title="Try again" icon="refresh" onPress={() => navigation.goBack()} accessibilityHint="Go back to choose a payment method" />
            <AppButton title="Pay later" variant="secondary" onPress={() => resetTo()} style={styles.gap} />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  content: {
    padding: 16,
    alignItems: 'stretch',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primaryDarkNavy,
    textAlign: 'center',
    marginTop: 16,
  },
  message: {
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
    lineHeight: 21,
  },
  errorList: {
    backgroundColor: colors.dangerBg,
    borderRadius: theme.borderRadius.button,
    padding: 12,
    marginBottom: 12,
  },
  errorItem: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  reassure: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tealTint,
    borderRadius: theme.borderRadius.button,
    padding: 12,
    marginBottom: 16,
  },
  reassureText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: colors.primaryText,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  gap: {
    marginTop: 10,
  },
});

export default PaymentResultScreen;
