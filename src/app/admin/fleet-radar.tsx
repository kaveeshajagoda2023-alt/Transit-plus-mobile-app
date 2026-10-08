import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Bus, Navigation, User, Gauge, Users, BatteryCharging, Radio, X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function FleetRadarScreen() {
  const [filterRoute, setFilterRoute] = useState('All');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

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
                { top: v.top, left: v.left },
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
                Assigned Driver: <Text style={{ fontWeight: 'bold', color: '#fff' }}>{selectedVehicle.driverName}</Text>
              </Text>
            </View>
            <Text style={styles.gpsText}>GPS Synced</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
    marginTop: 2,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  activeBadgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  chipScroll: {
    maxHeight: 40,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  chip: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  radarContainer: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.2)',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  roadLine: {
    position: 'absolute',
    backgroundColor: 'rgba(14, 165, 233, 0.25)',
  },
  vehicleMarker: {
    position: 'absolute',
    backgroundColor: '#0ea5e9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  markerDelayed: {
    backgroundColor: '#f59e0b',
    shadowColor: '#f59e0b',
  },
  markerMaintenance: {
    backgroundColor: '#f43f5e',
    shadowColor: '#f43f5e',
  },
  markerSelected: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  bottomSheet: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  routeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeInfoText: {
    color: '#94a3b8',
    fontSize: 12,
    marginLeft: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  telemetryCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  telemetryIcon: {
    marginBottom: 4,
  },
  telemetryVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  telemetryLabel: {
    fontSize: 10,
    color: '#94a3b8',
  },
  driverInfoRow: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfoText: {
    color: '#e2e8f0',
    fontSize: 12,
    marginLeft: 6,
  },
  gpsText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '600',
  }
});
