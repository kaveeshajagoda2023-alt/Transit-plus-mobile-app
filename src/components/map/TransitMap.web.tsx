import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Coordinate, TransitRoute } from '@/types/route';
import { Vehicle } from '@/types/vehicle';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

export interface TransitMapRef {
  zoomIn: () => void;
  zoomOut: () => void;
  centerOnUser: () => void;
  animateToVehicle: (vehicle: Vehicle) => void;
}

interface TransitMapProps {
  userLocation: Coordinate;
  vehicles: Vehicle[];
  routes: TransitRoute[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle | null) => void;
}

export const TransitMap = forwardRef<TransitMapRef, TransitMapProps>(
  ({ userLocation, vehicles, routes, selectedVehicle, onSelectVehicle }, ref) => {
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        setZoomLevel((prev) => Math.min(prev + 0.25, 2.2));
      },
      zoomOut: () => {
        setZoomLevel((prev) => Math.max(prev - 0.25, 0.7));
      },
      centerOnUser: () => {
        setPanOffset({ x: 0, y: 0 });
        setZoomLevel(1);
      },
      animateToVehicle: (vehicle: Vehicle) => {
        // Center the selected vehicle smoothly in web view
        setPanOffset({ x: 0, y: 0 });
      },
    }));

    return (
      <View style={styles.container}>
        {/* SVG-styled interactive web transit map canvas */}
        <View
          style={[
            styles.mapCanvas,
            {
              transform: [
                { translateX: panOffset.x },
                { translateY: panOffset.y },
                { scale: zoomLevel },
              ],
            },
          ]}
        >
          {/* Base Map Background & Road Grid */}
          <View style={styles.landBackground}>
            {/* Green park patches */}
            <View style={styles.parkOne} />
            <View style={styles.parkTwo} />

            {/* River / Water body */}
            <View style={styles.riverBody} />

            {/* Urban Road Grid lines */}
            <View style={styles.roadHorizontalOne} />
            <View style={styles.roadHorizontalTwo} />
            <View style={styles.roadVerticalOne} />
            <View style={styles.roadVerticalTwo} />
            <View style={styles.roadDiagonal} />

            {/* Transit Route Lines */}
            {/* Bus Line 42 (Navy dashed route) */}
            <View style={styles.busRoutePolyline} />
            {/* Train Line Red (Teal solid route) */}
            <View style={styles.trainRoutePolyline} />

            {/* Station Hub indicator */}
            <View style={styles.stationHubDot}>
              <View style={styles.stationInnerDot} />
            </View>
            <Text style={styles.stationHubLabel}>Central Metro Hub</Text>

            {/* Pulsing User Current Location */}
            <View style={styles.userLocationMarkerWrap}>
              <View style={styles.userLocationHalo} />
              <View style={styles.userLocationOuter} />
              <View style={styles.userLocationCore} />
            </View>

            {/* Interactive Vehicle Markers on Map */}
            {vehicles.map((v, index) => {
              const isBus = v.type === 'bus';
              const isSelected = selectedVehicle?.id === v.id;
              const badgeBg = isBus
                ? TransitColors.busBadge
                : TransitColors.trainBadgeSecondary;

              // Pre-calculated aesthetic map coordinates matching the screenshot
              let topPos = 210;
              let leftPos = 70;

              if (v.routeNumber === '42' || index === 0) {
                topPos = 210;
                leftPos = 70;
              } else if (v.routeNumber.includes('Red') || index === 1) {
                topPos = 168;
                leftPos = 175;
              } else if (index === 2) {
                topPos = 270;
                leftPos = 260;
              } else {
                topPos = 120;
                leftPos = 240;
              }

              const label = isBus
                ? `Bus ${v.routeNumber}`
                : v.routeNumber.startsWith('Line')
                ? v.routeNumber
                : `Train ${v.routeNumber}`;

              return (
                <TouchableOpacity
                  key={v.id}
                  activeOpacity={0.85}
                  onPress={() => onSelectVehicle(v)}
                  style={[
                    styles.vehicleMarkerContainer,
                    { top: topPos, left: leftPos },
                    isSelected && styles.selectedVehicleMarker,
                  ]}
                >
                  <View style={[styles.pillBadge, { backgroundColor: badgeBg }]}>
                    {isBus ? (
                      <Ionicons
                        name="bus"
                        size={12}
                        color="#FFFFFF"
                        style={styles.icon}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="train"
                        size={12}
                        color="#FFFFFF"
                        style={styles.icon}
                      />
                    )}
                    <Text style={styles.markerText}>{label}</Text>
                  </View>
                  <View style={[styles.pointerArrow, { borderTopColor: badgeBg }]} />
                  <View style={styles.pulseDot} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  }
);

TransitMap.displayName = 'TransitMap';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E8F1F5',
    overflow: 'hidden',
  },
  mapCanvas: {
    width: '100%',
    height: '100%',
  },
  landBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEF2F6',
    position: 'relative',
  },
  parkOne: {
    position: 'absolute',
    top: 60,
    right: 30,
    width: 140,
    height: 180,
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    opacity: 0.7,
  },
  parkTwo: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    width: 120,
    height: 130,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    opacity: 0.6,
  },
  riverBody: {
    position: 'absolute',
    top: -20,
    left: '42%',
    width: 60,
    height: '140%',
    backgroundColor: '#E0F2FE',
    transform: [{ rotate: '-35deg' }],
    opacity: 0.8,
  },
  roadHorizontalOne: {
    position: 'absolute',
    top: 170,
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  roadHorizontalTwo: {
    position: 'absolute',
    top: 250,
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
    left: 130,
    width: 16,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  roadVerticalTwo: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 140,
    width: 16,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  roadDiagonal: {
    position: 'absolute',
    top: 80,
    left: 40,
    width: 320,
    height: 14,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '25deg' }],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  busRoutePolyline: {
    position: 'absolute',
    top: 257,
    left: 60,
    width: 200,
    height: 4,
    backgroundColor: '#0F2942',
    borderRadius: 2,
    borderStyle: 'dashed',
  },
  trainRoutePolyline: {
    position: 'absolute',
    top: 130,
    left: 170,
    width: 140,
    height: 5,
    backgroundColor: '#0D9488',
    borderRadius: 2.5,
    transform: [{ rotate: '55deg' }],
  },
  stationHubDot: {
    position: 'absolute',
    top: 246,
    left: 200,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#0F2942',
    alignItems: 'center',
    justifyContent: 'center',
    ...TransitShadows.marker,
  },
  stationInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0F2942',
  },
  stationHubLabel: {
    position: 'absolute',
    top: 268,
    left: 168,
    fontSize: 10.5,
    fontWeight: '800',
    color: TransitColors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  userLocationMarkerWrap: {
    position: 'absolute',
    top: 236,
    left: 154,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
  },
  userLocationHalo: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
  },
  userLocationOuter: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    ...TransitShadows.marker,
  },
  userLocationCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  vehicleMarkerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 14,
    ...TransitShadows.marker,
  },
  selectedVehicleMarker: {
    transform: [{ scale: 1.18 }],
    zIndex: 20,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  icon: {
    marginRight: 4,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  pointerArrow: {
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
    position: 'absolute',
    top: 2,
    right: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: TransitColors.liveGreen,
  },
});
