# Traceability Matrix – Member 2 Passenger Ticketing

Prototype screen names refer to the Milestone 02 Figma prototype. "New (M03)" = screen added in Milestone 03 (see DEVIATIONS.md).
Paths are relative to `mobile/src/` and `backend/src/`.

| Req | Prototype screen | Implemented screen / file | API endpoint(s) | Test cases |
|---|---|---|---|---|
| FR-01 Digital Ticketing | Passenger Checkout (journey card) | `screens/BuyTicket/BuyTicketScreen.js`, `screens/FareSummary/FareSummaryScreen.js` · `controllers/ticketController.js` (createTicket), `utils/fare.js`, `models/Route.js`, `models/Ticket.js` | `GET /api/routes`, `GET /api/routes/:id/fare`, `POST /api/tickets` | TC-07 – TC-12 |
| FR-02 Online Payment | Passenger Checkout (payment methods, fare summary) | `screens/PassengerCheckout/`, `screens/PaymentProcessing/`, `screens/PaymentResult/`, `screens/PaymentHistory/`, `screens/PaymentReceipt/`, `screens/PaymentMethods/`, `screens/AddPaymentMethod/`, `components/ReceiptCard.js` · `controllers/paymentController.js`, `utils/cardGateway.js`, `models/Payment.js`, `models/SavedPaymentMethod.js` | `POST /api/payments/checkout`, `GET /api/payments`, `GET /api/payments/:id`, `GET/POST /api/payments/methods`, `PUT/DELETE /api/payments/methods/:id`, `PUT /api/payments/methods/:id/default` | TC-13 – TC-24 |
| FR-03 Dynamic QR | Digital QR Transit Pass | `screens/DigitalQRPass/DigitalQRPassScreen.js`, `components/CountdownRing.js` · `utils/qrToken.js`, `controllers/ticketController.js` (getQr, rotateQr) | `GET /api/tickets/:id/qr`, `POST /api/tickets/:id/qr/rotate` | TC-25 – TC-29 |
| FR-04 Purchase History | Ticket History | `screens/TicketHistory/TicketHistoryScreen.js`, `components/TicketCard.js` · `controllers/ticketController.js` (listTickets, hideTicket, rebookTicket) | `GET /api/tickets`, `DELETE /api/tickets/:id`, `POST /api/tickets/:id/rebook` | TC-30 – TC-36 |
| FR-05 Ticket Details | Ticket Details | `screens/TicketDetails/TicketDetailsScreen.js`, `screens/EditTicket/` (New M03), `components/StatusBadge.js` · `controllers/ticketController.js` (getTicket, updateTicket) | `GET /api/tickets/:id`, `PUT /api/tickets/:id` | TC-37 – TC-40 |
| FR-06 Cancellation / Status | Ticket Details (cancel button) | `screens/CancelTicket/CancelTicketScreen.js` (New M03) · `utils/ticketRules.js`, `controllers/ticketController.js` (cancelTicket) | `POST /api/tickets/:id/cancel` | TC-41 – TC-45 |
| FR-07 QR Scanner | QR Scanner | `screens/QRScanner/QRScannerScreen.js` (react-native-camera-kit) | – (device camera) | TC-46 – TC-48 |
| FR-08 QR Validation | QR Scanner (result) | `screens/ScanResult/` (New M03), `screens/ScanHistory/` (New M03) · `controllers/validationController.js`, `models/ScanLog.js` | `POST /api/validation/scan`, `GET /api/validation/logs` | TC-49 – TC-55 |
| FR-09 Profile | Profile | `screens/Profile/ProfileScreen.jsx`, `screens/EditProfile/`, `screens/Login/`, `screens/Register/`, `screens/Splash/` (New M03), `context/AuthContext.js` · `controllers/authController.js`, `controllers/userController.js`, `middleware/authMiddleware.js`, `models/User.js` | `POST /api/auth/register`, `POST /api/auth/login`, `GET/PUT/DELETE /api/users/me` | TC-01 – TC-06, TC-56 – TC-60 |
| FR-10 Navigation | Bottom navigation bar | `navigation/AppNavigator.js`, `components/BottomNavigation.js`, `navigation/ExternalModules.js`, `navigation/navHelpers.js`, `screens/Home/` | – | TC-61 – TC-63 |
| NFR-01 Security | – | `middleware/authMiddleware.js`, `middleware/rateLimit.js`, `utils/cardGateway.js` | all protected endpoints | TC-24, TC-64, TC-65 |
| NFR-02/03 Usability | All screens | `components/AppButton.js`, `TextField.js`, `Feedback.js`, `ConfirmDialog.js`, `context/ToastContext.js`, `theme.js` | – | TC-02, TC-10, TC-15, TC-27, TC-47, TC-66 |

## CRUD per interface (assignment requirement)

| Interface | Create | Read | Update | Delete |
|---|---|---|---|---|
| Tickets | Buy / rebook (`POST /tickets`, `/rebook`) | History, details | Change trip (`PUT /tickets/:id`), cancel | Hide from history (`DELETE /tickets/:id`) |
| Payments | Checkout, add card | Payment history, receipt, saved cards | Set default card, edit card | Remove card |
| Scanner | Scan creates a ScanLog | Scan history | (ticket marked USED) | – |
| Profile | Register | View profile | Edit profile | Delete account |
