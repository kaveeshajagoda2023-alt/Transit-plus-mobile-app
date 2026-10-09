# Transit-plus-mobile-app

TransitPulse – Member 2: **Passenger Ticketing** (SLIIT IT3060, Milestone 03).
React Native CLI 0.73 app + Node/Express/MongoDB API.

```
backend/   Express API (auth, routes/fares, tickets, payments, QR validation)
mobile/    React Native app (Android)
docs/      Requirements, test cases, traceability, usability plan, deviations
```

## 1. Prerequisites

- Node.js 18+ (tested with Node 24), npm
- Android phone with **wireless debugging** paired to the laptop, both on the same Wi-Fi
- MongoDB Atlas cluster (or a local MongoDB)
- JDK 17 + Android SDK (for building the app)

All commands below are for **Windows PowerShell** (`npm.cmd` / `npx.cmd`).

## 2. Backend

```powershell
cd backend
npm.cmd install
Copy-Item .env.example .env      # first time only, then edit .env
npm.cmd run seed                 # routes, demo users, demo tickets
npm.cmd run dev                  # or: npm.cmd start
```

### `.env` variables

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | Signs login tokens (required) |
| `JWT_EXPIRES_IN` | Login lifetime, e.g. `7d` |
| `QR_SIGNING_SECRET` | HMAC key for the dynamic QR (falls back to `JWT_SECRET` if empty) |
| `PAYMENT_SUCCESS_RATE` | Mock gateway success chance, default `0.9` |

Generate secrets with
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

Check it works: open `http://<LAN-IP>:5000/api/health` in the phone's browser. It should show `"database":"connected"`.

### Tests

```powershell
cd backend
npm.cmd test
```

Jest + supertest run against an in-memory MongoDB (the first run downloads a ~600 MB MongoDB binary to `%USERPROFILE%\.cache\mongodb-binaries`).

### Seed

`npm.cmd run seed` is safe to re-run. It:
- upserts 8 Sri Lankan routes (138, 100, 177, 187, 154, 01, 02, EX01) with fare tables,
- creates/resets 3 demo accounts and the demo passenger's tickets,
- removes documents left by the first (pre-auth) version of the ticket/payment collections and syncs indexes.

## 3. Mobile app

### Set the LAN IP

1. `ipconfig` → *Wireless LAN adapter Wi-Fi* → **IPv4 Address** (e.g. `192.168.8.170`).
2. Edit `mobile/src/config/env.js`:
   ```js
   export const API_BASE_URL = 'http://192.168.8.170:5000/api';
   ```
   Never use `localhost` – on the phone that is the phone itself.

### Run

```powershell
cd mobile
npm.cmd install
npx.cmd react-native start                 # terminal 1 – Metro
npx.cmd react-native run-android           # terminal 2 – build & install (needs a rebuild after new native deps)
```

With wireless debugging: `adb pair <ip:port>` then `adb connect <ip:port>` and check `adb devices` before `run-android`.
If Metro is not reachable from the phone, run `adb reverse tcp:8081 tcp:8081`, or set the debug server host to `<LAN-IP>:8081` in the dev menu.

Check that the JS bundle compiles:

```powershell
npx.cmd react-native bundle --platform android --dev false --entry-file index.js --bundle-output $env:TEMP\test.bundle
```

## 4. Demo accounts and test cards

| Account | Password | Notes |
|---|---|---|
| passenger@transitpulse.lk | Passenger@123 | Adult, has active/used/expired/refunded tickets + saved Visa 4242 |
| student@transitpulse.lk | Student@123 | Student (50% fare) |
| conductor@transitpulse.lk | Conductor@123 | role `conductor` – use on a 2nd phone to scan |

| Card | Result |
|---|---|
| 4242 4242 4242 4242 | Always approved |
| 4000 0000 0000 0002 | Always declined (demo a failed payment) |
| 5555 5555 5555 4444 | Mastercard, approved 90% of the time |

Any future expiry (e.g. `12/30`) and any 3-digit CVV. Cards are validated (Luhn, expiry, CVV) in memory; only brand + last 4 digits are stored.

## 5. Main API endpoints

All responses: `{ success, message, data }`. Everything except auth, health and routes needs `Authorization: Bearer <token>`.

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Profile | `GET/PUT/DELETE /api/users/me` |
| Routes | `GET /api/routes`, `GET /api/routes/:id/fare?from=&to=&type=&passengers=` |
| Tickets | `POST/GET /api/tickets`, `GET/PUT/DELETE /api/tickets/:id`, `POST /api/tickets/:id/cancel`, `POST /api/tickets/:id/rebook` |
| Dynamic QR | `GET /api/tickets/:id/qr`, `POST /api/tickets/:id/qr/rotate` |
| Payments | `POST /api/payments/checkout`, `GET /api/payments`, `GET /api/payments/:id`, `GET/POST /api/payments/methods`, `PUT/DELETE /api/payments/methods/:id`, `PUT /api/payments/methods/:id/default` |
| Validation | `POST /api/validation/scan`, `GET /api/validation/logs` |
| Health | `GET /api/health` |

## 6. Merging with other members

- Placeholder screens and navigation names for Member 1 (Live Map, Search & ETA), Member 3 (Driver/Conductor) and Member 4 (Admin) are in `mobile/src/navigation/ExternalModules.js`. Replace each placeholder component with the real screen.
- `User.role` (`passenger | conductor | admin`) and `requireRole()` in `backend/src/middleware/authMiddleware.js` are ready for Members 3 and 4.
- `GET /api/routes` is public so other modules can reuse route/stop data.

## 7. Troubleshooting

| Problem | Fix |
|---|---|
| App shows "Unable to connect to TransitPulse server" | Laptop IP changed → update `env.js`; backend running?; phone on same Wi-Fi; allow Node.js through Windows Firewall (Private network) |
| `/api/health` shows `database: disconnected` | Check `MONGODB_URI`, Atlas *Network Access* allows your IP |
| Login works but tickets fail with E11000 duplicate key | Old indexes from the first version – run `npm.cmd run seed` once |
| `EADDRINUSE :5000` | Another backend (e.g. nodemon) is already running – stop it or change `PORT` |
| Camera is black / no permission prompt | Phone Settings → Apps → TransitPulse → Permissions → Camera; rebuild after manifest changes |
| Red screen "AsyncStorage is null" | Native module not linked yet – rebuild with `npx.cmd react-native run-android` |
| QR shows "Connection problem" banner | The 30 s QR could not refresh; it will be rejected once the ring reaches 0 – reconnect |
| Metro cache issues | `npx.cmd react-native start --reset-cache` |
