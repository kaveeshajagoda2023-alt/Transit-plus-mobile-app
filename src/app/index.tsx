import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { usePassengerAuth } from '@/context/PassengerAuthContext';
import { WelcomeHomeScreen } from '@/screens/WelcomeHomeScreen';
import { PassengerHomeScreen } from '@/screens/PassengerHomeScreen';
import { RoleSelectionScreen } from '@/screens/RoleSelectionScreen';
import { PassengerLoginScreen } from '@/screens/PassengerLoginScreen';

export default function AppEntryScreen() {
  const { isLoading, hasCompletedOnboarding, isAuthenticated, selectedRole } = usePassengerAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B2545" />
      </View>
    );
  }

  // If user has not completed onboarding, start with Screen 1: Welcome Home
  if (!hasCompletedOnboarding) {
    return <WelcomeHomeScreen />;
  }

  // If passenger is logged in, show Passenger Home Dashboard
  if (isAuthenticated) {
    return <PassengerHomeScreen />;
  }

  // If role is selected, direct to that role's login/selection
  if (selectedRole === 'PASSENGER') {
    return <PassengerLoginScreen />;
  }

  return <RoleSelectionScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
