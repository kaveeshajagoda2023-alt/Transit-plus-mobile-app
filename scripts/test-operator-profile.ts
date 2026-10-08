import { operatorApi } from '../src/services/api/operatorApi';
import { tripApi } from '../src/services/api/tripApi';
import { terminalApi } from '../src/services/api/terminalApi';

async function runOperatorProfileTestSuite() {
  console.log('================================================================');
  console.log('TRANSITPULSE - OPERATOR PROFILE & ACTIVE DUTY TEST SUITE');
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

  // 1. Initial Operator Profile Load & Identity
  console.log('--- 1. OPERATOR IDENTITY & PROFILE DATA ---');
  const initialProfile = await operatorApi.getProfile();
  assert(
    'Operator Profile Loaded',
    initialProfile.name === 'Kavithusan' && initialProfile.staffId === 'DRV-84920',
    `Name: ${initialProfile.name}, Staff ID: ${initialProfile.staffId}`
  );

  assert(
    'Role & Depot Qualification',
    initialProfile.role === 'Senior Conductor / Operator' && initialProfile.depot === 'Div 4 Depot',
    `Role: ${initialProfile.role}, Depot: ${initialProfile.depot}`
  );

  assert(
    'Rating & Tier 1 Commendation',
    initialProfile.rating === 4.95 && initialProfile.tier === 'Tier 1 Safe',
    `Rating: ${initialProfile.rating} (${initialProfile.ratingNote}), Tier: ${initialProfile.tier}`
  );

  // 2. Current Duty Assignment & Dynamic Shift Math
  console.log('\n--- 2. CURRENT DUTY ASSIGNMENT & SHIFT TIMELINE ---');
  assert(
    'Duty Status Active',
    initialProfile.dutyStatus === 'ON DUTY',
    `Status: ${initialProfile.dutyStatus}`
  );

  assert(
    'Assigned Fleet & Route',
    initialProfile.assignedFleet === 'Bus #4028' &&
      initialProfile.fleetType === 'Electric Hybrid' &&
      initialProfile.activeRoute === 'Line 42',
    `Fleet: ${initialProfile.assignedFleet} (${initialProfile.fleetType}), Route: ${initialProfile.activeRoute}`
  );

  const now = Date.now();
  const elapsedMins = Math.floor((now - initialProfile.shiftStartEpoch) / 60000);
  const remainingMins = Math.floor((initialProfile.shiftEndEpoch - now) / 60000);
  assert(
    'Dynamic Shift Elapsed & Remaining Math',
    elapsedMins >= 310 && elapsedMins <= 320 && remainingMins >= 240,
    `Elapsed: ${Math.floor(elapsedMins / 60)}h ${elapsedMins % 60}m (~5h 12m), Remaining: ${Math.floor(remainingMins / 60)}h ${remainingMins % 60}m`
  );

  // 3. Shift Telemetry & Live KPIs
  console.log('\n--- 3. SHIFT TELEMETRY & LIVE KPIS ---');
  assert(
    'Baseline Boardings & Scans',
    initialProfile.todaysBoardings === 438 && initialProfile.scansCompleted === 392,
    `Boardings: ${initialProfile.todaysBoardings} (+${initialProfile.boardingsTrendPct}%), Scans: ${initialProfile.scansCompleted}`
  );

  assert(
    'Cashless Boarding & Valid Passes Ratio',
    initialProfile.cashlessBoardingPct === 94.2 && initialProfile.validPassesPct === 100,
    `Cashless: ${initialProfile.cashlessBoardingPct}%, Valid Passes: ${initialProfile.validPassesPct}%`
  );

  assert(
    'On-Time Departure & Punctuality Rating',
    initialProfile.onTimeDeparturePct === 98.5 && initialProfile.punctualityStatus === 'Tier-1 Punctuality',
    `On-Time: ${initialProfile.onTimeDeparturePct}%, Status: ${initialProfile.punctualityStatus}`
  );

  // 4. Official Certifications Audit
  console.log('\n--- 4. OFFICIAL CERTIFICATIONS AUDIT ---');
  const certs = initialProfile.certifications;
  assert(
    'All 3 Certifications Present',
    certs.length === 3,
    `Total Certs: ${certs.length}`
  );

  const cdl = certs.find((c) => c.name.includes('CDL'));
  const optical = certs.find((c) => c.name.includes('Optical Validator'));
  const firstAid = certs.find((c) => c.name.includes('First Aid'));

  assert(
    'CDL Class B w/ Air Brakes Validated',
    Boolean(cdl) && cdl?.status === 'VERIFIED',
    `CDL: ${cdl?.detail}, Status: ${cdl?.status}`
  );

  assert(
    'Optical Validator FIPS-140 Token Active',
    Boolean(optical) && optical?.status === 'ACTIVE',
    `Token: ${optical?.detail}, Status: ${optical?.status}`
  );

  assert(
    'Emergency First Aid & CPR Certified',
    Boolean(firstAid) && firstAid?.status === 'VALID',
    `First Aid: ${firstAid?.detail}, Status: ${firstAid?.status}`
  );

  // 5. Diagnostics & Hardware Controls
  console.log('\n--- 5. HARDWARE DIAGNOSTICS & PERIPHERAL CONTROLS ---');
  assert(
    'Air-Gap Cryptotoken Cache Status',
    initialProfile.diagnostics.airGapCachedTokens === 3240 && initialProfile.diagnostics.airGapStatus === 'Synced',
    `Cached Tokens: ${initialProfile.diagnostics.airGapCachedTokens}, State: ${initialProfile.diagnostics.airGapStatus}`
  );

  assert(
    'Optical Scanner Connection Status',
    initialProfile.diagnostics.scannerConnected === true && initialProfile.diagnostics.scannerName === 'POS-Scanner-99',
    `Device: ${initialProfile.diagnostics.scannerName}, Connected: ${initialProfile.diagnostics.scannerConnected}`
  );

  // Test toggles
  const beepStateAfterToggle = await operatorApi.toggleScannerBeep(false);
  assert(
    'Scanner Beep Toggle OFF',
    beepStateAfterToggle === false,
    `Beep Enabled: ${beepStateAfterToggle}`
  );

  const beepStateRestored = await operatorApi.toggleScannerBeep(true);
  assert(
    'Scanner Beep Toggle Restored ON',
    beepStateRestored === true,
    `Beep Enabled: ${beepStateRestored}`
  );

  const brightnessAfterToggle = await operatorApi.toggleBrightnessBoost(false);
  assert(
    'Turnstile Auto-Brightness Toggle OFF',
    brightnessAfterToggle === false,
    `Brightness Boost: ${brightnessAfterToggle}`
  );

  const brightnessRestored = await operatorApi.toggleBrightnessBoost(true);
  assert(
    'Turnstile Auto-Brightness Restored ON',
    brightnessRestored === true,
    `Brightness Boost: ${brightnessRestored}`
  );

  // Test scanner re-pair action
  const repairRes = await operatorApi.reconnectScanner();
  assert(
    'Scanner Re-Pair Action Succeeded',
    repairRes.connected === true && repairRes.device === 'POS-Scanner-99',
    `Re-paired Sensor: ${repairRes.device}`
  );

  // Test Air-gap cache sync
  const syncRes = await operatorApi.syncAirGapCache();
  assert(
    'Air-Gap Cache Synchronized',
    syncRes.synced === true && syncRes.tokenCount === 3264,
    `New Token Cache: ${syncRes.tokenCount} tokens`
  );

  // 6. Switch Vehicle Workflow
  console.log('\n--- 6. VEHICLE SWITCH WORKFLOW ---');
  const switchedProfile = await operatorApi.switchVehicle('Bus #4208', 'Zero-Emission EV');
  assert(
    'Vehicle Switched to Bus #4208',
    switchedProfile.assignedFleet === 'Bus #4208' && switchedProfile.fleetType === 'Zero-Emission EV',
    `New Fleet: ${switchedProfile.assignedFleet} (${switchedProfile.fleetType})`
  );

  // Switch back to #4028
  await operatorApi.switchVehicle('Bus #4028', 'Electric Hybrid');

  // 7. Real-Time Telemetry Sync with Trip Database
  console.log('\n--- 7. REAL-TIME TRIP BOARDING SYNCHRONIZATION ---');
  let listenerFired = false;
  let updatedFromListener: any = null;
  const unsub = operatorApi.subscribeOperatorUpdates((p) => {
    listenerFired = true;
    updatedFromListener = p;
  });

  // Simulate a passenger scanning a QR ticket
  await tripApi.validateTicket('TK-9021', 'QR');
  const profileAfterScan = await operatorApi.getProfile();

  assert(
    'Boardings & Scans Incremented Real-Time',
    profileAfterScan.todaysBoardings === 439 && profileAfterScan.scansCompleted === 393,
    `Boardings: ${profileAfterScan.todaysBoardings}, Scans: ${profileAfterScan.scansCompleted}`
  );

  assert(
    'Real-Time Subscriber Fired',
    listenerFired && updatedFromListener?.todaysBoardings === 439,
    `Subscriber received boardings = ${updatedFromListener?.todaysBoardings}`
  );
  unsub();

  // 8. Vehicle Fault / Maintenance Reporting
  console.log('\n--- 8. VEHICLE MAINTENANCE FAULT REPORTING ---');
  const faultReport = await operatorApi.reportVehicleFault({
    category: 'Doors & Ramp',
    severity: 'MEDIUM',
    description: 'Rear passenger door seal sticking on stop deployment.',
    busNumber: 'Bus #4028',
    routeNumber: 'Line 42',
  });

  assert(
    'Maintenance Fault Submitted to Dispatch',
    Boolean(faultReport.id) &&
      faultReport.status === 'SUBMITTED' &&
      faultReport.category === 'Doors & Ramp' &&
      faultReport.severity === 'MEDIUM',
    `Ticket ID: ${faultReport.id}, Bus: ${faultReport.busNumber}, Status: ${faultReport.status}`
  );

  const allFaults = await operatorApi.getFaultReports();
  assert(
    'Fault Logged in System Defect Registry',
    allFaults.length >= 1 && allFaults[0].id === faultReport.id,
    `Total Defects Logged: ${allFaults.length}`
  );

  // 9. Clock Out & Shift Summary Conclude Action
  console.log('\n--- 9. CLOCK OUT & COMPLETE SHIFT SUMMARY ---');
  const shiftSummary = await operatorApi.clockOutShift();
  assert(
    'Shift Summary Compiled',
    Boolean(shiftSummary.shiftId) &&
      shiftSummary.operatorName === 'Kavithusan' &&
      shiftSummary.staffId === 'DRV-84920' &&
      shiftSummary.boardingsTotal === 439 &&
      shiftSummary.scansCompleted === 393 &&
      Boolean(shiftSummary.shiftDuration),
    `Shift ID: ${shiftSummary.shiftId}, Duration: ${shiftSummary.shiftDuration}, Boardings: ${shiftSummary.boardingsTotal}`
  );

  const profileAfterClockOut = await operatorApi.getProfile();
  assert(
    'Duty Status Transitioned to OFF DUTY',
    profileAfterClockOut.dutyStatus === 'OFF DUTY',
    `Status: ${profileAfterClockOut.dutyStatus}`
  );

  // Reset duty status back to ON DUTY for persistent test repeatability
  await operatorApi.updateDutyStatus('ON DUTY');

  console.log('\n================================================================');
  console.log(`OPERATOR PROFILE TEST SUMMARY: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runOperatorProfileTestSuite().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
