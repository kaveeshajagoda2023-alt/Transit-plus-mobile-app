import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { getPayment } from '../../services/paymentService';
import ReceiptCard from '../../components/ReceiptCard';
import AppButton from '../../components/AppButton';
import { ErrorState, LoadingView } from '../../components/Feedback';

const PaymentReceiptScreen = ({ route, navigation }) => {
  const { paymentId } = route.params;
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setPayment(await getPayment(paymentId));
    } catch (e) {
      setError(e.message);
    }
  }, [paymentId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!payment) return <LoadingView message="Loading receipt..." />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ReceiptCard payment={payment} />
      {payment.ticket ? (
        <AppButton
          title="View ticket"
          icon="ticket"
          variant="secondary"
          onPress={() => navigation.navigate('TicketDetails', { ticketId: payment.ticket._id })}
          style={styles.button}
        />
      ) : null}
    </ScrollView>
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
  button: {
    marginTop: 16,
  },
});

export default PaymentReceiptScreen;
