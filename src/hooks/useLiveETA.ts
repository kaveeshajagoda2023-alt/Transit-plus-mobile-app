import { useState, useEffect, useRef, useCallback } from 'react';
import { RouteDetails } from '@/types/route';

export interface UseLiveETAReturn {
  etaMinutes: number;
  distanceKm: number;
  stopsAway: number;
  speedKmh: number;
  liveStatus: 'LIVE' | 'UPDATING' | 'OFFLINE';
  lastUpdatedText: string;
  isSimulating: boolean;
  refreshETA: () => void;
}

/**
 * useLiveETA Hook
 * Manages dynamic ETA, distance, stops countdown, and vehicle speed.
 * Designed for immediate plug-and-play with WebSocket / SSE / Node.js backend.
 */
export function useLiveETA(
  initialRoute: RouteDetails | null,
  autoUpdate = true
): UseLiveETAReturn {
  const [etaMinutes, setEtaMinutes] = useState<number>(initialRoute?.etaMinutes ?? 6);
  const [distanceKm, setDistanceKm] = useState<number>(initialRoute?.distanceKm ?? 1.4);
  const [stopsAway, setStopsAway] = useState<number>(initialRoute?.stopsAway ?? 3);
  const [speedKmh, setSpeedKmh] = useState<number>(initialRoute?.speedKmh ?? 24);
  const [liveStatus, setLiveStatus] = useState<'LIVE' | 'UPDATING' | 'OFFLINE'>('LIVE');
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState<number>(0);

  const stepRef = useRef<number>(0);

  // Sync initial values when route changes
  useEffect(() => {
    if (initialRoute) {
      setEtaMinutes(initialRoute.etaMinutes);
      setDistanceKm(initialRoute.distanceKm);
      setStopsAway(initialRoute.stopsAway);
      setSpeedKmh(initialRoute.speedKmh);
      setLiveStatus(initialRoute.liveStatus);
      setSecondsSinceUpdate(0);
      stepRef.current = 0;
    }
  }, [initialRoute?.id, initialRoute?.etaMinutes]);

  // Periodic ETA and Distance simulation
  useEffect(() => {
    if (!autoUpdate || !initialRoute) return;

    const interval = setInterval(() => {
      stepRef.current += 1;
      const step = stepRef.current;

      setLiveStatus('UPDATING');

      setTimeout(() => {
        setLiveStatus('LIVE');
        setSecondsSinceUpdate(0);
      }, 500);

      // Realistic speed fluctuation (22 - 28 km/h)
      const newSpeed = 22 + Math.floor(Math.random() * 7);
      setSpeedKmh(newSpeed);

      // Dynamic ETA and distance decrementing
      setEtaMinutes((prev) => {
        if (prev <= 1) {
          // Reset cycle to 6 mins for smooth demo replay
          return 6;
        }
        return prev - 1;
      });

      setDistanceKm((prev) => {
        const next = Math.max(0.2, Math.round((prev - 0.25) * 10) / 10);
        return next <= 0.2 ? 1.4 : next;
      });

      setStopsAway((prev) => {
        if (prev <= 1) {
          return 3;
        }
        return prev - 1;
      });
    }, 12000); // updates every 12 seconds

    return () => {
      clearInterval(interval);
    };
  }, [autoUpdate, initialRoute]);

  // Timer for seconds since update
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceUpdate((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const lastUpdatedText =
    secondsSinceUpdate < 3
      ? 'Just now'
      : `${secondsSinceUpdate}s ago`;

  const refreshETA = useCallback(() => {
    setLiveStatus('UPDATING');
    setTimeout(() => {
      setLiveStatus('LIVE');
      setSecondsSinceUpdate(0);
    }, 600);
  }, []);

  return {
    etaMinutes,
    distanceKm,
    stopsAway,
    speedKmh,
    liveStatus,
    lastUpdatedText,
    isSimulating: autoUpdate,
    refreshETA,
  };
}
