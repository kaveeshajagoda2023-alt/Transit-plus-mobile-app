import React from 'react';
import { ManualEntryScreen } from '@/screens/ManualEntryScreen';
import { router } from 'expo-router';

export default function ManualEntryRoute() {
  return (
    <ManualEntryScreen
      onBackToScanner={() => {
        router.replace('/staff/scanner' as any);
      }}
      onValidationSuccess={(res) => {
        router.push({
          pathname: '/staff/ticket-success' as any,
          params: {
            ticketId: res.ticketId,
            ticketType: res.ticketTypeLabel,
            passenger: res.passengerName || 'Cardholder',
            fare: String(res.fareAmount),
            bookingRef: res.bookingReference,
            origin: res.originStop,
            destination: res.destinationStop,
          },
        });
      }}
      onValidationError={(res) => {
        router.push({
          pathname: '/staff/ticket-error' as any,
          params: {
            ticketId: res.ticketId,
            reason: res.reason || 'Ticket not valid',
            faultCode: res.faultCode || '0x01',
          },
        });
      }}
    />
  );
}
