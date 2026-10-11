/**
 * Member 2 — Payment history & receipts
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { TransitColors } from '@/constants/transitTheme';
import { ticketingApi } from '@/services/api/ticketingApi';
import { PassengerTicket, TicketPayment } from '@/types/ticketing';
import { usePassengerIdentity } from '@/hooks/usePassengerIdentity';
import { formatFullDate, formatLKR } from '@/services/ticketing/format';
import {
  Card,
  ErrorBanner,
  InfoRow,
  OfflineBanner,
  PrimaryButton,
  TicketingHeader,
  ticketingStyles,
} from '@/components/ticketing/TicketingUI';

const STATUS_STYLE: Record<TicketPayment['status'], { bg: string; fg: string; label: string }> = {
  SUCCESS: { bg: TransitColors.onTimeBg, fg: TransitColors.onTimeText, label: 'Paid' },
  FAILED: { bg: TransitColors.delayedBg, fg: TransitColors.delayedText, label: 'Failed' },
  REFUNDED: { bg: TransitColors.etaNeutralBg, fg: TransitColors.etaNeutralText, label: 'Refunded' },
};

const methodLabel = (p: TicketPayment) =>
  p.method === 'WALLET' ? 'MetroPay wallet' : `${p.cardBrand || 'Card'} •••• ${p.cardLast4 || '----'}`;

export function PaymentHistoryScreen() {
  const { receipt } = useLocalSearchParams<{ receipt?: string }>();
  const { passengerId } = usePassengerIdentity();
  const [payments, setPayments] = useState<TicketPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openReceipt, setOpenReceipt] = useState<{ payment: TicketPayment; ticket: PassengerTicket | null } | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      ticketingApi
        .listPayments(passengerId)
        .then(setPayments)
        .catch((e) => setError(e instanceof Error ? e.message : 'Could not load payments.'))
        .finally(() => setLoading(false));
    }, [passengerId])
  );

  const showReceipt = useCallback((paymentId: string) => {
    ticketingApi
      .getPayment(paymentId)
      .then(setOpenReceipt)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load receipt.'));
  }, []);

  // Opened from a ticket's "View receipt" link
  useEffect(() => {
    if (!receipt) return;
    ticketingApi
      .getPayment(receipt)
      .then(setOpenReceipt)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load receipt.'));
  }, [receipt]);

  const paidCount = payments.filter((p) => p.status !== 'FAILED').length;
  const spent = payments
    .filter((p) => p.status !== 'FAILED')
    .reduce((sum, p) => sum + p.amount - (p.refundAmount || 0), 0);

  return (
    <SafeAreaView style={ticketingStyles.screen} edges={['top', 'left', 'right', 'bottom']}>
      <TicketingHeader title="Payment history" subtitle="Receipts for your ticket purchases" />
      <OfflineBanner />

      <ScrollView contentContainerStyle={ticketingStyles.scroll}>
        {error ? <ErrorBanner message={error} /> : null}

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Total spent on tickets</Text>
          <Text style={styles.summaryValue}>{formatLKR(spent)}</Text>
          <Text style={styles.summarySub}>
            {paidCount} payment{paidCount === 1 ? '' : 's'} · refunds deducted
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={TransitColors.primary} style={{ marginTop: 24 }} />
        ) : payments.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="receipt" size={44} color={TransitColors.textMuted} />
            <Text style={styles.emptyText}>No payments yet.</Text>
          </View>
        ) : (
          payments.map((p) => {
            const s = STATUS_STYLE[p.status];
            return (
              <TouchableOpacity
                key={p.id}
                style={styles.row}
                onPress={() => (p.status === 'FAILED' ? null : showReceipt(p.id))}
                disabled={p.status === 'FAILED'}
                accessibilityRole="button"
                accessibilityLabel={`${s.label} ${formatLKR(p.amount)} for ticket ${p.ticketNumber}`}
              >
                <View style={[styles.icon, { backgroundColor: s.bg }]}>
                  <Feather
                    name={p.status === 'FAILED' ? 'x' : p.status === 'REFUNDED' ? 'rotate-ccw' : 'check'}
                    size={16}
                    color={s.fg}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>Ticket {p.ticketNumber}</Text>
                  <Text style={styles.rowSub}>
                    {methodLabel(p)} · {formatFullDate(p.createdAt)}
                  </Text>
                  {p.failureReason ? <Text style={styles.rowFail}>{p.failureReason}</Text> : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.amount, p.status === 'FAILED' && styles.amountStruck]}>{formatLKR(p.amount)}</Text>
                  <Text style={[styles.badge, { color: s.fg }]}>
                    {p.status === 'REFUNDED' ? `−${formatLKR(p.refundAmount)}` : s.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal visible={!!openReceipt} transparent animationType="slide" onRequestClose={() => setOpenReceipt(null)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            {openReceipt ? (
              <>
                <View style={styles.receiptHead}>
                  <MaterialCommunityIcons name="check-decagram" size={34} color={TransitColors.onTimeText} />
                  <Text style={styles.receiptTitle}>Payment receipt</Text>
                  <Text style={styles.receiptNo}>{openReceipt.payment.receiptNumber}</Text>
                </View>
                <Card style={{ marginTop: 12 }}>
                  <InfoRow label="Ticket" value={openReceipt.payment.ticketNumber} />
                  {openReceipt.ticket ? (
                    <InfoRow label="Journey" value={`${openReceipt.ticket.fromStop} → ${openReceipt.ticket.toStop}`} />
                  ) : null}
                  <InfoRow label="Paid with" value={methodLabel(openReceipt.payment)} />
                  <InfoRow label="Date" value={formatFullDate(openReceipt.payment.createdAt)} />
                  <InfoRow label="Transaction" value={openReceipt.payment.transactionRef} />
                  {openReceipt.payment.refundAmount > 0 ? (
                    <InfoRow label="Refunded" value={formatLKR(openReceipt.payment.refundAmount)} />
                  ) : null}
                  <InfoRow label="Amount" value={formatLKR(openReceipt.payment.amount)} strong />
                </Card>
                <View style={{ gap: 10 }}>
                  {openReceipt.ticket ? (
                    <PrimaryButton
                      label="Open ticket"
                      icon="maximize"
                      onPress={() => {
                        const tid = openReceipt.ticket!.id;
                        setOpenReceipt(null);
                        router.push(`/tickets/${tid}` as any);
                      }}
                    />
                  ) : null}
                  <PrimaryButton label="Close" variant="outline" onPress={() => setOpenReceipt(null)} />
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  summary: { backgroundColor: TransitColors.primary, borderRadius: 20, padding: 18, marginBottom: 16 },
  summaryLabel: { color: '#CBD5E1', fontSize: 12, fontWeight: '700' },
  summaryValue: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 4 },
  summarySub: { color: '#CBD5E1', fontSize: 11, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 13, color: TransitColors.textSecondary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: TransitColors.cardBackground,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: TransitColors.borderLight,
  },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '800', color: TransitColors.textPrimary },
  rowSub: { fontSize: 11, color: TransitColors.textSecondary, marginTop: 2 },
  rowFail: { fontSize: 11, color: TransitColors.delayedText, marginTop: 2, fontWeight: '600' },
  amount: { fontSize: 14, fontWeight: '800', color: TransitColors.primary },
  amountStruck: { textDecorationLine: 'line-through', color: TransitColors.textMuted },
  badge: { fontSize: 11, fontWeight: '800', marginTop: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: TransitColors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  receiptHead: { alignItems: 'center' },
  receiptTitle: { fontSize: 18, fontWeight: '800', color: TransitColors.primary, marginTop: 6 },
  receiptNo: { fontSize: 12, color: TransitColors.textSecondary, marginTop: 2, letterSpacing: 1 },
});
