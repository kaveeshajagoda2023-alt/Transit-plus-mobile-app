import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Navigation, User, Gauge, Users, ShieldCheck, Radio, X, ChevronRight, RefreshCw } from 'lucide-react-native';
import { AdminFleetRadarMap, FleetVehicleLocation } from '@/components/admin/AdminFleetRadarMap';
import { getAdminApiUrl } from '@/services/utils/adminApiUrl';
import { adminDataStorage } from '@/services/storage/adminDataStorage';

// High-fidelity fallback vehicles with real Colombo coordinates
const DEFAULT_FALLBACK_VEHICLES: FleetVehicleLocation[] = [
  {
    vehicleId: 'TN-0821',
    routeId: 'Route 42',
    routeName: 'Line 42 Eastbound (Pettah - Malabe)',
    transportType: 'Bus',
    driverName: 'Saran Diya',
    driverId: 'DRV-401',
    speed: 42,
    location: { lat: 6.9271, lng: 79.8612 },
    occupancyCurrent: 36,
    occupancyMax: 50,
    status: 'Active',
    healthScore: 94,
    nextInspection: '24 Oct 2026',
  },
  {
    vehicleId: 'TN-0824',
    routeId: 'Route 42',
    routeName: 'Line 42 Eastbound (Market St to Malabe)',
    transportType: 'Bus',
    driverName: 'Kavithushan B.',
    driverId: 'DRV-102',
    speed: 18,
    location: { lat: 6.9147, lng: 79.8732 },
    occupancyCurrent: 48,
    occupancyMax: 50,
    status: 'Delayed',
    healthScore: 82,
    nextInspection: '19 Oct 2026',
  },
  {
    vehicleId: 'TN-0830',
    routeId: 'Route 18',
    routeName: 'Route 18 Express Train',
    transportType: 'Train',
    driverName: 'Anura Bandara',
    driverId: 'DRV-809',
    speed: 65,
    location: { lat: 6.9344, lng: 79.8500 },
    occupancyCurrent: 120,
    occupancyMax: 200,
    status: 'Active',
    healthScore: 98,
    nextInspection: '28 Oct 2026',
  },
  {
    vehicleId: 'TN-0842',
    routeId: 'Route 105',
    routeName: 'Route 105 BRT Bus',
    transportType: 'Bus',
    driverName: 'Nimal Perera',
    driverId: 'DRV-304',
    speed: 0,
    location: { lat: 6.9011, lng: 79.8655 },
    occupancyCurrent: 0,
    occupancyMax: 50,
    status: 'Maintenance',
    healthScore: 64,
    nextInspection: 'Immediate Inspection',
  },
  {
    vehicleId: 'TN-0855',
    routeId: 'Route 42',
    routeName: 'Line 42 Westbound',
    transportType: 'Bus',
    driverName: 'Kamal Silva',
    driverId: 'DRV-220',
    speed: 38,
    location: { lat: 6.9200, lng: 79.8800 },
    occupancyCurrent: 24,
    occupancyMax: 50,
    status: 'Active',
    healthScore: 91,
    nextInspection: '22 Oct 2026',
  },
];

