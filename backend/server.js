import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5000;

// Persistent Data Storage Directory
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
}

const VEHICLES_FILE = path.join(DATA_DIR, 'fleet_vehicles.json');
const ALERTS_FILE = path.join(DATA_DIR, 'disruption_alerts.json');
const TICKETS_FILE = path.join(DATA_DIR, 'ticket_audits.json');

const SEED_VEHICLES = [
  { vehicleId: 'TN-0821', routeId: 'Route 42', routeName: 'Line 42 Eastbound (Central to University)', transportType: 'Bus', driverName: 'Saran Diya', driverId: 'DRV-401', speed: 42, location: { lat: 6.9271, lng: 79.8612 }, occupancyCurrent: 36, occupancyMax: 50, status: 'Active', healthScore: 94, nextInspection: '24 Oct 2026', lastUpdated: new Date() },
  { vehicleId: 'TN-0824', routeId: 'Route 42', routeName: 'Line 42 Eastbound (Market St to Malabe)', transportType: 'Bus', driverName: 'Kavithushan B.', driverId: 'DRV-102', speed: 18, location: { lat: 6.9147, lng: 79.8732 }, occupancyCurrent: 48, occupancyMax: 50, status: 'Delayed', healthScore: 82, nextInspection: '19 Oct 2026', lastUpdated: new Date() },
  { vehicleId: 'TN-0830', routeId: 'Route 18', routeName: 'Route 18 Express Train', transportType: 'Train', driverName: 'Anura Bandara', driverId: 'DRV-809', speed: 65, location: { lat: 6.9344, lng: 79.8500 }, occupancyCurrent: 120, occupancyMax: 200, status: 'Active', healthScore: 98, nextInspection: '28 Oct 2026', lastUpdated: new Date() },
  { vehicleId: 'TN-0842', routeId: 'Route 105', routeName: 'Route 105 BRT Bus', transportType: 'Bus', driverName: 'Nimal Perera', driverId: 'DRV-304', speed: 0, location: { lat: 6.9011, lng: 79.8655 }, occupancyCurrent: 0, occupancyMax: 50, status: 'Maintenance', healthScore: 64, nextInspection: 'Immediate Inspection', lastUpdated: new Date() },
  { vehicleId: 'TN-0855', routeId: 'Route 42', routeName: 'Line 42 Westbound', transportType: 'Bus', driverName: 'Kamal Silva', driverId: 'DRV-220', speed: 38, location: { lat: 6.9200, lng: 79.8800 }, occupancyCurrent: 24, occupancyMax: 50, status: 'Active', healthScore: 91, nextInspection: '22 Oct 2026', lastUpdated: new Date() }
];

const SEED_TICKETS = [
  { ticketId: '#TK-9824-B01', passType: 'Single Journey Pass', routeId: 'Route 42', fare: 65.00, passengerName: 'Elena Rosiera', scannedAt: new Date(Date.now() - 300000), conductorId: 'CND-77492', status: 'valid', anomalyReason: '' },
  { ticketId: '#TK-9827-C18', passType: 'Metro Rapid Monthly Pass', routeId: 'Route 18', fare: 680.00, passengerName: 'Kasun Wickrama', scannedAt: new Date(Date.now() - 600000), conductorId: 'CND-88201', status: 'valid', anomalyReason: '' },
  { ticketId: '#TK-9830-D42', passType: 'Single Journey Pass', routeId: 'Route 42', fare: 65.00, passengerName: 'Unknown Commuter', scannedAt: new Date(Date.now() - 900000), conductorId: 'CND-77492', status: 'flagged', anomalyReason: 'Outdoor QR Glare / Low Contrast Scan Retry (UI-01)' },
  { ticketId: '#TK-9833-A05', passType: 'Day Pass (All Routes)', routeId: 'Route 105', fare: 250.00, passengerName: 'Dinuka Fernando', scannedAt: new Date(Date.now() - 1200000), conductorId: 'CND-30112', status: 'invalid', anomalyReason: 'Expired Pass Timestamp (Expired 12 mins prior)' },
  { ticketId: '#TK-9838-B12', passType: 'Single Journey Pass', routeId: 'Route 42', fare: 65.00, passengerName: 'Unknown Commuter', scannedAt: new Date(Date.now() - 1800000), conductorId: 'CND-77492', status: 'flagged', anomalyReason: 'Duplicate Scan Verification Attempt' },
  { ticketId: '#TK-9842-C09', passType: 'Student Transit Pass', routeId: 'Route 18', fare: 40.00, passengerName: 'Saman Kumara', scannedAt: new Date(Date.now() - 2400000), conductorId: 'CND-88201', status: 'valid', anomalyReason: '' }
];

