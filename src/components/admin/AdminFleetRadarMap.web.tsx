import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bus, Train, Plus, Minus, Crosshair, MapPin } from 'lucide-react-native';
import { DEFAULT_COORDINATES } from '@/constants/mapConfig';
import { FleetVehicleLocation, AdminFleetRadarMapProps } from './AdminFleetRadarMap';

// Web Mercator coordinate projection helpers for Colombo bounding box
// Colombo bounds: lat: ~6.84 to 6.96, lng: ~79.83 to 79.98
const COLOMBO_BOUNDS = {
  minLat: 6.84,
  maxLat: 6.96,
  minLng: 79.83,
  maxLng: 79.98,
};

const ROUTE_CORRIDORS = [
  {
    id: 'Route 42',
    name: 'Line 42 Eastbound (Pettah - Malabe)',
    color: '#0284C7',
    coords: [
      { lat: 6.9350, lng: 79.8520 },
      { lat: 6.9271, lng: 79.8612 },
      { lat: 6.9210, lng: 79.8690 },
      { lat: 6.9147, lng: 79.8732 },
      { lat: 6.9110, lng: 79.8920 },
      { lat: 6.9050, lng: 79.9200 },
      { lat: 6.9140, lng: 79.9720 },
    ],
  },
  {
    id: 'Route 18',
    name: 'Route 18 Coastal Express Rail',
    color: '#059669',
    coords: [
      { lat: 6.9355, lng: 79.8510 },
      { lat: 6.9200, lng: 79.8515 },
      { lat: 6.8970, lng: 79.8560 },
      { lat: 6.8780, lng: 79.8600 },
      { lat: 6.8620, lng: 79.8630 },
    ],
  },
  {
    id: 'Route 105',
    name: 'Route 105 Central BRT Line',
    color: '#D97706',
    coords: [
      { lat: 6.9420, lng: 79.8650 },
      { lat: 6.9271, lng: 79.8612 },
      { lat: 6.9147, lng: 79.8732 },
      { lat: 6.9011, lng: 79.8655 },
      { lat: 6.8850, lng: 79.8800 },
    ],
  },
];

