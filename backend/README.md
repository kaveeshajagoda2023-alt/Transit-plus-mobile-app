# TransitPulse Central Operations & Fleet API Server ⚡

A high-performance, modular **Node.js + Express + WebSocket** backend engine powering the **TransitPulse** public transit system. It provides real-time fleet telemetry, cryptographic ticket validation (QR/NFC), automated turnstile anti-fraud verification, driver/conductor dispatch terminals, passenger manifest management, commuter authentication, and live WebSocket broadcasts.

---

## 🌟 Key Architecture & Capabilities

1. **Authentication & Identity System**
   - **Commuter Authentication**: User registration with concession types (`STANDARD_ADULT`, `STUDENT_YOUTH`, `SENIOR_CONCESSION`), password hashing (`bcrypt`), email OTP verification (`849201`), password recovery, Google/Apple OAuth social sign-in, and JWT session issuance.
   - **Staff Operations & Security**: Driver/Conductor/Dispatcher credential authentication with brute-force lockout (locked after 5 consecutive failed attempts), rapid 4-digit PIN authentication for turnstiles, and RFID/NFC hardware staff badge authentication.
2. **Real-Time Fleet & Active Trip Engine**
   - Active trip metadata (`LINE 42`, `Bus #4028`, Driver assignment, Stop schedule, ETA).
   - Turnstile pneumatic door toggle (`OPEN` / `CLOSED`).
   - Stop advancement along transit route with automatic ETA recalculations.
   - Real-time passenger occupancy headcount updates (+/- delta).
   - Cash fare ticketing & revenue tracking.
   - Delay logging (`Traffic`, `Mechanical`, `Weather`, etc.) with dispatch alerts.
   - Dispatch emergency/assistance messaging.
3. **Turnstile Ticket Validation & Scanner Engine**
   - High-throughput cryptographic & database QR / NFC ticket validation.
   - Anti-fraud rejection for already redeemed tickets (`USED`), expired tickets (`EXPIRED`), unrecognized barcodes, and incorrect route tickets (`LINE 42` vs `ROUTE 138`).
   - Instant ticket preview (`/api/tickets/lookup-preview?code=...`) without burning/marking as redeemed.
   - Air-gap / offline turnstile queue batch synchronization (`/api/tickets/batch-sync`).
4. **Passenger Manifest System**
   - Live roster of onboard passengers with seat assignments, boarding stops, fare categories, and validation statuses.
   - Manual boarding override check-in.
   - Official manifest export for regulatory compliance.
5. **Operator Profile & Depot Diagnostics**
   - Duty status switching (`ON DUTY`, `OFF DUTY`, `ON BREAK`).
   - Vehicle fleet switching (e.g., transition to `Bus #4208 Zero-Emission EV`).
   - Diagnostic toggles: turnstile audio beeps, optical validator auto-brightness boost.
   - Hardware scanner re-pairing and cryptographic token cache synchronization.
   - Vehicle defect/maintenance reporting (`Brakes`, `Doors & Ramp`, `Electrical`, etc.).
   - End-of-shift compilation & clock-out summary reports.
6. **Routes, Fleet GPS & Live Telemetry**
   - Transit lines listing (filter by `bus`, `train`, `starred`), route search, and stop coordinates.
   - Vehicle fleet tracking, live GPS coordinates (`lat`, `lng`, `speed`, `heading`), and IoT telemetry ingestion.
7. **Real-Time WebSocket Gateway (`ws://localhost:5000/ws`)**
   - Broadcasts real-time events (`TRIP_UPDATE`, `TICKET_SCANNED`, `OCCUPANCY_CHANGED`, `STOP_ADVANCED`, `DOORS_TOGGLED`, `DELAY_ALERT`, `DISPATCH_ALERT`, `MAINTENANCE_FAULT`, `VEHICLE_TELEMETRY`).
   - Heartbeat ping/pong support.
8. **Interactive Visual Dashboard**
   - Visiting `http://localhost:5000` renders an interactive operations console and API catalog.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# From workspace root
npm run backend:dev

# Or inside the backend folder
cd backend
npm install
npm run dev
```

### 2. Available Scripts
- `npm run backend`: Runs the backend server using `tsx`.
- `npm run backend:dev`: Runs the backend server with live reload on file changes (`tsx watch`).
- `npm run backend:test`: Executes the full 53-point automated integration test suite across all 10 subsystems and the WebSocket layer.

---

## ⚙️ Configuration (.env)

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5000` | HTTP & WebSocket server port |
| `NODE_ENV` | `development` | Runtime environment |
| `JWT_SECRET` | `transitpulse_super_secret...` | Secret key used for signing session tokens |
| `JWT_EXPIRATION` | `7d` | Session expiration window |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |
| `DEFAULT_TRANSIT_AUTHORITY` | `Metro Transit Authority (MTA)` | Transit authority identity |
| `DEFAULT_DISPATCH_ZONE` | `DISPATCH ZONE 4` | Operating dispatch zone |

---

## 📡 REST API Reference