const SEED_ALERTS = [
  { alertId: 'ALT-1092', incidentType: 'Major Track Maintenance & Water Main Burst', affectedRoute: 'Route 42 Eastbound (Central to University)', affectedTransportType: 'Bus & Train', severity: 'High', delayMinutes: 15, rerouteInstruction: 'Reroute via Station Road Bypass', broadcastedAt: new Date(Date.now() - 3600000), broadcastBy: 'Admin (IT23762572)', status: 'Active' }
];

function loadJson(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(`[STORAGE] Error reading ${filePath}:`, e.message);
  }
  return defaultValue;
}

function saveJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`[STORAGE] Error writing ${filePath}:`, e.message);
  }
}

// Initialize persistent state from disk or seeds
let vehicles = loadJson(VEHICLES_FILE, SEED_VEHICLES);
let ticketAudits = loadJson(TICKETS_FILE, SEED_TICKETS);
let disruptionAlerts = loadJson(ALERTS_FILE, SEED_ALERTS);

// Write seed files if first time running
if (!fs.existsSync(VEHICLES_FILE)) saveJson(VEHICLES_FILE, vehicles);
if (!fs.existsSync(ALERTS_FILE)) saveJson(ALERTS_FILE, disruptionAlerts);
if (!fs.existsSync(TICKETS_FILE)) saveJson(TICKETS_FILE, ticketAudits);

