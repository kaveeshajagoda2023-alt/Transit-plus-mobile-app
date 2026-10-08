import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteDetails, Coordinate } from '@/types/route';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface RouteDetailsMapProps {
  route: RouteDetails;
  vehiclePosition: Coordinate;
  vehicleSpeed: number;
  userLocation?: Coordinate | null;
  onExpandMap: () => void;
  onCenterMap: () => void;
}

export const RouteDetailsMap: React.FC<RouteDetailsMapProps> = ({
  route,
  vehiclePosition,
  vehicleSpeed,
  userLocation,
  onExpandMap,
  onCenterMap,
}) => {
  const isBus = route.serviceType === 'bus';
  const badgeBg = isBus ? TransitColors.busBadge : TransitColors.trainBadgeSecondary;
  const vehicleLabel = `${route.routeNumber} • Moving ${vehicleSpeed} km/h`;

  return (
    <View style={styles.container}>
      {/* Visual Simulated Map Background Canvas */}
      <View style={styles.mapCanvas}>
        {/* Park Patch */}
        <View style={styles.parkPatch} />

        {/* Road Grid */}
        <View style={styles.roadHorizontal} />
        <View style={styles.roadVertical} />
        <View style={styles.roadDiagonal} />

        {/* Route Polyline */}
        <View style={styles.routePolyline} />

        {/* Boarding Stop Badge */}
        <View style={styles.boardingStopBadgeWrap}>
          <View style={styles.boardingPill}>
            <View style={styles.boardingDot} />
            <Text style={styles.boardingText}>
              Boarding: {route.boardingStop.name}
            </Text>
          </View>
          <View style={styles.boardingPin} />
        </View>

        {/* User Location Pulse */}
        <View style={styles.userWrap}>
          <View style={styles.userHalo} />
          <View style={styles.userCore} />
        </View>

        {/* Moving Live Vehicle Marker */}
        <View style={styles.vehicleMarkerWrap}>
          <View style={[styles.vehiclePill, { backgroundColor: badgeBg }]}>
            {isBus ? (
              <Ionicons name="bus" size={12} color="#FFFFFF" style={styles.vehIcon} />
            ) : (
              <MaterialCommunityIcons name="train" size={12} color="#FFFFFF" style={styles.vehIcon} />
            )}
            <Text style={styles.vehicleLabelText}>{vehicleLabel}</Text>
          </View>
          <View style={[styles.arrowPointer, { borderTopColor: badgeBg }]} />
          <View style={styles.pulseDot} />
        </View>
      </View>

      {/* Floating Controls */}
      <View style={styles.controlsWrap}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={onCenterMap}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Center map"
        >
          <Feather name="crosshair" size={18} color={TransitColors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={onExpandMap}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Expand map"
        >
          <Feather name="maximize-2" size={17} color={TransitColors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 220,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#EEF2F6',
    marginBottom: 16,
    position: 'relative',
    ...TransitShadows.card,
  },
  mapCanvas: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#E8F1F5',
  },
  parkPatch: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 100,
    height: 80,
    backgroundColor: '#DCFCE7',
    borderRadius: 14,
    opacity: 0.7,
  },
  roadHorizontal: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  roadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 140,
    width: 14,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  roadDiagonal: {
    position: 'absolute',
    top: 30,
    left: 60,
    width: 260,
    height: 12,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '25deg' }],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  routePolyline: {
    position: 'absolute',
    top: 115,
    left: 30,
    width: 250,
    height: 4,
    backgroundColor: '#0F2942',
    borderRadius: 2,
  },
  boardingStopBadgeWrap: {
    position: 'absolute',
    top: 60,
    left: 30,
    alignItems: 'center',
    zIndex: 5,
  },
  boardingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2942',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    gap: 5,
    ...TransitShadows.marker,
  },
  boardingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  boardingText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  boardingPin: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0F2942',
    alignSelf: 'center',
  },
  userWrap: {
    position: 'absolute',
    top: 105,
    left: 135,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
  },
  userHalo: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
  },
  userCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  vehicleMarkerWrap: {
    position: 'absolute',
    top: 130,
    left: 110,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
    ...TransitShadows.marker,
  },
  vehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  vehIcon: {
    marginRight: 4,
  },
  vehicleLabelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  arrowPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
    marginTop: -1,
  },
  pulseDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: TransitColors.liveGreen,
    position: 'absolute',
    top: 2,
    right: 2,
  },
  controlsWrap: {
    position: 'absolute',
    right: 12,
    top: 12,
    gap: 8,
    zIndex: 10,
  },
  controlBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.floating,
  },
});