export default function FleetRadarScreen() {
  const router = useRouter();
  const [filterRoute, setFilterRoute] = useState('All');
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicleLocation | null>(null);
  const [vehicles, setVehicles] = useState<FleetVehicleLocation[]>(DEFAULT_FALLBACK_VEHICLES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('Syncing...');

  const fetchFleetVehicles = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsRefreshing(true);
      const res = await fetch(getAdminApiUrl('/api/admin/fleet/vehicles'));
      if (res.ok) {
        const data = await res.json();
        if (data?.vehicles && Array.isArray(data.vehicles) && data.vehicles.length > 0) {
          const mapped: FleetVehicleLocation[] = data.vehicles.map((v: any) => ({
            vehicleId: v.vehicleId,
            routeId: v.routeId || 'Route 42',
            routeName: v.routeName || `${v.routeId || 'Transit'} Line`,
            transportType: v.transportType === 'Train' ? 'Train' : 'Bus',
            driverName: v.driverName || 'Assigned Driver',
            driverId: v.driverId || 'DRV-001',
            speed: Number(v.speed) || 0,
            location: {
              lat: Number(v.location?.lat) || 6.9271,
              lng: Number(v.location?.lng) || 79.8612,
            },
            occupancyCurrent: Number(v.occupancyCurrent) || 0,
            occupancyMax: Number(v.occupancyMax) || 50,
            status: v.status || 'Active',
            healthScore: v.healthScore || 90,
            nextInspection: v.nextInspection || 'Nominal',
          }));
          setVehicles(mapped);
          setLastSyncText(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } catch {
      // Offline fallback
      try {
        const local = await adminDataStorage.getVehicles([]);
        if (Array.isArray(local) && local.length > 0) {
          const mapped: FleetVehicleLocation[] = local.map((v: any) => ({
            vehicleId: v.vehicleId,
            routeId: v.routeId || 'Route 42',
            routeName: v.routeName || `${v.routeId || 'Transit'} Line`,
            transportType: v.transportType === 'Train' ? 'Train' : 'Bus',
            driverName: v.driverName || 'Assigned Driver',
            driverId: v.driverId || 'DRV-001',
            speed: Number(v.speed) || 0,
            location: {
              lat: Number(v.location?.lat) || 6.9271,
              lng: Number(v.location?.lng) || 79.8612,
            },
            occupancyCurrent: Number(v.occupancyCurrent) || 0,
            occupancyMax: Number(v.occupancyMax) || 50,
            status: v.status || 'Active',
            healthScore: v.healthScore || 90,
            nextInspection: v.nextInspection || 'Nominal',
          }));
          setVehicles(mapped);
        }
      } catch {}
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFleetVehicles();
    const interval = setInterval(() => {
      fetchFleetVehicles(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchFleetVehicles]);

  const filteredVehicles = filterRoute === 'All' 
    ? vehicles 
    : vehicles.filter(v => v.routeId === filterRoute);

  const availableRoutes = ['All', ...Array.from(new Set(vehicles.map(v => v.routeId).filter(Boolean)))];

  const activeCount = vehicles.filter(v => v.status === 'Active').length;

  return (
    <View style={styles.container}>
      {/* Header with Real Live GPS Badge */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Real-Time Spatial Telemetry Tracking</Text>
          <Text style={styles.headerTitle}>Live Fleet Radar</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={styles.activeBadge}>
            <Radio size={13} color="#059669" />
            <Text style={styles.activeBadgeText}>{activeCount} Active Nodes</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => fetchFleetVehicles(false)}
            disabled={isRefreshing}
            accessibilityLabel="Refresh fleet GPS telemetry"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#0284C7" />
            ) : (
              <RefreshCw size={15} color="#64748B" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Route Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
        {availableRoutes.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.chip, filterRoute === r && styles.chipActive]}
            onPress={() => setFilterRoute(r)}
          >
            <Text style={[styles.chipText, filterRoute === r && styles.chipTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Real Map Component (Interactive OpenStreetMap / Google Maps) */}
      <View style={styles.mapContainer}>
        <AdminFleetRadarMap
          vehicles={filteredVehicles}
          selectedVehicle={selectedVehicle}
          onSelectVehicle={setSelectedVehicle}
          filterRoute={filterRoute}
        />
      </View>

      {/* Pull-Up Telemetry Bottom Sheet */}
      {selectedVehicle && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.sheetTitle}>#{selectedVehicle.vehicleId}</Text>
              <View style={[
                styles.statusBadge, 
                { 
                  backgroundColor: 
                    selectedVehicle.status === 'Delayed' 
                      ? '#FEF3C7' 
                      : selectedVehicle.status === 'Maintenance'
                      ? '#FEE2E2'
                      : '#DCFCE7' 
                }
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  { 
                    color: 
                      selectedVehicle.status === 'Delayed' 
                        ? '#B45309' 
                        : selectedVehicle.status === 'Maintenance'
                        ? '#DC2626'
                        : '#15803D' 
                  }
                ]}>
                  {selectedVehicle.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setSelectedVehicle(null)}>
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View style={styles.routeInfoRow}>
            <Navigation size={14} color="#0ea5e9" />
            <Text style={styles.routeInfoText}>{selectedVehicle.routeName}</Text>
          </View>

          {/* Telemetry Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.telemetryCard}>
              <Gauge size={16} color="#0ea5e9" style={styles.telemetryIcon} />
              <Text style={styles.telemetryVal}>{selectedVehicle.speed} km/h</Text>
              <Text style={styles.telemetryLabel}>Telemetry Speed</Text>
            </View>

            <View style={styles.telemetryCard}>
              <Users size={16} color="#10b981" style={styles.telemetryIcon} />
              <Text style={styles.telemetryVal}>{selectedVehicle.occupancyCurrent}/{selectedVehicle.occupancyMax}</Text>
              <Text style={styles.telemetryLabel}>Passengers</Text>
            </View>

            <View style={styles.telemetryCard}>
              <ShieldCheck size={16} color="#6366f1" style={styles.telemetryIcon} />
              <Text style={styles.telemetryVal}>{selectedVehicle.healthScore || 92}%</Text>
              <Text style={styles.telemetryLabel}>Health Rating</Text>
            </View>
          </View>

          <View style={styles.driverInfoRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <User size={14} color="#64748B" />
              <Text style={styles.driverInfoText}>
                Operator: <Text style={{ fontWeight: 'bold', color: '#0F172A' }}>{selectedVehicle.driverName}</Text>
              </Text>
            </View>
            <Text style={styles.gpsText}>
              GPS {selectedVehicle.location.lat.toFixed(4)}°N, {selectedVehicle.location.lng.toFixed(4)}°E
            </Text>
          </View>

          <TouchableOpacity
            style={styles.manageFleetBtn}
            onPress={() => router.push('/admin/vehicles')}
            accessibilityLabel={`Manage vehicle ${selectedVehicle.vehicleId} in fleet inventory`}
          >
            <Text style={styles.manageFleetBtnText}>Manage Unit in Fleet Inventory</Text>
            <ChevronRight size={16} color="#0284C7" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 22,
    color: '#0F172A',
    fontWeight: '800',
    marginTop: 2,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  activeBadgeText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  refreshBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipScroll: {
    maxHeight: 38,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#0F2942',
    borderColor: '#0F2942',
  },
  chipText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mapContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 12,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 10,
    zIndex: 50,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 8,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  routeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeInfoText: {
    color: '#64748B',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  telemetryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  telemetryIcon: {
    marginBottom: 4,
  },
  telemetryVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  telemetryLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  driverInfoRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  driverInfoText: {
    color: '#334155',
    fontSize: 11.5,
    marginLeft: 6,
    fontWeight: '500',
  },
  gpsText: {
    color: '#0284C7',
    fontSize: 10.5,
    fontWeight: '700',
  },
  manageFleetBtn: {
    marginTop: 10,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  manageFleetBtnText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },
});
