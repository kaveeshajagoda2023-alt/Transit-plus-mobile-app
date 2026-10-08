import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { RouteDetails } from '@/types/route';
import { OccupancyIndicator } from './OccupancyIndicator';
import { ServiceAlert } from './ServiceAlert';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface RouteDetailsCardProps {
  route: RouteDetails;
  dynamicEtaMinutes: number;
  dynamicDistanceKm: number;
  dynamicStopsAway: number;
  liveStatus: 'LIVE' | 'UPDATING' | 'OFFLINE';
}

export const RouteDetailsCard: React.FC<RouteDetailsCardProps> = ({
  route,
  dynamicEtaMinutes,
  dynamicDistanceKm,
  dynamicStopsAway,
  liveStatus,
}) => {
  const isBus = route.serviceType === 'bus';
  const badgeBg = isBus ? TransitColors.busBadge : TransitColors.trainBadgeSecondary;

  const occupancyLabel =
    route.occupancyLevel === 'low'
      ? `Low Occupancy (${route.occupancyPercentage}% seated)`
      : route.occupancyLevel === 'medium'
      ? `Medium Occupancy (${route.occupancyPercentage}% seated)`
      : `High Occupancy (${route.occupancyPercentage}% seated)`;

  return (
    <View style={styles.card}>
      {/* Top Header: Route Badge & Destination Details */}
      <View style={styles.topRow}>
        {/* Route Badge */}
        <View style={[styles.routeBadge, { backgroundColor: badgeBg }]}>
          {isBus ? (
            <Ionicons name="bus" size={14} color="#FFFFFF" style={styles.badgeIcon} />
          ) : (
            <MaterialCommunityIcons name="train" size={14} color="#FFFFFF" style={styles.badgeIcon} />
          )}
          <Text style={styles.routeNumberText}>{route.routeNumber}</Text>
        </View>

        {/* Destination Information */}
        <View style={styles.destinationColumn}>
          <Text style={styles.destinationLabel}>DESTINATION</Text>
          <Text style={styles.destinationName} numberOfLines={2}>
            {route.destination}
          </Text>
          {route.via && (
            <Text style={styles.viaText}>Via {route.via}</Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Boarding Arrival & Live ETA Row */}
      <View style={styles.etaSection}>
        <View style={styles.etaLeftColumn}>
          <Text style={styles.boardingArrivalLabel}>Boarding Arrival</Text>
          <Text style={styles.arrivingInText}>
            Arriving in {dynamicEtaMinutes} min
          </Text>
        </View>

        {/* LIVE Status Badge */}
        <View
          style={[
            styles.liveBadge,
            liveStatus === 'UPDATING'
              ? styles.liveBadgeUpdating
              : liveStatus === 'OFFLINE'
              ? styles.liveBadgeOffline
              : styles.liveBadgeActive,
          ]}
        >
          <View
            style={[
              styles.livePulseDot,
              liveStatus === 'UPDATING'
                ? styles.liveDotUpdating
                : liveStatus === 'OFFLINE'
                ? styles.liveDotOffline
                : styles.liveDotActive,
            ]}
          />
          <Text
            style={[
              styles.liveBadgeText,
              liveStatus === 'OFFLINE' && styles.liveTextOffline,
            ]}
          >
            {liveStatus}
          </Text>
        </View>
      </View>

      {/* Vehicle Distance and Stops Count */}
      <View style={styles.distanceRow}>
        <Feather name="navigation" size={13} color={TransitColors.textSecondary} />
        <Text style={styles.distanceText}>
          Vehicle is {dynamicDistanceKm} km away ({dynamicStopsAway} stops away)
        </Text>
      </View>

      {/* Traffic / Delay Alert Banner */}
      {route.alert && <ServiceAlert alert={route.alert} />}

      {/* Occupancy Indicator */}
      <View style={styles.occupancyContainer}>
        <Text style={styles.occupancyText}>{occupancyLabel}</Text>
        <OccupancyIndicator level={route.occupancyLevel} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...TransitShadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 14,
    marginTop: 2,
  },
  badgeIcon: {
    marginRight: 5,
  },
  routeNumberText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  destinationColumn: {
    flex: 1,
  },
  destinationLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: TransitColors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: '800',
    color: TransitColors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  viaText: {
    fontSize: 13,
    fontWeight: '600',
    color: TransitColors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  etaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etaLeftColumn: {
    flex: 1,
  },
  boardingArrivalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: TransitColors.textSecondary,
    marginBottom: 2,
  },
  arrivingInText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#EA580C', // Vibrant Orange matching the screenshot
    letterSpacing: -0.4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  liveBadgeActive: {
    backgroundColor: '#DCFCE7',
  },
  liveBadgeUpdating: {
    backgroundColor: '#FEF3C7',
  },
  liveBadgeOffline: {
    backgroundColor: '#F1F5F9',
  },
  livePulseDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
  },
  liveDotActive: {
    backgroundColor: TransitColors.liveGreen,
  },
  liveDotUpdating: {
    backgroundColor: '#D97706',
  },
  liveDotOffline: {
    backgroundColor: '#94A3B8',
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  liveTextOffline: {
    color: '#64748B',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  distanceText: {
    fontSize: 13,
    color: TransitColors.textSecondary,
    fontWeight: '600',
  },
  occupancyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  occupancyText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: TransitColors.textSecondary,
  },
});
