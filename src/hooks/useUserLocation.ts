import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Coordinate } from '@/types/route';
import { DEFAULT_COORDINATES } from '@/constants/mapConfig';

export interface UserLocationState {
  location: Coordinate;
  hasPermission: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  refreshLocation: () => Promise<void>;
}

export function useUserLocation(): UserLocationState {
  const [location, setLocation] = useState<Coordinate>({
    latitude: DEFAULT_COORDINATES.latitude,
    longitude: DEFAULT_COORDINATES.longitude,
  });
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasPermission(false);
        setErrorMessage('Location permission denied. Using Central Metro location.');
        setLocation({
          latitude: DEFAULT_COORDINATES.latitude,
          longitude: DEFAULT_COORDINATES.longitude,
        });
        setIsLoading(false);
        return;
      }

      setHasPermission(true);
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to retrieve location');
      // Fallback cleanly to default coordinates
      setLocation({
        latitude: DEFAULT_COORDINATES.latitude,
        longitude: DEFAULT_COORDINATES.longitude,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    location,
    hasPermission,
    isLoading,
    errorMessage,
    refreshLocation: fetchLocation,
  };
}
