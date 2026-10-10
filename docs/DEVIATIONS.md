# Deviations from the Milestone 02 Prototype

| # | Screen | What changed | Why |
|---|---|---|---|
| D-01 | All buttons (primary) | Teal (#00AFC1) buttons now use dark navy text instead of white. | White on teal is about 2.7:1 contrast, which fails WCAG AA (4.5:1). Navy on teal is about 5.5:1. The brand colours are unchanged. |
| D-02 | Fares, links, teal text | Teal text uses a darker teal `tealText` (#00727E). | #00AFC1 text on white fails contrast. |
| D-03 | All screens | Prices shown in LKR ("Rs.") instead of "$". | Routes are Sri Lankan bus routes. |
| D-04 | Bottom navigation | Tabs changed from Home / Routes / Tickets / Alerts / Profile to Home / Buy Ticket / My Tickets / Scan / Profile. Emoji icons replaced by SVG line icons. | Routes/Alerts belong to Member 1 and are linked from Home quick actions (ExternalModules.js). Emoji render differently on each phone and can't be recoloured for the active state. |
| D-05 | Status badges | Badges now show an icon and a text label, not just a coloured pill. | Status must not rely on colour alone (colour-blind users). |
| D-06 | Passenger Checkout | The hard-coded journey was split into Buy Ticket → Fare Summary → Checkout. Payment options are now saved cards, new card form, wallet and cash on board. Processing and success/failure screens were added. | Needed for real route/stop/fare selection, card validation and clear feedback when a payment fails. |
| D-07 | Digital QR Transit Pass | Added a 30 s countdown ring, an automatic refresh, an offline/stale warning and a "Generate a new code" button. | The QR is now dynamic and signed so screenshots stop working. |
| D-08 | Ticket History | Added search, status filter chips, pagination, Hide and Rebook buttons. | Needed for FR-04 and the CRUD requirement. |
| D-09 | Ticket Details | Added Change trip, Cancel ticket (separate refund preview screen), View receipt and Remove from history. | Needed for FR-05/FR-06. |
| D-10 | QR Scanner | Alerts replaced by a full Scan Result screen (big colour + icon + text verdict and reason); added torch toggle, scan log and a permission-denied state with "Open settings". | Faster to read in a moving bus; supports FR-07/FR-08. |
| D-11 | Profile | Mock data replaced by the logged-in user; added edit profile, saved payment methods, payment history, logout and delete account. | Needed for FR-09. |
| D-12 | New screens | Splash, Login, Register, Home, Edit Ticket, Cancel Ticket, Payment Methods, Add Card, Payment History, Receipt, Scan Result, Scan History were not in the M02 prototype. They reuse the same colours, card style and typography. | Required by the new features. |
| D-13 | Tab screens | The navigator header was removed on tab screens; each tab shows its own title block (as in the prototype). Stack screens keep the navy header. | Avoids the title being shown twice. |
