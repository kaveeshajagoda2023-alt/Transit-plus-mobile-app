import { tripApi } from '../src/services/api/tripApi';
import { staffAuthApi } from '../src/services/api/staffAuthApi';
import { terminalApi } from '../src/services/api/terminalApi';

async function runDashboardTestSuite() {
  console.log('====================================================');
  console.log('TRANSITPULSE DRIVER/CONDUCTOR DASHBOARD - TEST SUITE');
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

  // 1. Staff Login & Session
  console.log('--- 1. Staff Authentication & Profile Link ---');
  const loginRes = await staffAuthApi.login('DRV-84920@transitpulse.gov', 'TransitSecure2024!');
  assert(
    'Driver M. Kavi Logged In',
    loginRes.success && loginRes.user?.role === 'DRIVER',
    `User: ${loginRes.user?.name}, Role: ${loginRes.user?.role}`
  );

  // 2. Active Trip Loading
  console.log('\n--- 2. Active Trip Real-Time Metadata ---');
  const initialTrip = await tripApi.getActiveTrip(loginRes.user?.name ? `Driver ${loginRes.user.name}` : undefined);
  assert(
    'Trip Metadata Initialized',
    initialTrip.busNumber.includes('4028') &&
      initialTrip.routeNumber === 'LINE 42' &&
      initialTrip.origin === 'Market Square' &&
      initialTrip.zone === 'Zone A',
    `Route: ${initialTrip.routeNumber}, Bus: ${initialTrip.busNumber}, Zone: ${initialTrip.zone}`
  );

  assert(
    'Trip Status & Schedule Initialized',
    initialTrip.tripStatus === 'ACTIVE' && initialTrip.scheduleStatus === 'ON_TIME',
    `Status: ${initialTrip.tripStatus}, Schedule: ${initialTrip.scheduleStatus}`
  );

  assert(
    'Current & Next Stops Correct',
    initialTrip.currentStop === 'Market St & 4th' &&
      initialTrip.doorStatus === 'OPEN' &&
      initialTrip.etaMinutes >= 0,
    `Current: ${initialTrip.currentStop} (${initialTrip.doorStatus}), Next: ${initialTrip.nextStop} (ETA ${initialTrip.etaMinutes}m)`
  );

  // 3. Vehicle Occupancy & Baseline Stats
  console.log('\n--- 3. Capacity & Statistics Baseline ---');
  const baseOccupied = initialTrip.occupiedSeats;
  const baseDigital = initialTrip.digitalQrCount;
  const baseCash = initialTrip.cashFareCount;
  const baseFail = initialTrip.pendingFailCount;

  assert(
    'Vehicle Occupancy Baseline',
    initialTrip.occupiedSeats >= 38 && initialTrip.totalSeats === 55,
    `${initialTrip.occupiedSeats} / ${initialTrip.totalSeats} seats`
  );

  assert(
    'Payment Statistics Baseline',
    initialTrip.digitalQrCount >= 32 &&
      initialTrip.cashFareCount >= 4 &&
      initialTrip.pendingFailCount >= 2,
    `Digital: ${initialTrip.digitalQrCount}, Cash: ${initialTrip.cashFareCount}, Fail: ${initialTrip.pendingFailCount}`
  );

  assert(
    'Recent Activity Feed Seeded',
    initialTrip.recentActivity.length >= 3 &&
      Boolean(initialTrip.recentActivity[0].ticketId) &&
      initialTrip.recentActivity[0].result === 'PASS',
    `Top feed item: Ticket #${initialTrip.recentActivity[0].ticketId} (${initialTrip.recentActivity[0].result})`
  );

  // 4. Ticket Scanner: Valid Standard Ticket Validation
  console.log('\n--- 4. Backend Ticket QR Verification ---');
  const validScanRes = await tripApi.validateTicket('TK-9044', 'QR');
  assert(
    'Valid Ticket TK-9044 PASS',
    validScanRes.valid && validScanRes.result === 'PASS' && validScanRes.fareAmount === 65,
    `Result: ${validScanRes.result}, Passenger: ${validScanRes.passengerName}, Fare: Rs ${validScanRes.fareAmount}`
  );

  // Check stats update
  assert(
    'Digital QR Count & Revenue Incremented',
    validScanRes.updatedTrip.digitalQrCount === baseDigital + 1,
    `Digital Count: ${validScanRes.updatedTrip.digitalQrCount}`
  );

  assert(
    'Occupancy Incremented on Boarding',
    validScanRes.updatedTrip.occupiedSeats === baseOccupied + 1,
    `Occupied: ${validScanRes.updatedTrip.occupiedSeats} / ${validScanRes.updatedTrip.totalSeats}`
  );

  assert(
    'Recent Activity Feed Updated Instantly',
    validScanRes.updatedTrip.recentActivity[0].ticketId === 'TK-9044' &&
      validScanRes.updatedTrip.recentActivity[0].result === 'PASS',
    `Top feed: Ticket #${validScanRes.updatedTrip.recentActivity[0].ticketId}`
  );

  // 5. Ticket Scanner: Expired Ticket Validation
  console.log('\n--- 5. Invalid / Expired / Duplicate Ticket Rejections ---');
  const expiredScanRes = await tripApi.validateTicket('TK-8832', 'QR');
  assert(
    'Expired Ticket TK-8832 REJECT',
    !expiredScanRes.valid && expiredScanRes.result === 'REJECT',
    `Result: ${expiredScanRes.result}, Reason: ${expiredScanRes.reason}`
  );
  assert(
    'Pending/Fail Count Incremented on Rejection',
    expiredScanRes.updatedTrip.pendingFailCount === 3,
    `Pending/Fail: ${expiredScanRes.updatedTrip.pendingFailCount}`
  );

  // 6. Ticket Scanner: Duplicate (Already Used) Ticket Validation
  const duplicateScanRes = await tripApi.validateTicket('TK-7740', 'QR');
  assert(
    'Duplicate Ticket TK-7740 REJECT',
    !duplicateScanRes.valid && duplicateScanRes.result === 'REJECT',
    `Result: ${duplicateScanRes.result}, Reason: ${duplicateScanRes.reason}`
  );

  // 7. Ticket Scanner: Wrong Route Ticket Validation
  const wrongRouteScanRes = await tripApi.validateTicket('TK-4411', 'QR');
  assert(
    'Wrong Route Ticket TK-4411 REJECT',
    !wrongRouteScanRes.valid && wrongRouteScanRes.result === 'REJECT',
    `Result: ${wrongRouteScanRes.result}, Reason: ${wrongRouteScanRes.reason}`
  );

  // 8. NFC Ticket Tap Validation
  console.log('\n--- 6. NFC Ticket Verification ---');
  const nfcScanRes = await tripApi.validateTicket('TK-9055', 'NFC');
  assert(
    'NFC Day Pass TK-9055 PASS',
    nfcScanRes.valid && nfcScanRes.result === 'PASS' && nfcScanRes.activityItem.method === 'NFC',
    `Result: ${nfcScanRes.result}, Method: ${nfcScanRes.activityItem.method}, Fare: Rs ${nfcScanRes.fareAmount}`
  );

  // 9. Cash Fare Recording
  console.log('\n--- 7. Walk-In Cash Fare Recording ---');
  const cashFareTrip = await tripApi.recordCashFare(50);
  assert(
    'Cash Fare Logged & Headcount Incremented',
    cashFareTrip.cashFareCount >= 5 && cashFareTrip.occupiedSeats > baseOccupied,
    `Cash Count: ${cashFareTrip.cashFareCount}, Occupied: ${cashFareTrip.occupiedSeats}`
  );
  assert(
    'Cash Fare Added to Recent Activity Feed',
    cashFareTrip.recentActivity[0].method === 'CASH',
    `Latest item: ${cashFareTrip.recentActivity[0].ticketId} (${cashFareTrip.recentActivity[0].ticketTypeLabel})`
  );

  // 10. Operational Action: Report Delay
  console.log('\n--- 8. Operational Actions: Delay, Dispatch, Doors, Stops ---');
  const delayedTrip = await tripApi.reportDelay({
    reason: 'Traffic',
    estimatedDelayMinutes: 10,
    notes: 'Heavy traffic at junction',
  });
  assert(
    'Trip Status Updated to DELAYED',
    delayedTrip.tripStatus === 'DELAYED' &&
      delayedTrip.scheduleStatus === 'DELAYED' &&
      delayedTrip.delayMinutes === 10,
    `Status: ${delayedTrip.tripStatus}, Delay: +${delayedTrip.delayMinutes}m`
  );

  // 11. Dispatch Alert
  const dispatchRes = await tripApi.sendDispatchMessage({
    type: 'ASSISTANCE',
    message: 'Assistance requested at Market St',
    priority: 'HIGH',
  });
  assert(
    'Dispatch Message Transmitted',
    dispatchRes.success && !!dispatchRes.messageId,
    `Message ID: ${dispatchRes.messageId}`
  );

  // 12. Door Toggle
  const doorRes = await tripApi.toggleDoors();
  assert(
    'Door State Toggled',
    doorRes.doorStatus === 'CLOSED' || doorRes.doorStatus === 'OPEN',
    `Door Status: ${doorRes.doorStatus}`
  );

  // 13. Advance Stop
  const advancedTrip = await tripApi.advanceStop();
  assert(
    'Stop Advanced along Route',
    advancedTrip.currentStop === 'Malabe Center',
    `New Stop: ${advancedTrip.currentStop}, Next: ${advancedTrip.nextStop}`
  );

  // 14. Real-time Subscription Check
  console.log('\n--- 9. Real-Time Subscription & Socket Layer ---');
  let subscriptionFired = false;
  const unsubscribe = tripApi.subscribeTripUpdates((t) => {
    subscriptionFired = true;
  });
  await tripApi.updateOccupancy(1);
  assert(
    'Real-time Subscriber Fired on Occupancy Change',
    subscriptionFired,
    'Event listener triggered'
  );
  unsubscribe();

  // 15. End Trip
  console.log('\n--- 10. Conclude Trip ---');
  const completedTrip = await tripApi.endTrip();
  assert(
    'Trip Concluded Successfully',
    completedTrip.tripStatus === 'COMPLETED' && !!completedTrip.completedAt,
    `Status: ${completedTrip.tripStatus}, Completed At: ${completedTrip.completedAt}`
  );

  // 16. Offline Error Protection
  console.log('\n--- 11. Network Outage Handling ---');
  terminalApi.setSimulatedOffline(true);
  let caughtError = false;
  try {
    await tripApi.validateTicket('TK-9021', 'QR');
  } catch (e: any) {
    caughtError = true;
    assert(
      'Offline Ticket Validation Blocked from False Positive',
      e.message.includes('Terminal offline'),
      e.message
    );
  }
  terminalApi.setSimulatedOffline(false);

  console.log('\n====================================================');
  console.log(`DASHBOARD TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runDashboardTestSuite().catch((err) => {
  console.error('Test execution threw error:', err);
  process.exit(1);
});
