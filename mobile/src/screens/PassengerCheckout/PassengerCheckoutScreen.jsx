import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PassengerCheckoutScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passenger Checkout</Text>
      <Text style={styles.subtitle}>Select your route and proceed to payment</Text>

      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Confirm & Pay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1D20',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#0D6EFD',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PassengerCheckoutScreen;
