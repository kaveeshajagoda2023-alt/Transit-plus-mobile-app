import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteDetails, Coordinate } from '@/types/route';
import { TRANSIT_MAP_STYLE } from '@/constants/mapConfig';
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
  const mapRef = useRef<MapView | null>(null);

  const isBus = route.serviceType === 'bus';
  const badgeBg = isBus ? TransitColors.busBadge : TransitColors.trainBadgeSecondary;

  const vehicleLabel = `${route.routeNumber} • Moving ${vehicleSpeed} km/h`;

  const initialRegion: Region = {
    latitude: (vehiclePosition.latitude + route.boardingStop.coordinate.latitude) / 2 || 6.9260,
    longitude: (vehiclePosition.longitude + route.boardingStop.coordinate.longitude) / 2 || 79.8600,
    latitudeDelta: 0.018,
    longitudeDelta: 0.018,
  };

  const handleCenter = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: vehiclePosition.latitude,
          longitude: vehiclePosition.longitude,
          latitudeDelta: 0.014,
          longitudeDelta: 0.014,
        },
        400
      );
    }
    onCenterMap();
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        customMapStyle={TRANSIT_MAP_STYLE}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        rotateEnabled={false}
      >
        {/* Route Polyline */}
        {route.coordinates && route.coordinates.length > 1 && (
          <Polyline
            coordinates={route.coordinates}
            strokeColor={isBus ? '#0F2942' : '#0D9488'}
            strokeWidth={4.5}
            lineDashPattern={isBus ? [6, 4] : undefined}
          />
        )}

        {/* Boarding Stop Marker */}
        <Marker
          coordinate={route.boardingStop.coordinate}
          anchor={{ x: 0.5, y: 1 }}
          tracksViewChanges={false}
        >
          <View style={styles.boardingMarkerWrap}>
            <View style={styles.boardingPill}>
              <View style={styles.boardingIconDot} />
              <Text style={styles.boardingText} numberOfLines={1}>
                Boarding: {route.boardingStop.name}
              </Text>
            </View>
            <View style={styles.boardingPinPoint} />
          </View>
        </Marker>

        {/* User Location Marker (if available) */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.userLocationWrap}>
              <View style={styles.userHalo} />
              <View style={styles.userCore} />
            </View>
          </Marker>
        )}

        {/* Live Moving Vehicle Marker */}
        <Marker
          coordinate={vehiclePosition}
          anchor={{ x: 0.5, y: 0.85 }}
          tracksViewChanges={false}
        >
          <View style={styles.vehicleMarkerWrap}>
            <View style={[styles.vehiclePill, { backgroundColor: badgeBg }]}>
              {isBus ? (
                <Ionicons name="bus" size={12} color="#FFFFFF" style={styles.vehIcon} />
              ) : (
                <MaterialCommunityIcons name="train" size={12} color="#FFFFFF" style={styles.vehIcon} />
              )}
              <Text style={styles.vehicleLabelText} numberOfLines={1}>
                {vehicleLabel}
              </Text>
            </View>
            <View style={[styles.arrowPointer, { borderTopColor: badgeBg }]} />
            <View style={styles.pulseDot} />
          </View>
        </Marker>
      </MapView>

      {/* Floating Map Controls */}
      <View style={styles.controlsWrap}>
        {/* Re-Center Button */}
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handleCenter}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Center on vehicle"
        >
          <Feather name="crosshair" size={18} color={TransitColors.primary} />
        </TouchableOpacity>

        {/* Expand Map Button */}
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={onExpandMap}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Expand tracking view"
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
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
    position: 'relative',
    ...TransitShadows.card,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  boardingMarkerWrap: {
    alignItems: 'center',
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
  boardingIconDot: {
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
  boardingPinPoint: {
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
  vehicleMarkerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: TransitColors.liveGreen,
    position: 'absolute',
    top: 2,
    right: 2,
  },
  userLocationWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userHalo: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
  },
  userCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
