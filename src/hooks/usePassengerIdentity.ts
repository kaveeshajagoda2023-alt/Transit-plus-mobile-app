import { usePassengerAuth } from '@/context/PassengerAuthContext';
import { FareCategory } from '@/types/ticketing';
import { categoryFromConcession } from '@/services/ticketing/fareRules';

/** Member 2 — who is buying tickets (falls back to a guest so the flow works without login). */
export function usePassengerIdentity(): {
  passengerId: string;
  passengerName: string;
  defaultCategory: FareCategory;
  isGuest: boolean;
} {
  const { user } = usePassengerAuth();
  return {
    passengerId: user?.id || 'guest-passenger',
    passengerName: user?.name || 'Guest Passenger',
    defaultCategory: categoryFromConcession(user?.concessionType),
    isGuest: !user,
  };
}
