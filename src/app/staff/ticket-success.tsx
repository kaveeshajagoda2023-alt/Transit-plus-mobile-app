import React from 'react';
import { TicketSuccessScreen } from '@/screens/TicketSuccessScreen';
import { router } from 'expo-router';

export default function TicketSuccessRoute() {
  return (
    <TicketSuccessScreen
      onScanNext={() => {
        router.replace('/staff/scanner' as any);
      }}
    />
  );
}
