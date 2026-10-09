import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, theme } from '../../theme';
import { createTicket } from '../../services/ticketService';
import { useToast } from '../../context/ToastContext';
import AppButton from '../../components/AppButton';
import InfoRow from '../../components/InfoRow';
import Icon from '../../components/Icon';
import { Banner } from '../../components/Feedback';
import { formatDate, formatLKR, formatTime, passengerTypeLabel } from '../../utils/format';

// Mirrors the backend validity rule: valid from 30 min before departure to 3 h after
const validity = (travelDate) => {
  const t = new Date(travelDate).getTime();
  return { from: new Date(t - 30 * 60 * 1000), until: new Date(t + 3 * 60 * 60 * 1000) };
};

const FareSummaryScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { route: busRoute, fromStop, toStop, passengerType, passengers, travelDate, fare } = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const validWindow = validity(travelDate);
  const discount = (fare.adultFare - fare.unitFare) * passengers;

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await createTicket({ routeId: busRoute._id, fromStop, toStop, passengerType, passengers, travelDate });
      toast.show('Ticket reserved. Complete payment to activate it.', 'info');
      // replace so "back" from checkout returns to Buy Ticket instead of creating a second ticket
      navigation.replace('PassengerCheckout', { ticket: res.data });
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Banner type="error" message={error} /> : null}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Journey</Text>
            <View style={styles.routeBadge}>
              <Text style={styles.routeBadgeText}>Route {busRoute.code}</Text>
            </View>
          </View>
          <Text style={styles.routeName}>{busRoute.name}</Text>
          <View style={styles.divider} />

          <View style={styles.locationNode}>
            <View style={[styles.dot, { backgroundColor: colors.tealCyan }]} />
            <View>
              <Text style={styles.locationLabel}>Boarding</Text>
              <Text style={styles.locationName}>{fromStop}</Text>
            </View>
          </View>
          <View style={styles.verticalLine} />
          <View style={styles.locationNode}>
            <View style={[styles.dot, { backgroundColor: colors.primaryDarkNavy }]} />
            <View>
              <Text style={styles.locationLabel}>Destination</Text>
              <Text style={styles.locationName}>{toStop}</Text>
            </View>
          </View>

          <View style={styles.divider} />
          <InfoRow icon="calendar" label="Date" value={formatDate(travelDate)} />
          <InfoRow icon="clock" label="Departure" value={formatTime(travelDate)} />
          <InfoRow icon="users" label="Passengers" value={`${passengers} × ${passengerTypeLabel(passengerType)}`} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fare summary</Text>
          <View style={styles.divider} />
          <InfoRow label={`Adult fare (${fare.stopsTravelled} stops)`} value={formatLKR(fare.adultFare)} />
          <InfoRow label={`Fare per ${passengerTypeLabel(passengerType).toLowerCase()}`} value={formatLKR(fare.unitFare)} />
          <InfoRow label="Passengers" value={`× ${passengers}`} />
          {discount > 0 ? <InfoRow label="Concession discount" value={`- ${formatLKR(discount)}`} valueColor={colors.success} /> : null}
          <InfoRow label="Booking fee" value={formatLKR(0)} />
          <View style={styles.divider} />
          <View style={styles.totalRow} accessible accessibilityLabel={`Total to pay ${formatLKR(fare.totalFare)}`}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatLKR(fare.totalFare)}</Text>
          </View>
        </View>

        <View style={styles.note}>
          <Icon name="info" size={18} color={colors.tealText} />
          <Text style={styles.noteText}>
            Your QR ticket is valid from {formatTime(validWindow.from)} to {formatTime(validWindow.until)}
            {validWindow.until.getDate() !== validWindow.from.getDate() ? ' (next day)' : ''}. Cancel more than 2 hours before
            it becomes valid for a full refund, or up to then for 50%.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <AppButton
          title={`Continue to payment · ${formatLKR(fare.totalFare)}`}
          icon="card"
          onPress={handleConfirm}
          loading={loading}
        />
      </View>
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
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDarkNavy,
  },
  routeBadge: {
    backgroundColor: colors.tealTint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.badge,
  },
  routeBadgeText: {
    color: colors.tealText,
    fontSize: 12,
    fontWeight: '700',
  },
  routeName: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  locationNode: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  locationLabel: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryText,
  },
  verticalLine: {
    width: 2,
    height: 18,
    backgroundColor: colors.border,
    marginLeft: 4,
    marginVertical: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDarkNavy,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.tealText,
  },
  note: {
    flexDirection: 'row',
    backgroundColor: colors.tealTint,
    borderRadius: theme.borderRadius.button,
    padding: 12,
  },
  noteText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: colors.primaryText,
    lineHeight: 19,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});

export default FareSummaryScreen;
