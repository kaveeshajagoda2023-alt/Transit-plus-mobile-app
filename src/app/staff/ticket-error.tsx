import React from 'react';
import { TicketErrorScreen } from '@/screens/TicketErrorScreen';
import { router } from 'expo-router';

export default function TicketErrorRoute() {
  return (
    <TicketErrorScreen
      onScanNext={() => {
        router.replace('/staff/scanner' as any);
      }}
      onManualEntry={() => {
        router.push('/staff/manual-entry' as any);
      }}
    />
  );
}
