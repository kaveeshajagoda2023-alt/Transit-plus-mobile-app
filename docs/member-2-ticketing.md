# Member 2 — Passenger Ticketing

Digital ticketing for passengers: buy a ticket, pay, show a QR pass to the conductor, reschedule, cancel with refund, and view payment history.

## Screens (Expo Router, `src/app/tickets/`)

| Route | Screen | Purpose |
|---|---|---|
| `/tickets` | `MyTicketsScreen` | Tickets tab — upcoming tickets and history, wallet balance, entry to buy |
| `/tickets/buy` | `BuyTicketScreen` | Route, boarding stop, destination, fare type, passengers, travel time, live fare |
| `/tickets/checkout?id=` | `CheckoutScreen` | Fare summary, pay with MetroPay wallet or card, failure handling |
| `/tickets/[id]` | `TicketDetailScreen` | Digital QR pass, validity window, reschedule / cancel / remove actions |
| `/tickets/reschedule?id=` | `RescheduleScreen` | Change travel time (paid) or time, fare type and passengers (unpaid) |
| `/tickets/payments` | `PaymentHistoryScreen` | Payments (paid, failed, refunded) and receipts |

Screens use the team's `TransitColors`, `Header` and `BottomNavigation`, so the module matches the rest of the app.

## Backend API (`/api/ticketing`)

| Method | Endpoint | CRUD | Description |
|---|---|---|---|
| GET | `/routes` | R | Routes and stops for the booking form |
| POST | `/quote` | — | Fare breakdown |
| POST | `/tickets` | **C** | Book a ticket (status `PENDING_PAYMENT`) |
| GET | `/tickets?passengerId=&view=active\|history` | **R** | List a passenger's tickets |
| GET | `/tickets/:id` | **R** | Ticket details (+ payment) |
| PATCH | `/tickets/:id` | **U** | Reschedule paid ticket / edit unpaid booking |
| DELETE | `/tickets/:id` | **D** | Discard unpaid booking or remove used/expired/cancelled ticket from history |
| POST | `/tickets/:id/pay` | — | Pay with `WALLET` or `CARD` |
| GET | `/tickets/:id/cancellation-preview` | — | Refund amount before cancelling |
| POST | `/tickets/:id/cancel` | — | Cancel and refund |
| GET | `/payments?passengerId=` | R | Payment history |
| GET | `/payments/:id` | R | Receipt |
| GET | `/wallet/:passengerId` | R | MetroPay balance |

Data is stored in MongoDB Atlas (`PassengerTicket`, `TicketPayment` collections) when connected, otherwise in memory — the same pattern the rest of the backend uses.

### Integration with the conductor scanner (Member 3)

The QR code encodes the ticket number (e.g. `TP-7F3K9Q`). When a ticket is paid it is registered with the scanner registry (`db.issueTicket`), so `POST /api/tickets/validate` accepts it. After a scan the ticket becomes **Used** in the passenger app; cancelled tickets are rejected by the scanner.

## Business rules (`backend/src/ticketing/fareRules.ts`)

- Fare: bus Rs. 40 + Rs. 30 per stop; train Rs. 60 + Rs. 45 per stop; Express routes × 1.5
- Student, senior and child fares: 50% off. Default fare type comes from the account's concession type
- 1–10 passengers per ticket; travel up to 30 days ahead
- Valid from 30 min before to 3 h after the travel time
- Paid tickets: reschedule up to 2 times, only before the validity window opens
- Refund: 100% if cancelled more than 2 h before the window opens, 50% within 2 h, 0% once it has started
- Card numbers are checked with the Luhn algorithm; only brand + last 4 digits are stored
- Test cards: `4242 4242 4242 4242` succeeds, `4000 0000 0000 0002` is declined

## Offline demo mode

If the app cannot reach the backend, ticketing switches to an on-device demo engine with the same rules (`src/services/ticketing/offlineTicketing.ts`) and shows a "Server offline" banner with a Retry button. Useful for usability testing on a phone without the server.

## Tests

```bash
cd backend
npm run test:ticketing
```

| ID | Test case |
|---|---|
| TC-M2-01 | Load routes and stops for booking |
| TC-M2-02 | Fare quote applies 50% student concession |
| TC-M2-03 | Create ticket (status PENDING_PAYMENT) |
| TC-M2-04 | Reject booking with same boarding and destination stop |
| TC-M2-05 | Reject booking with a past travel date |
| TC-M2-06 | Reject more than 10 passengers |
| TC-M2-07 | List active tickets for passenger |
| TC-M2-08 | Get single ticket by ID |
| TC-M2-09 | Edit unpaid booking recalculates fare |
| TC-M2-10 | Reject invalid card number (Luhn check) |
| TC-M2-11 | Declined card records FAILED payment, ticket stays unpaid |
| TC-M2-12 | Insufficient wallet balance is rejected |
| TC-M2-13 | Wallet payment activates ticket and deducts balance |
| TC-M2-14 | Cannot pay twice for the same ticket |
| TC-M2-15 | Reschedule paid ticket moves validity window |
| TC-M2-16 | Paid ticket cannot change passenger count |
| TC-M2-17 | Cancellation preview gives 100% refund well before travel |
| TC-M2-18 | Cancel ticket refunds wallet and marks payment REFUNDED |
| TC-M2-19 | Conductor scanner rejects a cancelled ticket |
| TC-M2-20 | Paid ticket QR passes conductor scan and becomes USED |
| TC-M2-21 | Active ticket cannot be deleted |
| TC-M2-22 | Remove used ticket from history |
| TC-M2-23 | Discard unpaid booking |
| TC-M2-24 | Payment history lists successful, failed and refunded payments |
| TC-M2-25 | View payment receipt |

## New dependencies

`react-native-svg` (Expo SDK version) and `react-native-qrcode-svg` for the QR pass — both work in Expo Go.
