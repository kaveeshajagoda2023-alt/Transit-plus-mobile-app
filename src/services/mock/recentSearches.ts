import { RecentSearch } from '@/types/location';

export const INITIAL_RECENT_SEARCHES: RecentSearch[] = [
  {
    id: 'rec-1',
    destinationId: 'loc-central-station',
    destination: 'Central Station',
    serviceBadge: 'Line Red',
    serviceType: 'train',
    serviceSummary: 'Rail Link',
    timestamp: '2 hours ago',
  },
  {
    id: 'rec-2',
    destinationId: 'loc-airport-t2',
    destination: 'Airport Terminal 2',
    serviceBadge: 'Express 88',
    serviceType: 'bus',
    serviceSummary: 'Non-stop',
    timestamp: 'Yesterday',
  },
];
