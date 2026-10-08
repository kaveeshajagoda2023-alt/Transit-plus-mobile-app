import { apiClient } from './apiClient';
import { MOCK_ROUTES } from '../mock/routeData';
import { TransitRoute, SavedRouteRecord } from '@/types/route';
import { TransportFilterType, Vehicle } from '@/types/vehicle';

// In-memory fallback cache for saved routes
let localSavedRoutes: SavedRouteRecord[] = [
  {
    id: 'saved-01',
    routeId: 'route-bus-42',
    routeNumber: 'LINE 42',
    routeName: 'Downtown - Univ Express',
    origin: 'Market Square',
    destination: 'Tech Campus',
    type: 'bus',
    etaMinutes: 6,
    savedAt: new Date().toISOString(),
    isStarred: true,
  },
  {
    id: 'saved-02',
    routeId: 'route-jaffna-nallur',
    routeNumber: 'LINE 765',
    routeName: 'Jaffna - Nallur Express Link',
    origin: 'Jaffna Central Bus Stand',
    destination: 'Nallur Kandaswamy Kovil',
    type: 'bus',
    etaMinutes: 8,
    savedAt: new Date().toISOString(),
    isStarred: true,
  },
];

/**
 * Route API service layer with full Passenger Live Map + Search ETA CRUD.
 * C – Create: saveRoute (POST /api/routes/saved)
 * R – Read: getRoutes, getRouteById, searchRoutes, getRouteETA, getSavedRoutes
 * U – Update: updateBusLocation (POST /api/vehicles/:id/location)
 * D – Delete: deleteSavedRoute (DELETE /api/routes/saved/:id)
 */
