# Requirement IDs – Member 2 Passenger Ticketing

## Functional requirements

| ID | Feature | Requirement |
|---|---|---|
| FR-01 | Digital Ticketing | The passenger can choose a route, boarding and destination stops, passenger type, passenger count and travel date/time, see the fare calculated live, and create a ticket (status `PENDING_PAYMENT`). |
| FR-02 | Online Payment | The passenger can pay for a ticket by card (new or saved), wallet or cash on board through a mock gateway. A successful payment activates the ticket and issues a receipt. A declined payment leaves the ticket unpaid and lets the passenger retry. Saved cards can be added, edited, set as default and removed. Payment history and receipts can be viewed. |
| FR-03 | Dynamic QR Digital Ticket | An active ticket shows a QR code containing a server-signed token (HMAC-SHA256) that expires after 30 s and refreshes automatically with a countdown. The passenger can force a new code (rotate), which invalidates older codes. |
| FR-04 | Ticket Purchase History | The passenger can list their tickets with status filters (Active / Used / Cancelled / Expired), search, pull-to-refresh and pagination, hide finished tickets and rebook a past trip. |
| FR-05 | Ticket Details | The passenger can view all ticket information (number, route, stops, validity window, passengers, fares, payment, usage/refund) with a status badge shown as colour + icon + text, and change the travel time (and the passenger count before payment). |
| FR-06 | Ticket Cancellation / Status | The passenger can cancel an active unused ticket after seeing a refund preview: 100% refund if more than 2 h before validity starts, 50% if less, 0% after it starts. Ticket status moves through `PENDING_PAYMENT → ACTIVE → USED / EXPIRED / CANCELLED / REFUNDED`. |
| FR-07 | QR Scanner | The app scans ticket QR codes with the device camera, with a framing overlay, torch toggle and a clear permission-denied state. |
| FR-08 | QR Ticket Validation | The server verifies the QR signature, token expiry, ticket status, validity window and previous use. A valid scan marks the ticket `USED`. Each scan is stored in a scan log and shown as Valid / Already used / Expired / Invalid with a reason. |
| FR-09 | Profile / Passenger Information | The passenger can register, log in and out, view and edit their profile (name, phone, passenger type, language), manage saved payment methods and delete their account after a password confirmation. |
| FR-10 | Navigation | The app has an auth flow (Splash → Login/Register) and bottom tabs (Home, Buy Ticket, My Tickets, Scan, Profile) linking all Member 2 screens, plus entry points to the other members' modules (Live Map, Search & ETA, Driver/Conductor, Admin). |

## Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 | Security: passwords hashed with bcrypt; JWT authentication; users can only access their own tickets/payments; full card numbers and CVVs are never stored; rate limiting on login and checkout. |
| NFR-02 | Usability/Accessibility: touch targets ≥ 48 dp, accessibility labels on interactive elements, status never shown by colour alone, WCAG AA contrast for text and buttons. |
| NFR-03 | Feedback: loading skeletons/spinners, empty states, friendly error messages with retry, confirmation for destructive actions, toast feedback after actions, inline form validation. |
| NFR-04 | Reliability: consistent `{ success, message, data }` responses with correct HTTP status codes; validation on every endpoint; automated API tests. |
