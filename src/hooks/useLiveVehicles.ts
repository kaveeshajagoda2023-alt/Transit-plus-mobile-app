import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Vehicle, TransportFilterType } from '@/types/vehicle';
import { TransitRoute } from '@/types/route';
import { vehicleApi } from '@/services/api/vehicleApi';
import { routeApi } from '@/services/api/routeApi';

export interface UseLiveVehiclesReturn {
  vehicles: Vehicle[];
  filteredVehicles: Vehicle[];
  routes: TransitRoute[];
  filteredRoutes: TransitRoute[];
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  filter: TransportFilterType;
  setFilter: (filter: TransportFilterType) => void;
  lastUpdatedText: string;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
  toggleStarVehicle: (id: string) => void;
}

export function useLiveVehicles(autoSimulate = true): UseLiveVehiclesReturn {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [filter, setFilter] = useState<TransportFilterType>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdatedSeconds, setLastUpdatedSeconds] = useState<number>(0);

  // Direction vectors for moving vehicles realistically in mock simulation
  const simulationStepsRef = useRef<{ [key: string]: number }>({
    'veh-bus-42': 0,
    'veh-train-red': 0,
    'veh-bus-138': 0,
    'veh-train-blue': 0,
  });

  const loadInitialData = useCallback(async () => {
    try {
      const [vehicleList, routeList] = await Promise.all([
        vehicleApi.getVehicles('all'),
        routeApi.getRoutes('all'),
      ]);
      setVehicles(vehicleList);
      setRoutes(routeList);
      setLastUpdatedSeconds(0);
    } catch (e) {
      console.error('Failed to load live transit data:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Real-time position and status update simulation
  useEffect(() => {
    if (!autoSimulate || isLoading) return;

    const interval = setInterval(() => {
      setVehicles((prevVehicles) =>
        prevVehicles.map((v) => {
          const stepIndex = (simulationStepsRef.current[v.id] || 0) + 1;
          simulationStepsRef.current[v.id] = stepIndex;

          // Subtle, smooth sinusoidal simulation offsets along the vehicle trajectory
          const latOffset = Math.sin((stepIndex * Math.PI) / 10) * 0.00015;
          const lngOffset = Math.cos((stepIndex * Math.PI) / 10) * 0.00015;

          // ETA dynamic adjustment simulation (cycle between 1-5 mins for bus, 4-9 for train)
          let updatedEta = v.eta;
          if (stepIndex % 4 === 0) {
            if (v.eta <= 1) {
              updatedEta = v.type === 'bus' ? 6 : 9;
            } else {
              updatedEta = v.eta - 1;
            }
          }

          let updatedStatus = v.status;
          if (updatedEta <= 2) {
            updatedStatus = 'arriving';
          } else if (v.status === 'arriving' && updatedEta > 2) {
            updatedStatus = 'on-time';
          }

          return {
            ...v,
            latitude: v.latitude + latOffset,
            longitude: v.longitude + lngOffset,
            eta: updatedEta,
            status: updatedStatus,
            updatedAt: new Date().toISOString(),
          };
        })
      );

      setLastUpdatedSeconds(0);
    }, 4500);

    return () => clearInterval(interval);
  }, [autoSimulate, isLoading]);

  // Timer to increment last updated seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const lastUpdatedText = useMemo(() => {
    if (lastUpdatedSeconds < 4) return 'Updated just now';
    return `Updated ${lastUpdatedSeconds}s ago`;
  }, [lastUpdatedSeconds]);

  const toggleStarVehicle = useCallback((id: string) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isStarred: !v.isStarred } : v))
    );
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadInitialData();
  }, [loadInitialData]);

  const filteredVehicles = useMemo(() => {
    if (filter === 'all') return vehicles;
    if (filter === 'bus') return vehicles.filter((v) => v.type === 'bus');
    if (filter === 'train') return vehicles.filter((v) => v.type === 'train');
    if (filter === 'starred') return vehicles.filter((v) => v.isStarred);
    return vehicles;
  }, [vehicles, filter]);

  const filteredRoutes = useMemo(() => {
    if (filter === 'all') return routes;
    if (filter === 'bus') return routes.filter((r) => r.type === 'bus');
    if (filter === 'train') return routes.filter((r) => r.type === 'train');
    if (filter === 'starred') return routes.filter((r) => r.isStarred);
    return routes;
  }, [routes, filter]);

  return {
    vehicles,
    filteredVehicles,
    routes,
    filteredRoutes,
    selectedVehicle,
    setSelectedVehicle,
    filter,
    setFilter,
    lastUpdatedText,
    isLoading,
    isRefreshing,
    refresh,
    toggleStarVehicle,
  };
}
