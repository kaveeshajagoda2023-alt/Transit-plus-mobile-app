import React, { useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, theme } from '../../theme';
import StatusBadge from '../../components/StatusBadge';
import { cancelTicket } from '../../services/api';

const TicketDetailsScreen = ({ route, navigation }) => {
  const ticket = route?.params?.ticket;
  const [cancelling, setCancelling] = useState(false);

  if (!ticket) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ticket details are unavailable.</Text>
      </View>
    );
  }

  const handleCancel = async () => {
    Alert.alert('CANCEL TICKET?', 'Are you sure you want to cancel this ticket?', [
      { text: 'Keep Ticket', style: 'default' },
      {
        text: 'Cancel Ticket',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            const response = await cancelTicket(ticket.ticketId || ticket._id);
            if (response?.success) {
              const updatedTicket = { ...ticket, ticketStatus: 'Cancelled' };
              navigation.navigate('TicketHistory', { refreshedTicket: updatedTicket });
              Alert.alert('Ticket Cancelled', 'Ticket cancelled successfully.');
            } else {
              throw new Error(response?.message || 'Cancellation failed.');
            }
          } catch (error) {
            Alert.alert('Cancellation Failed', error.message || 'Unable to cancel the ticket.');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  const canCancel = ticket.ticketStatus === 'Active';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>Ticket Details</Text>
        <Text style={styles.screenSubtitle}>Review the complete purchase information.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.label}>Ticket ID</Text>
            <Text style={styles.value}>{ticket.ticketId || ticket._id}</Text>
          </View>
          <StatusBadge status={ticket.ticketStatus} />
        </View>

        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Passenger</Text>
          <Text style={styles.value}>{ticket.passengerName || ticket.userId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>From</Text>
          <Text style={styles.value}>{ticket.boardingPoint || ticket.from}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>To</Text>
          <Text style={styles.value}>{ticket.destination || ticket.to}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Route</Text>
          <Text style={styles.value}>{ticket.route}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{ticket.travelDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{ticket.travelTime}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fare</Text>
          <Text style={[styles.value, { color: colors.tealCyan, fontWeight: '700' }]}>Rs. {Number(ticket.fare).toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Method</Text>
          <Text style={styles.value}>{ticket.paymentMethod || 'Simulated Pay'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Status</Text>
          <Text style={styles.value}>{ticket.paymentStatus || 'Completed'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Ticket Status</Text>
          <Text style={styles.value}>{ticket.ticketStatus || 'Active'}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('DigitalQRPass', { ticket })}
        >
          <Text style={styles.primaryButtonText}>View QR Pass</Text>
        </TouchableOpacity>
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? <ActivityIndicator color={colors.white} /> : <Text style={styles.cancelButtonText}>Cancel Ticket</Text>}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightBackground },
  contentContainer: { padding: 16, paddingBottom: 32 },
  headerContainer: { marginBottom: 16 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: colors.primaryDarkNavy },
  screenSubtitle: { color: colors.secondaryText, fontSize: 13, marginTop: 4 },
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 12 },
  label: { color: colors.secondaryText, fontSize: 12, flex: 0.8 },
  value: { color: colors.primaryText, fontSize: 13, fontWeight: '600', flex: 1.2, textAlign: 'right' },
  errorText: { color: colors.secondaryText, textAlign: 'center', marginTop: 20 },
  actions: { gap: 10, marginTop: 16 },
  primaryButton: { backgroundColor: colors.tealCyan, borderRadius: theme.borderRadius.button, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: colors.white, fontWeight: '700' },
  cancelButton: { backgroundColor: '#C5221F', borderRadius: theme.borderRadius.button, paddingVertical: 14, alignItems: 'center' },
  cancelButtonText: { color: colors.white, fontWeight: '700' },
});

export default TicketDetailsScreen;
