/**
 * Member 2 — Checkout & Payment
 * Fare summary, payment method (MetroPay wallet or card), processing and
 * failure handling. On success the QR ticket opens.
 */
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { TransitColors } from '@/constants/transitTheme';
import { ticketingApi } from '@/services/api/ticketingApi';
import { FARE_CATEGORY_LABELS, PassengerTicket } from '@/types/ticketing';
import { usePassengerIdentity } from '@/hooks/usePassengerIdentity';
import { formatCardNumber, formatExpiry, formatFullDate, formatLKR } from '@/services/ticketing/format';
import { isValidCardNumber, isValidExpiry } from '@/services/ticketing/fareRules';
import {
  Card,
  ErrorBanner,
  InfoRow,
  OfflineBanner,
  PrimaryButton,
  RouteBadge,
  SectionLabel,
  TicketingHeader,
  ticketingStyles,
} from '@/components/ticketing/TicketingUI';

type Method = 'WALLET' | 'CARD';

export function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { passengerId } = usePassengerIdentity();

  const [ticket, setTicket] = useState<PassengerTicket | null>(null);
  const [wallet, setWallet] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<Method>('CARD');
  const [holderName, setHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [touched, setTouched] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [{ ticket: t }, balance] = await Promise.all([
        ticketingApi.getTicket(id),
        ticketingApi.getWalletBalance(passengerId).catch(() => null),
      ]);
      setTicket(t);
      setWallet(balance);
      if (balance !== null && balance >= t.totalFare) setMethod('WALLET');
      if (t.status !== 'PENDING_PAYMENT') router.replace(`/tickets/${t.id}` as any);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load this booking.');
    } finally {
      setLoading(false);
    }
  }, [id, passengerId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const cardErrors = {
    holderName: !holderName.trim() ? 'Enter the name on the card' : null,
    number: !isValidCardNumber(cardNumber) ? 'Enter a valid card number' : null,
    expiry: !isValidExpiry(expiry) ? 'Use MM/YY, not expired' : null,
    cvv: !/^\d{3,4}$/.test(cvv) ? '3–4 digits' : null,
  };
  const cardValid = !Object.values(cardErrors).some(Boolean);
  const walletShort = method === 'WALLET' && ticket && wallet !== null && wallet < ticket.totalFare;

  const pay = async () => {
    if (!ticket) return;
    setTouched(true);
    if (method === 'CARD' && !cardValid) return;
    setProcessing(true);
    setError(null);
    try {
      await ticketingApi.pay(
        ticket.id,
        method,
        method === 'CARD' ? { holderName, number: cardNumber, expiry, cvv } : undefined
      );
      router.replace({ pathname: '/tickets/[id]', params: { id: ticket.id, paid: '1' } } as any);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const discardBooking = () => {
    if (!ticket) return;
    Alert.alert('Discard this booking?', 'Your reserved ticket will be removed. You have not been charged.', [
      { text: 'Keep booking', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: async () => {
          try {
            await ticketingApi.deleteTicket(ticket.id);
            router.replace('/tickets' as any);
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not discard booking.');
          }
        },
      },
    ]);
  };

  if (loading || !ticket) {
    return (
      <SafeAreaView style={ticketingStyles.screen}>
        <TicketingHeader title="Checkout" />
        {error ? <View style={{ padding: 16 }}><ErrorBanner message={error} /></View> : <ActivityIndicator style={{ marginTop: 40 }} color={TransitColors.primary} />}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={ticketingStyles.screen} edges={['top', 'left', 'right', 'bottom']}>
      <TicketingHeader title="Checkout" subtitle="Step 2 of 2 · Payment" />
      <OfflineBanner />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={ticketingStyles.scroll} keyboardShouldPersistTaps="handled">
          {error ? <ErrorBanner message={error} /> : null}

          {/* Trip summary */}
          <Card>
            <View style={styles.summaryTop}>
              <RouteBadge routeNumber={ticket.routeNumber} type={ticket.transportType} />
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/tickets/reschedule', params: { id: ticket.id } } as any)}
                accessibilityRole="button"
                accessibilityLabel="Edit booking"
              >
                <Text style={styles.link}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.journey}>
              {ticket.fromStop} <Feather name="arrow-right" size={14} /> {ticket.toStop}
            </Text>
            <Text style={styles.when}>{formatFullDate(ticket.travelDate)}</Text>
            <View style={styles.divider} />
            <InfoRow label="Fare type" value={FARE_CATEGORY_LABELS[ticket.fareCategory]} />
            <InfoRow label="Fare per passenger" value={formatLKR(ticket.unitFare)} />
            <InfoRow label="Passengers" value={`× ${ticket.passengers}`} />
            <View style={styles.divider} />
            <InfoRow label="Total to pay" value={formatLKR(ticket.totalFare)} strong />
          </Card>

          {/* Payment method */}
          <SectionLabel>Payment method</SectionLabel>
          <TouchableOpacity
            style={[styles.method, method === 'WALLET' && styles.methodOn]}
            onPress={() => setMethod('WALLET')}
            accessibilityRole="radio"
            accessibilityState={{ checked: method === 'WALLET' }}
            accessibilityLabel={`MetroPay wallet${wallet !== null ? `, balance ${formatLKR(wallet)}` : ''}`}
          >
            <View style={styles.methodIcon}>
              <MaterialCommunityIcons name="wallet-outline" size={22} color={TransitColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>MetroPay wallet</Text>
              <Text style={styles.methodSub}>
                {wallet === null ? 'Sign in to use your wallet' : `Balance ${formatLKR(wallet)}`}
              </Text>
            </View>
            <Feather
              name={method === 'WALLET' ? 'check-circle' : 'circle'}
              size={20}
              color={method === 'WALLET' ? TransitColors.primary : TransitColors.textMuted}
            />
          </TouchableOpacity>
          {walletShort ? (
            <Text style={styles.warn}>Your wallet balance is lower than the fare. Top up from Profile or pay by card.</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.method, method === 'CARD' && styles.methodOn]}
            onPress={() => setMethod('CARD')}
            accessibilityRole="radio"
            accessibilityState={{ checked: method === 'CARD' }}
            accessibilityLabel="Credit or debit card"
          >
            <View style={styles.methodIcon}>
              <Feather name="credit-card" size={20} color={TransitColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Credit / debit card</Text>
              <Text style={styles.methodSub}>Visa, Mastercard, Amex</Text>
            </View>
            <Feather
              name={method === 'CARD' ? 'check-circle' : 'circle'}
              size={20}
              color={method === 'CARD' ? TransitColors.primary : TransitColors.textMuted}
            />
          </TouchableOpacity>

          {method === 'CARD' ? (
            <Card style={{ marginTop: 4 }}>
              <Field
                label="Name on card"
                value={holderName}
                onChangeText={setHolderName}
                error={touched ? cardErrors.holderName : null}
                autoCapitalize="words"
                placeholder="e.g. K. Perera"
              />
              <Field
                label="Card number"
                value={cardNumber}
                onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                error={touched ? cardErrors.number : null}
                keyboardType="number-pad"
                placeholder="4242 4242 4242 4242"
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Expiry"
                    value={expiry}
                    onChangeText={(t) => setExpiry(formatExpiry(t))}
                    error={touched ? cardErrors.expiry : null}
                    keyboardType="number-pad"
                    placeholder="MM/YY"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="CVV"
                    value={cvv}
                    onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))}
                    error={touched ? cardErrors.cvv : null}
                    keyboardType="number-pad"
                    placeholder="123"
                    secureTextEntry
                  />
                </View>
              </View>
              <View style={styles.secure}>
                <Feather name="lock" size={12} color={TransitColors.textSecondary} />
                <Text style={styles.secureText}>Only the last 4 digits are stored. Prototype: no real charge is made.</Text>
              </View>
            </Card>
          ) : null}

          <TouchableOpacity onPress={discardBooking} style={styles.discard} accessibilityRole="button">
            <Text style={styles.discardText}>Discard booking</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <PrimaryButton
          label={`Pay ${formatLKR(ticket.totalFare)}`}
          icon="lock"
          onPress={pay}
          loading={processing}
          disabled={!!walletShort}
        />
      </View>

      {/* Processing overlay */}
      <Modal visible={processing} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={TransitColors.primary} />
            <Text style={styles.overlayTitle}>Processing payment…</Text>
            <Text style={styles.overlayText}>Please don&apos;t close the app.</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Field({
  label,
  error,
  ...input
}: { label: string; error: string | null } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...input}
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={TransitColors.textMuted}
        accessibilityLabel={label}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { fontSize: 13, fontWeight: '800', color: TransitColors.primary, textDecorationLine: 'underline' },
  journey: { fontSize: 17, fontWeight: '800', color: TransitColors.textPrimary, marginTop: 12 },
  when: { fontSize: 13, color: TransitColors.textSecondary, marginTop: 4 },
  divider: { height: 1, backgroundColor: TransitColors.divider, marginVertical: 8 },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: TransitColors.cardBackground,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: TransitColors.border,
    marginBottom: 10,
  },
  methodOn: { borderColor: TransitColors.primary, backgroundColor: '#F1F5F9' },
  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: TransitColors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: { fontSize: 15, fontWeight: '800', color: TransitColors.textPrimary },
  methodSub: { fontSize: 12, color: TransitColors.textSecondary, marginTop: 2 },
  warn: { fontSize: 12, color: TransitColors.etaPeachText, marginTop: -4, marginBottom: 10, fontWeight: '600' },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: TransitColors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: TransitColors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: 15,
    color: TransitColors.textPrimary,
    backgroundColor: '#FFFFFF',
  },
  inputError: { borderColor: TransitColors.delayedText },
  fieldError: { fontSize: 11, color: TransitColors.delayedText, marginTop: 4, fontWeight: '600' },
  secure: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  secureText: { flex: 1, fontSize: 11, color: TransitColors.textSecondary },
  discard: { alignSelf: 'center', padding: 12, marginTop: 4 },
  discardText: { fontSize: 13, fontWeight: '700', color: TransitColors.delayedText },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: TransitColors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: TransitColors.border,
  },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)', alignItems: 'center', justifyContent: 'center' },
  overlayCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, alignItems: 'center', width: 260 },
  overlayTitle: { fontSize: 16, fontWeight: '800', color: TransitColors.primary, marginTop: 14 },
  overlayText: { fontSize: 12, color: TransitColors.textSecondary, marginTop: 4 },
});
