import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, theme } from '../../theme';
import { cancelTicket } from '../../services/ticketService';
import { useToast } from '../../context/ToastContext';
import AppButton from '../../components/AppButton';
import ConfirmDialog from '../../components/ConfirmDialog';
import InfoRow from '../../components/InfoRow';
import Icon from '../../components/Icon';
import { Banner } from '../../components/Feedback';
import { formatDateTime, formatLKR } from '../../utils/format';

const POLICY = [
  { icon: 'check-circle', text: 'More than 2 hours before the ticket becomes valid: 100% refund' },
  { icon: 'clock', text: 'Less than 2 hours before: 50% refund' },
  { icon: 'x-circle', text: 'After the validity window starts: no refund' },
  { icon: 'alert-circle', text: 'Used tickets cannot be cancelled' },
];

// Refund preview + confirmation. The preview comes from the server (ticket.cancellation).
const CancelTicketScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { ticket } = route.params;
  const preview = ticket.cancellation || {};
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cancelTicket(ticket._id);
      setConfirmVisible(false);
      toast.show(res.message, 'success');
      navigation.goBack();
    } catch (e) {
      setConfirmVisible(false);
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Banner type="error" message={error} /> : null}

        <View style={styles.refundCard} accessible accessibilityLabel={`Estimated refund ${formatLKR(preview.refundAmount)}, ${preview.refundPercent} percent`}>
          <Text style={styles.refundLabel}>Estimated refund</Text>
          <Text style={styles.refundValue}>{formatLKR(preview.refundAmount)}</Text>
          <Text style={styles.refundSub}>
            {preview.refundPercent}% of {formatLKR(ticket.totalFare)} · {preview.reason}
          </Text>
        </View>

        <View style={styles.card}>
          <InfoRow label="Ticket" value={ticket.ticketNumber} />
          <InfoRow label="Journey" value={`${ticket.fromStop} → ${ticket.toStop}`} />
          <InfoRow label="Valid from" value={formatDateTime(ticket.validFrom)} />
          <InfoRow label="Paid" value={formatLKR(ticket.totalFare)} />
        </View>

        <Text style={styles.sectionTitle}>Cancellation policy</Text>
        <View style={styles.card}>
          {POLICY.map((p) => (
            <View key={p.text} style={styles.policyRow}>
              <Icon name={p.icon} size={18} color={colors.secondaryNavy} />
              <Text style={styles.policyText}>{p.text}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.note}>Refunds go back to the original payment method. Your QR code stops working immediately.</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <AppButton title="Cancel ticket" icon="x-circle" variant="danger" onPress={() => setConfirmVisible(true)} />
        <AppButton title="Keep my ticket" variant="secondary" onPress={() => navigation.goBack()} style={styles.gap} />
      </View>

      <ConfirmDialog
        visible={confirmVisible}
        title="Cancel this ticket?"
        message={
          preview.refundAmount > 0
            ? `You will get ${formatLKR(preview.refundAmount)} back. This cannot be undone.`
            : 'You will not get a refund for this ticket. This cannot be undone.'
        }
        confirmLabel="Yes, cancel"
        cancelLabel="Keep ticket"
        destructive
        loading={loading}
        onConfirm={handleCancel}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  refundCard: {
    backgroundColor: colors.primaryDarkNavy,
    borderRadius: theme.borderRadius.card,
    padding: 18,
    marginBottom: 14,
  },
  refundLabel: {
    color: '#C6D6E2',
    fontSize: 13,
  },
  refundValue: {
    color: colors.activeCyan,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 4,
  },
  refundSub: {
    color: colors.white,
    fontSize: 13,
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDarkNavy,
    marginBottom: 8,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  policyText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: colors.primaryText,
  },
  note: {
    fontSize: 12,
    color: colors.secondaryText,
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

export default CancelTicketScreen;