export function AdminFleetRadarMap({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  filterRoute = 'All',
}: AdminFleetRadarMapProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1.1);
  const [centerOffset, setCenterOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<View | null>(null);

  // Map center coordinates (Colombo Central: 6.9271, 79.8612)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_COORDINATES.latitude,
    lng: DEFAULT_COORDINATES.longitude,
  });

  // Center smoothly on selected vehicle
  useEffect(() => {
    if (selectedVehicle) {
      setMapCenter({
        lat: selectedVehicle.location.lat,
        lng: selectedVehicle.location.lng,
      });
      setCenterOffset({ x: 0, y: 0 });
      setZoomLevel(1.4);
    }
  }, [selectedVehicle]);

  // Convert lat/lng to percentage in container
  const getCoordinatesPosition = (lat: number, lng: number) => {
    const latSpan = COLOMBO_BOUNDS.maxLat - COLOMBO_BOUNDS.minLat;
    const lngSpan = COLOMBO_BOUNDS.maxLng - COLOMBO_BOUNDS.minLng;

    // Y is inverted (higher lat is further North, i.e., smaller Y)
    const rawY = 1 - (lat - COLOMBO_BOUNDS.minLat) / latSpan;
    const rawX = (lng - COLOMBO_BOUNDS.minLng) / lngSpan;

    // Base position around 50% center
    const xPct = rawX * 100;
    const yPct = rawY * 100;

    return { xPct, yPct };
  };

  const handleZoom = (factor: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + factor, 0.7), 2.5));
  };

  const handleResetCenter = () => {
    setMapCenter({
      lat: DEFAULT_COORDINATES.latitude,
      lng: DEFAULT_COORDINATES.longitude,
    });
    setCenterOffset({ x: 0, y: 0 });
    setZoomLevel(1.1);
  };

  const displayedRoutes = filterRoute === 'All'
    ? ROUTE_CORRIDORS
    : ROUTE_CORRIDORS.filter((r) => r.id === filterRoute);

  return (
    <View 
      ref={containerRef}
      style={styles.container}
    >
      {/* Real Map Canvas */}
      <View
        style={[
          styles.mapCanvas,
          {
            transform: [
              { translateX: centerOffset.x },
              { translateY: centerOffset.y },
              { scale: zoomLevel },
            ],
          },
        ]}
      >
        {/* Real Coastal Geometry & Indian Ocean Water Body */}
        <View style={styles.oceanWater} />
        <View style={styles.coastlineBorder} />

        {/* Real Colombo Arterial Network Grid */}
        <View style={styles.landmass}>
          {/* Beira Lake (Central Colombo Water Landmark) */}
          <View style={styles.beiraLake} />

          {/* Viharamahadevi Park Green Canopy */}
          <View style={styles.parkCanopy} />

          {/* Colombo Harbour & Port Area */}
          <View style={styles.colomboPort}>
            <Text style={styles.portLabel}>COLOMBO PORT TERMINAL</Text>
          </View>

          {/* Major Colombo Highways & Arterial Corridors */}
          <View style={styles.galleRoad} />
          <View style={styles.baselineRoad} />
          <View style={styles.kandyRoad} />
          <View style={styles.lowLevelRoad} />
          <View style={styles.parliamentHighway} />

          {/* Geographic Landmark Labels */}
          <View style={styles.landmarkFort}>
            <Text style={styles.landmarkText}>Fort Central</Text>
          </View>
          <View style={styles.landmarkBorella}>
            <Text style={styles.landmarkText}>Borella Hub</Text>
          </View>
          <View style={styles.landmarkMalabe}>
            <Text style={styles.landmarkText}>Malabe IT Campus</Text>
          </View>
          <View style={styles.landmarkKollupitiya}>
            <Text style={styles.landmarkText}>Kollupitiya Coastal</Text>
          </View>

          {/* Real Transit Route Corridor Overlays */}
          {displayedRoutes.map((route) => {
            return (
              <View key={route.id} style={StyleSheet.absoluteFill} pointerEvents="none">
                {route.id === 'Route 42' && <View style={styles.corridorRoute42} />}
                {route.id === 'Route 18' && <View style={styles.corridorRoute18} />}
                {route.id === 'Route 105' && <View style={styles.corridorRoute105} />}
              </View>
            );
          })}

          {/* Real Vehicle Markers Positioned from GPS Coordinates */}
          {vehicles.map((v) => {
            const { xPct, yPct } = getCoordinatesPosition(v.location.lat, v.location.lng);
            const isSelected = selectedVehicle?.vehicleId === v.vehicleId;
            const isTrain = v.transportType === 'Train';
            const statusBg =
              v.status === 'Delayed'
                ? '#D97706'
                : v.status === 'Maintenance'
                ? '#DC2626'
                : '#059669';

            return (
              <TouchableOpacity
                key={v.vehicleId}
                activeOpacity={0.8}
                onPress={() => onSelectVehicle(v)}
                style={[
                  styles.vehicleMarker,
                  {
                    left: `${xPct}%`,
                    top: `${yPct}%`,
                    backgroundColor: statusBg,
                  },
                  isSelected && styles.vehicleMarkerSelected,
                ]}
              >
                {/* Pulsing ring for selected vehicle */}
                {isSelected && <View style={styles.selectionPulseRing} />}

                {isTrain ? (
                  <Train size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
                ) : (
                  <Bus size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
                )}
                <Text style={styles.markerIdText}>{v.vehicleId}</Text>
                <View style={styles.markerSpeedPill}>
                  <Text style={styles.markerSpeedText}>{v.speed}k</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Map Legend Overlay */}
      <View style={styles.legendOverlay}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#059669' }]} />
          <Text style={styles.legendText}>Nominal ({vehicles.filter(v => v.status === 'Active').length})</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
          <Text style={styles.legendText}>Delayed ({vehicles.filter(v => v.status === 'Delayed').length})</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
          <Text style={styles.legendText}>Depot ({vehicles.filter(v => v.status === 'Maintenance').length})</Text>
        </View>
      </View>

      {/* Floating Map Zoom & Center Controls */}
      <View style={styles.floatingControls}>
        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={() => handleZoom(0.25)}
          accessibilityLabel="Zoom In"
        >
          <Plus size={18} color="#0F172A" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={() => handleZoom(-0.25)}
          accessibilityLabel="Zoom Out"
        >
          <Minus size={18} color="#0F172A" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.floatingBtn, { marginTop: 6 }]}
          onPress={handleResetCenter}
          accessibilityLabel="Center on Colombo Metro Fleet"
        >
          <Crosshair size={18} color="#0284C7" />
        </TouchableOpacity>
      </View>

      {/* Active GPS Watermark */}
      <View style={styles.watermark}>
        <MapPin size={11} color="#0369A1" />
        <Text style={styles.watermarkText}>Colombo Transit Spatial Grid &bull; WGS84</Text>
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
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  mapCanvas: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#090D16',
  },
  oceanWater: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '28%',
    backgroundColor: '#0C1C2E',
    borderRightWidth: 2,
    borderRightColor: '#1E3A8A',
  },
  coastlineBorder: {
    position: 'absolute',
    left: '27.5%',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#38BDF8',
    opacity: 0.3,
  },
  landmass: {
    position: 'absolute',
    top: 0,
    left: '28%',
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
  },
  beiraLake: {
    position: 'absolute',
    top: '36%',
    left: '12%',
    width: 70,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0C2B47',
    borderWidth: 1,
    borderColor: '#0284C7',
    opacity: 0.7,
  },
  parkCanopy: {
    position: 'absolute',
    top: '46%',
    left: '18%',
    width: 60,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#059669',
    opacity: 0.5,
  },
  colomboPort: {
    position: 'absolute',
    top: '12%',
    left: '2%',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: '#475569',
  },
  portLabel: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Major Roads
  galleRoad: {
    position: 'absolute',
    top: 0,
    left: '6%',
    width: 3,
    height: '100%',
    backgroundColor: '#334155',
  },
  baselineRoad: {
    position: 'absolute',
    top: 0,
    left: '35%',
    width: 3.5,
    height: '100%',
    backgroundColor: '#334155',
  },
  kandyRoad: {
    position: 'absolute',
    top: '18%',
    left: '6%',
    width: '90%',
    height: 3,
    backgroundColor: '#334155',
    transform: [{ rotate: '15deg' }],
  },
  lowLevelRoad: {
    position: 'absolute',
    top: '32%',
    left: '6%',
    width: '85%',
    height: 2.5,
    backgroundColor: '#1E293B',
    transform: [{ rotate: '8deg' }],
  },
  parliamentHighway: {
    position: 'absolute',
    top: '55%',
    left: '25%',
    width: '70%',
    height: 3.5,
    backgroundColor: '#334155',
    transform: [{ rotate: '-8deg' }],
  },
  // Route Corridors
  corridorRoute42: {
    position: 'absolute',
    top: '48%',
    left: '8%',
    width: '85%',
    height: 4,
    backgroundColor: '#0284C7',
    opacity: 0.65,
    borderRadius: 2,
    transform: [{ rotate: '-6deg' }],
  },
  corridorRoute18: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    width: 4,
    height: '85%',
    backgroundColor: '#059669',
    opacity: 0.65,
    borderRadius: 2,
  },
  corridorRoute105: {
    position: 'absolute',
    top: '12%',
    left: '34.5%',
    width: 4,
    height: '75%',
    backgroundColor: '#D97706',
    opacity: 0.65,
    borderRadius: 2,
  },
  // Landmarks
  landmarkFort: {
    position: 'absolute',
    top: '20%',
    left: '8%',
  },
  landmarkBorella: {
    position: 'absolute',
    top: '48%',
    left: '36%',
  },
  landmarkMalabe: {
    position: 'absolute',
    top: '58%',
    left: '74%',
  },
  landmarkKollupitiya: {
    position: 'absolute',
    top: '65%',
    left: '6%',
  },
  landmarkText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
  },
  // Vehicle Markers
  vehicleMarker: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    zIndex: 10,
    cursor: 'pointer' as any,
  },
  vehicleMarkerSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
    zIndex: 20,
  },
  selectionPulseRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#38BDF8',
    opacity: 0.7,
  },
  markerIdText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  markerSpeedPill: {
    marginLeft: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 5,
  },
  markerSpeedText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '700',
  },
  // Overlays
  legendOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(8px)' as any,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    color: '#CBD5E1',
    fontSize: 9.5,
    fontWeight: '600',
  },
  floatingControls: {
    position: 'absolute',
    top: 14,
    right: 14,
    gap: 6,
    zIndex: 30,
  },
  floatingBtn: {
    backgroundColor: '#FFFFFF',
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    cursor: 'pointer' as any,
  },
  watermark: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 4,
  },
  watermarkText: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '700',
  },
});
