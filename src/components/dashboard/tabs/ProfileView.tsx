import React from 'react';
import { StaffUser } from '@/types/staff';
import { TripData } from '@/types/trip';
import { OperatorProfileScreen } from '@/screens/OperatorProfileScreen';

interface ProfileViewProps {
  user?: StaffUser | null;
  trip?: TripData;
  onLogout?: () => Promise<void>;
  onSwitchToPassenger?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = () => {
  return <OperatorProfileScreen embedded={true} />;
};
