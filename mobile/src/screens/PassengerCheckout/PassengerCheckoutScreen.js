import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, theme } from '../../theme';
import PaymentMethodCard from '../../components/PaymentMethodCard';
import TextField from '../../components/TextField';
import AppButton from '../../components/AppButton';
import { Banner, Skeleton } from '../../components/Feedback';
import { listMethods } from '../../services/paymentService';
import { cardErrors, formatCardNumber, formatExpiry, digitsOnly } from '../../utils/validators';
import { formatDate, formatLKR, formatTime, passengerTypeLabel, routeLabel } from '../../utils/format';

const NEW_CARD = 'new-card';

const PassengerCheckoutScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const ticket = route?.params?.ticket;

  const [savedCards, setSavedCards] = useState([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [methodsError, setMethodsError] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(NEW_CARD);
  const [card, setCard] = useState({ cardNumber: '', expiry: '', cvv: '', holderName: '' });
  const [saveCard, setSaveCard] = useState(true);
  const [errors, setErrors] = useState({});

  const loadMethods = useCallback(async () => {
    setMethodsLoading(true);
    setMethodsError(null);
    try {
      const methods = await listMethods();
      setSavedCards(methods);
      const preferred = methods.find((m) => m.isDefault) || methods[0];
      if (preferred) setSelectedPaymentMethod(`saved:${preferred._id}`);
    } catch (e) {
      setMethodsError(e.message);
    } finally {
      setMethodsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  if (!ticket) {
    return (
      <View style={styles.container}>
        <Banner type="error" message="No ticket was selected. Start from Buy Ticket." />
      </View>
    );
  }

  const setField = (field, formatter) => (value) => {
    setCard((c) => ({ ...c, [field]: formatter ? formatter(value) : value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  };

  const paymentOptions = [
    ...savedCards.map((m) => ({
      id: `saved:${m._id}`,
      title: `${m.brand} •••• ${m.last4}`,
      subtitle: `Expires ${m.expiry}${m.holderName ? ` · ${m.holderName}` : ''}`,
      icon: 'card',
      badge: m.isDefault ? 'DEFAULT' : null,
    })),
    { id: NEW_CARD, title: 'New credit / debit card', subtitle: 'Visa, Mastercard or Amex', icon: 'plus-circle' },
    { id: 'WALLET', title: 'TransitPulse Pass Wallet', subtitle: 'Pay using pre-stored pass balance', icon: 'wallet' },
    { id: 'CASH_ON_BOARD', title: 'Cash on board', subtitle: 'Reserve now, pay the conductor when boarding', icon: 'cash' },
  ];

  const handlePayAndGeneratePass = () => {
    let payload;
    if (selectedPaymentMethod === NEW_CARD) {
      const found = cardErrors(card);
      setErrors(found);
      if (Object.keys(found).length) return;
      payload = {
        method: 'CARD',
        card: { ...card, cardNumber: digitsOnly(card.cardNumber), holderName: card.holderName.trim() },
        saveCard,
      };
    } else if (selectedPaymentMethod.startsWith('saved:')) {
      payload = { method: 'CARD', savedMethodId: selectedPaymentMethod.slice(6) };
    } else {
      payload = { method: selectedPaymentMethod };
    }

    // Card details only live in memory for this request; they are never saved on the phone
    navigation.navigate('PaymentProcessing', { ticket, payload: { ticketId: ticket._id, ...payload } });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        {/* Journey Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Journey Details</Text>
            <View style={styles.routeBadge}>
              <Text style={styles.routeBadgeText}>{ticket.ticketNumber}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.detailValueBold}>{routeLabel(ticket.route)}</Text>
          <View style={styles.locationContainer}>
            <View style={styles.locationNode}>
              <View style={[styles.dot, { backgroundColor: colors.tealCyan }]} />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Boarding</Text>
                <Text style={styles.locationName}>{ticket.fromStop}</Text>
              </View>
            </View>

            <View style={styles.verticalLine} />

            <View style={styles.locationNode}>
              <View style={[styles.dot, { backgroundColor: colors.primaryDarkNavy }]} />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>Destination</Text>
                <Text style={styles.locationName}>{ticket.toStop}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Schedule</Text>
            <Text style={styles.detailValue}>
              {formatDate(ticket.travelDate)} at {formatTime(ticket.travelDate)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Passengers</Text>
            <Text style={styles.detailValue}>
              {ticket.passengers} × {passengerTypeLabel(ticket.passengerType)}
            </Text>
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Select Payment Method
          </Text>

          {methodsError ? <Banner type="warning" message="Saved cards could not be loaded." actionLabel="Retry" onAction={loadMethods} /> : null}
          {methodsLoading ? <Skeleton height={64} radius={16} style={styles.skeleton} /> : null}

          <View accessibilityRole="radiogroup">
            {paymentOptions.map((option) => (
              <PaymentMethodCard
                key={option.id}
                id={option.id}
                title={option.title}
                subtitle={option.subtitle}
                icon={option.icon}
                badge={option.badge}
                isSelected={selectedPaymentMethod === option.id}
                onSelect={setSelectedPaymentMethod}
              />
            ))}
          </View>

          {selectedPaymentMethod === NEW_CARD ? (
            <View style={styles.card}>
              <TextField
                label="Card number"
                icon="card"
                value={card.cardNumber}
                onChangeText={setField('cardNumber', formatCardNumber)}
                error={errors.cardNumber}
                keyboardType="number-pad"
                placeholder="1234 5678 9012 3456"
                maxLength={23}
              />
              <View style={styles.row}>
                <TextField
                  label="Expiry (MM/YY)"
                  value={card.expiry}
                  onChangeText={setField('expiry', formatExpiry)}
                  error={errors.expiry}
                  keyboardType="number-pad"
                  placeholder="12/30"
                  maxLength={5}
                  style={styles.half}
                />
                <TextField
                  label="CVV"
                  value={card.cvv}
                  onChangeText={setField('cvv', (v) => digitsOnly(v).slice(0, 4))}
                  error={errors.cvv}
                  keyboardType="number-pad"
                  placeholder="123"
                  secure
                  style={[styles.half, styles.halfGap]}
                />
              </View>
              <TextField
                label="Name on card (optional)"
                value={card.holderName}
                onChangeText={setField('holderName')}
                autoCapitalize="characters"
                placeholder="K PERERA"
              />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Save card for next time</Text>
                <Switch
                  value={saveCard}
                  onValueChange={setSaveCard}
                  trackColor={{ true: colors.tealCyan, false: colors.border }}
                  thumbColor={colors.white}
                  accessibilityLabel="Save card for next time"
                />
              </View>
              <Text style={styles.secureNote}>Only the card brand and last 4 digits are stored. Never the full number or CVV.</Text>
              <Text style={styles.testNote}>Demo cards: 4242 4242 4242 4242 (approved) · 4000 0000 0000 0002 (declined)</Text>
            </View>
          ) : null}
        </View>

        {/* Fare Breakdown Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fare Summary</Text>
          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Fare ({ticket.passengers} × {formatLKR(ticket.unitFare)})
            </Text>
            <Text style={styles.summaryValue}>{formatLKR(ticket.totalFare)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Processing Fee</Text>
            <Text style={styles.summaryValue}>{formatLKR(0)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Fare</Text>
            <Text style={styles.totalValue}>{formatLKR(ticket.totalFare)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pay & Generate Pass Action Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <AppButton
          title={
            selectedPaymentMethod === 'CASH_ON_BOARD'
              ? 'Reserve & Generate Digital Pass'
              : `Pay ${formatLKR(ticket.totalFare)} & Generate Digital Pass`
          }
          onPress={handlePayAndGeneratePass}
          icon="lock"
        />
      </View>
    </KeyboardAvoidingView>
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
    color: colors.tealText,
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
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDarkNavy,
    marginBottom: 12,
  },
  skeleton: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
  },
  half: {
    flex: 1,
  },
  halfGap: {
    marginLeft: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: theme.touch,
  },
  switchLabel: {
    fontSize: 14,
    color: colors.primaryText,
    fontWeight: '600',
  },
  secureNote: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 4,
  },
  testNote: {
    fontSize: 12,
    color: colors.tealText,
    marginTop: 6,
    fontWeight: '600',
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
    color: colors.tealText,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});

export default PassengerCheckoutScreen;
