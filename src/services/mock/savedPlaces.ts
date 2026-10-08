import { SavedPlace } from '@/types/location';

export const INITIAL_SAVED_PLACES: SavedPlace[] = [
  {
    id: 'place-home',
    name: 'Home',
    address: '67 JAFFNA',
    type: 'home',
    latitude: 6.9380,
    longitude: 79.8520,
    iconName: 'home',
  },
  {
    id: 'place-university',
    name: 'University',
    address: 'Malabe Campus',
    type: 'university',
    latitude: 6.9140,
    longitude: 79.9720,
    iconName: 'school',
  },
  {
    id: 'place-work',
    name: 'Work',
    address: 'Financial Dist.',
    type: 'work',
    latitude: 6.9340,
    longitude: 79.8430,
    iconName: 'briefcase',
  },
];
