import { ViewStyle } from 'react-native';

export const TransitColors = {
  // Brand Primary
  primary: '#0F2942',
  primaryDark: '#0A1C2E',
  primaryLight: '#1A3B5D',
  primaryPress: '#091A2B',

  // Accent Colors
  busBadge: '#133E68',
  trainBadge: '#0D7B74',
  trainBadgeSecondary: '#008B7A',

  // Status Colors
  arrivingBg: '#D1FAE5',
  arrivingText: '#047857',
  onTimeBg: '#DCFCE7',
  onTimeText: '#15803D',
  delayedBg: '#FEE2E2',
  delayedText: '#DC2626',
  offlineBg: '#F1F5F9',
  offlineText: '#64748B',

  // ETA Colors
  etaPeachBg: '#FFEDD5',
  etaPeachText: '#C2410C',
  etaNeutralBg: '#F1F5F9',
  etaNeutralText: '#334155',

  // Occupancy Colors
  occupancyLow: '#10B981',
  occupancyMedium: '#F59E0B',
  occupancyHigh: '#EF4444',
  occupancyEmpty: '#E2E8F0',

  // Background & Surfaces
  background: '#F8FAFC',
  cardBackground: '#FFFFFF',
  mapOverlay: 'rgba(255, 255, 255, 0.95)',
  handleBar: '#CBD5E1',

  // Borders & Lines
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#F1F5F9',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',

  // Navigation
  navActive: '#0F2942',
  navInactive: '#64748B',
  badgeDot: '#F97316',

  // Live Pulse
  liveGreen: '#22C55E',
  userLocation: '#2563EB',
  userLocationHalo: 'rgba(37, 99, 235, 0.25)',

  // Routes
  routeBus: '#0F2942',
  routeTrain: '#0D9488',
  routeTrainSecondary: '#008B7A',
};

export const TransitShadows: Record<string, ViewStyle> = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  floating: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  marker: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  bottomSheet: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 10,
  },
};
