import { MOCK_LOCATIONS } from '../mock/locations';
import { TransitLocation } from '@/types/location';
import { RouteSearchCriteria, RouteSearchResult, RouteSortOption } from '@/types/journey';

/**
 * Route Search Service Layer.
 * Provides live location autocomplete and journey route generation.
 * Ready for Node.js + Express backend endpoints:
 * GET /api/locations/search?q=...
 * GET /api/routes/search?origin=...&destination=...&mode=...&sort=...
 */
export const routeSearchService = {
  async searchLocations(query: string): Promise<TransitLocation[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return MOCK_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        (loc.subtitle && loc.subtitle.toLowerCase().includes(q))
    );
  },

  async searchRoutes(criteria: RouteSearchCriteria): Promise<RouteSearchResult[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));

    const destinationTitle = criteria.destinationName || 'University Malabe Campus';
    const originTitle = criteria.originName || 'Market Square';

    const isJaffna =
      originTitle.toLowerCase().includes('jaffna') ||
      destinationTitle.toLowerCase().includes('nallur') ||
      destinationTitle.toLowerCase().includes('jaffna');

    const jaffnaResult: RouteSearchResult = {
      id: 'route-jaffna-nallur',
      routeNumber: 'LINE 765',
      serviceType: 'bus',
      serviceName: 'Jaffna - Nallur Express Link',
      originName: originTitle.toLowerCase().includes('jaffna') ? originTitle : 'Jaffna Central Bus Stand',
      destinationName: destinationTitle.toLowerCase().includes('nallur') ? destinationTitle : 'Nallur Kandaswamy Kovil',
      departureTime: '10:04 AM',
      arrivalTime: '10:12 AM',
      durationMinutes: 8,
      etaMinutes: 8,
      fare: 80.0,
      fareFormatted: 'RS 80.00',
      condition: 'on-time',
      transfers: 0,
      isDirect: true,
      isFastest: true,
      tagLabel: 'Direct Express • ETA 8 min',
      tagType: 'fastest',
      walkingMeters: 80,
      walkingMinutes: 1,
      occupancy: 'medium',
      directSummary: 'Direct • CTB Express Coach',
      legs: [
        { id: 'leg-jn-1', type: 'bus', label: 'LINE 765', durationMinutes: 8 },
      ],
      platform: 'Bay 1',
    };

    const standardResults: RouteSearchResult[] = [
      {
        id: 'route-fastest-multimodal',
        routeNumber: '42 / Line Red',
        serviceType: 'bus',
        serviceName: `${originTitle} to ${destinationTitle} Express`,
        originName: originTitle,
        destinationName: destinationTitle,
        departureTime: '10:14 AM',
        arrivalTime: '10:38 AM',
        durationMinutes: 24,
        etaMinutes: 24,
        fare: 550.0,
        fareFormatted: 'RS 550.00',
        condition: 'on-time',
        transfers: 1,
        isDirect: false,
        isFastest: true,
        tagLabel: 'Fastest Route • 24 min',
        tagType: 'fastest',
        walkingMeters: 320,
        walkingMinutes: 4,
        occupancy: 'low',
        legs: [
          { id: 'leg-1', type: 'bus', label: 'Bus 42', durationMinutes: 12 },
          { id: 'leg-2', type: 'walk', label: '4 min', durationMinutes: 4 },
          { id: 'leg-3', type: 'train', label: 'Line Red', durationMinutes: 8 },
        ],
        platform: 'Bay 2',
        track: 'Track 4',
      },
      {
        id: 'route-direct-bus-108',
        routeNumber: '108',
        serviceType: 'bus',
        serviceName: `${originTitle} Direct Highway Link`,
        originName: originTitle,
        destinationName: destinationTitle,
        departureTime: '10:18 AM',
        arrivalTime: '10:49 AM',
        durationMinutes: 31,
        etaMinutes: 31,
        fare: 400.0,
        fareFormatted: 'RS 400.00',
        condition: 'delayed',
        delayMinutes: 3,
        transfers: 0,
        isDirect: true,
        isFastest: false,
        tagLabel: 'Direct Bus • 31 min',
        tagType: 'direct',
        walkingMeters: 150,
        walkingMinutes: 2,
        occupancy: 'medium',
        directSummary: 'Direct • No transfers',
        legs: [
          { id: 'leg-108', type: 'bus', label: 'Bus 108', durationMinutes: 31 },
        ],
        platform: 'Bay 5',
      },
      {
        id: 'route-train-express',
        routeNumber: 'Line Red',
        serviceType: 'train',
        serviceName: 'North Harbor - Metro Rail Link',
        originName: originTitle,
        destinationName: destinationTitle,
        departureTime: '10:22 AM',
        arrivalTime: '10:48 AM',
        durationMinutes: 26,
        etaMinutes: 26,
        fare: 350.0,
        fareFormatted: 'RS 350.00',
        condition: 'on-time',
        transfers: 0,
        isDirect: true,
        isFastest: false,
        tagLabel: 'Train Express • 26 min',
        tagType: 'direct',
        walkingMeters: 280,
        walkingMinutes: 3,
        occupancy: 'low',
        directSummary: 'Direct • Rail Express',
        legs: [
          { id: 'leg-train', type: 'train', label: 'Line Red', durationMinutes: 26 },
        ],
        track: 'Track 2',
      },
      {
        id: 'route-economy-bus-138',
        routeNumber: '138',
        serviceType: 'bus',
        serviceName: 'Highlevel Feeder Loop',
        originName: originTitle,
        destinationName: destinationTitle,
        departureTime: '10:28 AM',
        arrivalTime: '11:06 AM',
        durationMinutes: 38,
        etaMinutes: 38,
        fare: 250.0,
        fareFormatted: 'RS 250.00',
        condition: 'on-time',
        transfers: 1,
        isDirect: false,
        isFastest: false,
        tagLabel: 'Economy Route • 38 min',
        tagType: 'standard',
        walkingMeters: 420,
        walkingMinutes: 5,
        occupancy: 'high',
        legs: [
          { id: 'leg-138a', type: 'bus', label: 'Bus 138', durationMinutes: 20 },
          { id: 'leg-138b', type: 'bus', label: 'Bus 177', durationMinutes: 18 },
        ],
        platform: 'Bay 3',
      },
    ];

    const baseResults: RouteSearchResult[] = isJaffna
      ? [jaffnaResult, ...standardResults]
      : [...standardResults, jaffnaResult];

    let filtered = baseResults;
    if (criteria.transportMode === 'bus') {
      filtered = baseResults.filter((r) => r.serviceType === 'bus');
    } else if (criteria.transportMode === 'train') {
      filtered = baseResults.filter((r) => r.serviceType === 'train');
    }

    // Apply sorting
    const sortBy = criteria.sortBy || 'fastest';
    return routeSearchService.sortRoutes(filtered, sortBy);
  },

  sortRoutes(routes: RouteSearchResult[], sortBy: RouteSortOption): RouteSearchResult[] {
    const list = [...routes];
    if (sortBy === 'fastest') {
      return list.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else if (sortBy === 'earliest') {
      return list.sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
    } else if (sortBy === 'lowest-fare') {
      return list.sort((a, b) => a.fare - b.fare);
    }
    return list;
  },
};
