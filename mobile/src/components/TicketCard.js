import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, theme } from '../theme';
import StatusBadge from './StatusBadge';

const TicketCard = ({ ticket, onViewQR, onViewDetails }) => {
  return (
    <View style={styles.card}>
      {/* Top Header Row */}
      <View style={styles.cardHeader}>
        <View style={styles.routeInfo}>
          <Text style={styles.labelText}>Route</Text>
          <Text style={styles.routeText} numberOfLines={1}>
            {ticket.route}
          </Text>
          <Text style={styles.ticketIdText}>Ticket ID: {ticket.ticketId || ticket._id}</Text>
        </View>
        <StatusBadge status={ticket.ticketStatus} />
      </View>

      <View style={styles.divider} />

      {/* Boarding and Destination Route */}
      <View style={styles.journeySnippet}>
        <Text style={styles.locationText} numberOfLines={1}>
          📍 {ticket.boardingPoint} ➔ {ticket.destination}
        </Text>
      </View>

      {/* Schedule and Fare */}
      <View style={styles.detailRow}>
        <View style={styles.scheduleContainer}>
          <Text style={styles.labelText}>Date &amp; Time</Text>
          <Text style={styles.scheduleText}>
            🗓️ {ticket.travelDate} • {ticket.travelTime}
          </Text>
        </View>
        <View style={styles.fareContainer}>
          <Text style={styles.labelText}>Fare</Text>
          <Text style={styles.fareText}>${Number(ticket.fare).toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Action Buttons to View the Dynamic QR Pass and ticket details */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => onViewQR(ticket)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`View Dynamic QR Pass for ticket ${ticket.ticketId || ticket._id}`}
        >
          <Text style={styles.qrButtonText}>View QR 📱</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => onViewDetails(ticket)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`View details for ticket ${ticket.ticketId || ticket._id}`}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: colors.primaryText,
    fontWeight: '500',
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
    color: colors.tealCyan,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  qrButton: {
    flex: 1,
    backgroundColor: colors.lightBackground,
    borderWidth: 1,
    borderColor: colors.tealCyan,
    borderRadius: theme.borderRadius.button,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrButtonText: {
    color: colors.primaryDarkNavy,
    fontSize: 13,
    fontWeight: '700',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: colors.lightBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.button,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    color: colors.secondaryText,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default TicketCard;
