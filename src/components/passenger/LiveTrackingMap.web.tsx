import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Coordinate, TransitRoute } from '@/types/route';
import { Vehicle } from '@/types/vehicle';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

export interface LiveTrackingMapRef {
  centerOnVehicle: () => void;
  centerOnUser: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

interface LiveTrackingMapProps {
  vehicle: Vehicle;
  route: TransitRoute | null;
  vehiclePosition: Coordinate;
  vehicleSpeed: number;
  userLocation: Coordinate;
  nextStopName: string;
  nextStopDistanceMeters: number;
  onCenterPress?: () => void;
}

export const LiveTrackingMap = forwardRef<LiveTrackingMapRef, LiveTrackingMapProps>(
  (
    {
      vehicle,
      route,
      vehiclePosition,
      vehicleSpeed,
      userLocation,
      nextStopName,
      nextStopDistanceMeters,
      onCenterPress,
    },
    ref
  ) => {
    const isBus = vehicle.type === 'bus';
    const vehicleLabel = `Bus ${vehicle.routeNumber.replace(/Bus |Line /g, '')} • ${vehicleSpeed} km/h`;

    useImperativeHandle(ref, () => ({
      centerOnVehicle: () => {},
      centerOnUser: () => {},
      zoomIn: () => {},
      zoomOut: () => {},
    }));

    return (
      <View style={styles.container}>
        {/* Web Interactive Map Canvas */}
        <View style={styles.mapCanvas}>
          {/* Park Patches */}
          <View style={styles.parkOne} />
          <View style={styles.parkTwo} />

          {/* Road Grid */}
          <View style={styles.roadHorizontalOne} />
          <View style={styles.roadHorizontalTwo} />
          <View style={styles.roadVerticalOne} />
          <View style={styles.roadVerticalTwo} />
          <View style={styles.roadDiagonal} />

          {/* Street Labels */}
          <Text style={styles.streetLabelPine}>PINE ST</Text>
          <Text style={styles.streetLabelMarket}>MARKET ST</Text>

          {/* Route Polyline */}
          <View style={styles.routePolyline} />

          {/* Dotted Walking Line to Stop */}
          <View style={styles.dottedWalkingLine} />

          {/* User Location Marker with "You" Badge */}
          <View style={styles.userMarkerWrap}>
            <View style={styles.userCircleOuter}>
              <View style={styles.userCircleMiddle}>
                <View style={styles.userCircleCore} />
              </View>
            </View>
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>You</Text>
            </View>
          </View>

          {/* Target Stop Marker with Badge */}
          <View style={styles.stopMarkerWrap}>
            <View style={styles.stopCirclePin}>
              <View style={styles.stopInnerDot} />
            </View>
            <View style={styles.stopBadgePill}>
              <View style={styles.stopGreenDot} />
              <View style={styles.stopTextColumn}>
                <Text style={styles.stopNameText}>{nextStopName}</Text>
                <Text style={styles.stopDistanceText}>
                  Boarding in {nextStopDistanceMeters}m
                </Text>
              </View>
            </View>
          </View>

          {/* Live Moving Vehicle Marker */}
          <View style={styles.vehicleMarkerWrap}>
            <View style={styles.vehiclePillBadge}>
              <View style={styles.cyanDot} />
              <Text style={styles.vehiclePillText}>{vehicleLabel}</Text>
            </View>
            <View style={styles.vehicleCirclePin}>
              {isBus ? (
                <Ionicons name="bus" size={16} color="#FFFFFF" />
              ) : (
                <MaterialCommunityIcons name="train" size={16} color="#FFFFFF" />
              )}
              <View style={styles.directionalArrow} />
            </View>
          </View>
        </View>

        {/* Floating Right Map Controls */}
        <View style={styles.floatingControls}>
          <TouchableOpacity
            style={styles.mapCtrlBtn}
            onPress={onCenterPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Center on tracked vehicle"
          >
            <MaterialCommunityIcons name="crosshairs-gps" size={20} color={TransitColors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapCtrlBtn}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Center on your location"
          >
            <Feather name="user" size={18} color={TransitColors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

LiveTrackingMap.displayName = 'LiveTrackingMap';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#EEF2F6',
  },
  mapCanvas: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#E8F1F5',
  },
  parkOne: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 140,
    height: 180,
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    opacity: 0.6,
  },
  parkTwo: {
    position: 'absolute',
    bottom: 240,
    left: 20,
    width: 120,
    height: 100,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    opacity: 0.5,
  },
  roadHorizontalOne: {
    position: 'absolute',
    top: 220,
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  roadHorizontalTwo: {
    position: 'absolute',
    top: 360,
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  roadVerticalOne: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 100,
    width: 14,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  roadVerticalTwo: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 120,
    width: 14,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  roadDiagonal: {
    position: 'absolute',
    top: 200,
    left: 60,
    width: 280,
    height: 12,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '35deg' }],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  streetLabelPine: {
    position: 'absolute',
    top: 204,
    left: 64,
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  streetLabelMarket: {
    position: 'absolute',
    top: 344,
    left: 160,
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  routePolyline: {
    position: 'absolute',
    top: 250,
    left: 180,
    width: 140,
    height: 5,
    backgroundColor: '#0F2942',
    transform: [{ rotate: '45deg' }],
  },
  dottedWalkingLine: {
    position: 'absolute',
    top: 375,
    left: 185,
    width: 50,
    height: 2,
    backgroundColor: '#0D9488',
    borderStyle: 'dashed',
  },
  userMarkerWrap: {
    position: 'absolute',
    top: 350,
    left: 155,
    alignItems: 'center',
    zIndex: 10,
  },
  userCircleOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(13, 148, 136, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCircleMiddle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D9488',
  },
  userCircleCore: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0D9488',
  },
  youBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    ...TransitShadows.marker,
  },
  youBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: TransitColors.primary,
  },
  stopMarkerWrap: {
    position: 'absolute',
    top: 360,
    left: 230,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 12,
  },
  stopCirclePin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#0F2942',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    ...TransitShadows.marker,
  },
  stopInnerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0F2942',
  },
  stopBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    ...TransitShadows.floating,
  },
  stopGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TransitColors.liveGreen,
  },
  stopTextColumn: {
    justifyContent: 'center',
  },
  stopNameText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: TransitColors.textPrimary,
  },
  stopDistanceText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#0D9488',
    marginTop: 1,
  },
  vehicleMarkerWrap: {
    position: 'absolute',
    top: 215,
    left: 170,
    alignItems: 'center',
    zIndex: 15,
  },
  vehiclePillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2942',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginBottom: 4,
    gap: 5,
    ...TransitShadows.marker,
  },
  cyanDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06B6D4',
  },
  vehiclePillText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  vehicleCirclePin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0F2942',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'relative',
    ...TransitShadows.marker,
  },
  directionalArrow: {
    position: 'absolute',
    bottom: -4,
    right: -2,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#06B6D4',
    transform: [{ rotate: '135deg' }],
  },
  floatingControls: {
    position: 'absolute',
    right: 16,
    bottom: 330,
    gap: 10,
    zIndex: 20,
  },
  mapCtrlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.floating,
  },
});
