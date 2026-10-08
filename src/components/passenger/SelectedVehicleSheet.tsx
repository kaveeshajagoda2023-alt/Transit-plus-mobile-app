import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Vehicle } from '@/types/vehicle';
import { ETABadge, StatusBadge } from './ETABadge';
import { OccupancyIndicator } from './OccupancyIndicator';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface SelectedVehicleSheetProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onTrackPress: (vehicle: Vehicle) => void;
}

export const SelectedVehicleSheet: React.FC<SelectedVehicleSheetProps> = ({
  vehicle,
  onClose,
  onTrackPress,
}) => {
  if (!vehicle) return null;

  const isBus = vehicle.type === 'bus';
  const badgeBg = isBus ? TransitColors.busBadge : TransitColors.trainBadge;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            {isBus ? (
              <Ionicons name="bus" size={16} color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="train" size={16} color="#FFFFFF" />
            )}
            <Text style={styles.badgeText}>{vehicle.routeNumber}</Text>
          </View>
          <View style={styles.titleColumn}>
            <Text style={styles.destinationTitle} numberOfLines={1}>
              {vehicle.destination}
            </Text>
            <Text style={styles.subTitleText}>
              Next: {vehicle.nextStop}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="x" size={18} color={TransitColors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Info Row */}
      <View style={styles.infoRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>STATUS</Text>
          <StatusBadge status={vehicle.status} />
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ESTIMATED ARRIVAL</Text>
          <ETABadge etaMinutes={vehicle.eta} />
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>OCCUPANCY</Text>
          <View style={styles.occupancyWrap}>
            <OccupancyIndicator level={vehicle.occupancy} />
          </View>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.trackButton}
        activeOpacity={0.85}
        onPress={() => onTrackPress(vehicle)}
      >
        <Text style={styles.trackButtonText}>Track Live Vehicle</Text>
        <Feather name="arrow-right" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 30,
    ...TransitShadows.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  titleColumn: {
    marginLeft: 10,
    flex: 1,
  },
  destinationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TransitColors.textPrimary,
  },
  subTitleText: {
    fontSize: 12,
    color: TransitColors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TransitColors.textMuted,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  occupancyWrap: {
    marginTop: 6,
  },
  trackButton: {
    backgroundColor: TransitColors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 14,
    gap: 8,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
