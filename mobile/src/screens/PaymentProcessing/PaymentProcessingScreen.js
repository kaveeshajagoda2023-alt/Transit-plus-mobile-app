import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
import { checkout } from '../../services/paymentService';
import Icon from '../../components/Icon';
import { formatLKR } from '../../utils/format';

const STEPS = ['Contacting payment gateway', 'Authorising payment', 'Issuing your digital ticket'];

// Runs the checkout call once and replaces itself with the result screen.
// Back is disabled while the payment is in flight so it cannot be submitted twice.
const PaymentProcessingScreen = ({ route, navigation }) => {
  const { ticket, payload } = route.params;
  const [step, setStep] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (started.current) return undefined;
    started.current = true;
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 700);

    (async () => {
      // Short minimum duration so the passenger can read what is happening
      const minDelay = new Promise((r) => setTimeout(r, 1500));
      try {
        const [res] = await Promise.all([checkout(payload), minDelay]);
        navigation.replace('PaymentResult', {
          success: true,
          message: res.message,
          payment: res.data.payment,
          ticket: res.data.ticket,
        });
      } catch (e) {
        await minDelay;
        navigation.replace('PaymentResult', {
          success: false,
          message: e.message,
          fieldErrors: e.status === 422 ? e.fieldErrors : null,
          payment: e.data?.payment || null,
          ticket: e.data?.ticket || ticket,
        });
      } finally {
        clearInterval(timer);
      }
    })();

    return () => clearInterval(timer);
  }, [navigation, payload, ticket]);

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.activeCyan} />
      <Text style={styles.title} accessibilityRole="header">
        Processing payment
      </Text>
      <Text style={styles.amount}>{formatLKR(ticket.totalFare)}</Text>
      <View style={styles.steps}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.stepRow}>
            <Icon
              name={i < step ? 'check-circle' : i === step ? 'clock' : 'alert-circle'}
              size={18}
              color={i <= step ? colors.activeCyan : '#5C7C94'}
            />
            <Text style={[styles.stepText, i <= step && styles.stepActive]}>{label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.warning}>Please don't close the app.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDarkNavy,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 20,
  },
  amount: {
    color: colors.activeCyan,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 6,
  },
  steps: {
    marginTop: 28,
    alignSelf: 'stretch',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  stepText: {
    color: '#8FA6B8',
    fontSize: 15,
    marginLeft: 10,
  },
  stepActive: {
    color: colors.white,
    fontWeight: '600',
  },
  warning: {
    color: '#C6D6E2',
    fontSize: 13,
    marginTop: 24,
  },
});

export default PaymentProcessingScreen;
