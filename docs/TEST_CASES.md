# Functional Test Cases – Member 2 Passenger Ticketing

Preconditions unless stated: backend running and seeded (`npm.cmd run seed`), app logged in as `passenger@transitpulse.lk / Passenger@123`.
"Auto" means the same check is also in the Jest suite (`backend/src/tests`).

| ID | Req | CRUD | Title | Steps | Expected result | Status |
|---|---|---|---|---|---|---|
| TC-01 | FR-09 | C | Register new account | Login → "Create an account" → fill name, email, password `Password1`, choose Student → Create account | Account created, user lands on Home greeted by first name; type shows "Student passenger" (Auto) | |
| TC-02 | FR-09 | – | Register with invalid data (negative) | Enter name "A", email "abc", password "short", different confirm → Create account | Inline messages under each field; no request succeeds (Auto) | |
| TC-03 | FR-09 | – | Register duplicate email (negative) | Register with `passenger@transitpulse.lk` | Banner "An account with this email already exists" (Auto) | |
| TC-04 | FR-09 | R | Log in | Enter demo credentials → Log in | Home screen with next trip card (Auto) | |
| TC-05 | FR-09 | – | Wrong password (negative) | Enter demo email + `Wrong1234` | Banner "Email or password is incorrect"; stays on Login (Auto) | |
| TC-06 | FR-09 | – | Session persists | Log in, close app fully, reopen | Splash then Home without logging in again | |
| TC-07 | FR-01 | R | Search routes | Buy Ticket → type "Nugegoda" | Only routes containing Nugegoda (138) listed | |
| TC-08 | FR-01 | R | Live fare | Choose route 138, tap Colombo Fort then Nugegoda, Adult, 1 passenger | Footer shows Rs. 78, "1 × Rs. 78 · 5 stops" (Auto: fare endpoint) | |
| TC-09 | FR-01 | R | Concession fare | Same as TC-08 but Student, 2 passengers | Footer shows Rs. 78 (2 × Rs. 39) (Auto) | |
| TC-10 | FR-01 | – | Missing stops (negative) | Choose route only → Continue | Inline message "Choose both a boarding and a destination stop" | |
| TC-11 | FR-01 | C | Create ticket | Complete TC-08 → Continue → Continue to payment | Toast "Ticket reserved…"; Checkout shows ticket number `TP-YYYYMMDD-XXXX`; ticket status PENDING_PAYMENT (Auto) | |
| TC-12 | FR-01 | – | Past travel date rejected (negative) | `POST /api/tickets` with yesterday's travelDate (Postman) | 400 "Travel date cannot be in the past" (Auto) | |
| TC-13 | FR-02 | C | Pay with new card (success) | Checkout → New card 4242 4242 4242 4242, 12/30, 123, Save card ON → Pay | Processing screen → "Payment successful" with receipt number `RCPT-…`; ticket ACTIVE; card saved (Auto) | |
| TC-14 | FR-02 | C | Declined card (negative) | Checkout → New card 4000 0000 0000 0002 → Pay | "Payment failed – Card declined…", "No money was taken"; ticket stays "Awaiting payment"; Try again returns to Checkout (Auto) | |
| TC-15 | FR-02 | – | Invalid card details (negative) | Card 4242 4242 4242 4241, expiry 01/20, CVV 12 → Pay | Inline errors on card number, expiry and CVV; no request sent (Auto: 422 server side) | |
| TC-16 | FR-02 | C | Pay with saved card | Buy a ticket → saved Visa •••• 4242 preselected → Pay | Success; payment method on receipt shows VISA •••• 4242 | |
| TC-17 | FR-02 | C | Cash on board | Choose "Cash on board" → Reserve | "Ticket reserved"; ticket ACTIVE; payment status "Pay on board" (Auto) | |
| TC-18 | FR-02 | – | Pay twice (negative) | `POST /api/payments/checkout` again for an ACTIVE ticket | 409 "already been paid or closed" (Auto) | |
| TC-19 | FR-02 | R | Payment history | Profile → Payment history | List of payments with status badges; newest first; pull to refresh works (Auto) | |
| TC-20 | FR-02 | R | Receipt | Tap a payment | Receipt with receipt no., transaction ref., method, amount, refund (if any) | |
| TC-21 | FR-02 | C | Add saved card | Profile → Saved payment methods → Add a card → 5555 5555 5555 4444, 10/29, 321 → Save | Toast "Card saved"; MASTERCARD •••• 4444 listed (Auto) | |
| TC-22 | FR-02 | U | Set default card | Tap "Set as default" on the Mastercard | Toast; Mastercard moves to top with "Default" pill; only one default (Auto) | |
| TC-23 | FR-02 | D | Remove card | Tap trash on a card → Remove | Confirmation dialog; card removed; another card becomes default if needed (Auto) | |
| TC-24 | NFR-01 | – | No card data stored | Inspect `payments` and `savedpaymentmethods` in Atlas | Only brand/last4/expiry; no full number or CVV (Auto) | |
| TC-25 | FR-03 | R | Dynamic QR shown | Home → Show QR pass | QR with countdown ring from 30; ticket number, route, validity shown | |
| TC-26 | FR-03 | – | QR refreshes | Watch the QR for 35 s | QR pattern changes when ring reaches ~2 s; ring restarts at 30 | |
| TC-27 | FR-03 | – | Offline warning (negative) | Show QR, then stop the backend | Yellow "Connection problem" banner; at 0 s red "QR code has expired… will be rejected" and QR dimmed | |
| TC-28 | FR-03 | U | Rotate QR | Tap "Generate a new code" | Toast; scanning the previous code gives "A newer QR code was issued" (Auto) | |
| TC-29 | FR-03 | – | No QR for unpaid ticket (negative) | Open QR for an "Awaiting payment" ticket | "Complete payment to get your QR code" + Pay now; API returns 409 (Auto) | |
| TC-30 | FR-04 | R | Ticket history list | My Tickets tab | Seeded tickets shown as cards with status badges; skeletons while loading | |
| TC-31 | FR-04 | R | Filter by status | Tap Active / Used / Cancelled / Expired | Only matching tickets; Cancelled includes Refunded (Auto) | |
| TC-32 | FR-04 | R | Search | Type "Homagama" | Only tickets with that stop; empty state text if none (Auto) | |
| TC-33 | FR-04 | R | Pagination | Create > 10 tickets, scroll to bottom | Next page loads with spinner; "You've reached the end" at the end (Auto) | |
| TC-34 | FR-04 | D | Hide ticket | Used ticket → Hide → Remove | Confirmation; ticket disappears; toast (Auto) | |
| TC-35 | FR-04 | – | Hide active ticket (negative) | `DELETE /api/tickets/:id` for an ACTIVE ticket | 409 "Only used, expired or cancelled tickets…"; app does not offer Hide (Auto) | |
| TC-36 | FR-04 | C | Rebook | Used ticket → Rebook → Rebook | New "Awaiting payment" ticket with the same stops opens in Checkout (Auto) | |
| TC-37 | FR-05 | R | Ticket details | Tap a ticket | All fields shown; badge has icon + text; Cancel/Change trip buttons only when allowed | |
| TC-38 | FR-05 | U | Change travel time | Active ticket → Change trip → pick a time → Save | Toast "Ticket updated"; new validity window; old QR invalid (Auto) | |
| TC-39 | FR-05 | U | Change passengers before payment | Pending ticket → Change trip → + passenger → Save | Total fare updated (Auto) | |
| TC-40 | FR-05 | – | Change passengers after payment (negative) | `PUT /api/tickets/:id {passengers:2}` on ACTIVE ticket | 409 "Passenger count can only be changed before payment…" (Auto) | |
| TC-41 | FR-06 | U | Cancel with full refund | Ticket departing tomorrow → Cancel ticket → Yes, cancel | Preview 100%; status REFUNDED; payment REFUNDED; toast with amount (Auto) | |
| TC-42 | FR-06 | U | Cancel with 50% refund | Ticket departing in ~1 h → Cancel | Preview 50%; refund = half (Auto) | |
| TC-43 | FR-06 | U | Cancel after start, 0% | Ticket departing now → Cancel | Preview 0%; status CANCELLED (Auto) | |
| TC-44 | FR-06 | – | Cancel used ticket (negative) | `POST /api/tickets/:id/cancel` on USED ticket | 409; app shows no Cancel button (Auto) | |
| TC-45 | FR-06 | – | Auto-expire | Ticket whose validUntil has passed | Shown as EXPIRED in history | |
| TC-46 | FR-07 | – | Camera permission | First open Scan tab | Android permission prompt; camera preview with frame overlay | |
| TC-47 | FR-07 | – | Permission denied (negative) | Deny camera ("Don't allow") | "Camera access is off" with Allow camera / Open settings button | |
| TC-48 | FR-07 | – | Torch | Tap "Light off" | Torch turns on, button shows "Light on" | |
| TC-49 | FR-08 | C | Valid scan | Phone B (conductor) scans live QR on phone A | Green "VALID TICKET"; phone A shows "Ticket used at …" within 30 s (Auto) | |
| TC-50 | FR-08 | – | Reused QR (negative) | Scan the same QR again within 30 s | "ALREADY USED" (Auto) | |
| TC-51 | FR-08 | – | Screenshot / expired QR (negative) | Screenshot QR, wait 40 s, scan the screenshot | "EXPIRED – QR code has expired" (Auto) | |
| TC-52 | FR-08 | – | Tampered QR (negative) | Scan a QR generated from an edited token | "INVALID – QR code has been altered or forged" (Auto) | |
| TC-53 | FR-08 | – | Not a TransitPulse QR (negative) | Scan any website QR | "INVALID – This is not a TransitPulse ticket QR code" (Auto) | |
| TC-54 | FR-08 | – | Cancelled ticket scanned (negative) | Cancel a ticket, scan its old QR | "INVALID – Ticket was cancelled" (Auto) | |
| TC-55 | FR-08 | R | Scan log | Scan tab → Scan log | Every scan listed with result badge, ticket and time (Auto) | |
| TC-56 | FR-09 | R | View profile | Profile tab | Name, email, phone, type, language, stats (active tickets, trips) | |
| TC-57 | FR-09 | U | Edit profile | Edit profile → change phone & type to Senior → Save | Toast "Profile updated"; Buy Ticket defaults to Senior (Auto) | |
| TC-58 | FR-09 | – | Invalid phone (negative) | Phone "abc" → Save | Inline "Enter a valid phone number…" | |
| TC-59 | FR-09 | – | Logout | Profile → Log out → Log out | Confirmation; returns to Login; token cleared | |
| TC-60 | FR-09 | D | Delete account | Profile → Delete account → password → Delete forever | Confirmation with password; wrong password shows inline error; correct deletes and logs out (Auto) | |
| TC-61 | FR-10 | – | Tab navigation | Tap each tab | Home, Buy Ticket, My Tickets, Scan, Profile open; active tab highlighted | |
| TC-62 | FR-10 | – | Other modules | Home → Live map / Search & ETA; Profile → Driver/Conductor, Admin | Placeholder screens for Members 1/3/4 open and Go back works | |
| TC-63 | FR-10 | – | Back after payment | After success, press Android back | Does not return to Checkout (stack reset) | |
| TC-64 | NFR-01 | – | Access another user's ticket (negative) | Log in as student, `GET /api/tickets/<passenger ticket id>` | 404 (Auto) | |
| TC-65 | NFR-01 | – | Expired/invalid token | Call any protected endpoint with a bad token | 401; app returns to Login with "session expired" banner (Auto) | |
| TC-66 | NFR-03 | – | Server unreachable | Stop backend, pull to refresh My Tickets | Friendly error with Try again; nothing crashes | |
