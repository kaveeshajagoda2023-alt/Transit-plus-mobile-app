import React from 'react';
import { TripData } from '@/types/trip';
import { PassengerManifestScreen } from '@/screens/PassengerManifestScreen';

interface PassengersViewProps {
  trip: TripData;
  onUpdateOccupancy?: (delta: number) => Promise<void>;
}

export const PassengersView: React.FC<PassengersViewProps> = ({ trip }) => {
  return <PassengerManifestScreen tripData={trip} embedded={true} />;
};
