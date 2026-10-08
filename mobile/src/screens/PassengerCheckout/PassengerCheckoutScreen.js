import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, theme } from '../../theme';
import PaymentMethodCard from '../../components/PaymentMethodCard';
import { processPayment, createTicket } from '../../services/api';

const PassengerCheckoutScreen = ({ navigation }) => {
  // Default Journey State (Matches Figma prototype flow)
  const journey = {
    userId: 'USR-PASSENGER-101',
    route: 'Express Route 101 - Airport Line',
    boardingPoint: 'Central Terminal (Platform 3)',
    destination: 'North Airport Station (Gate B)',
    travelDate: new Date().toISOString().split('T')[0],
    travelTime: '10:30 AM',
    fare: 4.50,
  };

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Simulated Pay');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const paymentOptions = [
    {
      id: 'Simulated Pay',
      title: 'Instant Online Payment (Simulated)',
      subtitle: 'Fast, secure university demo payment',
      icon: '💳',
    },
    {
      id: 'Digital Wallet',
      title: 'TransitPulse Pass Wallet',
      subtitle: 'Pay using pre-stored pass balance',
      icon: '📱',
    },
    {
      id: 'Credit / Debit Card',
      title: 'Credit or Debit Card',
      subtitle: 'Simulated Card checkout',
      icon: '🔒',
    },
  ];

  const handlePayAndGeneratePass = async () => {
    if (loading) return; // Prevent duplicate submissions

    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Trigger Simulated Online Payment (FR5)
      const paymentPayload = {
        userId: journey.userId,
        amount: journey.fare,
        paymentMethod: selectedPaymentMethod,
      };

      const paymentResponse = await processPayment(paymentPayload);

      if (!paymentResponse || !paymentResponse.success) {
        throw new Error(paymentResponse?.message || 'Payment failed');
      }

      // 2. Create Digital QR Ticket in backend
      const ticketPayload = {
        userId: journey.userId,
        route: journey.route,
        boardingPoint: journey.boardingPoint,
        destination: journey.destination,
        travelDate: journey.travelDate,
        travelTime: journey.travelTime,
        fare: journey.fare,
        paymentMethod: selectedPaymentMethod,
      };

      const ticketResponse = await createTicket(ticketPayload);

      if (ticketResponse && ticketResponse.success) {
        setLoading(false);
        // 3. Navigate with the exact ticket returned by the backend
        navigation.navigate('DigitalQRPass', {
          ticket: ticketResponse.ticket,
        });
      } else {
        throw new Error(ticketResponse?.message || 'Failed to issue ticket after payment');
      }
    } catch (error) {
      setLoading(false);
      console.error('[Checkout Error]:', error);
      const msg = error.message || 'Payment processing failed. Please try again.';
      setErrorMessage(msg);
      Alert.alert('Checkout Failed', msg);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Screen Title Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>Passenger Checkout</Text>
        <Text style={styles.screenSubtitle}>Review your trip details and complete payment</Text>
      </View>

      {/* Error Alert Banner */}
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
        </View>
      )}

      {/* Journey Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Journey Details</Text>
          <View style={styles.routeBadge}>
            <Text style={styles.routeBadgeText}>Single Pass</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Route:</Text>
          <Text style={styles.detailValueBold}>{journey.route}</Text>
        </View>

        <View style={styles.locationContainer}>
          <View style={styles.locationNode}>
            <View style={[styles.dot, { backgroundColor: colors.tealCyan }]} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Boarding</Text>
              <Text style={styles.locationName}>{journey.boardingPoint}</Text>
            </View>
          </View>

          <View style={styles.verticalLine} />

          <View style={styles.locationNode}>
            <View style={[styles.dot, { backgroundColor: colors.activeCyan }]} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Destination</Text>
              <Text style={styles.locationName}>{journey.destination}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Schedule:</Text>
          <Text style={styles.detailValue}>{journey.travelDate} at {journey.travelTime}</Text>
        </View>
      </View>

      {/* Payment Method Selection Card */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Select Payment Method</Text>

        {paymentOptions.map((option) => (
          <PaymentMethodCard
            key={option.id}
            id={option.id}
            title={option.title}
            subtitle={option.subtitle}
            icon={option.icon}
            isSelected={selectedPaymentMethod === option.id}
            onSelect={setSelectedPaymentMethod}
          />
        ))}
      </View>

      {/* Fare Breakdown Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fare Summary</Text>
        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Base Transit Fare</Text>
          <Text style={styles.summaryValue}>${journey.fare.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Processing Fee</Text>
          <Text style={styles.summaryValue}>$0.00</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Fare</Text>
          <Text style={styles.totalValue}>${journey.fare.toFixed(2)}</Text>
        </View>
      </View>

      {/* Pay & Generate Pass Action Button */}
      <TouchableOpacity
        style={[styles.payButton, loading && styles.disabledPayButton]}
        onPress={handlePayAndGeneratePass}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.payButtonText}>
            Pay ${journey.fare.toFixed(2)} & Generate Digital Pass
          </Text>
        )}
      </TouchableOpacity>
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
  headerContainer: {
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryDarkNavy,
  },
  screenSubtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: '#FCE8E6',
    borderWidth: 1,
    borderColor: '#F5C6CB',
    borderRadius: theme.borderRadius.button,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#C5221F',
    fontSize: 13,
    fontWeight: '600',
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
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.badge,
  },
  routeBadgeText: {
    color: colors.tealCyan,
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  detailValueBold: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryText,
  },
  detailValue: {
    fontSize: 13,
    color: colors.primaryText,
  },
  locationContainer: {
    marginVertical: 8,
    paddingLeft: 4,
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
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  locationName: {
    fontSize: 14,
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
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDarkNavy,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.primaryText,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDarkNavy,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.tealCyan,
  },
  payButton: {
    backgroundColor: colors.tealCyan,
    borderRadius: theme.borderRadius.button,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...theme.shadows.button,
  },
  disabledPayButton: {
    backgroundColor: colors.secondaryNavy,
    opacity: 0.7,
  },
  payButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PassengerCheckoutScreen;
