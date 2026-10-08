import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { NearbyService } from '@/types/nearbyService';
import { ETABadge, StatusBadge } from './ETABadge';
import { OccupancyIndicator } from './OccupancyIndicator';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface NearbyServiceCardProps {
  service: NearbyService;
  onPress?: (service: NearbyService) => void;
  onToggleStar?: (id: string) => void;
}

export const NearbyServiceCard: React.FC<NearbyServiceCardProps> = ({
  service,
  onPress,
}) => {
  const isBus = service.serviceType === 'bus';
  const badgeBg = isBus ? TransitColors.busBadge : TransitColors.trainBadge;

  const occupancyLabel =
    service.occupancy === 'low'
      ? 'Low Occupancy'
      : service.occupancy === 'medium'
      ? 'Medium Occupancy'
      : 'High Occupancy';

  const occupancyTextColor =
    service.occupancy === 'low'
      ? TransitColors.occupancyLow
      : service.occupancy === 'medium'
      ? TransitColors.occupancyMedium
      : TransitColors.occupancyHigh;

  const locationDetails = [
    `${service.distance}m away`,
    service.platform || service.track || '',
    service.direction ? `${service.direction}` : '',
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress && onPress(service)}
      style={styles.cardContainer}
      accessibilityRole="button"
    >
      {/* Top Details Section */}
      <View style={styles.topSection}>
        {/* Left Route Badge */}
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          {isBus ? (
            <View style={styles.busBadgeContent}>
              <Ionicons name="bus" size={16} color="#FFFFFF" style={styles.badgeIcon} />
              <Text style={styles.busNumberText}>{service.routeNumber}</Text>
            </View>
          ) : (
            <View style={styles.trainBadgeContent}>
              <MaterialCommunityIcons
                name="train"
                size={16}
                color="#FFFFFF"
                style={styles.badgeIcon}
              />
              <View>
                <Text style={styles.trainLineText}>Line</Text>
                <Text style={styles.trainLineSubText}>
                  {service.routeNumber.replace('Line ', '')}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Center Details */}
        <View style={styles.infoSection}>
          <Text style={styles.serviceName} numberOfLines={1}>
            {service.serviceName}
          </Text>
          <View style={styles.subtitleRow}>
            <Feather
              name="navigation"
              size={12}
              color={TransitColors.textSecondary}
              style={styles.navIcon}
            />
            <Text style={styles.subtitleText} numberOfLines={1}>
              {locationDetails}
            </Text>
          </View>
        </View>

        {/* Right ETA & Status Section */}
        <View style={styles.etaSection}>
          <ETABadge etaMinutes={service.eta} />
          <StatusBadge status={service.status} />
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom Occupancy Section */}
      <View style={styles.bottomSection}>
        <View style={styles.occupancyRow}>
          <Ionicons
            name="people-outline"
            size={14}
            color={occupancyTextColor}
            style={styles.peopleIcon}
          />
          <Text style={[styles.occupancyText, { color: occupancyTextColor }]}>
            {occupancyLabel}
          </Text>
        </View>

        <OccupancyIndicator level={service.occupancy} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.card,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 64,
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  busBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trainBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeIcon: {
    marginRight: 2,
  },
  busNumberText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  trainLineText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 11,
  },
  trainLineSubText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    lineHeight: 14,
  },
  infoSection: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  serviceName: {
    fontSize: 15.5,
    fontWeight: '700',
    color: TransitColors.textPrimary,
    letterSpacing: -0.2,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  navIcon: {
    marginRight: 4,
    transform: [{ rotate: '45deg' }],
  },
  subtitleText: {
    fontSize: 12,
    color: TransitColors.textSecondary,
    fontWeight: '500',
  },
  etaSection: {
    alignItems: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  occupancyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peopleIcon: {
    marginRight: 6,
  },
  occupancyText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
