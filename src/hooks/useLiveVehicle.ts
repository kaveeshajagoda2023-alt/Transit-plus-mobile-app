import { useState, useEffect, useRef } from 'react';
import { Coordinate } from '@/types/route';

export interface UseLiveVehicleReturn {
  vehiclePosition: Coordinate;
  heading: number;
  speedKmh: number;
}

/**
 * useLiveVehicle Hook
 * Simulates realistic vehicle movement smoothly along the route path coordinates.
 */
export function useLiveVehicle(
  initialCoordinates: Coordinate[],
  initialSpeed = 24,
  autoMove = true
): UseLiveVehicleReturn {
  const [position, setPosition] = useState<Coordinate>(
    initialCoordinates[1] || initialCoordinates[0] || { latitude: 6.9255, longitude: 79.8590 }
  );
  const [heading, setHeading] = useState<number>(45);
  const [speed, setSpeed] = useState<number>(initialSpeed);

  const stepRef = useRef<number>(0);

  useEffect(() => {
    if (initialCoordinates.length > 0) {
      setPosition(initialCoordinates[1] || initialCoordinates[0]);
    }
  }, [initialCoordinates]);

  useEffect(() => {
    if (!autoMove || initialCoordinates.length < 2) return;

    const interval = setInterval(() => {
      stepRef.current = (stepRef.current + 1) % (initialCoordinates.length * 10);
      const progress = (stepRef.current % 10) / 10;
      const segmentIndex = Math.floor(stepRef.current / 10) % (initialCoordinates.length - 1);

      const start = initialCoordinates[segmentIndex];
      const end = initialCoordinates[segmentIndex + 1] || initialCoordinates[0];

      // Linear interpolation between consecutive route waypoints
      const currentLat = start.latitude + (end.latitude - start.latitude) * progress;
      const currentLng = start.longitude + (end.longitude - start.longitude) * progress;

      // Calculate heading angle
      const dLng = end.longitude - start.longitude;
      const dLat = end.latitude - start.latitude;
      const angle = (Math.atan2(dLng, dLat) * 180) / Math.PI;

      setPosition({
        latitude: currentLat,
        longitude: currentLng,
      });
      setHeading(angle >= 0 ? angle : 360 + angle);

      // Vary speed smoothly
      setSpeed(22 + Math.floor(Math.sin(stepRef.current) * 4) + 2);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [autoMove, initialCoordinates]);

  return {
    vehiclePosition: position,
    heading,
    speedKmh: speed,
  };
}
