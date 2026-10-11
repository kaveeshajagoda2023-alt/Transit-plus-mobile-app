const http = require('http');
const url = require('url');

const PORT = 5000;

// In-Memory Seed Data for Member 4 (Admin & Fleet Operations)
let vehicles = [
  { vehicleId: 'TN-0821', routeId: 'Route 42', routeName: 'Line 42 Eastbound (Central to University)', transportType: 'Bus', driverName: 'Saran Diya', driverId: 'DRV-401', speed: 42, location: { lat: 6.9271, lng: 79.8612 }, occupancyCurrent: 36, occupancyMax: 50, status: 'Active', lastUpdated: new Date() },
  { vehicleId: 'TN-0824', routeId: 'Route 42', routeName: 'Line 42 Eastbound (Market St to Malabe)', transportType: 'Bus', driverName: 'Kavithushan B.', driverId: 'DRV-102', speed: 18, location: { lat: 6.9147, lng: 79.8732 }, occupancyCurrent: 48, occupancyMax: 50, status: 'Delayed', lastUpdated: new Date() },
  { vehicleId: 'TN-0830', routeId: 'Route 18', routeName: 'Route 18 Express Train', transportType: 'Train', driverName: 'Anura Bandara', driverId: 'DRV-809', speed: 65, location: { lat: 6.9344, lng: 79.8500 }, occupancyCurrent: 120, occupancyMax: 200, status: 'Active', lastUpdated: new Date() },
  { vehicleId: 'TN-0842', routeId: 'Route 105', routeName: 'Route 105 BRT Bus', transportType: 'Bus', driverName: 'Nimal Perera', driverId: 'DRV-304', speed: 0, location: { lat: 6.9011, lng: 79.8655 }, occupancyCurrent: 0, occupancyMax: 50, status: 'Maintenance', lastUpdated: new Date() },
  { vehicleId: 'TN-0855', routeId: 'Route 42', routeName: 'Line 42 Westbound', transportType: 'Bus', driverName: 'Kamal Silva', driverId: 'DRV-220', speed: 38, location: { lat: 6.9200, lng: 79.8800 }, occupancyCurrent: 24, occupancyMax: 50, status: 'Active', lastUpdated: new Date() }
];

let ticketAudits = [
  { ticketId: '#TK-9824-B01', passType: 'Single Journey Pass', routeId: 'Route 42', fare: 65.00, passengerName: 'Elena Rosiera', scannedAt: new Date(Date.now() - 300000), conductorId: 'CND-77492', status: 'valid', anomalyReason: '' },
  { ticketId: '#TK-9827-C18', passType: 'Metro Rapid Monthly Pass', routeId: 'Route 18', fare: 680.00, passengerName: 'Kasun Wickrama', scannedAt: new Date(Date.now() - 600000), conductorId: 'CND-88201', status: 'valid', anomalyReason: '' },
  { ticketId: '#TK-9830-D42', passType: 'Single Journey Pass', routeId: 'Route 42', fare: 65.00, passengerName: 'Unknown Commuter', scannedAt: new Date(Date.now() - 900000), conductorId: 'CND-77492', status: 'flagged', anomalyReason: 'Outdoor QR Glare / Low Contrast Scan Retry (UI-01)' },
  { ticketId: '#TK-9833-A05', passType: 'Day Pass (All Routes)', routeId: 'Route 105', fare: 250.00, passengerName: 'Dinuka Fernando', scannedAt: new Date(Date.now() - 1200000), conductorId: 'CND-30112', status: 'invalid', anomalyReason: 'Expired Pass Timestamp (Expired 12 mins prior)' },
  { ticketId: '#TK-9838-B12', passType: 'Single Journey Pass', routeId: 'Route 42', fare: 65.00, passengerName: 'Unknown Commuter', scannedAt: new Date(Date.now() - 1800000), conductorId: 'CND-77492', status: 'flagged', anomalyReason: 'Duplicate Scan Verification Attempt' },
  { ticketId: '#TK-9842-C09', passType: 'Student Transit Pass', routeId: 'Route 18', fare: 40.00, passengerName: 'Saman Kumara', scannedAt: new Date(Date.now() - 2400000), conductorId: 'CND-88201', status: 'valid', anomalyReason: '' }
];

