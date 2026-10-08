import { MOCK_ROUTES } from '../mock/routeData';
import { INITIAL_MOCK_VEHICLES } from '../mock/vehicleData';
import { RouteDetails, RouteStop, ServiceAlert } from '@/types/route';
import { routeApi } from '../api/routeApi';

/**
 * In-memory store for bookmarked routes (ready for AsyncStorage / Backend sync)
 */
const savedBookmarks = new Set<string>(['route-bus-42']);

/**
 * Route Details Service Layer
 * API-ready architecture for Node.js + Express endpoints:
 * GET /api/routes/:id
 * GET /api/routes/:id/details
 * GET /api/routes/:id/stops
 * POST /api/routes/:id/bookmark
 */
export const routeDetailsService = {
  /**
   * Fetch full route details with live vehicle status and stops
   */
  async getRouteDetails(
    routeId?: string,
    originOverride?: string,
    destinationOverride?: string
  ): Promise<RouteDetails> {
    // Simulate lightweight API latency
    await new Promise((resolve) => setTimeout(resolve, 60));

    const route =
      MOCK_ROUTES.find((r) => r.id === routeId) ||
      MOCK_ROUTES.find((r) => r.routeNumber.toLowerCase().includes(routeId?.toLowerCase() || '')) ||
      MOCK_ROUTES[0];

    const isBus = route.type === 'bus';
    const vehicle =
      INITIAL_MOCK_VEHICLES.find((v) => v.routeNumber === route.routeNumber || v.type === route.type) ||
      INITIAL_MOCK_VEHICLES[0];

    const origin = originOverride || route.stops[0]?.name || 'Market Square';
    const destination =
      destinationOverride ||
      route.stops[route.stops.length - 1]?.name ||
      'University Malabe Campus';

    // Determine via stop
    const viaStop = route.stops.length > 2 ? route.stops[1].name : 'Central Hub';

    // Boarding stop
    const boardingStopItem = route.stops.find((s) => s.isBoarding) || route.stops[0];
    const boardingStop = {
      id: boardingStopItem?.id || 'stop-b1',
      name: boardingStopItem?.name === 'Market Square' ? 'Market St & 4th' : (boardingStopItem?.name || 'Market St & 4th'),
      coordinate: boardingStopItem?.coordinate || { latitude: 6.9250, longitude: 79.8600 },
      platform: boardingStopItem?.platform || 'Bay 2',
      scheduledArrival: boardingStopItem?.estimatedTime || '10:14 AM',
    };

    // Calculate dynamic stops away
    const currentStopIndex = route.stops.findIndex((s) => s.status === 'current');
    const stopsAway = currentStopIndex >= 0 ? Math.max(1, route.stops.length - currentStopIndex - 1) : 3;

    // Service alert
    let alert: ServiceAlert | null = null;
    if (route.id.includes('bus-42') || route.id.includes('fastest') || route.id.includes('108')) {
      alert = {
        id: 'alert-traffic-5th-ave',
        type: 'traffic',
        message: 'Minor traffic on 5th Ave: Service is running +2 min behind schedule',
        delayMinutes: 2,
        severity: 'warning',
        location: '5th Ave Junction',
      };
    }

    const isJaffna = route.id.includes('jaffna') || route.routeNumber.includes('765');
    const etaMinutes = isJaffna ? 8 : (vehicle.eta || 6);
    const distanceKm = isJaffna ? 1.8 : 1.4;
    const fareFormatted = isJaffna ? 'RS 80.00' : 'RS 550.00';
    const frequency = isJaffna ? 'Every 10 min' : 'Every 15 min';

    return {
      id: route.id,
      routeNumber: route.routeNumber,
      serviceType: route.type,
      serviceName: route.name,
      origin,
      destination,
      via: viaStop,
      vehicleId: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber || 'BUS-4289',
      speedKmh: vehicle.speed || (isJaffna ? 32 : 24),
      vehicleLocation: {
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
      },
      boardingStop,
      stopsAway: stopsAway > 0 ? stopsAway : (isJaffna ? 2 : 3),
      distanceKm,
      etaMinutes,
      liveStatus: 'LIVE',
      occupancyLevel: vehicle.occupancy || 'low',
      occupancyPercentage: vehicle.occupancy === 'high' ? 85 : vehicle.occupancy === 'medium' ? 60 : 35,
      alert,
      stops: route.stops,
      coordinates: route.coordinates,
      fareFormatted,
      isBookmarked: savedBookmarks.has(route.id),
      frequency,
    };
  },

  /**
   * Toggle bookmark for a route
   */
  async toggleBookmark(
    routeId: string,
    metadata?: { origin?: string; destination?: string; customName?: string }
  ): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    if (savedBookmarks.has(routeId)) {
      savedBookmarks.delete(routeId);
      routeApi.deleteSavedRoute(routeId).catch(() => {});
      return false;
    } else {
      savedBookmarks.add(routeId);
      routeApi.saveRoute({
        routeId,
        origin: metadata?.origin,
        destination: metadata?.destination,
        customName: metadata?.customName,
        isStarred: true,
      }).catch(() => {});
      return true;
    }
  },

  /**
   * Get stops for a route
   */
  async getRouteStops(routeId: string): Promise<RouteStop[]> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    const route = MOCK_ROUTES.find((r) => r.id === routeId) || MOCK_ROUTES[0];
    return route.stops;
  },
};
