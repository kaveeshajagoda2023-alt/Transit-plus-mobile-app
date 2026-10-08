import React from 'react';
import { TicketScannerScreen } from '@/screens/TicketScannerScreen';
import { router } from 'expo-router';

export default function StaffScannerRoute() {
  return (
    <TicketScannerScreen
      onClose={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/staff/dashboard' as any);
        }
      }}
      activeTripNumber="42"
    />
  );
}