export const routeApi = {
  // R - READ: List routes
  async getRoutes(filter?: TransportFilterType): Promise<TransitRoute[]> {
    try {
      const q = filter ? `?filter=${filter}` : '';
      const res = await apiClient.get<{ success: boolean; routes: TransitRoute[] }>(`/api/routes${q}`, {
        timeoutMs: 2500,
      });
      if (res?.success && res.routes) return res.routes;
    } catch {
      // Fallback to mock
    }

    let list = [...MOCK_ROUTES];
    if (filter === 'bus') list = list.filter((r) => r.type === 'bus');
    else if (filter === 'train') list = list.filter((r) => r.type === 'train');
    else if (filter === 'starred') list = list.filter((r) => r.isStarred);
    return list;
  },

  // R - READ: Route details by ID
  async getRouteById(id: string): Promise<TransitRoute | null> {
    try {
      const res = await apiClient.get<{ success: boolean; route: TransitRoute }>(`/api/routes/${id}`, {
        timeoutMs: 2500,
      });
      if (res?.success && res.route) return res.route;
    } catch {
      // Fallback
    }
    return MOCK_ROUTES.find((r) => r.id === id || r.routeNumber.toLowerCase() === id.toLowerCase()) || null;
  },

  // R - READ: Search routes
  async searchRoutes(query: string): Promise<TransitRoute[]> {
    const q = query.toLowerCase().trim();
    try {
      const res = await apiClient.get<{ success: boolean; routes: TransitRoute[] }>(
        `/api/routes/search?q=${encodeURIComponent(query)}`,
        { timeoutMs: 2500 }
      );
      if (res?.success && res.routes) return res.routes;
    } catch {
      // Fallback
    }

    if (!q) return MOCK_ROUTES;
    return MOCK_ROUTES.filter(
      (r) =>
        r.routeNumber.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.stops.some((s) => s.name.toLowerCase().includes(q))
    );
  },

  // R - READ: Calculate & retrieve live ETA for route
  async getRouteETA(routeId: string, coords?: { latitude: number; longitude: number }): Promise<{
    routeId: string;
    routeNumber: string;
    serviceName: string;
    vehicle: Vehicle | null;
    etaMinutes: number;
    distanceKm: number;
    status: string;
    nextStop: string;
    speedKmh: number;
  }> {
    try {
      const queryParams = coords ? `?lat=${coords.latitude}&lng=${coords.longitude}` : '';
      const res = await apiClient.get<any>(`/api/routes/${routeId}/eta${queryParams}`, { timeoutMs: 2500 });
      if (res?.success) return res;
    } catch {
      // Fallback
    }

    const route = MOCK_ROUTES.find((r) => r.id === routeId) || MOCK_ROUTES[0];
    return {
      routeId: route?.id || routeId,
      routeNumber: route?.routeNumber || 'LINE 765',
      serviceName: route?.name || 'Jaffna - Nallur Express',
      vehicle: null,
      etaMinutes: 8,
      distanceKm: 1.8,
      status: 'arriving',
      nextStop: 'Teaching Hospital Junction',
      speedKmh: 32,
    };
  },

  // C - CREATE: Add / save a favourite route or ETA search
  async saveRoute(payload: {
    routeId: string;
    origin?: string;
    destination?: string;
    customName?: string;
    isStarred?: boolean;
    passengerId?: string;
  }): Promise<SavedRouteRecord> {
    try {
      const res = await apiClient.post<{ success: boolean; savedRoute: SavedRouteRecord }>(
        '/api/routes/saved',
        payload,
        { timeoutMs: 2500 }
      );
      if (res?.success && res.savedRoute) {
        // Also update local cache
        const idx = localSavedRoutes.findIndex((r) => r.routeId === payload.routeId);
        if (idx >= 0) localSavedRoutes[idx] = res.savedRoute;
        else localSavedRoutes.unshift(res.savedRoute);
        return res.savedRoute;
      }
    } catch {
      // Local fallback
    }

    const route = MOCK_ROUTES.find((r) => r.id === payload.routeId);
    const newRecord: SavedRouteRecord = {
      id: `saved-${Date.now()}`,
      routeId: payload.routeId,
      routeNumber: route?.routeNumber || 'LINE 765',
      routeName: payload.customName || route?.name || 'Saved Route',
      origin: payload.origin || 'Jaffna Central Bus Stand',
      destination: payload.destination || 'Nallur Kandaswamy Kovil',
      type: route?.type || 'bus',
      etaMinutes: 8,
      savedAt: new Date().toISOString(),
      passengerId: payload.passengerId,
      isStarred: payload.isStarred !== undefined ? payload.isStarred : true,
    };

    const idx = localSavedRoutes.findIndex((r) => r.routeId === payload.routeId);
    if (idx >= 0) localSavedRoutes[idx] = newRecord;
    else localSavedRoutes.unshift(newRecord);

    return newRecord;
  },

  // R - READ: Get saved / favourite routes
  async getSavedRoutes(passengerId?: string): Promise<SavedRouteRecord[]> {
    try {
      const q = passengerId ? `?passengerId=${passengerId}` : '';
      const res = await apiClient.get<{ success: boolean; savedRoutes: SavedRouteRecord[] }>(
        `/api/routes/saved${q}`,
        { timeoutMs: 2500 }
      );
      if (res?.success && res.savedRoutes) {
        localSavedRoutes = res.savedRoutes;
        return res.savedRoutes;
      }
    } catch {
      // Return fallback
    }
    return [...localSavedRoutes];
  },

  // D - DELETE: Remove saved / favourite route
  async deleteSavedRoute(idOrRouteId: string, passengerId?: string): Promise<boolean> {
    try {
      const q = passengerId ? `?passengerId=${passengerId}` : '';
      const res = await apiClient.delete<{ success: boolean }>(`/api/routes/saved/${idOrRouteId}${q}`, {
        timeoutMs: 2500,
      });
      if (res?.success) {
        localSavedRoutes = localSavedRoutes.filter((r) => r.id !== idOrRouteId && r.routeId !== idOrRouteId);
        return true;
      }
    } catch {
      // Local fallback
    }

    const prevLen = localSavedRoutes.length;
    localSavedRoutes = localSavedRoutes.filter((r) => r.id !== idOrRouteId && r.routeId !== idOrRouteId);
    return localSavedRoutes.length < prevLen;
  },

  // U - UPDATE: Update live bus location & ETA
  async updateBusLocation(
    vehicleId: string,
    coords: { latitude: number; longitude: number },
    speed?: number,
    heading?: number,
    status?: Vehicle['status']
  ): Promise<{ success: boolean; vehicle?: Vehicle; etaMinutes?: number }> {
    try {
      const res = await apiClient.post<any>(
        `/api/vehicles/${vehicleId}/location`,
        { ...coords, speed, heading, status },
        { timeoutMs: 2500 }
      );
      if (res?.success) {
        return res;
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      etaMinutes: Math.max(1, Math.round((1.2 / ((speed || 32) / 60)))),
    };
  },
};
