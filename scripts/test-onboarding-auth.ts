import { passengerDatabase } from '../src/services/mock/passengerDatabase';
import { passengerAuthApi } from '../src/services/api/passengerAuthApi';
import { terminalApi } from '../src/services/api/terminalApi';
import { secureStorage } from '../src/services/storage/secureStorage';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('TRANSITPULSE ONBOARDING & AUTHENTICATION TEST SUITE');
  console.log('======================================================\n');

  // Ensure online state initially
  terminalApi.setOfflineMode(false);

  // 1. Seed Commuter Verification
  console.log('--- 1. Seed Commuter Verification ---');
  const saraRecord = passengerDatabase.getByEmail('sara.miller@gmail.com');
  assert(saraRecord !== null, 'Sara Miller exists in passenger database');
  assert(saraRecord?.name === 'Sara Miller', 'Sara Miller name is properly set');
  assert(saraRecord?.role === 'PASSENGER', 'Role is PASSENGER');
  assert(saraRecord?.concessionType === 'STANDARD_ADULT', 'Concession type is STANDARD_ADULT');
  assert(saraRecord?.metroPayBalance === 42.5, 'MetroPay balance is 42.50');
  assert(saraRecord?.emailVerified === true, 'Email is verified');

  // 2. Commuter Login Authentication & Validation
  console.log('\n--- 2. Commuter Login Authentication & Validation ---');
  const emptyLogin = await passengerAuthApi.login({ identifier: '', password: '' });
  assert(!emptyLogin.success, 'Rejects empty credentials');

  const invalidPass = await passengerAuthApi.login({
    identifier: 'sara.miller@gmail.com',
    password: 'WrongPassword123!',
  });
  assert(!invalidPass.success, 'Rejects invalid password');

  const nonExistent = await passengerAuthApi.login({
    identifier: 'unknown.commuter@transitpulse.gov',
    password: 'CommuterPulse2025#',
  });
  assert(!nonExistent.success, 'Rejects unregistered commuter');

  const validLogin = await passengerAuthApi.login({
    identifier: 'sara.miller@gmail.com',
    password: 'CommuterPulse2025#',
    rememberMe: true,
  });
  assert(validLogin.success, 'Authenticates Sara Miller with valid credentials');
  assert(Boolean(validLogin.token), 'Issues valid session token');
  assert(validLogin.user?.email === 'sara.miller@gmail.com', 'Returns sanitized passenger profile');

  // 3. Social SSO Authentication (Apple ID & Google)
  console.log('\n--- 3. Social SSO Authentication ---');
  const googleAuth = await passengerAuthApi.socialLogin('GOOGLE');
  assert(googleAuth.success, 'Authenticates via Google SSO');
  assert(googleAuth.user?.role === 'PASSENGER', 'Google user has PASSENGER role');

  const appleAuth = await passengerAuthApi.socialLogin('APPLE');
  assert(appleAuth.success, 'Authenticates via Apple ID SSO');
  assert(Boolean(appleAuth.token), 'Issues token for Apple ID');

  // 4. Passenger Registration & Field Validations
  console.log('\n--- 4. Passenger Registration & Validation ---');
  const missingName = await passengerAuthApi.register({
    fullName: '',
    email: 'new.commuter@gmail.com',
    password: 'StrongPassword2026!',
    concessionType: 'STUDENT_YOUTH',
    agreeToTerms: true,
    disruptionAlertsEnabled: true,
  });
  assert(!missingName.success, 'Rejects registration with missing full name');

  const invalidEmail = await passengerAuthApi.register({
    fullName: 'David Commuter',
    email: 'invalid-email-format',
    password: 'StrongPassword2026!',
    concessionType: 'STUDENT_YOUTH',
    agreeToTerms: true,
    disruptionAlertsEnabled: true,
  });
  assert(!invalidEmail.success, 'Rejects registration with invalid email format');

  const weakPassword = await passengerAuthApi.register({
    fullName: 'David Commuter',
    email: 'david.commuter@gmail.com',
    password: 'short',
    concessionType: 'STUDENT_YOUTH',
    agreeToTerms: true,
    disruptionAlertsEnabled: true,
  });
  assert(!weakPassword.success, 'Rejects weak/short password (<8 chars)');

  const missingTerms = await passengerAuthApi.register({
    fullName: 'David Commuter',
    email: 'david.commuter@gmail.com',
    password: 'StrongPassword2026!',
    concessionType: 'STUDENT_YOUTH',
    agreeToTerms: false,
    disruptionAlertsEnabled: true,
  });
  assert(!missingTerms.success, 'Rejects registration without agreeing to terms');

  const testEmail = `new.commuter.${Date.now()}@gmail.com`;
  const validReg = await passengerAuthApi.register({
    fullName: 'Alex River',
    email: testEmail,
    phone: '+1 (555) 0196 283',
    password: 'CommuterPulse2025#',
    concessionType: 'STUDENT_YOUTH',
    agreeToTerms: true,
    disruptionAlertsEnabled: true,
  });
  assert(validReg.success, 'Registers new commuter Alex River');
  assert(validReg.requiresVerification === true, 'Requires OTP email verification');
  assert(validReg.user?.status === 'PENDING_VERIFICATION', 'Status is PENDING_VERIFICATION');
  assert(validReg.user?.concessionType === 'STUDENT_YOUTH', 'Concession set to STUDENT_YOUTH');

  const duplicateReg = await passengerAuthApi.register({
    fullName: 'Duplicate Alex',
    email: testEmail,
    password: 'CommuterPulse2025#',
    concessionType: 'STANDARD_ADULT',
    agreeToTerms: true,
    disruptionAlertsEnabled: true,
  });
  assert(!duplicateReg.success, 'Rejects duplicate email registration');

  // 5. Email OTP Verification Flow
  console.log('\n--- 5. Email OTP Verification Flow ---');
  const badOtp = await passengerAuthApi.verifyEmail(testEmail, '000000');
  assert(!badOtp.success, 'Rejects invalid OTP code');

  const goodOtp = await passengerAuthApi.verifyEmail(testEmail, '849201');
  assert(goodOtp.success, 'Verifies account with OTP 849201');
  assert(goodOtp.user?.emailVerified === true, 'Sets emailVerified to true');
  assert(goodOtp.user?.status === 'ACTIVE', 'Activates user status to ACTIVE');

  // 6. Password Reset Request
  console.log('\n--- 6. Password Reset Flow ---');
  const resetBlank = await passengerAuthApi.requestPasswordReset('');
  assert(!resetBlank.success, 'Rejects empty email for reset');

  const resetValid = await passengerAuthApi.requestPasswordReset('sara.miller@gmail.com');
  assert(resetValid.success, 'Dispatches password reset instructions');
  assert(resetValid.message.includes('sara.miller@gmail.com'), 'Contains recipient email');

  // 7. Offline Network Resilience
  console.log('\n--- 7. Network Resilience & Offline Mode ---');
  terminalApi.setOfflineMode(true);
  const offlineLogin = await passengerAuthApi.login({
    identifier: 'sara.miller@gmail.com',
    password: 'CommuterPulse2025#',
  });
  assert(!offlineLogin.success, 'Rejects login when network is offline');
  assert(
    Boolean(offlineLogin.error?.toLowerCase().includes('offline')),
    'Returns informative offline network error message'
  );

  const offlineReg = await passengerAuthApi.register({
    fullName: 'Offline Tester',
    email: 'offline@tester.com',
    password: 'Password123!',
    concessionType: 'STANDARD_ADULT',
    agreeToTerms: true,
    disruptionAlertsEnabled: true,
  });
  assert(!offlineReg.success, 'Rejects registration when network is offline');

  // Restore online mode
  terminalApi.setOfflineMode(false);
  const onlineLoginAgain = await passengerAuthApi.login({
    identifier: 'sara.miller@gmail.com',
    password: 'CommuterPulse2025#',
  });
  assert(onlineLoginAgain.success, 'Login succeeds when network is restored');

  // 8. Onboarding State & Role Selection Persistence
  console.log('\n--- 8. Onboarding State & Role Selection Persistence ---');
  await passengerAuthApi.resetOnboarding();
  let onboardingState = await passengerAuthApi.getOnboardingState();
  assert(!onboardingState.hasCompletedOnboarding, 'Onboarding is not completed initially after reset');

  await passengerAuthApi.completeOnboarding();
  onboardingState = await passengerAuthApi.getOnboardingState();
  assert(onboardingState.hasCompletedOnboarding, 'Onboarding is marked completed');

  await passengerAuthApi.setSelectedRole('PASSENGER');
  let selectedRole = await passengerAuthApi.getSelectedRole();
  assert(selectedRole === 'PASSENGER', 'Selected role is PASSENGER');

  await passengerAuthApi.setSelectedRole('DRIVER');
  selectedRole = await passengerAuthApi.getSelectedRole();
  assert(selectedRole === 'DRIVER', 'Selected role updated to DRIVER');

  await passengerAuthApi.setSelectedRole('ADMIN');
  selectedRole = await passengerAuthApi.getSelectedRole();
  assert(selectedRole === 'ADMIN', 'Selected role updated to ADMIN');

  console.log('\n======================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite execution error:', err);
  process.exit(1);
});
