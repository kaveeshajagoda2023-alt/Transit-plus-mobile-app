import React, { useState } from 'react';
import { Bus, Navigation, User, Gauge, Users, BatteryCharging, Radio, X } from 'lucide-react';

export default function FleetRadarScreen() {
  const [filterRoute, setFilterRoute] = useState('All');
  const [selectedVehicle, setSelectedVehicle] = useState({
    vehicleId: 'TN-0824',
    routeId: 'Route 42',
    routeName: 'Line 42 Eastbound (Market St to Malabe)',
    transportType: 'Bus',
    driverName: 'Kavithushan B.',
    driverId: 'DRV-102',
    speed: 18,
    occupancyCurrent: 48,
    occupancyMax: 50,
    batteryFuel: 82,
    status: 'Delayed',
    lastSync: '2 seconds ago'
  });

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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>US08 — Fleet Monitoring</div>
          <h2 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#fff', fontWeight: '700' }}>Live Fleet Radar</h2>
        </div>
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '12px', padding: '4px 10px', fontSize: '11px', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Radio size={14} /> 5 Active Telemetry Nodes
        </div>
      </div>

      {/* Filter Chips */}
      <div className="chip-row">
        {['All', 'Route 42', 'Route 18', 'Route 105'].map((r) => (
          <button
            key={r}
            className={`chip ${filterRoute === r ? 'active' : ''}`}
            onClick={() => setFilterRoute(r)}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Spatial Map / Radar Simulation */}
      <div className="radar-map-container">
        <div className="radar-sweep-line"></div>

        {/* Map Grid Road Lines */}
        <div style={{ position: 'absolute', top: '45%', left: '0', width: '100%', height: '2px', background: 'rgba(14, 165, 233, 0.25)' }}></div>
        <div style={{ position: 'absolute', top: '0', left: '48%', width: '2px', height: '100%', background: 'rgba(14, 165, 233, 0.25)' }}></div>

        {/* Vehicle Markers */}
        {filteredVehicles.map((v) => (
          <div
            key={v.id}
            className={`vehicle-marker ${v.status === 'Delayed' ? 'delayed' : v.status === 'Maintenance' ? 'maintenance' : ''} ${selectedVehicle?.vehicleId === v.id ? 'selected' : ''}`}
            style={{ top: v.top, left: v.left }}
            onClick={() => setSelectedVehicle({
              vehicleId: v.id,
              routeId: v.route,
              routeName: `${v.route} (${v.type})`,
              transportType: v.type,
              driverName: v.driver,
              driverId: 'DRV-102',
              speed: v.speed,
              occupancyCurrent: v.occupancy,
              occupancyMax: 50,
              batteryFuel: 85,
              status: v.status,
              lastSync: '1 sec ago'
            })}
          >
            <Bus size={12} />
            <span>{v.label}</span>
          </div>
        ))}
      </div>

      {/* Pull-Up Telemetry Bottom Sheet */}
      {selectedVehicle && (
        <div className="telemetry-bottom-sheet">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>#{selectedVehicle.vehicleId}</span>
              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '8px',
                background: selectedVehicle.status === 'Delayed' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: selectedVehicle.status === 'Delayed' ? '#f59e0b' : '#10b981'
              }}>
                {selectedVehicle.status}
              </span>
            </div>
            <button
              onClick={() => setSelectedVehicle(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Navigation size={14} color="#0ea5e9" />
            {selectedVehicle.routeName}
          </div>

          {/* Telemetry Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
              <Gauge size={16} color="#0ea5e9" style={{ margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{selectedVehicle.speed} km/h</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Telemetry Speed</div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
              <Users size={16} color="#10b981" style={{ margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{selectedVehicle.occupancyCurrent}/{selectedVehicle.occupancyMax}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Passengers</div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
              <BatteryCharging size={16} color="#f59e0b" style={{ margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>82%</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>EV Battery</div>
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', color: '#e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} color="#94a3b8" />
              <span>Assigned Driver: <strong>{selectedVehicle.driverName}</strong></span>
            </div>
            <span style={{ fontSize: '10px', color: '#10b981' }}>GPS Synced</span>
          </div>
        </div>
      )}
    </div>
  );
}
