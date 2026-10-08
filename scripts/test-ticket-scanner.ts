import { tripApi } from '../src/services/api/tripApi';
import { terminalApi } from '../src/services/api/terminalApi';
import { offlineScannerSync } from '../src/services/storage/offlineScannerSync';
import { scannerAudio } from '../src/services/utils/scannerAudio';

async function runTicketScannerTestSuite() {
  console.log('====================================================');
  console.log('TRANSITPULSE TICKET SCANNER - AUTOMATED TEST SUITE');
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

  // 1. Initial Trip & Bus Terminal State
  console.log('--- 1. Terminal & Trip Verification ---');
  terminalApi.setSimulatedOffline(false);
  const initialTrip = await tripApi.getActiveTrip('Driver M. Kavi');
  assert(
    'Active Trip Loaded',
    initialTrip.routeNumber === 'LINE 42' && initialTrip.busNumber.includes('4028'),
    `Route: ${initialTrip.routeNumber}, Bus: ${initialTrip.busNumber}`
  );

  const initialOccupancy = initialTrip.occupiedSeats;
  const initialDigitalCount = initialTrip.digitalQrCount;
  const initialRevenue = initialTrip.shiftDigitalFareTotal;

  // 2. Valid Ticket Validations
  console.log('\n--- 2. Valid QR Ticket Scans ---');

  // Test Valid Single (TK-9021)
  const validRes1 = await tripApi.validateTicket('TK-9021', 'QR');
  assert(
    'Valid Single Ticket (TK-9021)',
    validRes1.valid === true && validRes1.result === 'PASS' && validRes1.fareAmount === 65,
    `Status: PASS, Fare: $${validRes1.fareAmount}, Passenger: ${validRes1.passengerName || 'Cardholder'}`
  );

  // Test Valid Day Pass (TK-9055)
  const validRes2 = await tripApi.validateTicket('TK-9055', 'QR');
  assert(
    'Valid Day Pass (TK-9055)',
    validRes2.valid === true && validRes2.result === 'PASS' && validRes2.fareAmount === 150,
    `Status: PASS, Fare: $${validRes2.fareAmount}, Type: ${validRes2.ticketTypeLabel}`
  );

  // 3. Security, Expiry & Duplicate Redemptions
  console.log('\n--- 3. Anti-Fraud & Security Rejections ---');

  // Duplicate / Already Used scan (TK-9021 scanned again)
  const dupRes = await tripApi.validateTicket('TK-9021', 'QR');
  assert(
    'Duplicate Scan Rejection (TK-9021)',
    dupRes.valid === false && dupRes.result === 'REJECT',
    `Reason: ${dupRes.reason}`
  );

  // Pre-seeded Used Ticket (TK-7740)
  const usedRes = await tripApi.validateTicket('TK-7740', 'QR');
  assert(
    'Already Redeemed Ticket (TK-7740)',
    usedRes.valid === false && usedRes.result === 'REJECT',
    `Reason: ${usedRes.reason}`
  );

  // Expired Ticket (TK-8832)
  const expiredRes = await tripApi.validateTicket('TK-8832', 'QR');
  assert(
    'Expired Ticket (TK-8832)',
    expiredRes.valid === false && expiredRes.result === 'REJECT',
    `Reason: ${expiredRes.reason}`
  );

  // Wrong Route Ticket (TK-4411 - Valid on Line 138, not 42)
  const wrongRouteRes = await tripApi.validateTicket('TK-4411', 'QR');
  assert(
    'Wrong Route Ticket (TK-4411)',
    wrongRouteRes.valid === false && wrongRouteRes.result === 'REJECT',
    `Reason: ${wrongRouteRes.reason}`
  );

  // Unrecognized / Invalid Code
  const invalidRes = await tripApi.validateTicket('TK-FAKE99', 'QR');
  assert(
    'Unrecognized Ticket ID',
    invalidRes.valid === false && invalidRes.result === 'REJECT',
    `Reason: ${invalidRes.reason}`
  );

  // 4. Passenger Capacity & Shift Total Updates
  console.log('\n--- 4. Real-Time Occupancy & Telemetry Impact ---');
  const updatedTrip = await tripApi.getActiveTrip();
  assert(
    'Occupancy Incremented Onboard',
    updatedTrip.occupiedSeats >= initialOccupancy + 2,
    `Seats: ${updatedTrip.occupiedSeats} / ${updatedTrip.totalSeats}`
  );

  assert(
    'Digital Scan Count Incremented',
    updatedTrip.digitalQrCount === initialDigitalCount + 2,
    `Scans: ${updatedTrip.digitalQrCount}`
  );

  assert(
    'Shift Digital Fare Revenue Updated',
    updatedTrip.shiftDigitalFareTotal === initialRevenue + 65 + 150,
    `Revenue: $${updatedTrip.shiftDigitalFareTotal.toFixed(2)}`
  );

  // 5. Offline Cache Synchronization Layer
  console.log('\n--- 5. Offline Mode & Cache Synchronization ---');
  const initialSyncStatus = offlineScannerSync.getStatus();
  assert(
    'Initial Cache Synced Keys',
    initialSyncStatus.keysSyncedCount === 1240 && initialSyncStatus.pendingQueueCount === 0,
    `Synced: ${initialSyncStatus.keysSyncedCount} keys, Pending: ${initialSyncStatus.pendingQueueCount}`
  );

  // Queue offline ticket scan
  offlineScannerSync.setOnlineState(false);
  const queuedItem = offlineScannerSync.queueScan('TK-9044', 'QR', 'DRV-84920');
  assert(
    'Offline Scan Queued',
    queuedItem.ticketId === 'TK-9044' && queuedItem.offlineStatus === 'PENDING',
    `Queue ID: ${queuedItem.id}, Status: ${queuedItem.offlineStatus}`
  );

  const offlineStatusNow = offlineScannerSync.getStatus();
  assert(
    'Queue Count Updated',
    offlineStatusNow.pendingQueueCount === 1 && offlineStatusNow.syncState === 'OFFLINE_QUEUED',
    `Pending: ${offlineStatusNow.pendingQueueCount}, State: ${offlineStatusNow.syncState}`
  );

  // Restore connection & auto-sync
  offlineScannerSync.setOnlineState(true);
  const syncedStatusAfter = offlineScannerSync.getStatus();
  assert(
    'Queued Records Automatically Synced',
    syncedStatusAfter.pendingQueueCount === 0 && syncedStatusAfter.keysSyncedCount === 1241,
    `Synced Keys: ${syncedStatusAfter.keysSyncedCount}, Pending: ${syncedStatusAfter.pendingQueueCount}`
  );

  // 6. Audio Service Tones & Chime
  console.log('\n--- 6. Turnstile Audio Feedback System ---');
  assert('Audio Initial Mute State', scannerAudio.isMuted() === false, 'Muted: false');
  const isMutedNow = scannerAudio.toggleMute();
  assert('Audio Toggle Mute', isMutedNow === true, 'Muted: true');
  scannerAudio.toggleMute();
  assert('Audio Unmuted', scannerAudio.isMuted() === false, 'Muted: false');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTicketScannerTestSuite().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
