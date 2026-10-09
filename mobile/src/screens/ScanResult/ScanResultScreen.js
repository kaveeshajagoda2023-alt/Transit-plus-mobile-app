import React, { useEffect } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, Text, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, theme } from '../../theme';
import { SCAN_RESULT } from '../../utils/constants';
import { formatDateTime, formatTime, passengerTypeLabel, routeLabel } from '../../utils/format';
import AppButton from '../../components/AppButton';
import Icon from '../../components/Icon';
import InfoRow from '../../components/InfoRow';

// Big, unmistakable verdict for the conductor: colour + icon + words + reason
const ScanResultScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { result, reason, message, ticket, scannedAt } = route.params;
  const config = SCAN_RESULT[result] || SCAN_RESULT.INVALID;
  const valid = result === 'VALID';

  useEffect(() => {
    // One short buzz for valid, a double buzz for a problem (helps in a noisy bus)
    Vibration.vibrate(valid ? 80 : [0, 120, 80, 120]);
    AccessibilityInfo.announceForAccessibility(`${config.label}. ${message}`);
  }, [valid, config.label, message]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}>
        <View style={[styles.verdict, { backgroundColor: config.bg, borderColor: config.fg }]}>
          <Icon name={config.icon} size={64} color={config.fg} strokeWidth={2.2} />
          <Text style={[styles.verdictText, { color: config.fg }]} accessibilityRole="header">
            {config.label.toUpperCase()}
          </Text>
          <Text style={styles.reason}>{message}</Text>
          <Text style={styles.code}>Reason code: {reason}</Text>
        </View>

        {ticket ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ticket</Text>
            <InfoRow label="Number" value={ticket.ticketNumber} bold />
            <InfoRow label="Route" value={routeLabel(ticket.route)} />
            <InfoRow label="Journey" value={`${ticket.fromStop} → ${ticket.toStop}`} />
            <InfoRow label="Passengers" value={`${ticket.passengers} × ${passengerTypeLabel(ticket.passengerType)}`} />
            <InfoRow label="Valid" value={`${formatTime(ticket.validFrom)} – ${formatTime(ticket.validUntil)}`} />
            {ticket.usedAt ? <InfoRow label="Used at" value={formatDateTime(ticket.usedAt)} /> : null}
          </View>
        ) : null}

        <Text style={styles.time}>Scanned {formatDateTime(scannedAt)}</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <AppButton title="Scan next ticket" icon="scan" onPress={() => navigation.goBack()} />
        <AppButton title="View scan log" icon="list" variant="secondary" onPress={() => navigation.replace('ScanHistory')} style={styles.gap} />
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
  },
  verdict: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.card,
    borderWidth: 2,
    padding: 24,
  },
  verdictText: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 10,
    letterSpacing: 1,
  },
  reason: {
    fontSize: 16,
    color: colors.primaryText,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  code: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDarkNavy,
    marginBottom: 4,
  },
  time: {
    textAlign: 'center',
    color: colors.secondaryText,
    fontSize: 12,
    marginTop: 14,
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

export default ScanResultScreen;
