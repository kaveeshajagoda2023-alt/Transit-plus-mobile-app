import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TrackingStatus, VehicleType } from '@/types/vehicle';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface TrackingHeaderProps {
  routeNumber: string;
  serviceType: VehicleType;
  speedKmh: number;
  trackingStatus: TrackingStatus;
  destination: string;
  etaMinutes: number;
  onBackPress: () => void;
}

export const TrackingHeader: React.FC<TrackingHeaderProps> = ({
  routeNumber,
  serviceType,
  speedKmh,
  trackingStatus,
  destination,
  etaMinutes,
  onBackPress,
}) => {
  const isBus = serviceType === 'bus';
  const routeLabel = isBus ? 'Bus' : 'Train';
  const cleanRouteNum = routeNumber.replace(/Bus |Train |Line /g, '');

  const isLive = trackingStatus === 'LIVE';
  const isStopped = trackingStatus === 'STOPPED';

  const handleShare = async () => {
    try {
      await Share.share({
        title: `TransitPulse - Live Tracking ${routeNumber}`,
        message: `TransitPulse Live Tracking: ${routeNumber} to ${destination} is currently moving at ${speedKmh} km/h, arriving in ${etaMinutes} min.`,
      });
    } catch (error) {
      console.error('Error sharing tracking info:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Floating Back Button */}
      <TouchableOpacity
        style={styles.circleBtn}
        onPress={onBackPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Feather name="arrow-left" size={20} color={TransitColors.primary} />
      </TouchableOpacity>

      {/* Pill-Shaped Central Status Card */}
      <View style={styles.statusPill}>
        {/* Left Segment: Live GPS Status */}
        <View style={styles.statusSegment}>
          <View
            style={[
              styles.pulseDot,
              isLive ? styles.pulseDotActive : isStopped ? styles.pulseDotStopped : styles.pulseDotUpdating,
            ]}
          />
          <View style={styles.textStack}>
            <Text style={styles.statusLabelTop}>
              {isStopped ? 'TRACKING' : 'LIVE GPS'}
            </Text>
            <Text style={styles.statusLabelBottom}>
              {isStopped ? 'STOPPED' : 'TRACKING'}
            </Text>
          </View>
        </View>

        {/* Middle Segment Divider */}
        <View style={styles.pillDivider} />

        {/* Middle Segment: Vehicle Route Number */}
        <View style={styles.routeSegment}>
          <Text style={styles.routeTypeLabel}>{routeLabel}</Text>
          <Text style={styles.routeNumberText}>{cleanRouteNum}</Text>
        </View>

        {/* Right Segment: Speed Badge */}
        <View style={styles.speedBadge}>
          <Text style={styles.speedNumberText}>{speedKmh}</Text>
          <Text style={styles.speedUnitText}>km/h</Text>
        </View>
      </View>

      {/* Floating Share Button */}
      <TouchableOpacity
        style={styles.circleBtn}
        onPress={handleShare}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Share live tracking"
      >
        <Feather name="share-2" size={18} color={TransitColors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 25,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.floating,
  },
  statusPill: {
    flex: 1,
    marginHorizontal: 10,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.floating,
  },
  statusSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1.2,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pulseDotActive: {
    backgroundColor: TransitColors.liveGreen,
  },
  pulseDotUpdating: {
    backgroundColor: '#F59E0B',
  },
  pulseDotStopped: {
    backgroundColor: '#94A3B8',
  },
  textStack: {
    justifyContent: 'center',
  },
  statusLabelTop: {
    fontSize: 9.5,
    fontWeight: '800',
    color: TransitColors.textPrimary,
    letterSpacing: 0.3,
    lineHeight: 11,
  },
  statusLabelBottom: {
    fontSize: 9.5,
    fontWeight: '800',
    color: TransitColors.textPrimary,
    letterSpacing: 0.3,
    lineHeight: 11,
  },
  pillDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  routeSegment: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 10,
  },
  routeTypeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: TransitColors.textPrimary,
    lineHeight: 11,
  },
  routeNumberText: {
    fontSize: 13,
    fontWeight: '900',
    color: TransitColors.primary,
    lineHeight: 14,
  },
  speedBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 42,
  },
  speedNumberText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1D4ED8',
    lineHeight: 13,
  },
  speedUnitText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#3B82F6',
    lineHeight: 9,
  },
});
