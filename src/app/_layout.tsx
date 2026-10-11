import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { StaffAuthProvider } from '@/context/StaffAuthContext';
import { PassengerAuthProvider } from '@/context/PassengerAuthContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen smoothly once ready
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <StaffAuthProvider>
      <PassengerAuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: '#F8FAFC' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="role-selection" />
          <Stack.Screen name="passenger/login" />
          <Stack.Screen name="passenger/register" />
          <Stack.Screen name="staff/login" />
          <Stack.Screen name="staff/dashboard" />
          <Stack.Screen name="staff/scanner" />
          <Stack.Screen name="staff/ticket-success" />
          <Stack.Screen name="staff/ticket-error" />
          <Stack.Screen name="staff/manual-entry" />
          <Stack.Screen name="staff/passengers" />
          <Stack.Screen name="staff/profile" />
          <Stack.Screen name="staff/index" />
          <Stack.Screen name="passenger/home" />
          <Stack.Screen name="passenger/route-search" />
          <Stack.Screen name="passenger/search-results" />
          <Stack.Screen name="passenger/route-details" />
          <Stack.Screen name="passenger/vehicle-tracking" />
          <Stack.Screen name="routes/index" />
          <Stack.Screen name="tickets/index" />
          {/* Member 2 — Passenger Ticketing */}
          <Stack.Screen name="tickets/buy" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="tickets/checkout" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="tickets/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="tickets/reschedule" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="tickets/payments" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="alerts/index" />
          <Stack.Screen name="profile/index" />
        </Stack>
      </PassengerAuthProvider>
    </StaffAuthProvider>
  );
}
