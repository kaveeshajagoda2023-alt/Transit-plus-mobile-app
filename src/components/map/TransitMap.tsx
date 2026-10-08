import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { Coordinate, TransitRoute } from '@/types/route';
import { Vehicle } from '@/types/vehicle';
import { VehicleMarker } from './VehicleMarker';
import { RoutePolyline } from './RoutePolyline';
import { CurrentLocationMarker } from './CurrentLocationMarker';
import { TRANSIT_MAP_STYLE, DEFAULT_COORDINATES } from '@/constants/mapConfig';

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
    const mapRef = useRef<MapView | null>(null);
    const currentRegionRef = useRef<Region>({
      latitude: userLocation.latitude || DEFAULT_COORDINATES.latitude,
      longitude: userLocation.longitude || DEFAULT_COORDINATES.longitude,
      latitudeDelta: DEFAULT_COORDINATES.latitudeDelta,
      longitudeDelta: DEFAULT_COORDINATES.longitudeDelta,
    });

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        if (!mapRef.current) return;
        const cur = currentRegionRef.current;
        const newDeltaLat = Math.max(cur.latitudeDelta / 1.8, 0.003);
        const newDeltaLng = Math.max(cur.longitudeDelta / 1.8, 0.003);
        mapRef.current.animateToRegion(
          {
            ...cur,
            latitudeDelta: newDeltaLat,
            longitudeDelta: newDeltaLng,
          },
          300
        );
      },
      zoomOut: () => {
        if (!mapRef.current) return;
        const cur = currentRegionRef.current;
        const newDeltaLat = Math.min(cur.latitudeDelta * 1.8, 0.2);
        const newDeltaLng = Math.min(cur.longitudeDelta * 1.8, 0.2);
        mapRef.current.animateToRegion(
          {
            ...cur,
            latitudeDelta: newDeltaLat,
            longitudeDelta: newDeltaLng,
          },
          300
        );
      },
      centerOnUser: () => {
        if (!mapRef.current) return;
        mapRef.current.animateToRegion(
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          },
          500
        );
      },
      animateToVehicle: (vehicle: Vehicle) => {
        if (!mapRef.current) return;
        mapRef.current.animateToRegion(
          {
            latitude: vehicle.latitude,
            longitude: vehicle.longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          },
          500
        );
      },
    }));

    const initialRegion: Region = {
      latitude: userLocation.latitude || DEFAULT_COORDINATES.latitude,
      longitude: userLocation.longitude || DEFAULT_COORDINATES.longitude,
      latitudeDelta: DEFAULT_COORDINATES.latitudeDelta,
      longitudeDelta: DEFAULT_COORDINATES.longitudeDelta,
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
          showsTraffic={false}
          showsIndoors={false}
          onRegionChangeComplete={(region) => {
            currentRegionRef.current = region;
          }}
          onPress={() => {
            if (selectedVehicle) {
              onSelectVehicle(null);
            }
          }}
        >
          {/* Route Polylines */}
          {routes.map((route) => (
            <RoutePolyline key={route.id} route={route} />
          ))}

          {/* User Location Marker */}
          {userLocation && <CurrentLocationMarker coordinate={userLocation} />}

          {/* Interactive Live Vehicle Markers */}
          {vehicles.map((vehicle) => (
            <VehicleMarker
              key={vehicle.id}
              vehicle={vehicle}
              isSelected={selectedVehicle?.id === vehicle.id}
              onPress={(v) => {
                onSelectVehicle(v);
              }}
            />
          ))}
        </MapView>
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
    backgroundColor: '#E0F2FE',
  },
  mapView: {
    width: '100%',
    height: '100%',
  },
});
