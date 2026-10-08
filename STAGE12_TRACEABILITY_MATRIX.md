# Stage 12 – Functional Testing, Usability Testing, Traceability Matrix, and Final Fixes

## Scope

This matrix covers the passenger ticketing flow implemented through Stage 11 and the Stage 12 validation performed against the Express API.

## Functional Test Coverage

| Requirement | Test / Verification | Evidence | Status |
|---|---|---|---|
| Payment succeeds before ticket creation | Simulated payment endpoint returns success and Completed status | Stage 12 functional test | PASS |
| Payment creates the correct ticket | Ticket request carries user ID, route, journey, fare, and payment method | Stage 12 functional test | PASS |
| Ticket creation returns QR payload | Created ticket contains a QR data string | Stage 12 functional test | PASS |
| Ticket history loads saved tickets | User history returns the created ticket | Stage 12 functional test | PASS |
| Historical ticket selection resolves details | Single-ticket lookup matches the selected ticket ID | Stage 12 functional test | PASS |
| QR uses selected ticket data | QR payload is returned with the created ticket | Stage 12 functional test | PASS |
| Ticket status can change | Status update returns the requested status | Stage 12 functional test | PASS |
| Navigation reaches history and QR | Profile and bottom navigation target existing screens | Source review and diagnostics | PASS |
| Loading, empty, and error states | History and QR screens expose loading, empty, and retry states | Source review and diagnostics | PASS |
| No hard-coded ticket history | History is populated only from the API response | Source review | PASS |
| No sensitive payment information stored | Payment model contains no card, CVV, password, or credential fields | Source review | PASS |

## Usability Review

| Interaction | Review Result | Status |
|---|---|---|---|
| Checkout → Payment → Ticket Creation | Sequential flow is exposed through the existing checkout action | PASS |
| Ticket History → Dynamic QR Pass | History cards pass the selected API ticket into the QR screen | PASS |
| Profile → Ticket History | Profile navigation invokes the Tickets route | PASS |
| Bottom navigation | Checkout, Tickets, and Profile routes are registered | PASS |
| Empty history | Empty-state purchase action is available | PASS |
| API error | Retry control is available on history and QR error states | PASS |

## Test Execution

Executed:

```powershell
node .\src\test\stage12FunctionalTests.js
```

The test uses real Express controllers and routes with the in-memory persistence path. It verifies payment, ticket creation, history, selected-ticket lookup, QR payload presence, status updates, and absence of sensitive payment fields.

## Final Fixes

- Removed demo ticket fallback from the Digital QR Pass screen so it cannot render an unrelated ticket when navigation data is missing.
- Added an explicit missing-ticket error state.
- No unrelated functionality was modified.
