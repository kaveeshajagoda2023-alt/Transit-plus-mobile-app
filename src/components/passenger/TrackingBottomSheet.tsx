import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Vehicle, TrackingStatus } from '@/types/vehicle';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface TrackingBottomSheetProps {
  vehicle: Vehicle;
  isTracking: boolean;
  trackingStatus: TrackingStatus;
  freeSeats: number;
  etaMinutes: number;
  arrivalAlertEnabled: boolean;
  onToggleArrivalAlert: (val: boolean) => void;
  onStopTrackingPress: () => void;
  onGetDirectionsPress: () => void;
  onSimulateMovePress?: () => void;
}

export const TrackingBottomSheet: React.FC<TrackingBottomSheetProps> = ({
  vehicle,
  isTracking,
  trackingStatus,
  freeSeats,
  etaMinutes,
  arrivalAlertEnabled,
  onToggleArrivalAlert,
  onStopTrackingPress,
  onGetDirectionsPress,
  onSimulateMovePress,
}) => {
  const isBus = vehicle.type === 'bus';
  const vehicleTypeLabel = isBus ? 'Bus' : 'Train';
  const vehicleSpec = vehicle.vehicleSpec || (isBus ? 'Hybrid Electric' : 'High-Speed Rail');
  const routeName = vehicle.routeName || 'Rapid Transit Line 42';
  const direction = vehicle.direction || 'Eastbound';

  const occupancyLabel =
    vehicle.occupancy === 'low'
      ? 'LOW OCCUPANCY'
      : vehicle.occupancy === 'medium'
      ? 'MED OCCUPANCY'
      : 'HIGH OCCUPANCY';

  const occupancyBadgeBg =
    vehicle.occupancy === 'low'
      ? '#DCFCE7'
      : vehicle.occupancy === 'medium'
      ? '#FEF3C7'
      : '#FEE2E2';

  const occupancyTextColor =
    vehicle.occupancy === 'low'
      ? '#15803D'
      : vehicle.occupancy === 'medium'
      ? '#B45309'
      : '#DC2626';

  return (
    <View style={styles.sheetContainer}>
      {/* Grab Handle */}
      <View style={styles.handleContainer}>
        <View style={styles.handleBar} />
      </View>

      {/* Vehicle Info & Occupancy Header */}
      <View style={styles.headerRow}>
        {/* Left Column: Number and Line Details */}
        <View style={styles.vehicleInfoLeft}>
          <Text style={styles.vehicleTypeSmall}>{vehicleTypeLabel}</Text>
          <Text style={styles.vehicleNumberBold}>{vehicle.vehicleNumber}</Text>
          <Text style={styles.routeSubtitleText}>{routeName}</Text>
          <Text style={styles.directionText}>{direction}</Text>
        </View>

        {/* Right Column: Spec & Occupancy Badges */}
        <View style={styles.vehicleInfoRight}>
          {/* Hybrid / Spec Badge */}
          <View style={styles.specBadge}>
            <Text style={styles.specBadgeText}>{vehicleSpec}</Text>
          </View>

          {/* Occupancy Pill Badge */}
          <View
            style={[
              styles.occupancyBadge,
              { backgroundColor: occupancyBadgeBg },
            ]}
          >
            <MaterialCommunityIcons
              name="signal-cellular-2"
              size={14}
              color={occupancyTextColor}
            />
            <Text
              style={[
                styles.occupancyBadgeText,
                { color: occupancyTextColor },
              ]}
            >
              {occupancyLabel}
            </Text>
          </View>

          {/* Free Seats Subtext */}
          <Text style={styles.freeSeatsText}>{freeSeats} seats free</Text>
        </View>
      </View>

      {/* Horizontal 3-Stop Journey Progress Card */}
      <View style={styles.progressCard}>
        {/* Step 1: Departed Stop */}
        <View style={styles.stopColumn}>
          <View style={styles.completedNode}>
            <Feather name="check" size={13} color="#FFFFFF" />
          </View>
          <Text style={styles.stopNameLabel} numberOfLines={1}>
            3rd & Pine
          </Text>
          <Text style={styles.stopSubLabel}>Departed</Text>
        </View>

        {/* Connecting Line 1 */}
        <View style={styles.lineSolid} />

        {/* Step 2: Current / Target Stop */}
        <View style={styles.stopColumn}>
          <View style={styles.currentNode}>
            <Ionicons name="location" size={14} color="#FFFFFF" />
          </View>
          <Text style={[styles.stopNameLabel, styles.targetStopName]} numberOfLines={1}>
            Market & 4th
          </Text>
          <Text style={styles.yourStopLabel}>
            Your Stop ({etaMinutes}m)
          </Text>
        </View>

        {/* Connecting Line 2 */}
        <View style={styles.lineDotted} />

        {/* Step 3: Upcoming Destination Stop */}
        <View style={styles.stopColumn}>
          <View style={styles.upcomingNode}>
            <View style={styles.upcomingInnerDot} />
          </View>
          <Text style={[styles.stopNameLabel, styles.upcomingStopName]} numberOfLines={1}>
            Civic Center
          </Text>
          <Text style={styles.stopSubLabel}>Terminal</Text>
        </View>
      </View>

      {/* Arrival Alert Notification Card */}
      <View style={styles.alertCard}>
        <View style={styles.alertIconBox}>
          <Feather name="bell" size={16} color={TransitColors.primary} />
        </View>

        <View style={styles.alertTextColumn}>
          <Text style={styles.alertTitle}>
            Arrival Alert: {arrivalAlertEnabled ? 'Enabled' : 'Disabled'}
          </Text>
          <Text style={styles.alertSubtext}>
            Vibrate & sound 5m before arrival
          </Text>
        </View>

        <Switch
          value={arrivalAlertEnabled}
          onValueChange={onToggleArrivalAlert}
          trackColor={{ false: '#CBD5E1', true: '#0D9488' }}
          thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
          ios_backgroundColor="#CBD5E1"
        />
      </View>

      {/* Simulation / Manual Advance GPS Update (CRUD: Update) */}
      {onSimulateMovePress && (
        <TouchableOpacity
          style={styles.simulateMoveBtn}
          onPress={onSimulateMovePress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Simulate vehicle GPS movement and recalculate ETA"
        >
          <Ionicons name="flash" size={16} color="#0284C7" />
          <Text style={styles.simulateMoveBtnText}>
            Advance GPS Move (Update Location & ETA)
          </Text>
        </TouchableOpacity>
      )}

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        {/* Stop Tracking Button */}
        <TouchableOpacity
          style={[
            styles.stopTrackingBtn,
            !isTracking && styles.resumeTrackingBtn,
          ]}
          onPress={onStopTrackingPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isTracking ? 'Stop tracking vehicle' : 'Resume tracking vehicle'}
        >
          <Feather
            name={isTracking ? 'stop-circle' : 'play-circle'}
            size={18}
            color={isTracking ? '#DC2626' : '#15803D'}
          />
          <Text
            style={[
              styles.stopTrackingText,
              !isTracking && styles.resumeTrackingText,
            ]}
          >
            {isTracking ? 'Stop Tracking' : 'Resume Tracking'}
          </Text>
        </TouchableOpacity>

        {/* Get Directions Button */}
        <TouchableOpacity
          style={styles.directionsBtn}
          onPress={onGetDirectionsPress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Get directions to boarding stop"
        >
          <Feather name="navigation" size={17} color="#FFFFFF" />
          <Text style={styles.directionsText}>Get Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 30,
    ...TransitShadows.bottomSheet,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handleBar: {
    width: 44,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  vehicleInfoLeft: {
    flex: 1,
  },
  vehicleTypeSmall: {
    fontSize: 16,
    fontWeight: '800',
    color: TransitColors.textPrimary,
    lineHeight: 18,
  },
  vehicleNumberBold: {
    fontSize: 22,
    fontWeight: '900',
    color: TransitColors.textPrimary,
    letterSpacing: -0.4,
    lineHeight: 26,
    marginTop: 1,
  },
  routeSubtitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: TransitColors.textSecondary,
    marginTop: 3,
  },
  directionText: {
    fontSize: 12,
    fontWeight: '600',
    color: TransitColors.textSecondary,
    marginTop: 1,
  },
  vehicleInfoRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  specBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  specBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
  },
  occupancyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  occupancyBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  freeSeatsText: {
    fontSize: 12,
    fontWeight: '600',
    color: TransitColors.textSecondary,
  },
  progressCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stopColumn: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 2,
  },
  completedNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  currentNode: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0F2942',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  upcomingNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  upcomingInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  lineSolid: {
    height: 2.5,
    backgroundColor: '#0D9488',
    width: 38,
    marginBottom: 24,
  },
  lineDotted: {
    height: 2.5,
    backgroundColor: '#CBD5E1',
    width: 38,
    marginBottom: 24,
  },
  stopNameLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: TransitColors.textPrimary,
    textAlign: 'center',
  },
  targetStopName: {
    fontWeight: '800',
    color: TransitColors.textPrimary,
  },
  upcomingStopName: {
    color: TransitColors.textSecondary,
  },
  stopSubLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: TransitColors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  yourStopLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0D9488',
    marginTop: 2,
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 12,
    gap: 10,
  },
  alertIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTextColumn: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: TransitColors.textPrimary,
  },
  alertSubtext: {
    fontSize: 11,
    color: TransitColors.textSecondary,
    marginTop: 1,
  },
  simulateMoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    height: 42,
    gap: 8,
    marginBottom: 10,
  },
  simulateMoveBtnText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stopTrackingBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  resumeTrackingBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  stopTrackingText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  resumeTrackingText: {
    color: '#15803D',
  },
  directionsBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: TransitColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...TransitShadows.card,
  },
  directionsText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
