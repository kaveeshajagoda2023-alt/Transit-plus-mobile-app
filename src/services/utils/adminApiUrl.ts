import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Resolves the backend API URL dynamically for Member 4 Admin functions.
 * - Web: http://localhost:5000
 * - Android physical device over LAN (Expo Go): http://<hostIp>:5000
 * - Android Emulator: http://10.0.2.2:5000
 */
export function getAdminApiUrl(endpointPath: string): string {
  const cleanPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;

  if (process.env.EXPO_PUBLIC_API_URL) {
    const base = process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
    return `${base}${cleanPath}`;
  }

  if (Platform.OS === 'web') {
    return `http://localhost:5000${cleanPath}`;
  }

  // Check Expo Go hostUri on physical phone
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000${cleanPath}`;
    }
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:5000${cleanPath}`;
  }

  return `http://localhost:5000${cleanPath}`;
}
