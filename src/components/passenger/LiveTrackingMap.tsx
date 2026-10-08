import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Coordinate, TransitRoute } from '@/types/route';
import { Vehicle } from '@/types/vehicle';
import { TRANSIT_MAP_STYLE, DEFAULT_COORDINATES } from '@/constants/mapConfig';
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
    const mapRef = useRef<MapView | null>(null);

    const isBus = vehicle.type === 'bus';
    const vehicleLabel = `Bus ${vehicle.routeNumber.replace(/Bus |Line /g, '')} • ${vehicleSpeed} km/h`;

    const targetStopCoordinate: Coordinate =
      route?.stops?.find((s) => s.isBoarding)?.coordinate ||
      route?.stops?.[1]?.coordinate || {
        latitude: 6.9255,
        longitude: 79.8590,
      };

    const initialRegion: Region = {
      latitude: (vehiclePosition.latitude + targetStopCoordinate.latitude) / 2 || DEFAULT_COORDINATES.latitude,
      longitude: (vehiclePosition.longitude + targetStopCoordinate.longitude) / 2 || DEFAULT_COORDINATES.longitude,
      latitudeDelta: 0.014,
      longitudeDelta: 0.014,
    };

    useImperativeHandle(ref, () => ({
      centerOnVehicle: () => {
        if (!mapRef.current) return;
        mapRef.current.animateToRegion(
          {
            latitude: vehiclePosition.latitude,
            longitude: vehiclePosition.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          400
        );
      },
      centerOnUser: () => {
        if (!mapRef.current) return;
        mapRef.current.animateToRegion(
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          },
          400
        );
      },
      zoomIn: () => {},
      zoomOut: () => {},
    }));

    const handleRecenterVehicle = () => {
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: vehiclePosition.latitude,
            longitude: vehiclePosition.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          400
        );
      }
      onCenterPress && onCenterPress();
    };

    const handleRecenterUser = () => {
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          },
          400
        );
      }
    };

    return (
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.mapView}
          provider={PROVIDER_DEFAULT}
          initialRegion={initialRegion}
          customMapStyle={TRANSIT_MAP_STYLE}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          showsBuildings={true}
        >
          {/* Selected Route Polyline */}
          {route?.coordinates && route.coordinates.length > 1 && (
            <Polyline
              coordinates={route.coordinates}
              strokeColor="#0F2942"
              strokeWidth={5}
            />
          )}

          {/* Dotted Walking Path from User to Boarding/Target Stop */}
          {userLocation && (
            <Polyline
              coordinates={[userLocation, targetStopCoordinate]}
              strokeColor="#0D9488"
              strokeWidth={3}
              lineDashPattern={[6, 5]}
            />
          )}

          {/* Current User Marker with "You" badge */}
          {userLocation && (
            <Marker
              coordinate={userLocation}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
            >
              <View style={styles.userMarkerContainer}>
                <View style={styles.userCircleOuter}>
                  <View style={styles.userCircleMiddle}>
                    <View style={styles.userCircleCore} />
                  </View>
                </View>
                <View style={styles.youBadge}>
                  <Text style={styles.youBadgeText}>You</Text>
                </View>
              </View>
            </Marker>
          )}

          {/* Next / Target Stop Marker with Badge */}
          <Marker
            coordinate={targetStopCoordinate}
            anchor={{ x: 0.2, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.stopMarkerContainer}>
              <View style={styles.stopCirclePin}>
                <View style={styles.stopInnerDot} />
              </View>

              <View style={styles.stopBadgePill}>
                <View style={styles.stopGreenDot} />
                <View style={styles.stopTextColumn}>
                  <Text style={styles.stopNameText} numberOfLines={1}>
                    {nextStopName}
                  </Text>
                  <Text style={styles.stopDistanceText}>
                    Boarding in {nextStopDistanceMeters}m
                  </Text>
                </View>
              </View>
            </View>
          </Marker>

          {/* Live Moving Vehicle Marker */}
          <Marker
            coordinate={vehiclePosition}
            anchor={{ x: 0.5, y: 0.8 }}
            tracksViewChanges={false}
          >
            <View style={styles.vehicleMarkerWrap}>
              {/* Badge above icon */}
              <View style={styles.vehiclePillBadge}>
                <View style={styles.cyanDot} />
                <Text style={styles.vehiclePillText}>{vehicleLabel}</Text>
              </View>

              {/* Main Circular Vehicle Icon Marker */}
              <View style={styles.vehicleCirclePin}>
                {isBus ? (
                  <Ionicons name="bus" size={16} color="#FFFFFF" />
                ) : (
                  <MaterialCommunityIcons name="train" size={16} color="#FFFFFF" />
                )}
                <View style={styles.directionalArrow} />
              </View>
            </View>
          </Marker>
        </MapView>

        {/* Floating Right Map Controls */}
        <View style={styles.floatingControls}>
          <TouchableOpacity
            style={styles.mapCtrlBtn}
            onPress={handleRecenterVehicle}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Center on tracked vehicle"
          >
            <MaterialCommunityIcons name="crosshairs-gps" size={20} color={TransitColors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapCtrlBtn}
            onPress={handleRecenterUser}
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
    backgroundColor: '#E2E8F0',
  },
  mapView: {
    width: '100%',
    height: '100%',
  },
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCircleOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(13, 148, 136, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCircleMiddle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D9488',
  },
  userCircleCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    fontSize: 10,
    fontWeight: '800',
    color: TransitColors.primary,
  },
  stopMarkerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopCirclePin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#0F2942',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    ...TransitShadows.marker,
  },
  stopInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0F2942',
  },
  stopBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    ...TransitShadows.floating,
  },
  stopGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: TransitColors.liveGreen,
  },
  stopTextColumn: {
    justifyContent: 'center',
  },
  stopNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: TransitColors.textPrimary,
  },
  stopDistanceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0D9488',
    marginTop: 1,
  },
  vehicleMarkerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehiclePillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2942',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginBottom: 4,
    gap: 6,
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
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  vehicleCirclePin: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    borderBottomWidth: 7,
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
    zIndex: 15,
  },
  mapCtrlBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.floating,
  },
});
