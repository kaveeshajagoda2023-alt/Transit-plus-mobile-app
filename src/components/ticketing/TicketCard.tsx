import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';
import { FARE_CATEGORY_LABELS, PassengerTicket } from '@/types/ticketing';
import { formatDateTime, formatLKR } from '@/services/ticketing/format';
import { RouteBadge, StatusPill } from './TicketingUI';

/** Member 2 — one ticket in the My Tickets list. */
export function TicketCard({ ticket, onPress }: { ticket: PassengerTicket; onPress: () => void }) {
  const muted = ['USED', 'EXPIRED', 'CANCELLED'].includes(ticket.status);
  return (
    <TouchableOpacity
      style={[styles.card, muted && styles.cardMuted]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${ticket.routeNumber} ticket from ${ticket.fromStop} to ${ticket.toStop}, ${formatDateTime(ticket.travelDate)}, ${ticket.status.toLowerCase().replace('_', ' ')}`}
      accessibilityHint="Opens ticket details"
    >
      <View style={styles.topRow}>
        <RouteBadge routeNumber={ticket.routeNumber} type={ticket.transportType} />
        <StatusPill status={ticket.status} />
      </View>

      <View style={styles.journey}>
        <View style={styles.rail}>
          <View style={[styles.dot, { backgroundColor: TransitColors.primary }]} />
          <View style={styles.railLine} />
          <View style={[styles.dot, styles.dotHollow]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.stop} numberOfLines={1}>{ticket.fromStop}</Text>
          <Text style={[styles.stop, { marginTop: 14 }]} numberOfLines={1}>{ticket.toStop}</Text>
        </View>
        {ticket.status === 'ACTIVE' ? (
          <View style={styles.qrHint}>
            <MaterialCommunityIcons name="qrcode" size={26} color={TransitColors.primary} />
            <Text style={styles.qrHintText}>Show QR</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <View style={styles.meta}>
          <Feather name="clock" size={13} color={TransitColors.textSecondary} />
          <Text style={styles.metaText}>{formatDateTime(ticket.travelDate)}</Text>
        </View>
        <View style={styles.meta}>
          <Feather name="users" size={13} color={TransitColors.textSecondary} />
          <Text style={styles.metaText}>
            {ticket.passengers} × {FARE_CATEGORY_LABELS[ticket.fareCategory]}
          </Text>
        </View>
        <Text style={styles.fare}>{formatLKR(ticket.totalFare)}</Text>
      </View>

      {ticket.status === 'PENDING_PAYMENT' ? (
        <View style={styles.payNudge}>
          <Feather name="credit-card" size={13} color={TransitColors.etaPeachText} />
          <Text style={styles.payNudgeText}>Payment pending — tap to complete</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: TransitColors.cardBackground,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: TransitColors.borderLight,
    ...TransitShadows.card,
  },
  cardMuted: { opacity: 0.85 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  journey: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 12 },
  rail: { alignItems: 'center', width: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotHollow: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: TransitColors.primary },
  railLine: { width: 2, height: 20, backgroundColor: TransitColors.border, marginVertical: 2 },
  stop: { fontSize: 15, fontWeight: '700', color: TransitColors.textPrimary },
  qrHint: { alignItems: 'center', paddingLeft: 8 },
  qrHintText: { fontSize: 10, fontWeight: '700', color: TransitColors.primary, marginTop: 2 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: TransitColors.divider,
    gap: 12,
    flexWrap: 'wrap',
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: TransitColors.textSecondary, fontWeight: '600' },
  fare: { marginLeft: 'auto', fontSize: 15, fontWeight: '800', color: TransitColors.primary },
  payNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: TransitColors.etaPeachBg,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  payNudgeText: { fontSize: 12, fontWeight: '700', color: TransitColors.etaPeachText },
});
