import { staffAuthApi } from '../src/services/api/staffAuthApi';
import { terminalApi } from '../src/services/api/terminalApi';
import { staffDatabase } from '../src/services/mock/staffDatabase';
import { secureStorage } from '../src/services/storage/secureStorage';
import { nfcService } from '../src/services/nfc/nfcService';

async function runTestSuite() {
  console.log('====================================================');
  console.log('TRANSITPULSE STAFF PORTAL - AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(testName: string, condition: boolean | undefined, detail: string = '') {
    if (Boolean(condition)) {
      console.log(`[PASS] ${testName} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail}`);
      failed++;
    }
  }

  // 1. Terminal Telemetry & Real-Time Status
  console.log('--- 1. Terminal Telemetry & Operational Data ---');
  const termStatus = await terminalApi.getTerminalStatus();
  assert(
    'Terminal Status Fetch',
    termStatus.vehicleNumber === 'Bus #4028' &&
      termStatus.transitAuthority === 'Metro Transit Authority (MTA)' &&
      termStatus.dispatchZone === 'DISPATCH ZONE 4' &&
      termStatus.version === 'v4.8.2-ops',
    `Vehicle: ${termStatus.vehicleNumber}, Zone: ${termStatus.dispatchZone}`
  );

  // 2. Empty Field Validation
  console.log('\n--- 2. Input Validation ---');
  const emptyRes = await staffAuthApi.login('', '');
  assert(
    'Empty Credentials Rejected',
    emptyRes.success === false && !!emptyRes.error,
    emptyRes.error || ''
  );

  // 3. Invalid Staff ID
  const invalidIdRes = await staffAuthApi.login('NONEXISTENT-999', 'Password123!');
  assert(
    'Non-existent Staff ID Rejected',
    invalidIdRes.success === false && invalidIdRes.error?.includes('Invalid Staff ID'),
    invalidIdRes.error || ''
  );

  // 4. Invalid Password
  const invalidPassRes = await staffAuthApi.login('DRV-84920@transitpulse.gov', 'WrongPassword!');
  assert(
    'Invalid Password Rejected',
    invalidPassRes.success === false && invalidPassRes.error?.includes('Invalid Staff ID or password'),
    invalidPassRes.error || ''
  );

  // 5. Valid Driver Login
  console.log('\n--- 3. Role-Based Staff Authentication ---');
  const driverLoginRes = await staffAuthApi.login('DRV-84920@transitpulse.gov', 'TransitSecure2024!');
  assert(
    'Driver Login Succeeded',
    driverLoginRes.success === true &&
      driverLoginRes.user?.role === 'DRIVER' &&
      driverLoginRes.user?.assignedVehicle === '#4028' &&
      !!driverLoginRes.accessToken,
    `Driver: ${driverLoginRes.user?.name}, Token: ${driverLoginRes.accessToken?.substring(0, 16)}...`
  );

  // 6. Valid Conductor Login
  const conductorLoginRes = await staffAuthApi.login('cnd.rostova@transitpulse.gov', 'ConductorPass2024!');
  assert(
    'Conductor Login Succeeded',
    conductorLoginRes.success === true &&
      conductorLoginRes.user?.role === 'CONDUCTOR' &&
      conductorLoginRes.user?.assignedVehicle === '#4028',
    `Conductor: ${conductorLoginRes.user?.name}`
  );

  // 7. Valid Dispatcher Login
  const dispatcherLoginRes = await staffAuthApi.login('dispatch.sterling@transitpulse.gov', 'DispatchHQ2024!');
  assert(
    'Dispatcher Login Succeeded',
    dispatcherLoginRes.success === true && dispatcherLoginRes.user?.role === 'DISPATCHER',
    `Dispatcher: ${dispatcherLoginRes.user?.name}`
  );

  // 8. Valid Admin Login
  const adminLoginRes = await staffAuthApi.login('admin.chen@transitpulse.gov', 'AdminTransit2024!');
  assert(
    'Admin Login Succeeded',
    adminLoginRes.success === true && adminLoginRes.user?.role === 'ADMIN',
    `Admin: ${adminLoginRes.user?.name}`
  );

  // 9. Unauthorized Passenger Account Denied
  console.log('\n--- 4. Role Authorization & Access Control (RBAC) ---');
  const passengerLoginRes = await staffAuthApi.login('passenger.john@gmail.com', 'Passenger123!');
  assert(
    'Passenger Account Denied Terminal Access',
    passengerLoginRes.success === false &&
      passengerLoginRes.error === 'This account is not authorized for terminal access.',
    passengerLoginRes.error || ''
  );

  // 10. Suspended Staff Member Denied
  const suspendedRes = await staffAuthApi.login('suspended.staff@transitpulse.gov', 'Password123!');
  assert(
    'Suspended Account Denied Terminal Access',
    suspendedRes.success === false &&
      suspendedRes.error?.includes('Account is suspended'),
    suspendedRes.error || ''
  );

  // 11. Secure Session Storage & Remember Me
  console.log('\n--- 5. Secure Session Storage & Remember Me ---');
  if (driverLoginRes.accessToken && driverLoginRes.user) {
    await secureStorage.saveAuthToken(driverLoginRes.accessToken, 3600);
    await secureStorage.saveStaffUser(driverLoginRes.user);
    await secureStorage.setRememberMe(true, 'DRV-84920@transitpulse.gov');

    const storedToken = await secureStorage.getAuthToken();
    const storedUser = await secureStorage.getStaffUser();
    const rememberedId = await secureStorage.getRememberedIdentifier();

    assert(
      'Session Token Securely Stored & Retrieved',
      storedToken === driverLoginRes.accessToken,
      'Token match verified'
    );
    assert(
      'Staff Profile Securely Stored & Retrieved',
      storedUser?.staffId === 'DRV-84920',
      `User ID: ${storedUser?.staffId}`
    );
    assert(
      'Remember Me Identifier Preserved',
      rememberedId === 'DRV-84920@transitpulse.gov',
      rememberedId || ''
    );

    // Logout & Session Clearing
    await secureStorage.clearSession();
    const tokenAfterLogout = await secureStorage.getAuthToken();
    const userAfterLogout = await secureStorage.getStaffUser();
    const rememberedAfterLogout = await secureStorage.getRememberedIdentifier();

    assert(
      'Logout Clears Session Token',
      tokenAfterLogout === null && userAfterLogout === null,
      'Session destroyed'
    );
    assert(
      'Logout Preserves Remembered Identifier When Policy Configured',
      rememberedAfterLogout === 'DRV-84920@transitpulse.gov',
      'Identifier remembered'
    );
  }

  // 12. Password Recovery (Forgot Password Flow)
  console.log('\n--- 6. Forgot Password & Recovery Flow ---');
  const forgotRes = await staffAuthApi.requestPasswordReset('DRV-84920@transitpulse.gov');
  assert(
    'Forgot Password Request Succeeded',
    forgotRes.success === true && !!forgotRes.recoveryPin,
    `PIN: ${forgotRes.recoveryPin}, Channel: ${forgotRes.contactDispatch}`
  );

  if (forgotRes.recoveryPin) {
    const resetRes = await staffAuthApi.resetPassword(
      'DRV-84920@transitpulse.gov',
      forgotRes.recoveryPin,
      'TransitSecure2026New!'
    );
    assert(
      'Password Reset With PIN Succeeded',
      resetRes.success === true,
      'Password updated'
    );

    // Verify login with new password
    const newPassLogin = await staffAuthApi.login('DRV-84920@transitpulse.gov', 'TransitSecure2026New!');
    assert(
      'Login With Newly Reset Password Succeeded',
      newPassLogin.success === true,
      `Re-authenticated as ${newPassLogin.user?.name}`
    );

    // Revert password back for test consistency
    const pin2 = staffDatabase.createPasswordResetPin('DRV-84920@transitpulse.gov');
    await staffAuthApi.resetPassword('DRV-84920@transitpulse.gov', pin2, 'TransitSecure2024!');
  }

  // 13. Operator NFC Key Badge Tap Flow
  console.log('\n--- 7. Operator NFC Key Authentication ---');
  const nfcScan = await nfcService.scanBadge('NFC-COND-55219');
  assert(
    'NFC Badge Scan Abstraction Working',
    nfcScan.success === true && nfcScan.badgeId === 'NFC-COND-55219',
    `Badge Scanned: ${nfcScan.badgeId}`
  );

  const nfcLoginRes = await staffAuthApi.loginWithNfc('NFC-COND-55219');
  assert(
    'Conductor NFC Badge Login Succeeded',
    nfcLoginRes.success === true &&
      nfcLoginRes.user?.name === 'Elena Rostova' &&
      nfcLoginRes.user?.role === 'CONDUCTOR',
    `Authenticated Conductor: ${nfcLoginRes.user?.name}`
  );

  const invalidNfcRes = await staffAuthApi.loginWithNfc('NFC-UNKNOWN-BADGE');
  assert(
    'Unrecognized NFC Badge Rejected',
    invalidNfcRes.success === false && invalidNfcRes.error?.includes('Unable to verify conductor badge'),
    invalidNfcRes.error || ''
  );

  // 14. Network Failure / Offline Handling
  console.log('\n--- 8. Network Failure & Offline State ---');
  terminalApi.setSimulatedOffline(true);
  const offlineLogin = await staffAuthApi.login('DRV-84920@transitpulse.gov', 'TransitSecure2024!');
  assert(
    'Network Outage Gracefully Caught & Reported',
    offlineLogin.success === false && offlineLogin.error?.includes('Unable to connect to the TransitPulse server'),
    offlineLogin.error || ''
  );
  terminalApi.setSimulatedOffline(false);

  console.log('\n====================================================');
  console.log(`TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test execution threw an uncaught error:', err);
  process.exit(1);
});
