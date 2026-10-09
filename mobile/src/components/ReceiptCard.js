import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, theme } from '../theme';
import { PAYMENT_METHOD_LABEL } from '../utils/constants';
import { formatDateTime, formatLKR, routeLabel } from '../utils/format';
import InfoRow from './InfoRow';
import StatusBadge from './StatusBadge';

// Receipt used after checkout and in Payment History
const ReceiptCard = ({ payment, ticket }) => {
  const method =
    payment.method === 'CARD' && payment.cardLast4
      ? `${payment.cardBrand || 'Card'} •••• ${payment.cardLast4}`
      : PAYMENT_METHOD_LABEL[payment.method] || payment.method;
  const t = ticket || payment.ticket;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Receipt</Text>
        <StatusBadge kind="payment" status={payment.status} />
      </View>
      <View style={styles.divider} />
      {payment.receiptNumber ? <InfoRow label="Receipt no." value={payment.receiptNumber} /> : null}
      <InfoRow label="Transaction ref." value={payment.transactionRef} />
      <InfoRow label="Date" value={formatDateTime(payment.createdAt)} />
      <InfoRow label="Method" value={method} />
      {t ? (
        <>
          <InfoRow label="Ticket" value={t.ticketNumber} />
          {t.route ? <InfoRow label="Route" value={routeLabel(t.route)} /> : null}
          {t.fromStop ? <InfoRow label="Journey" value={`${t.fromStop} → ${t.toStop}`} /> : null}
        </>
      ) : null}
      {payment.failureReason ? <InfoRow label="Reason" value={payment.failureReason} valueColor={colors.danger} /> : null}
      <View style={styles.divider} />
      <InfoRow label="Amount" value={formatLKR(payment.amount)} bold />
      {payment.refundAmount > 0 ? (
        <InfoRow label="Refunded" value={formatLKR(payment.refundAmount)} bold valueColor="#5B21B6" />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDarkNavy,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
});

export default ReceiptCard;