let disruptionAlerts = [
  { alertId: 'ALT-1092', incidentType: 'Major Track Maintenance & Water Main Burst', affectedRoute: 'Route 42 Eastbound (Central to University)', affectedTransportType: 'Bus & Train', severity: 'High', delayMinutes: 15, rerouteInstruction: 'Reroute via Station Road Bypass', broadcastedAt: new Date(Date.now() - 3600000), broadcastBy: 'Admin (IT23762572)', status: 'Active' }
];

const server = http.createServer((req, res) => {
  // Enable CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 1. Admin Auth Login API
  if (pathname === '/api/admin/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Admin Authentication successful',
        user: {
          staffId: 'CDR-8910@transitpulse.gov',
          name: 'K. K. Jagoda (Transport Coordinator)',
          studentId: 'IT23762572',
          role: 'Transport Coordinator',
          clearanceLevel: 'Tier 3 (Master Security Passcode Verified)'
        }
      }));
    });
    return;
  }

  // 2. Operational Metrics API
  if (pathname === '/api/admin/metrics' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      metrics: {
        activeFleetCount: 142,
        activeRoutesCount: 24,
        passesIssuedCount: 18420,
        flaggedAnomaliesCount: 23,
        onTimePerformancePercentage: 94.2,
        dbStatus: 'MongoDB Datastore Sync Active'
      }
    }));
    return;
  }

  // 3. Live Fleet Radar & Telemetry API (US08) & Vehicle Inventory Management
  if (pathname === '/api/admin/fleet/vehicles' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, vehicles }));
    return;
  }

  // 3b. Add New Vehicle to Fleet
  if (pathname === '/api/admin/fleet/vehicles' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const newVehicle = {
          vehicleId: data.vehicleId || `TN-${Math.floor(1000 + Math.random() * 9000)}`,
          routeId: data.routeId || 'Route 42',
          routeName: data.routeName || `${data.routeId || 'Route 42'} Transit Line`,
          transportType: data.transportType || 'Bus',
          driverName: data.driverName || 'Assigned Driver',
          driverId: data.driverId || `DRV-${Math.floor(100 + Math.random() * 900)}`,
          speed: parseInt(data.speed) || 0,
          location: data.location || { lat: 6.9271, lng: 79.8612 },
          occupancyCurrent: parseInt(data.occupancyCurrent) || 0,
          occupancyMax: parseInt(data.occupancyMax) || (data.transportType === 'Train' ? 200 : 50),
          status: data.status || 'Active',
          lastUpdated: new Date()
        };
        vehicles.unshift(newVehicle);
        console.log(`🚌 [FLEET MANAGEMENT] Added vehicle: ${newVehicle.vehicleId} (${newVehicle.transportType})`);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Vehicle registered successfully.', vehicle: newVehicle }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // 3c. Update Vehicle Details or Status
  if ((pathname.startsWith('/api/admin/fleet/vehicles/') || pathname === '/api/admin/fleet/vehicles/update') && (req.method === 'PUT' || req.method === 'POST')) {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const targetId = data.vehicleId || pathname.split('/').pop();
        const index = vehicles.findIndex(v => v.vehicleId === targetId);
        if (index === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Vehicle not found' }));
          return;
        }
        vehicles[index] = {
          ...vehicles[index],
          ...data,
          lastUpdated: new Date()
        };
        console.log(`🔧 [FLEET MANAGEMENT] Updated vehicle: ${targetId} -> Status: ${vehicles[index].status}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Vehicle updated.', vehicle: vehicles[index] }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // 3d. Delete / Decommission Vehicle from Fleet
  if ((pathname.startsWith('/api/admin/fleet/vehicles/') || pathname === '/api/admin/fleet/vehicles/delete') && (req.method === 'DELETE' || req.method === 'POST')) {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const targetId = data.vehicleId || pathname.split('/').pop();
        const initialLen = vehicles.length;
        vehicles = vehicles.filter(v => v.vehicleId !== targetId);
        if (vehicles.length === initialLen) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Vehicle not found' }));
          return;
        }
        console.log(`🗑️ [FLEET MANAGEMENT] Decommissioned vehicle: ${targetId}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Vehicle decommissioned from fleet.' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Error processing request' }));
      }
    });
    return;
  }

  // 4. Ticket Audit Hub API (US09)
  if (pathname === '/api/admin/audit/tickets' && req.method === 'GET') {
    const status = parsedUrl.query.status;
    let filtered = ticketAudits;
    if (status && status !== 'all') {
      filtered = ticketAudits.filter(t => t.status === status);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, tickets: filtered }));
    return;
  }

  // 5. Disruption Alerts API (FR6, FR7, FR8)
  if (pathname === '/api/admin/disruptions' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, alerts: disruptionAlerts }));
    return;
  }

  if (pathname === '/api/admin/disruptions/broadcast' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const data = JSON.parse(body || '{}');
      const newAlert = {
        alertId: 'ALT-' + Math.floor(1000 + Math.random() * 9000),
        incidentType: data.incidentType || 'Emergency Obstruction',
        affectedRoute: data.affectedRoute || 'Route 42',
        affectedTransportType: data.affectedTransportType || 'Bus & Train',
        severity: data.severity || 'High',
        delayMinutes: parseInt(data.delayMinutes) || 15,
        rerouteInstruction: data.rerouteInstruction || 'Follow station operator instructions.',
        broadcastedAt: new Date(),
        broadcastBy: 'Admin (IT23762572)',
        status: data.status || 'Active'
      };
      disruptionAlerts.unshift(newAlert);

      console.log(`📢 [EMERGENCY BROADCAST] Alert sent: ${newAlert.incidentType} on ${newAlert.affectedRoute}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Disruption alert broadcasted.', alert: newAlert }));
    });
    return;
  }

  // 5b. Update Disruption Alert (CRUD 2: Update)
  if ((pathname.startsWith('/api/admin/disruptions/update') || pathname.match(/\/api\/admin\/disruptions\/ALT-\d+/)) && (req.method === 'PUT' || req.method === 'POST')) {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const targetId = data.alertId || pathname.split('/').pop();
        const index = disruptionAlerts.findIndex(a => a.alertId === targetId);
        if (index === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Alert not found' }));
          return;
        }
        disruptionAlerts[index] = {
          ...disruptionAlerts[index],
          ...data,
          lastUpdated: new Date()
        };
        console.log(`✏️ [DISRUPTION UPDATE] Updated alert: ${targetId} -> Status: ${disruptionAlerts[index].status}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Disruption alert updated.', alert: disruptionAlerts[index] }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid payload' }));
      }
    });
    return;
  }

  // 5c. Delete / Withdraw Disruption Alert (CRUD 2: Delete)
  if ((pathname.startsWith('/api/admin/disruptions/delete') || pathname.match(/\/api\/admin\/disruptions\/ALT-\d+/)) && (req.method === 'DELETE' || req.method === 'POST')) {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const targetId = data.alertId || pathname.split('/').pop();
        const initialLen = disruptionAlerts.length;
        disruptionAlerts = disruptionAlerts.filter(a => a.alertId !== targetId);
        if (disruptionAlerts.length === initialLen) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Alert not found' }));
          return;
        }
        console.log(`🗑️ [DISRUPTION WITHDRAWN] Withdrew alert: ${targetId}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Disruption alert withdrawn from broadcast.' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Error processing delete' }));
      }
    });
    return;
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`
========================================================================
🚀 TRANSITPLUS PURE NODE.JS SERVER RUNNING ON PORT ${PORT}
📌 MEMBER 4 API SCOPE: Admin & Fleet Operations
🔗 REST Endpoints: http://localhost:${PORT}/api/admin/metrics
========================================================================
  `);
});
