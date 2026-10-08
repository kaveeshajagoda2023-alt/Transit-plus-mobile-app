import http from 'http';
import WebSocket from 'ws';
import { createServer } from '../src/server.js';
import { wsServer } from '../src/websocket/wsServer.js';
import { db } from '../src/db/database.js';

const TEST_PORT = 5099;
const BASE_URL = `http://localhost:${TEST_PORT}`;
const WS_URL = `ws://localhost:${TEST_PORT}/ws`;

let server: http.Server;

async function request(path: string, options: RequestInit = {}): Promise<{ status: number; body: any }> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    },
  });
  let body: any;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('TRANSITPULSE FULL BACKEND END-TO-END TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean | undefined, detail: string = '') {
    if (Boolean(condition)) {
      console.log(`[PASS] ${name} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} - ${detail}`);
      failed++;
    }
  }

  // 0. Start Server
  db.resetToSeed();
  const app = createServer();
  server = http.createServer(app);
  wsServer.initialize(server);

  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, () => {
      console.log(`Test server running on port ${TEST_PORT}\n`);
      resolve();
    });
  });

  try {
    // 1. Health Check & Root HTML
    console.log('--- 1. Health & Server Status ---');
    const healthRes = await request('/api/health');
    assert('Health Check Status 200', healthRes.status === 200);
    assert('Service Online', healthRes.body?.status === 'ONLINE' && healthRes.body?.version === '4.8.2-ops');

    // 2. Commuter / Passenger Authentication
    console.log('\n--- 2. Commuter / Passenger Authentication ---');
    // Login
    const passLogin = await request('/api/auth/passenger/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'sara.miller@gmail.com', password: 'CommuterPulse2025#' }),
    });
    assert('Passenger Login (Sara Miller)', passLogin.status === 200 && passLogin.body?.success === true);
    const passengerToken = passLogin.body?.token;
    assert('JWT Session Issued', Boolean(passengerToken));

    // Reject bad password
    const badPassRes = await request('/api/auth/passenger/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'sara.miller@gmail.com', password: 'WrongPassword!' }),
    });
    assert('Rejects Bad Password', badPassRes.status === 401 && badPassRes.body?.success === false);

    // Register new commuter
    const regRes = await request('/api/auth/passenger/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Alex River',
        email: 'alex.river@transitpulse.test',
        password: 'SecurePassword2026!',
        concessionType: 'STUDENT_YOUTH',
        agreeToTerms: true,
      }),
    });
    assert('Commuter Registration', regRes.status === 201 && regRes.body?.user?.name === 'Alex River');

    // Verify OTP
    const verifyRes = await request('/api/auth/passenger/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email: 'alex.river@transitpulse.test', code: '849201' }),
    });
    assert('Email OTP Verification', verifyRes.status === 200 && verifyRes.body?.user?.emailVerified === true);

    // Profile with Bearer token
    const profileRes = await request('/api/auth/passenger/profile', {
      headers: { Authorization: `Bearer ${passengerToken}` },
    });
    assert('Protected Commuter Profile', profileRes.status === 200 && profileRes.body?.user?.name === 'Sara Miller');

    // 3. Staff Authentication & Lockout Protection
    console.log('\n--- 3. Staff Authentication & Terminal Access ---');
    // Staff Credential Login
    const staffLogin = await request('/api/auth/staff/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'DRV-84920@transitpulse.gov', password: 'TransitSecure2024!' }),
    });
    assert('Driver Kavithusan Logged In', staffLogin.status === 200 && staffLogin.body?.user?.role === 'DRIVER');
    const staffToken = staffLogin.body?.accessToken;

    // PIN Login
    const pinRes = await request('/api/auth/staff/pin-login', {
      method: 'POST',
      body: JSON.stringify({ pin: '8492', staffId: 'DRV-84920' }),
    });
    assert('Driver Terminal PIN Login', pinRes.status === 200 && pinRes.body?.user?.staffId === 'DRV-84920');

    // NFC Badge Login
    const nfcRes = await request('/api/auth/staff/nfc-login', {
      method: 'POST',
      body: JSON.stringify({ badgeId: 'MTA-NFC-8492-SEC' }),
    });
    assert('RFID/NFC Hardware Badge Login', nfcRes.status === 200 && nfcRes.body?.badgeId === 'MTA-NFC-8492-SEC');

    // Brute-force Lockout Test
    for (let i = 0; i < 5; i++) {
      await request('/api/auth/staff/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: 'DRV-77102', password: 'WrongPassword!' }),
      });
    }
    const lockedRes = await request('/api/auth/staff/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'DRV-77102', password: 'TransitSecure2024!' }),
    });
    assert('Brute Force Account Lockout (5 attempts)', lockedRes.status === 403 && lockedRes.body?.error?.includes('locked'));

    // Dispatcher Unlock
    const unlockRes = await request('/api/auth/staff/unlock', {
      method: 'POST',
      body: JSON.stringify({ staffId: 'DRV-77102' }),
    });
    assert('Dispatcher Security Unlock', unlockRes.status === 200 && unlockRes.body?.success === true);

    // 4. Active Trip Operations
    console.log('\n--- 4. Active Fleet Trip Operations ---');
    const tripRes = await request('/api/trips/active');
    assert('Active Trip Metadata', tripRes.status === 200 && tripRes.body?.routeNumber === 'LINE 42');
    const tripId = tripRes.body?.id;

    // Toggle Doors
    const doorRes = await request(`/api/trips/${tripId}/toggle-doors`, { method: 'POST' });
    assert('Door Status Toggled', doorRes.status === 200 && doorRes.body?.doorStatus === 'CLOSED');

    // Advance Stop
    const stopRes = await request(`/api/trips/${tripId}/advance-stop`, { method: 'POST' });
    assert('Advance Stop along Route', stopRes.status === 200 && stopRes.body?.currentStop === 'Malabe Center');

    // Update Occupancy
    const occRes = await request(`/api/trips/${tripId}/occupancy`, {
      method: 'POST',
      body: JSON.stringify({ delta: 2 }),
    });
    assert('Adjust Passenger Headcount', occRes.status === 200 && occRes.body?.occupiedSeats === 44);

    // Walk-in Cash Fare
    const cashRes = await request(`/api/trips/${tripId}/cash-fare`, {
      method: 'POST',
      body: JSON.stringify({ amount: 50 }),
    });
    assert('Walk-in Cash Fare Collected', cashRes.status === 200 && cashRes.body?.cashFareCount === 5);

    // Report Delay
    const delayRes = await request(`/api/trips/${tripId}/report-delay`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Traffic', estimatedDelayMinutes: 8 }),
    });
    assert('Report Operational Delay (+8m)', delayRes.status === 200 && delayRes.body?.tripStatus === 'DELAYED');

    // Dispatch Alert
    const dspRes = await request(`/api/trips/${tripId}/dispatch`, {
      method: 'POST',
      body: JSON.stringify({ type: 'GENERAL', message: 'Heavy rain near sector 4', priority: 'MEDIUM' }),
    });
    assert('Dispatch Radio Message', dspRes.status === 200 && Boolean(dspRes.body?.messageId));

    // 5. Ticket Validation Engine & Anti-Fraud Scanner
    console.log('\n--- 5. Ticket Validation & Anti-Fraud Scanner Engine ---');
    // Valid Ticket TK-9021
    const val1 = await request(`/api/trips/${tripId}/scan-ticket`, {
      method: 'POST',
      body: JSON.stringify({ ticketId: 'TK-9021', method: 'QR' }),
    });
    assert('Valid Single Ticket (TK-9021) PASS', val1.status === 200 && val1.body?.valid === true && val1.body?.result === 'PASS');

    // Duplicate Scan (TK-9021 again)
    const dupRes = await request(`/api/trips/${tripId}/scan-ticket`, {
      method: 'POST',
      body: JSON.stringify({ ticketId: 'TK-9021', method: 'QR' }),
    });
    assert('Duplicate Scan REJECT', dupRes.status === 200 && dupRes.body?.valid === false && dupRes.body?.reason?.includes('already redeemed'));

    // Pre-seeded Redeemed Ticket (TK-7740)
    const usedRes = await request(`/api/trips/${tripId}/scan-ticket`, {
      method: 'POST',
      body: JSON.stringify({ ticketId: 'TK-7740', method: 'QR' }),
    });
    assert('Already Redeemed Ticket REJECT', usedRes.status === 200 && usedRes.body?.valid === false);

    // Expired Ticket (TK-8832)
    const expRes = await request(`/api/trips/${tripId}/scan-ticket`, {
      method: 'POST',
      body: JSON.stringify({ ticketId: 'TK-8832', method: 'QR' }),
    });
    assert('Expired Ticket REJECT', expRes.status === 200 && expRes.body?.valid === false && expRes.body?.reason?.includes('expired'));

    // Wrong Route Ticket (TK-4411)
    const wrongRes = await request(`/api/trips/${tripId}/scan-ticket`, {
      method: 'POST',
      body: JSON.stringify({ ticketId: 'TK-4411', method: 'QR' }),
    });
    assert('Wrong Route Ticket REJECT', wrongRes.status === 200 && wrongRes.body?.valid === false && wrongRes.body?.reason?.includes('Route 138'));

    // Non-existent Ticket
    const unkRes = await request(`/api/trips/${tripId}/scan-ticket`, {
      method: 'POST',
      body: JSON.stringify({ ticketId: 'UNKNOWN-999', method: 'QR' }),
    });
    assert('Unrecognized Ticket REJECT', unkRes.status === 200 && unkRes.body?.valid === false && unkRes.body?.reason?.includes('not recognized'));

    // Ticket Preview Lookup
    const prevRes = await request('/api/tickets/lookup-preview?code=TK-9055');
    assert('Ticket Preview Lookup (TK-9055)', prevRes.status === 200 && prevRes.body?.ticket?.passengerName === 'Nimal Jayawardena');

    // Issue New Ticket
    const newTkRes = await request('/api/tickets/issue', {
      method: 'POST',
      body: JSON.stringify({ passengerName: 'Dilshan Test', type: 'Day Pass', fareAmount: 150 }),
    });
    assert('Issue New Ticket Pass', newTkRes.status === 201 && Boolean(newTkRes.body?.ticket?.ticketId));

    // Batch Sync Offline Turnstile Scans
    const syncRes = await request('/api/tickets/batch-sync', {
      method: 'POST',
      body: JSON.stringify({ records: [{ ticketId: 'TK-9018', timestamp: Date.now() }] }),
    });
    assert('Batch Sync Offline Turnstile Scans', syncRes.status === 200 && syncRes.body?.pendingCount === 0);

    // 6. Passenger Manifest
    console.log('\n--- 6. Passenger Manifest Management ---');
    const mnfRes = await request(`/api/trips/${tripId}/passengers`);
    assert('Passenger Manifest Fetch', mnfRes.status === 200 && Array.isArray(mnfRes.body?.manifest) && mnfRes.body?.manifest.length >= 4);

    const expMnfRes = await request(`/api/trips/${tripId}/report`);
    assert('Manifest Official Report Export', expMnfRes.status === 200 && Boolean(expMnfRes.body?.report?.exportedAt));

    // 7. Operator Profile & Fleet Maintenance
    console.log('\n--- 7. Operator Profile & Depot Management ---');
    const opProfile = await request('/api/operator/profile');
    assert('Operator Profile Loaded', opProfile.status === 200 && opProfile.body?.staffId === 'DRV-84920');

    // Duty Status Switch
    const dutyRes = await request('/api/operator/duty-status', {
      method: 'POST',
      body: JSON.stringify({ status: 'ON BREAK' }),
    });
    assert('Switch Duty Status to ON BREAK', dutyRes.status === 200 && dutyRes.body?.dutyStatus === 'ON BREAK');

    // Switch Assigned Vehicle
    const switchRes = await request('/api/operator/switch-vehicle', {
      method: 'POST',
      body: JSON.stringify({ busNumber: 'Bus #4208', fleetType: 'Zero-Emission EV' }),
    });
    assert('Switch Assigned Vehicle to Bus #4208', switchRes.status === 200 && switchRes.body?.assignedFleet === 'Bus #4208');

    // Toggles & Diagnostics
    const beepRes = await request('/api/operator/toggle-beep', { method: 'POST', body: JSON.stringify({ enabled: false }) });
    assert('Scanner Beep Toggle OFF', beepRes.status === 200 && beepRes.body?.beepEnabled === false);

    const reBeepRes = await request('/api/operator/toggle-beep', { method: 'POST', body: JSON.stringify({ enabled: true }) });
    assert('Scanner Beep Toggle ON', reBeepRes.status === 200 && reBeepRes.body?.beepEnabled === true);

    const repairRes = await request('/api/operator/reconnect-scanner', { method: 'POST' });
    assert('Hardware Scanner Re-paired', repairRes.status === 200 && repairRes.body?.connected === true);

    const airgapRes = await request('/api/operator/sync-airgap', { method: 'POST' });
    assert('Air-Gap Cryptotoken Cache Synced', airgapRes.status === 200 && airgapRes.body?.synced === true);

    // Vehicle Defect / Fault Report
    const faultRes = await request('/api/operator/report-fault', {
      method: 'POST',
      body: JSON.stringify({
        category: 'Doors & Ramp',
        severity: 'MEDIUM',
        description: 'Rear hydraulic ramp sensor slow to deploy',
        busNumber: 'Bus #4028',
      }),
    });
    assert('Submit Vehicle Maintenance Fault', faultRes.status === 201 && faultRes.body?.report?.status === 'SUBMITTED');

    // Complete Shift Summary
    const shiftSumRes = await request('/api/operator/shift-summary', { method: 'POST' });
    assert('Compile Shift Summary & Clock Out', shiftSumRes.status === 200 && Boolean(shiftSumRes.body?.shiftId));

    // 8. Transit Routes & Fleet Telemetry
    console.log('\n--- 8. Transit Routes & Vehicle Telemetry ---');
    const routesRes = await request('/api/routes');
    assert('List All Transit Routes', routesRes.status === 200 && routesRes.body?.count >= 3);

    const routeSearchRes = await request('/api/routes/search?q=Downtown');
    assert('Search Routes (Downtown)', routeSearchRes.status === 200 && routeSearchRes.body?.routes?.length >= 1);

    const vehiclesRes = await request('/api/vehicles');
    assert('List Fleet Vehicles', vehiclesRes.status === 200 && vehiclesRes.body?.count >= 3);

    const locRes = await request('/api/vehicles/veh-bus-4028/location');
    assert('Vehicle Live GPS Coordinates', locRes.status === 200 && Boolean(locRes.body?.latitude));

    const updateGpsRes = await request('/api/vehicles/veh-bus-4028/telemetry', {
      method: 'POST',
      body: JSON.stringify({ latitude: 6.908, longitude: 79.915, speed: 45, heading: 100 }),
    });
    assert('Update Vehicle IoT Telemetry', updateGpsRes.status === 200 && updateGpsRes.body?.vehicle?.speed === 45);

    // 8B. Passenger Live Map & Search ETA CRUD
    console.log('\n--- 8B. Passenger Live Map & Search ETA CRUD ---');
    // R - Search Destination / Route (Jaffna -> Nallur)
    const jaffnaSearchRes = await request('/api/routes/search?q=Jaffna');
    assert('Search Destination (Jaffna)', jaffnaSearchRes.status === 200 && jaffnaSearchRes.body?.routes?.length >= 1);
    const jaffnaRoute = jaffnaSearchRes.body?.routes?.[0];
    assert('Found Jaffna -> Nallur Route (LINE 765)', jaffnaRoute?.routeNumber === 'LINE 765');

    // R - Read Route ETA & Live Bus Status (ETA: 8 mins)
    const etaRes = await request(`/api/routes/${jaffnaRoute.id}/eta?lat=9.6615&lng=80.0145`);
    assert('Read Route Live ETA', etaRes.status === 200 && Boolean(etaRes.body?.etaMinutes));
    assert('Initial Jaffna Bus Status & ETA', etaRes.body?.status === 'arriving' && etaRes.body?.etaMinutes >= 1);

    // C - Create: Save favourite route / ETA search
    const saveTripRes = await request('/api/routes/saved', {
      method: 'POST',
      body: JSON.stringify({
        routeId: 'route-jaffna-nallur',
        origin: 'Jaffna Central Bus Stand',
        destination: 'Nallur Kandaswamy Kovil',
        customName: 'Jaffna → Nallur Daily Commute',
        isStarred: true,
        passengerId: 'usr-sara-01',
      }),
    });
    assert('Create / Save Favourite Route', saveTripRes.status === 201 && saveTripRes.body?.success === true);
    const savedRouteId = saveTripRes.body?.savedRoute?.id;
    assert('Saved Route Record Stored', Boolean(savedRouteId));

    // R - Read Saved / Favourite Routes
    const getSavedRes = await request('/api/routes/saved?passengerId=usr-sara-01');
    assert('Read Saved Routes List', getSavedRes.status === 200 && getSavedRes.body?.count >= 1);

    // U - Update: Live Bus GPS location changes -> ETA automatically changes
    const updateLocRes = await request('/api/vehicles/veh-bus-jaffna-765/location', {
      method: 'POST',
      body: JSON.stringify({
        latitude: 9.6710,
        longitude: 80.0250,
        speed: 38,
        heading: 50,
        status: 'on-time',
      }),
    });
    assert('Update Bus GPS Location (Bus Moves)', updateLocRes.status === 200 && updateLocRes.body?.success === true);
    assert('ETA Changes Automatically on Bus Movement', typeof updateLocRes.body?.etaMinutes === 'number');

    // D - Delete: Remove saved/favourite route
    const deleteSavedRes = await request(`/api/routes/saved/${savedRouteId}`, {
      method: 'DELETE',
    });
    assert('Delete Saved Route', deleteSavedRes.status === 200 && deleteSavedRes.body?.success === true);

    // Verify Deletion
    const verifyDelRes = await request('/api/routes/saved');
    const stillPresent = verifyDelRes.body?.savedRoutes?.some((r: any) => r.id === savedRouteId);
    assert('Confirm Route Removed from Favourites', stillPresent === false);

    // 9. Terminal Telemetry & Places
    console.log('\n--- 9. Terminal Telemetry & Commuter Amenities ---');
    const termRes = await request('/api/terminal/status');
    assert('Terminal Operational Status', termRes.status === 200 && termRes.body?.transitAuthority?.includes('MTA'));

    const pingRes = await request('/api/terminal/ping');
    assert('Terminal Ping Pong Heartbeat', pingRes.status === 200 && pingRes.body?.pong === true);

    const nearbyRes = await request('/api/services/nearby');
    assert('Nearby Transit Hubs & Amenities', nearbyRes.status === 200 && nearbyRes.body?.count >= 2);

    const placesRes = await request('/api/places/saved');
    assert('Saved Destinations List', placesRes.status === 200 && placesRes.body?.places?.length >= 3);

    // 10. Real-time WebSocket Protocol Verification
    console.log('\n--- 10. Real-Time WebSocket Gateway Testing ---');
    const wsReceivedEvents: string[] = [];

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(WS_URL);
      const timer = setTimeout(() => {
        ws.close();
        resolve();
      }, 2500);

      ws.on('open', () => {
        assert('WebSocket Connection Established', true);
        // Send Ping
        ws.send(JSON.stringify({ type: 'PING' }));

        // Trigger REST event that should emit over WS
        setTimeout(async () => {
          await request(`/api/trips/${tripId}/occupancy`, {
            method: 'POST',
            body: JSON.stringify({ delta: 1 }),
          });
        }, 300);
      });

      ws.on('message', (data: WebSocket.Data) => {
        try {
          const parsed = JSON.parse(data.toString());
          wsReceivedEvents.push(parsed.type);
          if (parsed.type === 'OCCUPANCY_CHANGED') {
            assert('Received OCCUPANCY_CHANGED broadcast via WebSocket', true);
            clearTimeout(timer);
            ws.close();
            resolve();
          }
        } catch {
          // ignore
        }
      });

      ws.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    assert('Received SYSTEM_HEARTBEAT on WS handshake', wsReceivedEvents.includes('SYSTEM_HEARTBEAT'));
    assert('Received PONG response on PING', wsReceivedEvents.includes('PONG'));

    console.log('\n====================================================');
    console.log(`TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});
