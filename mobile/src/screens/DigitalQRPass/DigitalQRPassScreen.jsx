import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DigitalQRPassScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Digital QR Pass</Text>
      <Text style={styles.subtitle}>Scan this pass at the gate or validator</Text>

      <View style={styles.qrContainer}>
        <Text style={styles.qrPlaceholder}>[ QR Code Placeholder ]</Text>
      </View>
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
  qrContainer: {
    width: 220,
    height: 220,
    backgroundColor: '#E9ECEF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CED4DA',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPlaceholder: {
    color: '#495057',
    fontWeight: '500',
  },
});

export default DigitalQRPassScreen;
