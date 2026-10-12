import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { Bus, Train, Plus, Minus, Crosshair } from 'lucide-react-native';
import { TRANSIT_MAP_STYLE, DEFAULT_COORDINATES } from '@/constants/mapConfig';

export interface FleetVehicleLocation {
  vehicleId: string;
  routeId: string;
  routeName: string;
  transportType: 'Bus' | 'Train';
  driverName: string;
  driverId?: string;
  speed: number;
  location: {
    lat: number;
    lng: number;
  };
  occupancyCurrent: number;
  occupancyMax: number;
  status: 'Active' | 'Delayed' | 'Maintenance';
  healthScore?: number;
  nextInspection?: string;
}

export interface AdminFleetRadarMapProps {
  vehicles: FleetVehicleLocation[];
  selectedVehicle: FleetVehicleLocation | null;
  onSelectVehicle: (vehicle: FleetVehicleLocation | null) => void;
  filterRoute?: string;
}

// Major transit route corridors in Colombo metropolitan area
const ROUTE_CORRIDORS = [
  {
    id: 'Route 42',
    name: 'Line 42 Eastbound (Pettah - Malabe)',
    color: '#0284C7',
    coords: [
      { latitude: 6.9350, longitude: 79.8520 }, // Pettah / Fort Terminal
      { latitude: 6.9271, longitude: 79.8612 }, // Central Metro Hub
      { latitude: 6.9210, longitude: 79.8690 }, // Town Hall
      { latitude: 6.9147, longitude: 79.8732 }, // Borella Junction
      { latitude: 6.9110, longitude: 79.8920 }, // Rajagiriya
      { latitude: 6.9050, longitude: 79.9200 }, // Battaramulla
      { latitude: 6.9140, longitude: 79.9720 }, // Malabe IT Park
    ],
  },
  {
    id: 'Route 18',
    name: 'Route 18 Coastal Express Rail',
    color: '#059669',
    coords: [
      { latitude: 6.9355, longitude: 79.8510 }, // Colombo Fort Railway Station
      { latitude: 6.9200, longitude: 79.8515 }, // Kollupitiya
      { latitude: 6.8970, longitude: 79.8560 }, // Bambalapitiya
      { latitude: 6.8780, longitude: 79.8600 }, // Wellawatte
      { latitude: 6.8620, longitude: 79.8630 }, // Dehiwala
    ],
  },
  {
    id: 'Route 105',
    name: 'Route 105 Central BRT Line',
    color: '#D97706',
    coords: [
      { latitude: 6.9420, longitude: 79.8650 }, // Grandpass / Colombo North
      { latitude: 6.9271, longitude: 79.8612 }, // Central Metro Hub
      { latitude: 6.9147, longitude: 79.8732 }, // Baseline Road Borella
      { latitude: 6.9011, longitude: 79.8655 }, // Narahenpita Depot
      { latitude: 6.8850, longitude: 79.8800 }, // Nugegoda
    ],
  },
];

export function AdminFleetRadarMap({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  filterRoute = 'All',
}: AdminFleetRadarMapProps) {
  const mapRef = useRef<MapView | null>(null);

  const initialRegion: Region = {
    latitude: selectedVehicle?.location.lat || DEFAULT_COORDINATES.latitude,
    longitude: selectedVehicle?.location.lng || DEFAULT_COORDINATES.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    if (selectedVehicle && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: selectedVehicle.location.lat,
          longitude: selectedVehicle.location.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );
    }
  }, [selectedVehicle]);

  const handleZoom = (factor: number) => {
    if (!mapRef.current) return;
    mapRef.current.getCamera().then((cam) => {
      if (cam && mapRef.current) {
        mapRef.current.animateCamera({
          zoom: (cam.zoom || 13) + factor,
        }, { duration: 300 });
      }
    }).catch(() => {});
  };

  const handleCenterFleet = () => {
    if (!mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: DEFAULT_COORDINATES.latitude,
        longitude: DEFAULT_COORDINATES.longitude,
        latitudeDelta: 0.055,
        longitudeDelta: 0.055,
      },
      500
    );
  };

  const displayedRoutes = filterRoute === 'All'
    ? ROUTE_CORRIDORS
    : ROUTE_CORRIDORS.filter((r) => r.id === filterRoute);

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
        showsCompass={true}
        showsScale={true}
        showsBuildings={true}
        showsTraffic={false}
        onPress={() => {
          if (selectedVehicle) onSelectVehicle(null);
        }}
      >
        {/* Active Transit Corridors */}
        {displayedRoutes.map((route) => (
          <Polyline
            key={route.id}
            coordinates={route.coords}
            strokeColor={route.color}
            strokeWidth={4}
            lineDashPattern={route.id === 'Route 18' ? undefined : [6, 4]}
            zIndex={2}
          />
        ))}

        {/* Real Dynamic Vehicle Markers */}
        {vehicles.map((v) => {
          const isSelected = selectedVehicle?.vehicleId === v.vehicleId;
          const isTrain = v.transportType === 'Train';
          const statusBg =
            v.status === 'Delayed'
              ? '#D97706'
              : v.status === 'Maintenance'
              ? '#DC2626'
              : '#059669';

          return (
            <Marker
              key={v.vehicleId}
              coordinate={{
                latitude: v.location.lat,
                longitude: v.location.lng,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
              onPress={() => onSelectVehicle(v)}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onSelectVehicle(v)}
                style={[
                  styles.markerBubble,
                  { backgroundColor: statusBg },
                  isSelected && styles.markerBubbleSelected,
                ]}
              >
                {isTrain ? (
                  <Train size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
                ) : (
                  <Bus size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
                )}
                <Text style={styles.markerText}>{v.vehicleId}</Text>
                <View style={styles.speedPill}>
                  <Text style={styles.speedText}>{v.speed}k</Text>
                </View>
              </TouchableOpacity>
            </Marker>
          );
        })}
      </MapView>

      {/* Floating Map Controls */}
      <View style={styles.controlsWrap}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => handleZoom(1)}
          accessibilityLabel="Zoom In"
        >
          <Plus size={18} color="#0F172A" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => handleZoom(-1)}
          accessibilityLabel="Zoom Out"
        >
          <Minus size={18} color="#0F172A" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, { marginTop: 6 }]}
          onPress={handleCenterFleet}
          accessibilityLabel="Center Fleet Radar"
        >
          <Crosshair size={18} color="#0284C7" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 5,
  },
  markerBubbleSelected: {
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  speedPill: {
    marginLeft: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  speedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  controlsWrap: {
    position: 'absolute',
    top: 14,
    right: 14,
    gap: 6,
  },
  controlBtn: {
    backgroundColor: '#FFFFFF',
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
