import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, theme } from '../../theme';
import StatusBadge from '../../components/StatusBadge';
import InfoRow from '../../components/InfoRow';
import AppButton from '../../components/AppButton';
import ConfirmDialog from '../../components/ConfirmDialog';
import Icon from '../../components/Icon';
import { ErrorState, LoadingView } from '../../components/Feedback';
import { useToast } from '../../context/ToastContext';
import { getTicket, hideTicket, rebookTicket } from '../../services/ticketService';
import { PAYMENT_METHOD_LABEL } from '../../utils/constants';
import { formatDateTime, formatLKR, passengerTypeLabel, routeLabel } from '../../utils/format';

const TicketDetailsScreen = ({ route, navigation }) => {
  const toast = useToast();
  // Accepts { ticketId } or a full { ticket } (older callers)
  const ticketId = route?.params?.ticketId || route?.params?.ticket?._id;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [confirmHide, setConfirmHide] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!ticketId) {
        setError('Ticket details are unavailable.');
        setLoading(false);
        return;
      }
      if (isRefresh) setRefreshing(true);
      setError(null);
      try {
        setTicket(await getTicket(ticketId));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [ticketId]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) return <LoadingView message="Loading ticket..." />;
  if (error || !ticket) return <ErrorState message={error} onRetry={() => load()} />;

  const { actions = {}, cancellation = {}, payment } = ticket;

  const handleHide = async () => {
    setBusy(true);
    try {
      const res = await hideTicket(ticket._id);
      toast.show(res.message, 'success');
      setConfirmHide(false);
      navigation.goBack();
    } catch (e) {
      toast.show(e.message, 'error');
      setBusy(false);
    }
  };

  const handleRebook = async () => {
    setBusy(true);
    try {
      const res = await rebookTicket(ticket._id);
      toast.show(res.message, 'info');
      navigation.navigate('PassengerCheckout', { ticket: res.data });
    } catch (e) {
      toast.show(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const paymentMethod = payment
    ? payment.method === 'CARD' && payment.cardLast4
      ? `${payment.cardBrand} •••• ${payment.cardLast4}`
      : PAYMENT_METHOD_LABEL[payment.method]
    : 'Not paid';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.tealCyan]} />}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.flex}>
            <Text style={styles.label}>Ticket number</Text>
            <Text style={styles.ticketNumber} selectable>
              {ticket.ticketNumber}
            </Text>
          </View>
          <StatusBadge status={ticket.status} large />
        </View>
        <Text style={styles.routeText}>{routeLabel(ticket.route)}</Text>

        <View style={styles.divider} />
        <View style={styles.journey}>
          <View style={styles.flex}>
            <Text style={styles.label}>From</Text>
            <Text style={styles.stop}>{ticket.fromStop}</Text>
          </View>
          <Icon name="arrow-right" size={20} color={colors.secondaryText} />
          <View style={[styles.flex, styles.alignRight]}>
            <Text style={styles.label}>To</Text>
            <Text style={styles.stop}>{ticket.toStop}</Text>
          </View>
        </View>
        <View style={styles.divider} />

        <InfoRow icon="calendar" label="Departure" value={formatDateTime(ticket.travelDate)} />
        <InfoRow icon="clock" label="Valid from" value={formatDateTime(ticket.validFrom)} />
        <InfoRow icon="hourglass" label="Valid until" value={formatDateTime(ticket.validUntil)} />
        <InfoRow icon="users" label="Passengers" value={`${ticket.passengers} × ${passengerTypeLabel(ticket.passengerType)}`} />
        <InfoRow label="Fare per passenger" value={formatLKR(ticket.unitFare)} />
        <InfoRow label="Total fare" value={formatLKR(ticket.totalFare)} bold />
        <InfoRow icon="card" label="Payment" value={paymentMethod} />
        {ticket.usedAt ? <InfoRow icon="check-double" label="Used at" value={formatDateTime(ticket.usedAt)} /> : null}
        {ticket.cancelledAt ? <InfoRow icon="x-circle" label="Cancelled at" value={formatDateTime(ticket.cancelledAt)} /> : null}
        {['CANCELLED', 'REFUNDED'].includes(ticket.status) ? (
          <InfoRow icon="refund" label="Refund" value={formatLKR(ticket.refundAmount)} bold valueColor="#5B21B6" />
        ) : null}
      </View>

      {actions.canCancel && ticket.status === 'ACTIVE' ? (
        <View style={styles.policy}>
          <Icon name="info" size={18} color={colors.tealText} />
          <Text style={styles.policyText}>
            If you cancel now: {cancellation.refundPercent}% refund ({formatLKR(cancellation.refundAmount)}). {cancellation.reason}.
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        {actions.canShowQr ? (
          <AppButton title="Show QR pass" icon="qr" onPress={() => navigation.navigate('DigitalQRPass', { ticketId: ticket._id })} />
        ) : null}
        {actions.canPay ? (
          <AppButton title="Pay now" icon="card" onPress={() => navigation.navigate('PassengerCheckout', { ticket })} />
        ) : null}
        {actions.canEdit ? (
          <AppButton title="Change trip" icon="edit" variant="secondary" onPress={() => navigation.navigate('EditTicket', { ticket })} />
        ) : null}
        {payment?.receiptNumber ? (
          <AppButton
            title="View receipt"
            icon="receipt"
            variant="secondary"
            onPress={() => navigation.navigate('PaymentReceipt', { paymentId: payment._id })}
          />
        ) : null}
        {actions.canHide ? (
          <AppButton title="Rebook this trip" icon="refresh" variant="secondary" onPress={handleRebook} loading={busy && !confirmHide} />
        ) : null}
        {actions.canCancel ? (
          <AppButton
            title="Cancel ticket"
            icon="x-circle"
            variant="dangerOutline"
            onPress={() => navigation.navigate('CancelTicket', { ticket })}
            accessibilityHint="Shows the refund before you confirm"
          />
        ) : null}
        {actions.canHide ? (
          <AppButton title="Remove from history" icon="eye-off" variant="dangerOutline" onPress={() => setConfirmHide(true)} />
        ) : null}
      </View>

      <ConfirmDialog
        visible={confirmHide}
        title="Remove from history?"
        message={`Ticket ${ticket.ticketNumber} will no longer appear in My Tickets.`}
        confirmLabel="Remove"
        destructive
        icon="eye-off"
        loading={busy}
        onConfirm={handleHide}
        onCancel={() => setConfirmHide(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  flex: {
    flex: 1,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 11,
    color: colors.secondaryText,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ticketNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDarkNavy,
    marginTop: 2,
  },
  routeText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  journey: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stop: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryText,
    marginTop: 2,
  },
  policy: {
    flexDirection: 'row',
    backgroundColor: colors.tealTint,
    borderRadius: theme.borderRadius.button,
    padding: 12,
    marginTop: 14,
  },
  policyText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: colors.primaryText,
    lineHeight: 19,
  },
  actions: {
    marginTop: 16,
    gap: 10,
  },
});

export default TicketDetailsScreen;
