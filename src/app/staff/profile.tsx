import React from 'react';
import { OperatorProfileScreen } from '@/screens/OperatorProfileScreen';
import { router } from 'expo-router';

export default function StaffProfileRoute() {
  return (
    <OperatorProfileScreen
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
