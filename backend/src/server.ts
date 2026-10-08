import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { db } from './db/database.js';

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger
  app.use((req: Request, res: Response, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
      console.log(
        `\x1b[90m${new Date().toISOString()}\x1b[0m ${req.method.padEnd(6)} ${req.path.padEnd(35)} ${statusColor}${res.statusCode}\x1b[0m \x1b[90m(${duration}ms)\x1b[0m`
      );
    });
    next();
  });

  // Root Web Dashboard with live status and interactive API catalog
  app.get('/', (req: Request, res: Response) => {
    const activeTrip = db.getActiveTrip();
    const operator = db.getOperatorProfile();
    const vehicles = db.getVehicles();
    const routes = db.getRoutes();

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TransitPulse — Central Transit & Fleet Operations API</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090D16;
      --card-bg: #111726;
      --card-border: #1E293B;
      --primary: #3B82F6;
      --primary-light: #60A5FA;
      --accent: #10B981;
      --warning: #F59E0B;
      --danger: #EF4444;
      --text: #F1F5F9;
      --text-muted: #94A3B8;
      --font-sans: 'Plus Jakarta Sans', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      padding: 32px 24px;
      line-height: 1.5;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--card-border);
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand { display: flex; align-items: center; gap: 14px; }
    .logo-badge {
      width: 44px; height: 44px; border-radius: 12px;
      background: linear-gradient(135deg, #2563EB, #7C3AED);
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; font-weight: 800; color: #fff;
      box-shadow: 0 8px 20px rgba(37,99,235,0.35);
    }
    .brand h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .brand p { font-size: 13px; color: var(--text-muted); }
    .status-pill {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 16px; border-radius: 9999px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--accent); font-size: 13px; font-weight: 600;
    }
    .pulse-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 10px var(--accent);
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
    
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; margin-bottom: 32px; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px;
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover { border-color: rgba(96, 165, 250, 0.4); transform: translateY(-2px); }
    .card-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); font-weight: 700; margin-bottom: 8px; }
    .card-value { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 4px; }
    .card-sub { font-size: 13px; color: var(--text-muted); }

    .section-title {
      font-size: 18px; font-weight: 700; margin: 36px 0 16px 0;
      display: flex; align-items: center; gap: 10px;
    }
    .table-container {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 32px;
    }
    table { width: 100%; border-collapse: collapse; font-size: 14px; text-align: left; }
    th {
      background: #0D1322;
      padding: 14px 18px;
      font-weight: 700;
      color: var(--text-muted);
      border-bottom: 1px solid var(--card-border);
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.8px;
    }
    td { padding: 14px 18px; border-bottom: 1px solid rgba(30, 41, 59, 0.6); }
    tr:last-child td { border-bottom: none; }
    .method {
      display: inline-block; padding: 4px 10px; border-radius: 6px;
      font-family: var(--font-mono); font-size: 11px; font-weight: 700;
    }
    .get { background: rgba(59, 130, 246, 0.15); color: var(--primary-light); border: 1px solid rgba(59, 130, 246, 0.3); }
    .post { background: rgba(16, 185, 129, 0.15); color: var(--accent); border: 1px solid rgba(16, 185, 129, 0.3); }
    .patch { background: rgba(245, 158, 11, 0.15); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.3); }
    .endpoint-path { font-family: var(--font-mono); color: #E2E8F0; font-size: 13px; }
    .ws-box {
      background: linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08));
      border: 1px dashed rgba(96, 165, 250, 0.4);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 32px;
    }
    .code-block {
      background: #090D16;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 14px;
      font-family: var(--font-mono);
      font-size: 13px;
      color: #38BDF8;
      overflow-x: auto;
      margin-top: 10px;
    }
    footer {
      text-align: center;
      padding-top: 32px;
      border-top: 1px solid var(--card-border);
      color: var(--text-muted);
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <div class="logo-badge">⚡</div>
        <div>
          <h1>TransitPulse Central Operations API</h1>
          <p>Real-Time Public Transit Dispatch, Ticket Validation & Fleet Telemetry Engine</p>
        </div>
      </div>
      <div class="status-pill">
        <span class="pulse-dot"></span>
        <span>OPS SYSTEM ONLINE (PORT ${config.port})</span>
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <div class="card-title">Active Fleet Trip</div>
        <div class="card-value">${activeTrip.routeNumber}</div>
        <div class="card-sub">${activeTrip.busNumber} • Driver: ${activeTrip.driverName}</div>
      </div>
      <div class="card">
        <div class="card-title">Real-Time Occupancy</div>
        <div class="card-value">${activeTrip.occupiedSeats} / ${activeTrip.totalSeats}</div>
        <div class="card-sub">${Math.round((activeTrip.occupiedSeats / activeTrip.totalSeats) * 100)}% Capacity • Stop: ${activeTrip.currentStop}</div>
      </div>
      <div class="card">
        <div class="card-title">Shift Revenue & Validations</div>
        <div class="card-value">Rs ${activeTrip.shiftDigitalFareTotal}</div>
        <div class="card-sub">${activeTrip.digitalQrCount} Digital QR / NFC • ${activeTrip.cashFareCount} Walk-in Cash</div>
      </div>
      <div class="card">
        <div class="card-title">Assigned Operator</div>
        <div class="card-value">${operator.name}</div>
        <div class="card-sub">${operator.staffId} • ${operator.dutyStatus} • Rating: ${operator.rating} ★</div>
      </div>
    </div>

    <div class="ws-box">
      <h3 style="font-size: 16px; margin-bottom: 6px;">⚡ Real-Time WebSocket Telemetry Gateway</h3>
      <p style="font-size: 13px; color: var(--text-muted);">
        Connect your mobile client or dispatch station to listen to live ticket validations, stop announcements, vehicle GPS movements, and turnstile events.
      </p>
      <div class="code-block">ws://${req.headers.host || 'localhost:' + config.port}/ws</div>
    </div>

    <div class="section-title">📡 Complete API Route Registry (All Subsystems)</div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Endpoint</th>
            <th>Subsystem</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/health</td>
            <td>System</td>
            <td>Server uptime, service status, MongoDB state, and version</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/passengers</td>
            <td>Commuter CRUD</td>
            <td>List all passengers (search, filter by status/concession, pagination)</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/passengers</td>
            <td>Commuter CRUD</td>
            <td>Create new passenger record with profile, balance, concession</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/passengers/:id</td>
            <td>Commuter CRUD</td>
            <td>Retrieve single passenger details by ID or email</td>
          </tr>
          <tr>
            <td><span class="method patch">PATCH</span></td>
            <td class="endpoint-path">/api/passengers/:id</td>
            <td>Commuter CRUD</td>
            <td>Update passenger profile, contact info, balance, status</td>
          </tr>
          <tr>
            <td><span class="method delete">DELETE</span></td>
            <td class="endpoint-path">/api/passengers/:id</td>
            <td>Commuter CRUD</td>
            <td>Permanently delete passenger record</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/drivers</td>
            <td>Driver CRUD</td>
            <td>List all drivers & operators (search, filter by zone/status, pagination)</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/drivers</td>
            <td>Driver CRUD</td>
            <td>Create new driver profile with staffId, license, vehicle assignment</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/drivers/:id</td>
            <td>Driver CRUD</td>
            <td>Retrieve driver profile by ID or Staff ID</td>
          </tr>
          <tr>
            <td><span class="method patch">PATCH</span></td>
            <td class="endpoint-path">/api/drivers/:id</td>
            <td>Driver CRUD</td>
            <td>Update driver details, vehicle, duty hours, phone</td>
          </tr>
          <tr>
            <td><span class="method delete">DELETE</span></td>
            <td class="endpoint-path">/api/drivers/:id</td>
            <td>Driver CRUD</td>
            <td>Permanently delete driver record</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/auth/passenger/register</td>
            <td>Commuter Auth</td>
            <td>Register commuter with role, concession, password hashing</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/auth/passenger/login</td>
            <td>Commuter Auth</td>
            <td>Authenticate commuter by email/ID, issue JWT session</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/auth/passenger/verify-otp</td>
            <td>Commuter Auth</td>
            <td>Verify 6-digit email OTP and activate account</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/auth/passenger/social-login</td>
            <td>Commuter Auth</td>
            <td>Google / Apple ID SSO token exchange</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/auth/staff/login</td>
            <td>Staff Auth</td>
            <td>Driver / Conductor credential login with lockout protection</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/auth/staff/pin-login</td>
            <td>Staff Auth</td>
            <td>Rapid 4-digit PIN access for driver console terminal</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/auth/staff/nfc-login</td>
            <td>Staff Auth</td>
            <td>Hardware RFID/NFC staff badge authentication</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/trips/active</td>
            <td>Operations</td>
            <td>Get real-time trip status, stops, doors, headcount, revenue</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/trips/:id/scan-ticket</td>
            <td>Scanner Engine</td>
            <td>Validate QR / NFC ticket, anti-fraud check, occupancy update</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/trips/:id/toggle-doors</td>
            <td>Operations</td>
            <td>Toggle bus pneumatic doors OPEN / CLOSED</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/trips/:id/advance-stop</td>
            <td>Operations</td>
            <td>Advance vehicle to next route stop, recompute ETAs</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/trips/:id/occupancy</td>
            <td>Operations</td>
            <td>Adjust onboard passenger headcount (+/- delta)</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/trips/:id/cash-fare</td>
            <td>Farebox</td>
            <td>Record walk-in passenger cash fare transaction</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/trips/:id/report-delay</td>
            <td>Dispatch</td>
            <td>Log traffic / mechanical delay with minutes & reason</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/trips/:id/dispatch</td>
            <td>Dispatch</td>
            <td>Send high-priority radio / dispatch alert</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/trips/:id/passengers</td>
            <td>Manifest</td>
            <td>Passenger boarding manifest with seat and fare classes</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/trips/:id/report</td>
            <td>Manifest</td>
            <td>Export official shift passenger manifest report</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/tickets/lookup-preview</td>
            <td>Ticketing</td>
            <td>Preview ticket barcode metadata without burning</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/tickets/issue</td>
            <td>Ticketing</td>
            <td>Issue / purchase new digital QR fare pass</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/tickets/batch-sync</td>
            <td>Air-Gap Sync</td>
            <td>Synchronize offline turnstile cryptographic validation queue</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/operator/profile</td>
            <td>Operator</td>
            <td>Driver telemetry, CDL certifications, shift math, rating</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/operator/duty-status</td>
            <td>Operator</td>
            <td>Switch duty status (ON DUTY, OFF DUTY, ON BREAK)</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/operator/switch-vehicle</td>
            <td>Fleet Ops</td>
            <td>Re-assign operator to another vehicle / bus fleet</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/operator/report-fault</td>
            <td>Maintenance</td>
            <td>File vehicle defect / maintenance report to dispatch</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td class="endpoint-path">/api/operator/shift-summary</td>
            <td>Operator</td>
            <td>Compile end-of-shift report and clock out</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/routes</td>
            <td>Routes</td>
            <td>List all transit routes (filter: bus, train, starred)</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/routes/search</td>
            <td>Routes</td>
            <td>Search routes and stops by name, number, or stop</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/vehicles</td>
            <td>Fleet GPS</td>
            <td>List all fleet vehicles with real-time GPS coordinates</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/vehicles/:id/location</td>
            <td>Fleet GPS</td>
            <td>Live vehicle GPS telemetry, heading, and speed</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/terminal/status</td>
            <td>Terminal</td>
            <td>Terminal connection status, ping latency, dispatch zone</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/services/nearby</td>
            <td>Commuter</td>
            <td>Nearby transit hubs, stations, and bay departures</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td class="endpoint-path">/api/places/saved</td>
            <td>Commuter</td>
            <td>Saved commuter destinations (Home, Work, Campus)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer>
      TransitPulse Operations Infrastructure • Metro Transit Authority (MTA) • All rights reserved
    </footer>
  </div>
</body>
</html>`;

    res.send(html);
  });

  // Mount API router
  app.use('/api', apiRouter);

  // 404 & Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
