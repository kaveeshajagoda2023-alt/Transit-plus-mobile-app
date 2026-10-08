import { useState, useEffect, useRef, useCallback } from 'react';
import { Vehicle, TrackingStatus } from '@/types/vehicle';
import { TransitRoute, Coordinate } from '@/types/route';

export interface UseVehicleTrackingReturn {
  isTracking: boolean;
  trackingStatus: TrackingStatus;
  vehiclePosition: Coordinate;
  heading: number;
  speedKmh: number;
  etaMinutes: number;
  delayMinutes: number;
  stopsAway: number;
  nextStopName: string;
  nextStopDistanceMeters: number;
  currentStopName: string;
  destinationName: string;
  freeSeats: number;
  currentStopIndex: number;
  arrivalAlertEnabled: boolean;
  setArrivalAlertEnabled: (enabled: boolean) => void;
  stopTracking: () => void;
  resumeTracking: () => void;
  recenterOnVehicle: () => void;
}

export function useVehicleTracking(
  initialVehicle: Vehicle | null,
  route: TransitRoute | null,
  initialAlertEnabled = true
): UseVehicleTrackingReturn {
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>('LIVE');
  const [speedKmh, setSpeedKmh] = useState<number>(initialVehicle?.speed || 28);
  const [etaMinutes, setEtaMinutes] = useState<number>(initialVehicle?.eta || 6);
  const [delayMinutes, setDelayMinutes] = useState<number>(initialVehicle?.delayMinutes ?? 2);
  const [stopsAway, setStopsAway] = useState<number>(initialVehicle?.stopsAway ?? 3);
  const [nextStopDistanceMeters, setNextStopDistanceMeters] = useState<number>(
    initialVehicle?.targetStopDistanceMeters ?? 180
  );
  const [freeSeats, setFreeSeats] = useState<number>(initialVehicle?.freeSeats ?? 32);
  const [currentStopIndex, setCurrentStopIndex] = useState<number>(1);
  const [arrivalAlertEnabled, setArrivalAlertEnabled] = useState<boolean>(initialAlertEnabled);

  // Waypoints for vehicle movement
  const waypoints = route?.coordinates || [
    { latitude: 6.9250, longitude: 79.8590 },
    { latitude: 6.9258, longitude: 79.8598 },
    { latitude: 6.9271, longitude: 79.8612 },
    { latitude: 6.9290, longitude: 79.8625 },
    { latitude: 6.9310, longitude: 79.8660 },
  ];

  const [vehiclePosition, setVehiclePosition] = useState<Coordinate>(
    waypoints[1] || waypoints[0] || { latitude: 6.9258, longitude: 79.8598 }
  );
  const [heading, setHeading] = useState<number>(initialVehicle?.heading || 140);

  const stepRef = useRef<number>(0);

  // Sync initial vehicle state
  useEffect(() => {
    if (initialVehicle) {
      setSpeedKmh(initialVehicle.speed || 28);
      setEtaMinutes(initialVehicle.eta || 6);
      setDelayMinutes(initialVehicle.delayMinutes ?? 2);
      setStopsAway(initialVehicle.stopsAway ?? 3);
      setNextStopDistanceMeters(initialVehicle.targetStopDistanceMeters ?? 180);
      setFreeSeats(initialVehicle.freeSeats ?? 32);
      if (initialVehicle.latitude && initialVehicle.longitude) {
        setVehiclePosition({
          latitude: initialVehicle.latitude,
          longitude: initialVehicle.longitude,
        });
      }
    }
  }, [initialVehicle?.id]);

  // Real-time waypoint-following vehicle movement & live stats simulation
  useEffect(() => {
    if (!isTracking || waypoints.length < 2) return;

    const interval = setInterval(() => {
      stepRef.current += 1;
      const step = stepRef.current;

      // Realistic speed fluctuation (24 - 32 km/h)
      const currentSpeed = 24 + Math.floor(Math.sin(step / 2) * 6) + 2;
      setSpeedKmh(currentSpeed);

      // Smooth interpolation along the polyline path
      const totalSteps = (waypoints.length - 1) * 8;
      const normalizedStep = step % totalSteps;
      const segmentIndex = Math.floor(normalizedStep / 8);
      const segmentProgress = (normalizedStep % 8) / 8;

      const p1 = waypoints[segmentIndex];
      const p2 = waypoints[segmentIndex + 1] || waypoints[0];

      const currentLat = p1.latitude + (p2.latitude - p1.latitude) * segmentProgress;
      const currentLng = p1.longitude + (p2.longitude - p1.longitude) * segmentProgress;

      // Heading angle
      const dLng = p2.longitude - p1.longitude;
      const dLat = p2.latitude - p1.latitude;
      const angle = (Math.atan2(dLng, dLat) * 180) / Math.PI;

      setVehiclePosition({ latitude: currentLat, longitude: currentLng });
      setHeading(angle >= 0 ? angle : 360 + angle);

      // Update distance to next stop
      setNextStopDistanceMeters((prev) => {
        const next = prev - 15;
        return next <= 30 ? 180 : next;
      });

      // Update ETA dynamically
      if (step % 4 === 0) {
        setEtaMinutes((prev) => (prev <= 1 ? 6 : prev - 1));
      }

      // Update free seats subtly for realism
      if (step % 6 === 0) {
        setFreeSeats((prev) => Math.max(10, Math.min(45, prev + (Math.random() > 0.5 ? 1 : -1))));
      }

      setTrackingStatus('LIVE');
    }, 2500);

    return () => clearInterval(interval);
  }, [isTracking, waypoints]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    setTrackingStatus('STOPPED');
  }, []);

  const resumeTracking = useCallback(() => {
    setIsTracking(true);
    setTrackingStatus('LIVE');
  }, []);

  const recenterOnVehicle = useCallback(() => {
    // Handled in Map component
  }, []);

  const currentStopName = initialVehicle?.currentStop || route?.stops[0]?.name || '3rd & Pine';
  const nextStopName = initialVehicle?.nextStop || route?.stops[1]?.name || 'Market St & 4th';
  const destinationName = initialVehicle?.destination || route?.stops[route.stops.length - 1]?.name || 'Civic Center Terminal';

  return {
    isTracking,
    trackingStatus,
    vehiclePosition,
    heading,
    speedKmh,
    etaMinutes,
    delayMinutes,
    stopsAway,
    nextStopName,
    nextStopDistanceMeters,
    currentStopName,
    destinationName,
    freeSeats,
    currentStopIndex,
    arrivalAlertEnabled,
    setArrivalAlertEnabled,
    stopTracking,
    resumeTracking,
    recenterOnVehicle,
  };
}
