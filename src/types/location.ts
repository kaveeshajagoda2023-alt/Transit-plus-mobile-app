export interface TransitLocation {
  id: string;
  name: string;
  subtitle?: string;
  category: 'station' | 'hub' | 'airport' | 'university' | 'commercial' | 'landmark' | 'current-location';
  latitude?: number;
  longitude?: number;
}

export interface SavedPlace {
  id: string;
  name: string;
  address: string;
  type: 'home' | 'university' | 'work' | 'other';
  latitude?: number;
  longitude?: number;
  iconName?: string;
}

export interface RecentSearch {
  id: string;
  destinationId: string;
  destination: string;
  serviceBadge: string;
  serviceType: 'bus' | 'train';
  serviceSummary: string;
  timestamp: string;
}
