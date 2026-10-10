import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, theme } from '../theme';
import { formatDate, formatLKR, formatTime, passengerTypeLabel, routeLabel } from '../utils/format';
import StatusBadge from './StatusBadge';
import Icon from './Icon';

const ActionButton = ({ label, icon, onPress, accessibilityLabel, primary = false }) => (
  <TouchableOpacity
    style={[styles.actionButton, primary && styles.actionPrimary]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
  >
    <Icon name={icon} size={16} color={primary ? colors.primaryDarkNavy : colors.secondaryNavy} />
    <Text style={[styles.actionText, primary && styles.actionTextPrimary]}>{label}</Text>
  </TouchableOpacity>
);

// Ticket summary card. Buttons are shown based on ticket.actions from the API.
const TicketCard = ({ ticket, onViewQR, onViewDetails, onHide, onRebook, onPay, compact = false }) => {
  const actions = ticket.actions || {};
  const number = ticket.ticketNumber || ticket.ticketId || ticket._id;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onViewDetails?.(ticket)}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`Ticket ${number}, ${ticket.fromStop} to ${ticket.toStop}, ${formatDate(ticket.travelDate)}. Open details`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.routeInfo}>
          <Text style={styles.labelText}>Route</Text>
          <Text style={styles.routeText} numberOfLines={1}>
            {routeLabel(ticket.route)}
          </Text>
          <Text style={styles.ticketIdText}>{number}</Text>
        </View>
        <StatusBadge status={ticket.status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.journeySnippet}>
        <Icon name="map-pin" size={16} color={colors.tealText} />
        <Text style={styles.locationText} numberOfLines={1}>
          {ticket.fromStop}
        </Text>
        <Icon name="arrow-right" size={14} color={colors.secondaryText} />
        <Text style={styles.locationText} numberOfLines={1}>
          {ticket.toStop}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <View style={styles.scheduleContainer}>
          <Text style={styles.labelText}>Date &amp; Time</Text>
          <Text style={styles.scheduleText}>
            {formatDate(ticket.travelDate)} · {formatTime(ticket.travelDate)}
          </Text>
          <Text style={styles.scheduleText}>
            {ticket.passengers} × {passengerTypeLabel(ticket.passengerType)}
          </Text>
        </View>
        <View style={styles.fareContainer}>
          <Text style={styles.labelText}>Fare</Text>
          <Text style={styles.fareText}>{formatLKR(ticket.totalFare)}</Text>
        </View>
      </View>

      {!compact && (
        <>
          <View style={styles.divider} />
          <View style={styles.actionRow}>
            {actions.canShowQr && onViewQR ? (
              <ActionButton primary label="Show QR" icon="qr" onPress={() => onViewQR(ticket)} accessibilityLabel={`Show QR code for ticket ${number}`} />
            ) : null}
            {actions.canPay && onPay ? (
              <ActionButton primary label="Pay now" icon="card" onPress={() => onPay(ticket)} accessibilityLabel={`Pay for ticket ${number}`} />
            ) : null}
            {actions.canHide && onRebook ? (
              <ActionButton label="Rebook" icon="refresh" onPress={() => onRebook(ticket)} accessibilityLabel={`Rebook the trip on ticket ${number}`} />
            ) : null}
            {actions.canHide && onHide ? (
              <ActionButton label="Hide" icon="eye-off" onPress={() => onHide(ticket)} accessibilityLabel={`Remove ticket ${number} from history`} />
            ) : null}
            <ActionButton label="Details" icon="chevron-right" onPress={() => onViewDetails?.(ticket)} accessibilityLabel={`View details for ticket ${number}`} />
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routeInfo: {
    flex: 1,
    marginRight: 10,
  },
  routeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDarkNavy,
  },
  ticketIdText: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  labelText: {
    fontSize: 10,
    color: colors.secondaryText,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  journeySnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: colors.primaryText,
    fontWeight: '600',
    marginHorizontal: 6,
    flexShrink: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  scheduleContainer: {
    flex: 1,
    marginRight: 16,
  },
  fareContainer: {
    alignItems: 'flex-end',
  },
  scheduleText: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  fareText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.tealText,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  actionButton: {
    flexGrow: 1,
    flexDirection: 'row',
    minHeight: theme.touch,
    backgroundColor: colors.lightBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.button,
    paddingHorizontal: 10,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: {
    borderColor: colors.tealCyan,
    backgroundColor: colors.tealTint,
  },
  actionText: {
    color: colors.secondaryNavy,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  actionTextPrimary: {
    color: colors.primaryDarkNavy,
  },
});

export default TicketCard;
