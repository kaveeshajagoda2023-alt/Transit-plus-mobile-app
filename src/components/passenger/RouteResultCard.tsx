import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteSearchResult, RouteLeg } from '@/types/journey';
import { OccupancyIndicator } from './OccupancyIndicator';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface RouteResultCardProps {
  route: RouteSearchResult;
  onPress: (route: RouteSearchResult) => void;
  onSavePress?: (route: RouteSearchResult) => void;
  isSaved?: boolean;
}

export const RouteResultCard: React.FC<RouteResultCardProps> = ({
  route,
  onPress,
  onSavePress,
  isSaved = false,
}) => {
  const isFastest = route.isFastest || route.tagType === 'fastest';
  const isDirect = route.isDirect || route.tagType === 'direct';

  // Dynamic Occupancy Label
  const occupancyLabel =
    route.occupancy === 'low'
      ? 'Low Occupancy'
      : route.occupancy === 'medium'
      ? 'Medium Occupancy'
      : 'High Occupancy';

  // Condition Badge Label
  const conditionLabel =
    route.condition === 'delayed' && route.delayMinutes
      ? `Delayed (+${route.delayMinutes} min)`
      : 'On time';

  // Render a specific transit leg badge
  const renderLegItem = (leg: RouteLeg, index: number) => {
    if (leg.type === 'walk') {
      return (
        <View key={leg.id || index} style={styles.walkLegContainer}>
          <Feather name="chevron-right" size={14} color="#94A3B8" />
          <MaterialCommunityIcons
            name="walk"
            size={16}
            color={TransitColors.textSecondary}
            style={styles.walkIcon}
          />
          <Text style={styles.walkText}>{leg.label}</Text>
          <Feather name="chevron-right" size={14} color="#94A3B8" />
        </View>
      );
    }

    const isBus = leg.type === 'bus';
    const badgeBg = isBus ? TransitColors.busBadge : TransitColors.trainBadge;

    return (
      <View key={leg.id || index} style={[styles.legBadge, { backgroundColor: badgeBg }]}>
        {isBus ? (
          <Ionicons name="bus" size={13} color="#FFFFFF" style={styles.legIcon} />
        ) : (
          <MaterialCommunityIcons
            name="train"
            size={13}
            color="#FFFFFF"
            style={styles.legIcon}
          />
        )}
        <Text style={styles.legText}>{leg.label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.cardContainer}>
      {/* Top Badges Row */}
      <View style={styles.topBadgesRow}>
        {/* Left Tag Badge */}
        <View
          style={[
            styles.tagBadge,
            isFastest
              ? styles.fastestTagBadge
              : isDirect
              ? styles.directTagBadge
              : styles.standardTagBadge,
          ]}
        >
          {isFastest ? (
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={14}
              color="#0F766E"
              style={styles.tagIcon}
            />
          ) : (
            <Ionicons
              name="bus-outline"
              size={13}
              color="#0369A1"
              style={styles.tagIcon}
            />
          )}
          <Text
            style={[
              styles.tagText,
              isFastest
                ? styles.fastestTagText
                : isDirect
                ? styles.directTagText
                : styles.standardTagText,
            ]}
          >
            {route.tagLabel}
          </Text>
        </View>

        {/* Right Status Badge */}
        <View
          style={[
            styles.conditionBadge,
            route.condition === 'delayed'
              ? styles.delayedBadge
              : styles.onTimeBadge,
          ]}
        >
          <View
            style={[
              styles.conditionDot,
              {
                backgroundColor:
                  route.condition === 'delayed' ? '#C2410C' : '#15803D',
              },
            ]}
          />
          <Text
            style={[
              styles.conditionText,
              {
                color:
                  route.condition === 'delayed' ? '#C2410C' : '#15803D',
              },
            ]}
          >
            {conditionLabel}
          </Text>
        </View>
      </View>

      {/* Time Schedule and Fare Row */}
      <View style={styles.timeFareRow}>
        <Text style={styles.timeRangeText}>
          {route.departureTime} - {route.arrivalTime}
        </Text>
        <Text style={styles.fareText}>
          RS {typeof route.fare === 'number' ? route.fare.toFixed(2) : route.fare}
        </Text>
      </View>

      {/* Transit Legs Summary Box */}
      <View style={styles.legsBox}>
        <View style={styles.legsRow}>
          {route.legs && route.legs.length > 0 ? (
            route.legs.map((leg, idx) => renderLegItem(leg, idx))
          ) : (
            <View style={[styles.legBadge, { backgroundColor: TransitColors.busBadge }]}>
              <Ionicons name="bus" size={13} color="#FFFFFF" style={styles.legIcon} />
              <Text style={styles.legText}>{route.routeNumber}</Text>
            </View>
          )}

          {route.directSummary && (
            <Text style={styles.directSummaryText}>{route.directSummary}</Text>
          )}
        </View>
      </View>

      {/* Route Metrics Row */}
      <View style={styles.metricsRow}>
        {/* Total Duration */}
        <View style={styles.metricItem}>
          <Feather
            name="clock"
            size={13}
            color={TransitColors.textSecondary}
            style={styles.metricIcon}
          />
          <Text style={styles.metricText}>{route.durationMinutes} mins</Text>
        </View>

        {/* Walking Distance */}
        <View style={styles.metricItem}>
          <MaterialCommunityIcons
            name="walk"
            size={15}
            color={TransitColors.textSecondary}
            style={styles.metricIcon}
          />
          <Text style={styles.metricText}>{route.walkingMeters}m walk</Text>
        </View>

        {/* Transfers */}
        <View style={styles.metricItem}>
          <MaterialCommunityIcons
            name="account-switch-outline"
            size={14}
            color={TransitColors.textSecondary}
            style={styles.metricIcon}
          />
          <Text style={styles.metricText}>
            {route.transfers === 0
              ? 'No transfers'
              : `${route.transfers} transfer`}
          </Text>
        </View>
      </View>

      {/* Occupancy Row */}
      <View style={styles.occupancyRow}>
        <View style={styles.occupancyLabelWrap}>
          <Ionicons
            name="people-outline"
            size={14}
            color={TransitColors.occupancyLow}
            style={styles.peopleIcon}
          />
          <Text style={styles.occupancyText}>{occupancyLabel}</Text>
        </View>

        <OccupancyIndicator level={route.occupancy} />
      </View>

      {/* Action Buttons Row: Save Trip (CRUD Create) + View Route */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.saveTripButton, isSaved && styles.saveTripButtonActive]}
          activeOpacity={0.8}
          onPress={() => onSavePress?.(route)}
          accessibilityRole="button"
          accessibilityLabel={`Save ${route.routeNumber} to favourite routes`}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={17}
            color={isSaved ? '#0284C7' : '#64748B'}
          />
          <Text style={[styles.saveTripText, isSaved && styles.saveTripTextActive]}>
            {isSaved ? 'Saved' : 'Save Trip'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewRouteButton}
          activeOpacity={0.85}
          onPress={() => onPress(route)}
          accessibilityRole="button"
          accessibilityLabel={`View full route details for ${route.routeNumber}`}
        >
          <Text style={styles.viewRouteText}>View Route</Text>
          <Feather name="arrow-right" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.card,
  },
  topBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  fastestTagBadge: {
    backgroundColor: '#CCFBF1',
  },
  directTagBadge: {
    backgroundColor: '#E0F2FE',
  },
  standardTagBadge: {
    backgroundColor: '#F1F5F9',
  },
  tagIcon: {
    marginRight: 4,
  },
  tagText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  fastestTagText: {
    color: '#0F766E',
  },
  directTagText: {
    color: '#0369A1',
  },
  standardTagText: {
    color: TransitColors.textPrimary,
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  onTimeBadge: {
    backgroundColor: '#DCFCE7',
  },
  delayedBadge: {
    backgroundColor: '#FFEDD5',
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  conditionText: {
    fontSize: 11,
    fontWeight: '800',
  },
  timeFareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeRangeText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  fareText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2942',
    letterSpacing: -0.2,
  },
  legsBox: {
    backgroundColor: '#F0F4F8',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  legsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  legBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  legIcon: {
    marginRight: 4,
  },
  legText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  walkLegContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  walkIcon: {
    marginLeft: 2,
  },
  walkText: {
    fontSize: 12,
    fontWeight: '600',
    color: TransitColors.textSecondary,
    marginRight: 2,
  },
  directSummaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    marginRight: 4,
  },
  metricText: {
    fontSize: 12,
    color: TransitColors.textSecondary,
    fontWeight: '600',
  },
  occupancyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  occupancyLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peopleIcon: {
    marginRight: 6,
  },
  occupancyText: {
    fontSize: 12,
    fontWeight: '700',
    color: TransitColors.occupancyLow,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  saveTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    height: 46,
    paddingHorizontal: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  saveTripButtonActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
  },
  saveTripText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  saveTripTextActive: {
    color: '#0284C7',
    fontWeight: '800',
  },
  viewRouteButton: {
    flex: 1,
    backgroundColor: '#0F2942',
    borderRadius: 14,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewRouteText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
});
