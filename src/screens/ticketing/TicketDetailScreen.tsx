/**
 * Member 2 — Ticket details / Digital QR pass
 * Shows the QR code the conductor scans (encodes the ticket number), validity,
 * journey details and the actions allowed for the ticket's current status.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';
import { ticketingApi } from '@/services/api/ticketingApi';
import { FARE_CATEGORY_LABELS, PassengerTicket, TicketPayment } from '@/types/ticketing';
import { formatDateTime, formatFullDate, formatLKR, formatTime } from '@/services/ticketing/format';
import {
  Card,
  ErrorBanner,
  InfoRow,
  OfflineBanner,
  PrimaryButton,
  RouteBadge,
  StatusPill,
  TicketingHeader,
  ticketingStyles,
} from '@/components/ticketing/TicketingUI';

export function TicketDetailScreen() {
  const { id, paid } = useLocalSearchParams<{ id: string; paid?: string }>();
  const [ticket, setTicket] = useState<PassengerTicket | null>(null);
  const [payment, setPayment] = useState<TicketPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [notice, setNotice] = useState<string | null>(paid ? 'Payment successful — your ticket is ready.' : null);

  const load = useCallback(
    async (silent = false) => {
      if (!id) return;
      if (!silent) setLoading(true);
      try {
        const res = await ticketingApi.getTicket(id);
        setTicket(res.ticket);
        setPayment(res.payment);
        setNow(Date.now());
        setError(null);
      } catch (e) {
        if (!silent) setError(e instanceof Error ? e.message : 'Could not load this ticket.');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // While the QR is on screen, poll so the pass flips to "Used" right after the conductor scans it
  useEffect(() => {
    if (ticket?.status !== 'ACTIVE') return;
    const timer = setInterval(() => load(true), 10000);
    return () => clearInterval(timer);
  }, [ticket?.status, load]);

  const confirmCancel = async () => {
    if (!ticket) return;
    setBusy(true);
    try {
      const res = await ticketingApi.cancel(ticket.id);
      setTicket(res.ticket);
      setShowCancel(false);
      setNotice(
        res.refund.refundAmount > 0
          ? `Ticket cancelled. ${formatLKR(res.refund.refundAmount)} refunded.`
          : 'Ticket cancelled. No refund applies.'
      );
      load(true);
    } catch (e) {
      setShowCancel(false);
      setError(e instanceof Error ? e.message : 'Could not cancel the ticket.');
    } finally {
      setBusy(false);
    }
  };

  const removeTicket = () => {
    if (!ticket) return;
    const pending = ticket.status === 'PENDING_PAYMENT';
    Alert.alert(
      pending ? 'Discard this booking?' : 'Remove from history?',
      pending ? 'You have not been charged for this booking.' : 'This ticket will no longer appear in your history.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: pending ? 'Discard' : 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await ticketingApi.deleteTicket(ticket.id);
              router.replace('/tickets' as any);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Could not remove the ticket.');
            }
          },
        },
      ]
    );
  };

  if (loading || !ticket) {
    return (
      <SafeAreaView style={ticketingStyles.screen}>
        <TicketingHeader title="Ticket" onBack={() => router.replace('/tickets' as any)} />
        {error ? <View style={{ padding: 16 }}><ErrorBanner message={error} /></View> : <ActivityIndicator style={{ marginTop: 40 }} color={TransitColors.primary} />}
      </SafeAreaView>
    );
  }

  const a = ticket.actions;
  const windowOpen = now >= new Date(ticket.validFrom).getTime();

  return (
    <SafeAreaView style={ticketingStyles.screen} edges={['top', 'left', 'right', 'bottom']}>
      <TicketingHeader
        title={ticket.status === 'ACTIVE' ? 'Digital pass' : 'Ticket details'}
        subtitle={ticket.ticketNumber}
        onBack={() => router.replace('/tickets' as any)}
      />
      <OfflineBanner />

      <ScrollView contentContainerStyle={ticketingStyles.scroll}>
        {notice ? (
          <View style={styles.notice} accessibilityRole="alert">
            <Feather name="check-circle" size={16} color={TransitColors.onTimeText} />
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}
        {error ? <ErrorBanner message={error} /> : null}

        {/* Pass */}
        <View style={styles.pass}>
          <View style={styles.passTop}>
            <RouteBadge routeNumber={ticket.routeNumber} type={ticket.transportType} />
            <StatusPill status={ticket.status} />
          </View>
          <Text style={styles.passRoute}>{ticket.routeName}</Text>

          <View style={styles.stops}>
            <View style={{ flex: 1 }}>
              <Text style={styles.stopLabel}>FROM</Text>
              <Text style={styles.stopName}>{ticket.fromStop}</Text>
            </View>
            <Feather name="arrow-right" size={18} color={TransitColors.textMuted} />
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.stopLabel}>TO</Text>
              <Text style={[styles.stopName, { textAlign: 'right' }]}>{ticket.toStop}</Text>
            </View>
          </View>

          <View style={styles.perforation}>
            <View style={[styles.notch, { left: -28 }]} />
            <View style={styles.dash} />
            <View style={[styles.notch, { right: -28 }]} />
          </View>

          {ticket.status === 'ACTIVE' ? (
            <View style={styles.qrWrap}>
              <View
                style={styles.qrBox}
                accessible
                accessibilityLabel={`QR code for ticket ${ticket.ticketNumber}. Show this to the conductor.`}
              >
                <QRCode value={ticket.qrPayload} size={200} color={TransitColors.primaryDark} backgroundColor="#FFFFFF" />
              </View>
              <Text style={styles.ticketNo}>{ticket.ticketNumber}</Text>
              <Text style={styles.qrHint}>
                {windowOpen
                  ? 'Show this code to the conductor when boarding. Turn up screen brightness if it does not scan.'
                  : `Scannable from ${formatDateTime(ticket.validFrom)}.`}
              </Text>
            </View>
          ) : (
            <View style={styles.qrInactive}>
              <MaterialCommunityIcons
                name={ticket.status === 'PENDING_PAYMENT' ? 'credit-card-clock-outline' : ticket.status === 'USED' ? 'check-decagram' : 'ticket-outline'}
                size={44}
                color={TransitColors.textMuted}
              />
              <Text style={styles.qrInactiveText}>
                {ticket.status === 'PENDING_PAYMENT'
                  ? 'Complete payment to get your QR code.'
                  : ticket.status === 'USED'
                    ? `Scanned on board${ticket.usedAt ? ` at ${formatTime(ticket.usedAt)}` : ''}. Have a good trip!`
                    : ticket.status === 'CANCELLED'
                      ? `Cancelled${ticket.refundAmount > 0 ? ` · ${formatLKR(ticket.refundAmount)} refunded` : ''}.`
                      : 'This ticket has expired.'}
              </Text>
            </View>
          )}
        </View>

        {/* Details */}
        <Card>
          <InfoRow label="Travel" value={formatFullDate(ticket.travelDate)} />
          <InfoRow label="Valid" value={`${formatTime(ticket.validFrom)} – ${formatTime(ticket.validUntil)}`} />
          <InfoRow label="Passengers" value={`${ticket.passengers} × ${FARE_CATEGORY_LABELS[ticket.fareCategory]}`} />
          <InfoRow label="Passenger name" value={ticket.passengerName} />
          {ticket.rescheduleCount > 0 ? <InfoRow label="Rescheduled" value={`${ticket.rescheduleCount} time(s)`} /> : null}
          <View style={styles.divider} />
          <InfoRow label="Total fare" value={formatLKR(ticket.totalFare)} strong />
          {payment ? (
            <TouchableOpacity
              style={styles.receiptLink}
              onPress={() => router.push({ pathname: '/tickets/payments', params: { receipt: payment.id } } as any)}
              accessibilityRole="button"
            >
              <Feather name="file-text" size={14} color={TransitColors.primary} />
              <Text style={styles.receiptText}>
                Paid by {payment.method === 'WALLET' ? 'MetroPay wallet' : `${payment.cardBrand} •••• ${payment.cardLast4}`} · View receipt
              </Text>
            </TouchableOpacity>
          ) : null}
        </Card>

        {/* Actions */}
        <View style={{ gap: 10 }}>
          {a.canPay ? (
            <PrimaryButton
              label="Pay now"
              icon="credit-card"
              onPress={() => router.push({ pathname: '/tickets/checkout', params: { id: ticket.id } } as any)}
            />
          ) : null}
          {a.canReschedule ? (
            <PrimaryButton
              label={ticket.status === 'ACTIVE' ? 'Reschedule' : 'Edit booking'}
              icon="calendar"
              variant="outline"
              onPress={() => {
                setNotice(null);
                router.push({ pathname: '/tickets/reschedule', params: { id: ticket.id } } as any);
              }}
            />
          ) : null}
          {a.canCancel ? (
            <PrimaryButton label="Cancel ticket" icon="x-circle" variant="outline" onPress={() => setShowCancel(true)} />
          ) : null}
          {a.canDelete ? (
            <TouchableOpacity onPress={removeTicket} style={styles.removeBtn} accessibilityRole="button">
              <Feather name="trash-2" size={15} color={TransitColors.delayedText} />
              <Text style={styles.removeText}>
                {ticket.status === 'PENDING_PAYMENT' ? 'Discard booking' : 'Remove from history'}
              </Text>
            </TouchableOpacity>
          ) : null}
          {ticket.status === 'USED' || ticket.status === 'EXPIRED' || ticket.status === 'CANCELLED' ? (
            <PrimaryButton
              label="Book this trip again"
              icon="repeat"
              variant="outline"
              onPress={() => router.push({ pathname: '/tickets/buy', params: { routeId: ticket.routeId } } as any)}
            />
          ) : null}
        </View>
      </ScrollView>

      {/* Cancel confirmation with refund preview */}
      <Modal visible={showCancel} transparent animationType="slide" onRequestClose={() => setShowCancel(false)}>
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Cancel this ticket?</Text>
            <View style={styles.refundBox}>
              <Text style={styles.refundLabel}>Refund</Text>
              <Text style={styles.refundAmount}>{formatLKR(ticket.cancellation.refundAmount)}</Text>
              <Text style={styles.refundPct}>{ticket.cancellation.refundPercent}% of {formatLKR(ticket.totalFare)}</Text>
            </View>
            <Text style={styles.sheetText}>{ticket.cancellation.reason}</Text>
            <Text style={styles.sheetPolicy}>
              Policy: full refund up to 2 h before the ticket becomes valid, 50% after that, none once the travel window starts.
            </Text>
            <View style={{ gap: 10, marginTop: 16 }}>
              <PrimaryButton label="Yes, cancel ticket" variant="danger" onPress={confirmCancel} loading={busy} />
              <PrimaryButton label="Keep my ticket" variant="outline" onPress={() => setShowCancel(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: TransitColors.onTimeBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  noticeText: { flex: 1, fontSize: 13, fontWeight: '700', color: TransitColors.onTimeText },
  pass: {
    backgroundColor: TransitColors.cardBackground,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    overflow: 'hidden',
    ...TransitShadows.floating,
  },
  passTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  passRoute: { fontSize: 13, color: TransitColors.textSecondary, marginTop: 8 },
  stops: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 10 },
  stopLabel: { fontSize: 10, fontWeight: '800', color: TransitColors.textMuted, letterSpacing: 1 },
  stopName: { fontSize: 16, fontWeight: '800', color: TransitColors.primary, marginTop: 3 },
  perforation: { height: 28, justifyContent: 'center', marginVertical: 12 },
  notch: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: TransitColors.background },
  dash: { borderTopWidth: 2, borderStyle: 'dashed', borderColor: TransitColors.border, marginHorizontal: 12 },
  qrWrap: { alignItems: 'center' },
  qrBox: { padding: 12, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: TransitColors.border },
  ticketNo: { fontSize: 18, fontWeight: '800', color: TransitColors.primary, letterSpacing: 2, marginTop: 12 },
  qrHint: { fontSize: 12, color: TransitColors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 17, paddingHorizontal: 8 },
  qrInactive: { alignItems: 'center', paddingVertical: 18, gap: 8 },
  qrInactiveText: { fontSize: 13, color: TransitColors.textSecondary, textAlign: 'center', paddingHorizontal: 12 },
  divider: { height: 1, backgroundColor: TransitColors.divider, marginVertical: 8 },
  receiptLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  receiptText: { flex: 1, fontSize: 12, fontWeight: '700', color: TransitColors.primary },
  removeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 },
  removeText: { fontSize: 13, fontWeight: '700', color: TransitColors.delayedText },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: TransitColors.handleBar, alignSelf: 'center', marginBottom: 14 },
  sheetTitle: { fontSize: 19, fontWeight: '800', color: TransitColors.primary },
  refundBox: { backgroundColor: TransitColors.borderLight, borderRadius: 14, padding: 14, marginTop: 14, alignItems: 'center' },
  refundLabel: { fontSize: 11, fontWeight: '800', color: TransitColors.textSecondary, textTransform: 'uppercase' },
  refundAmount: { fontSize: 26, fontWeight: '800', color: TransitColors.primary, marginTop: 2 },
  refundPct: { fontSize: 12, color: TransitColors.textSecondary },
  sheetText: { fontSize: 13, color: TransitColors.textPrimary, marginTop: 12, fontWeight: '600' },
  sheetPolicy: { fontSize: 12, color: TransitColors.textSecondary, marginTop: 6, lineHeight: 17 },
});
