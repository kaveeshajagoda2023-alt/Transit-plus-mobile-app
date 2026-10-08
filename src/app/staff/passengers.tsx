import React from 'react';
import { PassengerManifestScreen } from '@/screens/PassengerManifestScreen';
import { router } from 'expo-router';

export default function StaffPassengersRoute() {
  return (
    <PassengerManifestScreen
      onBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/staff/dashboard' as any);
        }
      }}
    />
  );
}
