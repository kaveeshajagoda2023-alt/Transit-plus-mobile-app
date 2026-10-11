import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Bus, Navigation, User, Gauge, Users, BatteryCharging, Radio, X, ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function FleetRadarScreen() {
  const router = useRouter();
  const [filterRoute, setFilterRoute] = useState('All');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const vehicles = [
    { id: 'TN-0821', label: 'TN-0821', route: 'Route 42', type: 'Bus', top: '35%', left: '42%', status: 'Active', driver: 'Saran Diya', speed: 42, occupancy: 36 },
    { id: 'TN-0824', label: 'TN-0824', route: 'Route 42', type: 'Bus', top: '55%', left: '68%', status: 'Delayed', driver: 'Kavithushan B.', speed: 18, occupancy: 48 },
    { id: 'TN-0830', label: 'TN-0830', route: 'Route 18', type: 'Train', top: '25%', left: '25%', status: 'Active', driver: 'Anura Bandara', speed: 65, occupancy: 120 },
    { id: 'TN-0842', label: 'TN-0842', route: 'Route 105', type: 'Bus', top: '70%', left: '30%', status: 'Maintenance', driver: 'Nimal Perera', speed: 0, occupancy: 0 },
    { id: 'TN-0855', label: 'TN-0855', route: 'Route 42', type: 'Bus', top: '45%', left: '50%', status: 'Active', driver: 'Kamal Silva', speed: 38, occupancy: 24 }
  ];

  const filteredVehicles = filterRoute === 'All' 
    ? vehicles 
    : vehicles.filter(v => v.route === filterRoute);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>US08 — Fleet Monitoring</Text>
          <Text style={styles.headerTitle}>Live Fleet Radar</Text>
        </View>
        <View style={styles.activeBadge}>
          <Radio size={14} color="#10b981" />
          <Text style={styles.activeBadgeText}> 5 Active Nodes</Text>
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
        {['All', 'Route 42', 'Route 18', 'Route 105'].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.chip, filterRoute === r && styles.chipActive]}
            onPress={() => setFilterRoute(r)}
          >
            <Text style={[styles.chipText, filterRoute === r && styles.chipTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Spatial Map / Radar Simulation */}
      <View style={styles.radarContainer}>
        {/* Map Grid Road Lines */}
        <View style={[styles.roadLine, { top: '45%', left: 0, width: '100%', height: 2 }]} />
        <View style={[styles.roadLine, { top: 0, left: '48%', width: 2, height: '100%' }]} />

        {/* Vehicle Markers */}
        {filteredVehicles.map((v) => {
          const isDelayed = v.status === 'Delayed';
          const isMaintenance = v.status === 'Maintenance';
          const isSelected = selectedVehicle?.id === v.id;
          
          return (
            <TouchableOpacity
              key={v.id}
              style={[
                styles.vehicleMarker,
                { top: v.top as any, left: v.left as any },
                isDelayed && styles.markerDelayed,
                isMaintenance && styles.markerMaintenance,
                isSelected && styles.markerSelected
              ]}
              onPress={() => setSelectedVehicle({
                id: v.id,
                routeId: v.route,
                routeName: `${v.route} (${v.type})`,
                driverName: v.driver,
                speed: v.speed,
                occupancyCurrent: v.occupancy,
                occupancyMax: v.type === 'Train' ? 200 : 50,
                status: v.status
              })}
            >
              <Bus size={12} color="#fff" />
              <Text style={styles.markerText}>{v.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Pull-Up Telemetry Bottom Sheet */}
      {selectedVehicle && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.sheetTitle}>#{selectedVehicle.id}</Text>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: selectedVehicle.status === 'Delayed' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)' }
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  { color: selectedVehicle.status === 'Delayed' ? '#f59e0b' : '#10b981' }
                ]}>
                  {selectedVehicle.status}
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
              <BatteryCharging size={16} color="#f59e0b" style={styles.telemetryIcon} />
              <Text style={styles.telemetryVal}>82%</Text>
              <Text style={styles.telemetryLabel}>EV Battery</Text>
            </View>
          </View>

          <View style={styles.driverInfoRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <User size={14} color="#94a3b8" />
              <Text style={styles.driverInfoText}>
                Assigned Driver: <Text style={{ fontWeight: 'bold', color: '#0F172A' }}>{selectedVehicle.driverName}</Text>
              </Text>
            </View>
            <Text style={styles.gpsText}>GPS Synced</Text>
          </View>

          <TouchableOpacity
            style={styles.manageFleetBtn}
            onPress={() => router.push('/admin/vehicles')}
            accessibilityLabel={`Manage vehicle ${selectedVehicle.id} in fleet inventory`}
          >
            <Text style={styles.manageFleetBtnText}>Manage in Fleet Inventory</Text>
            <ChevronRight size={16} color="#0ea5e9" />
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
    marginBottom: 14,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '700',
    textTransform: 'uppercase',
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
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  activeBadgeText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  chipScroll: {
    maxHeight: 40,
    marginBottom: 14,
  },
  chipRow: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
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
    fontSize: 12.5,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  radarContainer: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  roadLine: {
    position: 'absolute',
    backgroundColor: '#BAE6FD',
  },
  vehicleMarker: {
    position: 'absolute',
    backgroundColor: '#0284C7',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  markerDelayed: {
    backgroundColor: '#D97706',
    shadowColor: '#D97706',
  },
  markerMaintenance: {
    backgroundColor: '#E11D48',
    shadowColor: '#E11D48',
  },
  markerSelected: {
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 4,
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
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  routeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
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
    marginBottom: 14,
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  driverInfoText: {
    color: '#334155',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  gpsText: {
    color: '#059669',
    fontSize: 11,
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
