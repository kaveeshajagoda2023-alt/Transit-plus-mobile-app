import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
import Icon from '../../components/Icon';

// Shown while the saved session is being restored
const SplashScreen = () => (
  <View style={styles.container} accessibilityLabel="TransitPulse is loading">
    <View style={styles.logo}>
      <Icon name="bus" size={44} color={colors.primaryDarkNavy} />
    </View>
    <Text style={styles.title}>TransitPulse</Text>
    <Text style={styles.subtitle}>Smart public transport ticketing</Text>
    <ActivityIndicator color={colors.activeCyan} size="large" style={styles.spinner} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDarkNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.activeCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 18,
  },
  subtitle: {
    color: '#C6D6E2',
    fontSize: 14,
    marginTop: 4,
  },
  spinner: {
    marginTop: 32,
  },
});

export default SplashScreen;