### Commuter Authentication (`/api/auth/passenger`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register commuter account (name, email, password, concession) |
| `POST` | `/login` | Commuter login returning JWT token & user object |
| `POST` | `/verify-otp` | Verify 6-digit email confirmation code (`849201`) |
| `POST` | `/social-login` | Google / Apple ID SSO token exchange |
| `POST` | `/forgot-password` | Request password reset instructions |
| `GET` | `/profile` | Retrieve authenticated commuter profile (`Bearer token`) |
| `PATCH`| `/profile` | Update commuter profile details |

### Staff Operations Authentication (`/api/auth/staff`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/login` | Staff login with lockout protection after 5 bad attempts |
| `POST` | `/pin-login` | Driver console 4-digit PIN authentication |
| `POST` | `/nfc-login` | Hardware RFID/NFC staff badge authentication |
| `POST` | `/unlock` | Dispatcher override to unlock locked staff account |
| `GET` | `/profile` | Retrieve authenticated staff profile |

### Active Trip Operations (`/api/trips`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/active` | Retrieve real-time active trip metadata and occupancy |
| `GET` | `/:id` | Retrieve specific trip details |
| `POST` | `/:id/toggle-doors` | Toggle pneumatic doors `OPEN` / `CLOSED` |
| `POST` | `/:id/advance-stop` | Move vehicle to next stop along line |
| `POST` | `/:id/occupancy` | Adjust onboard headcount (`{ delta: 1 }`) |
| `POST` | `/:id/cash-fare` | Record cash fare transaction (`{ amount: 50 }`) |
| `POST` | `/:id/report-delay`| Report delay with minutes & reason |
| `POST` | `/:id/dispatch` | Send radio/dispatch broadcast |
| `POST` | `/:id/end` | Complete active trip |
| `POST` | `/:id/scan-ticket` | Validate ticket against active trip rules |
| `GET` | `/:id/passengers` | Retrieve passenger manifest |
| `POST` | `/:id/passengers/:passengerId/board` | Check-in / board passenger |
| `GET` | `/:id/report` | Export official shift manifest report |

### Ticket Engine & Scanner (`/api/tickets`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/validate` | Direct ticket validation endpoint |
| `GET` | `/lookup-preview?code=:id` | Preview ticket metadata without redeeming |
| `POST` | `/issue` | Issue new ticket pass |
| `POST` | `/batch-sync` | Synchronize offline air-gap scan queue |

### Operator Profile & Depot Management (`/api/operator`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/profile` | Full operator profile, telemetry KPIs, certifications |
| `POST` | `/duty-status` | Update duty status (`ON DUTY`, `OFF DUTY`, `ON BREAK`) |
| `POST` | `/switch-vehicle` | Switch assigned fleet vehicle |
| `POST` | `/toggle-beep` | Toggle validator audio feedback |
| `POST` | `/toggle-brightness` | Toggle turnstile screen brightness boost |
| `POST` | `/reconnect-scanner` | Re-pair hardware optical scanner |
| `POST` | `/sync-airgap` | Sync cryptographic token cache |
| `POST` | `/report-fault` | File vehicle defect report to maintenance |
| `GET` | `/faults` | List maintenance defect reports |
| `POST` | `/shift-summary` | Compile shift report and clock out |

### Routes, Fleet GPS & Amenities (`/api/routes`, `/api/vehicles`, `/api/...`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/routes` | List transit routes (filter: `all`, `bus`, `train`, `starred`) |
| `GET` | `/api/routes/search?q=...` | Search routes and stops |
| `GET` | `/api/routes/:id` | Specific route coordinates and stop sequence |
| `GET` | `/api/vehicles` | List fleet vehicles with live status |
| `GET` | `/api/vehicles/:id/location` | Vehicle live GPS coordinates, heading, speed |
| `POST` | `/api/vehicles/:id/telemetry`| Ingest GPS coordinates from vehicle IoT tracker |
| `GET` | `/api/terminal/status` | Terminal operational status and ping |
| `GET` | `/api/terminal/ping` | Latency ping check |
| `GET` | `/api/services/nearby` | Nearby transit stations and bay departures |
| `GET` | `/api/places/saved` | Saved commuter destinations |
| `GET` | `/api/places/recent` | Recent searches |

---

## ⚡ WebSocket Gateway

Connect to:
```
ws://localhost:5000/ws
```

### Initial Message
Upon connection, the server sends a `SYSTEM_HEARTBEAT`:
```json
{
  "type": "SYSTEM_HEARTBEAT",
  "payload": {
    "status": "CONNECTED",
    "serverTime": "2026-10-08T05:50:00.000Z",
    "activeTripId": "TRIP-4028-0941",
    "totalClients": 1
  },
  "timestamp": "2026-10-08T05:50:00.000Z"
}
```

### Ping / Pong Heartbeat
Send:
```json
{ "type": "PING" }
```
Receive:
```json
{ "type": "PONG", "payload": { "timestamp": "2026-10-08T05:50:01.000Z" } }
```

### Broadcast Events
Subscribers automatically receive events whenever backend state updates:
- `TICKET_SCANNED`
- `OCCUPANCY_CHANGED`
- `STOP_ADVANCED`
- `DOORS_TOGGLED`
- `DELAY_ALERT`
- `DISPATCH_ALERT`
- `MAINTENANCE_FAULT`
- `VEHICLE_TELEMETRY`
