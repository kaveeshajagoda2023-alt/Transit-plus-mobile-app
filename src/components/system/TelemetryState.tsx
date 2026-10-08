import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { TelemetryData } from '@/types/systemState';
import { TransitColors } from '@/constants/transitTheme';

interface TelemetryStateProps {
  telemetry?: TelemetryData;
}

export const TelemetryState: React.FC<TelemetryStateProps> = ({ telemetry }) => {
  const data: TelemetryData = telemetry || {
    gpsStatus: 'locked',
    connectionStatus: 'online',
    satellitesCount: 9,
    latencyMs: 12,
    lastUpdated: 'Just now',
    vehicleSpeedKmh: 28,
    headingDegrees: 140,
  };

  const isLocked = data.gpsStatus === 'locked';

  return (
    <View style={styles.container}>
      {/* Top Metrics Grid */}
      <View style={styles.metricsGrid}>
        {/* GPS Fix Metric */}
        <View style={styles.metricBox}>
          <View style={styles.metricHeaderRow}>
            <View
              style={[
                styles.statusDot,
                isLocked ? styles.dotGreen : styles.dotAmber,
              ]}
            />
            <Text style={styles.metricLabel}>GPS STATUS</Text>
          </View>
          <Text style={styles.metricMainValue}>
            {isLocked ? 'GPS Locked' : 'Searching Fix'}
          </Text>
          <Text style={styles.metricSubtext}>
            {data.satellitesCount} satellites tracked
          </Text>
        </View>

        {/* Telemetry Stream Metric */}
        <View style={styles.metricBox}>
          <View style={styles.metricHeaderRow}>
            <MaterialCommunityIcons
              name="wifi-check"
              size={14}
              color="#0D9488"
            />
            <Text style={styles.metricLabel}>STREAM LINK</Text>
          </View>
          <Text style={styles.metricMainValue}>Online (5G)</Text>
          <Text style={styles.metricSubtext}>{data.latencyMs}ms stream jitter</Text>
        </View>
      </View>

      {/* Vehicle Live Telemetry Banner */}
      <View style={styles.telemetryBanner}>
        <View style={styles.bannerLeft}>
          <MaterialCommunityIcons name="radar" size={18} color="#1D4ED8" />
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>Live Tracking Active</Text>
            <Text style={styles.bannerSubtitle}>
              Continuous telemetry stream at 2.5s cadence
            </Text>
          </View>
        </View>

        {data.vehicleSpeedKmh !== undefined && (
          <View style={styles.speedPill}>
            <Text style={styles.speedValue}>{data.vehicleSpeedKmh} km/h</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotGreen: {
    backgroundColor: TransitColors.liveGreen,
  },
  dotAmber: {
    backgroundColor: '#F59E0B',
  },
  metricLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: TransitColors.textMuted,
    letterSpacing: 0.5,
  },
  metricMainValue: {
    fontSize: 14,
    fontWeight: '800',
    color: TransitColors.textPrimary,
  },
  metricSubtext: {
    fontSize: 11,
    color: TransitColors.textSecondary,
    marginTop: 2,
  },
  telemetryBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E40AF',
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 1,
  },
  speedPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  speedValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },
});
