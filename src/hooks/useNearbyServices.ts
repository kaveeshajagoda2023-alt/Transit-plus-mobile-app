import { useState, useEffect, useMemo, useCallback } from 'react';
import { NearbyService } from '@/types/nearbyService';
import { TransportFilterType, Vehicle } from '@/types/vehicle';
import { vehicleApi } from '@/services/api/vehicleApi';

export interface UseNearbyServicesReturn {
  nearbyServices: NearbyService[];
  filteredServices: NearbyService[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  toggleStarService: (id: string) => void;
}

export function useNearbyServices(
  vehicles: Vehicle[],
  filter: TransportFilterType
): UseNearbyServicesReturn {
  const [nearbyServices, setNearbyServices] = useState<NearbyService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadServices = useCallback(async () => {
    try {
      const data = await vehicleApi.getNearbyServices('all');
      setNearbyServices(data);
    } catch (e) {
      console.error('Failed to load nearby services:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Synchronize ETAs and statuses from live vehicles into the nearby service cards
  useEffect(() => {
    if (vehicles.length === 0) return;

    setNearbyServices((prevServices) =>
      prevServices.map((service) => {
        const matchingVehicle = vehicles.find((v) => v.id === service.vehicleId);
        if (matchingVehicle) {
          return {
            ...service,
            eta: matchingVehicle.eta,
            status: matchingVehicle.status,
            occupancy: matchingVehicle.occupancy,
          };
        }
        return service;
      })
    );
  }, [vehicles]);

  const toggleStarService = useCallback((id: string) => {
    setNearbyServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isStarred: !s.isStarred } : s))
    );
  }, []);

  const filteredServices = useMemo(() => {
    if (filter === 'all') return nearbyServices;
    if (filter === 'bus') return nearbyServices.filter((s) => s.serviceType === 'bus');
    if (filter === 'train') return nearbyServices.filter((s) => s.serviceType === 'train');
    if (filter === 'starred') return nearbyServices.filter((s) => s.isStarred);
    return nearbyServices;
  }, [nearbyServices, filter]);

  return {
    nearbyServices,
    filteredServices,
    isLoading,
    refresh: loadServices,
    toggleStarService,
  };
}