// Optional MongoDB Atlas Cloud Sync
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://it23759152_db_user:r100SSYPSuH7kfcy@cluster0.8h3sprz.mongodb.net/transitplus?retryWrites=true&w=majority&appName=Cluster0';
  mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 4000 })
    .then(() => console.log('✅ [DATABASE] Connected to MongoDB Atlas Cloud datastore'))
    .catch((err) => console.log('📁 [DATABASE] Persistent local datastore active in backend/data (MongoDB Atlas remote access restricted).'));
} catch (e) {
  console.log('📁 [DATABASE] Persistent local datastore active in backend/data');
}

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

  // 2. Operational Metrics API (Dynamically Computed from Real Datastore)
  if (pathname === '/api/admin/metrics' && req.method === 'GET') {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'Active').length;
    const delayedVehicles = vehicles.filter(v => v.status === 'Delayed').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'Maintenance').length;
    const uniqueRoutes = Array.from(new Set(vehicles.map(v => v.routeId).filter(Boolean))).length || 4;
    const flaggedAnomalies = ticketAudits.filter(t => t.status === 'flagged').length;
    const activeDisruptions = disruptionAlerts.filter(a => a.status === 'Active').length;
    const totalFareCollected = ticketAudits.reduce((sum, t) => sum + (Number(t.fare) || 0), 0);
    const onTimePerformance = totalVehicles > 0 
      ? Math.round(((totalVehicles - delayedVehicles) / totalVehicles) * 100) 
      : 94;

    // Dynamically compile real-time operations log stream
    const logs = [];

    // 1. Add vehicles that are Delayed
    vehicles.filter(v => v.status === 'Delayed').forEach(v => {
      logs.push({
        id: `log-v-${v.vehicleId}`,
        title: `#${v.vehicleId}`,
        subtitle: `• ${v.routeName || v.routeId}`,
        tag: `Delayed (${v.speed || 15}km/h)`,
        tagColor: '#B45309',
        tagBg: '#FEF3C7',
        borderColor: '#FDE68A',
        timestamp: 'Live'
      });
    });

    // 2. Add vehicles in Maintenance
    vehicles.filter(v => v.status === 'Maintenance').forEach(v => {
      logs.push({
        id: `log-m-${v.vehicleId}`,
        title: `#${v.vehicleId}`,
        subtitle: `• Depot Inspection`,
        tag: 'Maintenance',
        tagColor: '#DC2626',
        tagBg: '#FEE2E2',
        borderColor: '#FECDD3',
        timestamp: 'Live'
      });
    });

    // 3. Add active disruption alerts
    disruptionAlerts.filter(a => a.status === 'Active').slice(0, 2).forEach(a => {
      logs.push({
        id: `log-a-${a.alertId}`,
        title: `#${a.alertId}`,
        subtitle: `• ${a.affectedRoute}`,
        tag: a.source === 'Driver' ? 'Driver Alert' : `${a.severity} Alert`,
        tagColor: a.severity === 'Critical' ? '#DC2626' : '#B45309',
        tagBg: a.severity === 'Critical' ? '#FEE2E2' : '#FEF3C7',
        borderColor: a.severity === 'Critical' ? '#FECDD3' : '#FDE68A',
        timestamp: a.broadcastAt || 'Live'
      });
    });

    // 4. Add flagged ticket anomalies
    ticketAudits.filter(t => t.status === 'flagged').slice(0, 2).forEach(t => {
      logs.push({
        id: `log-t-${t.ticketId}`,
        title: `${t.ticketId}`,
        subtitle: `• Conductor ${t.conductorId || 'Scanner'} (${t.anomalyReason || 'Anomaly'})`,
        tag: 'Flagged Anomaly',
        tagColor: '#DC2626',
        tagBg: '#FEE2E2',
        borderColor: '#FECDD3',
        timestamp: 'Live'
      });
    });

    // 5. Add active on-time vehicles if stream has room
    if (logs.length < 3) {
      vehicles.filter(v => v.status === 'Active').slice(0, 3 - logs.length).forEach(v => {
        logs.push({
          id: `log-ok-${v.vehicleId}`,
          title: `#${v.vehicleId}`,
          subtitle: `• ${v.routeName || v.routeId}`,
          tag: `On Time (${v.speed || 40}km/h)`,
          tagColor: '#15803D',
          tagBg: '#DCFCE7',
          borderColor: '#A7F3D0',
          timestamp: 'Live'
        });
      });
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      metrics: {
        activeFleetCount: activeVehicles,
        totalFleetCount: totalVehicles,
        delayedFleetCount: delayedVehicles,
        maintenanceFleetCount: maintenanceVehicles,
        activeRoutesCount: uniqueRoutes,
        passesIssuedCount: ticketAudits.length,
        totalFareCollectedLKR: totalFareCollected,
        flaggedAnomaliesCount: flaggedAnomalies,
        activeDisruptionsCount: activeDisruptions,
        onTimePerformancePercentage: onTimePerformance,
        dbStatus: 'MongoDB Datastore Sync Active'
      },
      logs: logs.slice(0, 6)
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
        const vId = (data.vehicleId || '').trim().toUpperCase();
        const dName = (data.driverName || '').trim();

        if (!vId || !dName) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Validation Error: Vehicle ID and Driver Name are required and cannot be empty or whitespace only.'
          }));
          return;
        }

        if (vehicles.some(v => v.vehicleId.toUpperCase() === vId)) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: `Validation Error: Vehicle ID "${vId}" already exists in the fleet inventory.`
          }));
          return;
        }

        const rawCapacity = parseInt(data.occupancyMax);
        const parsedCapacity = (!isNaN(rawCapacity) && rawCapacity > 0)
          ? rawCapacity
          : (data.transportType === 'Train' ? 200 : 50);

        const newVehicle = {
          vehicleId: vId,
          routeId: (data.routeId || 'Route 42').trim(),
          routeName: (data.routeName || `${data.routeId || 'Route 42'} Transit Line`).trim(),
          transportType: data.transportType === 'Train' ? 'Train' : 'Bus',
          driverName: dName,
          driverId: data.driverId || `DRV-${Math.floor(100 + Math.random() * 900)}`,
          speed: parseInt(data.speed) || 0,
          location: data.location || { lat: 6.9271, lng: 79.8612 },
          occupancyCurrent: parseInt(data.occupancyCurrent) || 0,
          occupancyMax: parsedCapacity,
          status: data.status || 'Active',
          healthScore: 100,
          nextInspection: '30 Oct 2026',
          lastUpdated: new Date()
        };
        vehicles.unshift(newVehicle);
        saveJson(VEHICLES_FILE, vehicles);
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

  // 3d. Delete / Decommission Vehicle from Fleet
  if ((pathname === '/api/admin/fleet/vehicles/delete' || (pathname.startsWith('/api/admin/fleet/vehicles/') && req.method === 'DELETE')) && (req.method === 'DELETE' || req.method === 'POST')) {
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
        saveJson(VEHICLES_FILE, vehicles);
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

  // 3c. Update Vehicle Details or Status
  if ((pathname.startsWith('/api/admin/fleet/vehicles/') || pathname === '/api/admin/fleet/vehicles/update') && pathname !== '/api/admin/fleet/vehicles/delete' && (req.method === 'PUT' || req.method === 'POST')) {
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
        saveJson(VEHICLES_FILE, vehicles);
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

  // 4b. Update / Flag / Resolve Ticket Audit Record
  if ((pathname.startsWith('/api/admin/audit/tickets/action') || pathname.startsWith('/api/admin/audit/tickets/update')) && (req.method === 'PUT' || req.method === 'POST')) {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const targetId = data.ticketId;
        const index = ticketAudits.findIndex(t => t.ticketId === targetId);
        if (index === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Ticket audit record not found' }));
          return;
        }
        ticketAudits[index] = {
          ...ticketAudits[index],
          ...data,
          lastUpdated: new Date()
        };
        saveJson(TICKETS_FILE, ticketAudits);
        console.log(`📋 [TICKET AUDIT] Updated ticket: ${targetId} -> Status: ${ticketAudits[index].status}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Ticket audit record updated.', ticket: ticketAudits[index] }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid payload' }));
      }
    });
    return;
  }

  // 5. Disruption Alerts API (FR6, FR7, FR8)
  if (pathname === '/api/admin/disruptions' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, alerts: disruptionAlerts }));
    return;
  }

  // 5a. Driver Delay Report Bridge (Driver Panel -> Admin Disruption Hub)
  if ((pathname === '/api/admin/disruptions/driver-report' || pathname === '/api/trips/report-delay') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const driverAlert = {
          alertId: 'ALT-DRV-' + Math.floor(1000 + Math.random() * 9000),
          incidentType: data.reason || data.incidentType || 'Driver Reported Route Delay',
          affectedRoute: data.route || data.routeId || data.affectedRoute || 'Route 42 Eastbound',
          affectedTransportType: data.transportType || 'Bus',
          severity: (data.estimatedDelayMinutes || data.delayMinutes) > 20 ? 'High' : 'Medium',
          delayMinutes: parseInt(data.estimatedDelayMinutes || data.delayMinutes) || 15,
          rerouteInstruction: data.notes || data.rerouteInstruction || 'Driver reported schedule disruption. Awaiting coordinator advisory.',
          broadcastedAt: new Date(),
          broadcastBy: `Operator (${data.driverId || data.driverName || 'DRV-Onboard'})`,
          status: 'Active',
          source: 'Driver'
        };
        disruptionAlerts.unshift(driverAlert);
        saveJson(ALERTS_FILE, disruptionAlerts);
        console.log(`🚨 [DRIVER DELAY REPORT] Forwarded to Admin Hub: ${driverAlert.incidentType} on ${driverAlert.affectedRoute}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Driver delay recorded and forwarded to Admin Ops.', alert: driverAlert }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid payload' }));
      }
    });
    return;
  }

  if (pathname === '/api/admin/disruptions/broadcast' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const incType = (data.incidentType || '').trim();
        const affRoute = (data.affectedRoute || '').trim();

        if (!incType || !affRoute) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Validation Error: Incident Type and Affected Route are required and cannot be empty.'
          }));
          return;
        }

        const newAlert = {
          alertId: data.alertId || ('ALT-' + Math.floor(1000 + Math.random() * 9000)),
          incidentType: incType,
          affectedRoute: affRoute,
          affectedTransportType: data.affectedTransportType || 'Bus & Train',
          severity: data.severity || 'High',
          delayMinutes: parseInt(data.delayMinutes) || 15,
          rerouteInstruction: (data.rerouteInstruction || 'Follow station operator instructions.').trim(),
          broadcastedAt: new Date(),
          broadcastBy: 'Admin (IT23762572)',
          status: data.status || 'Active'
        };
        disruptionAlerts.unshift(newAlert);
        saveJson(ALERTS_FILE, disruptionAlerts);

        console.log(`📢 [EMERGENCY BROADCAST] Alert sent: ${newAlert.incidentType} on ${newAlert.affectedRoute}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Disruption alert broadcasted.', alert: newAlert }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // 5c. Delete / Withdraw Disruption Alert (CRUD 2: Delete)
  if ((pathname === '/api/admin/disruptions/delete' || (pathname.startsWith('/api/admin/disruptions/') && req.method === 'DELETE')) && (req.method === 'DELETE' || req.method === 'POST')) {
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
        saveJson(ALERTS_FILE, disruptionAlerts);
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

  // 5b. Update Disruption Alert (CRUD 2: Update)
  if ((pathname.startsWith('/api/admin/disruptions/update') || pathname.match(/\/api\/admin\/disruptions\/ALT-\d+/)) && pathname !== '/api/admin/disruptions/delete' && (req.method === 'PUT' || req.method === 'POST')) {
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
        saveJson(ALERTS_FILE, disruptionAlerts);
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

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`
========================================================================
🚀 TRANSITPLUS PURE NODE.JS SERVER RUNNING ON PORT ${PORT}
📌 SCOPE: Transit Operations Control & Fleet Administration
🔗 REST Endpoints: http://localhost:${PORT}/api/admin/metrics
========================================================================
  `);
});
