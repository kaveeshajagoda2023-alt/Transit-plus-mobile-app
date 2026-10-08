import { tripApi } from '../src/services/api/tripApi';
import { terminalApi } from '../src/services/api/terminalApi';

async function runThreeScreensTestSuite() {
  console.log('====================================================');
  console.log('TRANSITPULSE - THREE SCREENS VALIDATION TEST SUITE');
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

  terminalApi.setSimulatedOffline(false);

  // ============================================================
  // PAGE 4: SUCCESSFUL TICKET / PAYMENT VERIFIED TESTS
  // ============================================================
  console.log('--- PAGE 4: SUCCESSFUL TICKET / PAYMENT VERIFIED ---');
  const validScan = await tripApi.validateTicket('TK-9021', 'QR');
  assert(
    'Page 4 - Validation Confirmed',
    validScan.valid === true && validScan.result === 'PASS',
    `Status: ${validScan.result}, Ticket: ${validScan.ticketId}`
  );

  assert(
    'Page 4 - Payment Verified Status',
    validScan.paymentStatus === 'PAID' && validScan.fareAmount === 65,
    `Payment: ${validScan.paymentStatus}, Fare: Rs ${validScan.fareAmount}.00, Method: ${validScan.paymentMethod}`
  );

  assert(
    'Page 4 - Passenger & Booking Metadata',
    validScan.passengerName === 'Dilshan Silva' &&
      validScan.bookingReference === 'MTA-BK-90214' &&
      validScan.passengerCount === 1,
    `Passenger: ${validScan.passengerName}, Booking: ${validScan.bookingReference}`
  );

  assert(
    'Page 4 - Journey Stops & Route Timeline',
    validScan.originStop === 'Market St & 4th' &&
      validScan.destinationStop === 'University Malabe Campus' &&
      validScan.originZone === 'Zone 1' &&
      validScan.destinationZone === 'Zone 2',
    `From: ${validScan.originStop} (${validScan.originZone}) -> To: ${validScan.destinationStop} (${validScan.destinationZone})`
  );

  assert(
    'Page 4 - Automated Transaction & Checkpoint Telemetry',
    Boolean(validScan.transactionId) && validScan.deviceScannerId === 'TERM-4028-V4',
    `Txn: ${validScan.transactionId}, Device: ${validScan.deviceScannerId}, Service: ${validScan.verificationService}`
  );

  // ============================================================
  // PAGE 5: INVALID TICKET / VALIDATION ERROR TESTS
  // ============================================================
  console.log('\n--- PAGE 5: INVALID TICKET / VALIDATION ERROR ---');

  // Scenario 1: Expired Pass (TK-8832)
  const expiredScan = await tripApi.validateTicket('TK-8832', 'QR');
  assert(
    'Page 5 - Expired Pass Security Exception',
    expiredScan.valid === false &&
      expiredScan.result === 'REJECT' &&
      expiredScan.faultCode === '0x44',
    `Fault: ${expiredScan.faultCode}, Reason: ${expiredScan.reason}`
  );

  assert(
    'Page 5 - Expired Diagnostics Schema',
    Boolean(expiredScan.failureDiagnostics?.includes('EXPIRED_PASS_SCHEMA')),
    `Diagnostics: ${expiredScan.failureDiagnostics}`
  );

  // Scenario 2: Already Redeemed (TK-7740)
  const usedScan = await tripApi.validateTicket('TK-7740', 'QR');
  assert(
    'Page 5 - Already Used Token Exception',
    usedScan.valid === false &&
      usedScan.result === 'REJECT' &&
      usedScan.faultCode === '0x19',
    `Fault: ${usedScan.faultCode}, Previous Scan: ${usedScan.previousScanTime}`
  );

  // Scenario 3: Wrong Route (TK-4411)
  const wrongRouteScan = await tripApi.validateTicket('TK-4411', 'QR');
  assert(
    'Page 5 - Route Mismatch Exception',
    wrongRouteScan.valid === false &&
      wrongRouteScan.result === 'REJECT' &&
      wrongRouteScan.faultCode === '0x32',
    `Fault: ${wrongRouteScan.faultCode}, Diagnostics: ${wrongRouteScan.failureDiagnostics}`
  );

  // Scenario 4: Operational Mandate Cash Fare Override
  const tripBeforeCash = await tripApi.getActiveTrip();
  const seatsBefore = tripBeforeCash.occupiedSeats;
  const cashFaresBefore = tripBeforeCash.cashFareCount;

  const tripAfterCash = await tripApi.recordCashFare(65);
  assert(
    'Page 5 - Operational Mandate Cash Override (Rs 65.00)',
    tripAfterCash.occupiedSeats === seatsBefore + 1 &&
      tripAfterCash.cashFareCount === cashFaresBefore + 1,
    `Occupied: ${tripAfterCash.occupiedSeats}, Cash Count: ${tripAfterCash.cashFareCount}`
  );

  // ============================================================
  // PAGE 6: MANUAL TICKET ENTRY TESTS
  // ============================================================
  console.log('\n--- PAGE 6: MANUAL TICKET ENTRY & LIVE LOOKUP ---');

  // Dynamic Lookup Preview for Valid Pass
  const previewValid = tripApi.lookupTicketPreview('TK-9021');
  assert(
    'Page 6 - Dynamic Lookup Match for Valid Pass',
    previewValid.found === true &&
      previewValid.status === 'USED' && // Was validated above, now in used state
      previewValid.passengerName === 'Dilshan Silva',
    `Preview: ${previewValid.passengerName}, Status: ${previewValid.status}`
  );

  // Dynamic Lookup Preview for Expired Pass
  const previewExpired = tripApi.lookupTicketPreview('TK-8832');
  assert(
    'Page 6 - Dynamic Lookup Match for Expired Pass',
    previewExpired.found === true && previewExpired.status === 'EXPIRED',
    `Ticket: ${previewExpired.ticketId}, Status: ${previewExpired.status}`
  );

  // Dynamic Lookup Preview with Suffix (e.g. TK-9044-042)
  const previewSuffix = tripApi.lookupTicketPreview('TK-9044-042');
  assert(
    'Page 6 - Dynamic Lookup with Terminal Suffix',
    previewSuffix.found === true && previewSuffix.ticketId === 'TK-9044',
    `Matched: ${previewSuffix.ticketId}, Passenger: ${previewSuffix.passengerName}`
  );

  // Dynamic Lookup for Nonexistent Code
  const previewUnknown = tripApi.lookupTicketPreview('TK-9999-FAKE');
  assert(
    'Page 6 - Dynamic Lookup for Unrecognized Code',
    previewUnknown.found === false && previewUnknown.status === 'NOT_FOUND',
    `Found: false, Status: ${previewUnknown.status}`
  );

  // Manual Validation of Valid Concession Pass (TK-9018)
  const manualScan = await tripApi.validateTicket('TK-9018', 'QR');
  assert(
    'Page 6 - Manual Code Verified Through Core Backend',
    manualScan.valid === true && manualScan.result === 'PASS' && manualScan.fareAmount === 35,
    `Passenger: ${manualScan.passengerName}, Fare: Rs ${manualScan.fareAmount}.00`
  );

  console.log('\n====================================================');
  console.log(`THREE SCREENS TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runThreeScreensTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
