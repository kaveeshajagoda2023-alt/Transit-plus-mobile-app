import { tripApi } from '../src/services/api/tripApi';
import { terminalApi } from '../src/services/api/terminalApi';

async function runPassengerManifestTestSuite() {
  console.log('================================================================');
  console.log('TRANSITPULSE - REAL-TIME PASSENGER MANIFEST & TRIP MGMT TEST SUITE');
  console.log('================================================================\n');

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

  // 1. Initial Active Trip Load & Verification
  console.log('--- 1. ACTIVE TRIP INFORMATION & TELEMETRY ---');
  const initialTrip = await tripApi.getActiveTrip();
  assert(
    'Trip Data Loaded',
    initialTrip.id === 'TRIP-4028-0941' && initialTrip.busNumber === '#4028',
    `ID: ${initialTrip.id}, Bus: ${initialTrip.busNumber}`
  );

  assert(
    'Driver & Route Assignment',
    initialTrip.driverName.includes('Mr. Kavith') && initialTrip.routeNumber === 'LINE 42',
    `Driver: ${initialTrip.driverName}, Route: ${initialTrip.routeNumber}`
  );

  assert(
    'Active Dispatch Status',
    initialTrip.tripStatus === 'ACTIVE' && initialTrip.scheduleStatus === 'ON_TIME',
    `Trip Status: ${initialTrip.tripStatus}, Schedule: ${initialTrip.scheduleStatus}`
  );

  // 2. Headcount & Occupancy Math Validation
  console.log('\n--- 2. HEADCOUNT & OCCUPANCY MATHEMATICAL INTEGRITY ---');
  const initOccupied = initialTrip.occupiedSeats;
  const initTotal = initialTrip.totalSeats;
  const initOccupancyPct = Math.round((initOccupied / initTotal) * 100);
  const initRemainingSeats = Math.max(0, initTotal - initOccupied);

  assert(
    'Initial Occupied Headcount',
    initOccupied === 42 && initTotal === 55,
    `${initOccupied} / ${initTotal} Passengers`
  );

  assert(
    'Occupancy Percentage Calculation',
    initOccupancyPct === 76,
    `Calculated: ${initOccupancyPct}% (Expected 76% from 42/55)`
  );

  assert(
    'Remaining Seats Calculation',
    initRemainingSeats === 13,
    `Calculated: ${initRemainingSeats} Seats Remaining`
  );

  // 3. Boarding Statistics Grid Math
  console.log('\n--- 3. 2x2 BOARDING STATISTICS INTEGRITY ---');
  const initDigital = initialTrip.digitalQrCount;
  const initCash = initialTrip.cashFareCount;
  const initFailed = initialTrip.pendingFailCount;
  const initAdoptionRate = Math.round((initDigital / Math.max(1, initOccupied)) * 100);

  assert(
    'Digital QR Count & Adoption Rate',
    initDigital === 36 && initAdoptionRate === 86,
    `Digital: ${initDigital}, Adoption: ${initAdoptionRate}%`
  );

  assert(
    'Cash Fares Count',
    initCash === 4,
    `Cash Fares: ${initCash}`
  );

  assert(
    'Failed Scans Count',
    initFailed === 2,
    `Failed Scans: ${initFailed}`
  );

  // 4. Passenger Manifest Seeding & Filtering
  console.log('\n--- 4. PASSENGER MANIFEST RECORDS & SEARCH/FILTER ---');
  let manifest = await tripApi.getPassengerManifest();
  assert(
    'Manifest Entries Seeded',
    manifest.length >= 5,
    `Total Records: ${manifest.length}`
  );

  const digitalRecords = manifest.filter((p) => p.category === 'DIGITAL');
  const cashRecords = manifest.filter((p) => p.category === 'CASH');
  const failedRecords = manifest.filter((p) => p.category === 'FAILED');

  assert(
    'Filter Tabs Segregation',
    digitalRecords.length > 0 && cashRecords.length > 0 && failedRecords.length > 0,
    `Digital: ${digitalRecords.length}, Cash: ${cashRecords.length}, Failed: ${failedRecords.length}`
  );

  // Test Search Logic
  const searchByTicket = manifest.filter((p) => p.ticketId.includes('9824'));
  const searchByStop = manifest.filter((p) => p.boardedAtStop.toLowerCase().includes('market'));
  assert(
    'Search by Ticket ID',
    searchByTicket.length >= 1 && searchByTicket[0].ticketId === 'TK-9824',
    `Found ticket #${searchByTicket[0]?.ticketId}`
  );
  assert(
    'Search by Stop Name',
    searchByStop.length >= 1,
    `Found ${searchByStop.length} entries for stop 'Market'`
  );

  // 5. Real-Time Ticket Validation -> Manifest & Occupancy Update
  console.log('\n--- 5. REAL-TIME QR BOARDING FLOW ---');
  let updateReceived = false;
  let updatedTripData: any = null;
  const unsubscribe = tripApi.subscribeTripUpdates((t) => {
    updateReceived = true;
    updatedTripData = t;
  });

  const scanResult = await tripApi.validateTicket('TK-9021', 'QR');
  assert(
    'Valid Ticket Scan Confirmed',
    scanResult.valid === true && scanResult.result === 'PASS',
    `Ticket: ${scanResult.ticketId}`
  );

  assert(
    'Occupancy Increased from 42 to 43',
    scanResult.updatedTrip.occupiedSeats === 43,
    `New Occupied Seats: ${scanResult.updatedTrip.occupiedSeats}`
  );

  assert(
    'Digital QR Count Increased from 36 to 37',
    scanResult.updatedTrip.digitalQrCount === 37,
    `New Digital QR: ${scanResult.updatedTrip.digitalQrCount}`
  );

  assert(
    'Real-time Listener Event Fired',
    updateReceived && updatedTripData?.occupiedSeats === 43,
    `Listener received update with ${updatedTripData?.occupiedSeats} seats`
  );

  manifest = await tripApi.getPassengerManifest();
  const newestPassenger = manifest[0];
  assert(
    'Newest Passenger Manifest Entry Created',
    newestPassenger.ticketId === 'TK-9021' && newestPassenger.category === 'DIGITAL',
    `Entry: #${newestPassenger.ticketId}, Status: ${newestPassenger.status}`
  );

  // 6. Duplicate Scan Protection
  console.log('\n--- 6. DUPLICATE SCAN PROTECTION ---');
  const dupScan = await tripApi.validateTicket('TK-9021', 'QR');
  assert(
    'Duplicate Scan Rejected',
    dupScan.valid === false && dupScan.result === 'REJECT',
    `Reason: ${dupScan.reason}`
  );

  assert(
    'Occupancy Not Incremented Twice',
    dupScan.updatedTrip.occupiedSeats === 43,
    `Occupancy remained at ${dupScan.updatedTrip.occupiedSeats}`
  );

  // 7. Cash Fare Recording & Manifest Update
  console.log('\n--- 7. CASH FARE BOARDING FLOW ---');
  const afterCashTrip = await tripApi.recordCashFare(2.5);
  assert(
    'Cash Fare Count Increased to 5',
    afterCashTrip.cashFareCount === 5,
    `Cash Count: ${afterCashTrip.cashFareCount}`
  );

  assert(
    'Headcount Increased to 44',
    afterCashTrip.occupiedSeats === 44,
    `Occupancy: ${afterCashTrip.occupiedSeats}`
  );

  manifest = await tripApi.getPassengerManifest();
  const newestCash = manifest[0];
  assert(
    'Cash Passenger Manifest Entry Verified',
    newestCash.category === 'CASH' && newestCash.fareLabel === '$2.50 Paid',
    `Ticket: #${newestCash.ticketId}, Badge: ${newestCash.badgeLabel}, Fare: ${newestCash.fareLabel}`
  );

  // 8. Failed Scan Handling
  console.log('\n--- 8. FAILED SCAN EXCEPTION FLOW ---');
  const invalidScan = await tripApi.validateTicket('INVALID-FAKE-TICKET', 'QR');
  assert(
    'Invalid Ticket Rejected',
    invalidScan.valid === false && invalidScan.result === 'REJECT',
    `Result: ${invalidScan.result}`
  );

  manifest = await tripApi.getPassengerManifest();
  const failedEntry = manifest.find((p) => p.ticketId === 'INVALID-FAKE-TICKET');
  assert(
    'Failed Scan Added to Manifest as FAILED',
    Boolean(failedEntry) && failedEntry?.category === 'FAILED' && failedEntry?.status === 'REJECTED',
    `Ticket: ${failedEntry?.ticketId}, Rejection: ${failedEntry?.rejectionReason}`
  );

  // 9. Incident Reporting & Issue Dispatch
  console.log('\n--- 9. ISSUE REPORTING ARCHITECTURE ---');
  const issueRes = await tripApi.reportTripIssue({
    type: 'Incorrect fare',
    description: 'Farebox card reader jammed at Market St stop.',
  });
  assert(
    'Issue Transmitted to Dispatch',
    issueRes.success === true && Boolean(issueRes.issueId),
    `Issue ID: ${issueRes.issueId}, Timestamp: ${issueRes.timestamp}`
  );

  // 10. Manifest CSV Export
  console.log('\n--- 10. MANIFEST REPORT EXPORT ---');
  const report = await tripApi.exportManifestReport();
  assert(
    'Manifest Report Generated with Real Data',
    report.tripId === 'TRIP-4028-0941' &&
      report.busNumber === '#4028' &&
      report.totalBoarded === afterCashTrip.occupiedSeats &&
      report.csv.includes('Ticket ID,Passenger Name') &&
      report.csv.includes('TK-9021'),
    `CSV length: ${report.csv.length} bytes, Total Boarded: ${report.totalBoarded}`
  );

  // 11. Complete & End Trip Workflow
  console.log('\n--- 11. COMPLETE & END TRIP WORKFLOW ---');
  const endedTrip = await tripApi.endTrip();
  assert(
    'Trip Status Transitioned to COMPLETED',
    endedTrip.tripStatus === 'COMPLETED' && Boolean(endedTrip.completedAt),
    `Status: ${endedTrip.tripStatus}, Completed At: ${endedTrip.completedAt}`
  );

  assert(
    'Doors Closed & Boarding Finalized',
    endedTrip.doorStatus === 'CLOSED',
    `Door Status: ${endedTrip.doorStatus}`
  );

  unsubscribe();

  console.log('\n================================================================');
  console.log(`PASSENGER MANIFEST TEST SUMMARY: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPassengerManifestTestSuite().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
