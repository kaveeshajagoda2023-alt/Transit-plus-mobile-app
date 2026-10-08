import { passengerCrudApi } from '../src/services/api/passengerCrudApi';
import { driverCrudApi } from '../src/services/api/driverCrudApi';

async function runClientCrudVerification() {
  console.log('====================================================');
  console.log('TRANSITPULSE FRONTEND CRUD SERVICE API CONTRACT TEST');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail: string = '') {
    if (condition) {
      console.log(`[PASS] ${name} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} - ${detail}`);
      failed++;
    }
  }

  assert('passengerCrudApi.getAll is defined function', typeof passengerCrudApi.getAll === 'function');
  assert('passengerCrudApi.getById is defined function', typeof passengerCrudApi.getById === 'function');
  assert('passengerCrudApi.create is defined function', typeof passengerCrudApi.create === 'function');
  assert('passengerCrudApi.update is defined function', typeof passengerCrudApi.update === 'function');
  assert('passengerCrudApi.delete is defined function', typeof passengerCrudApi.delete === 'function');
  assert('passengerCrudApi.topUpWallet is defined function', typeof passengerCrudApi.topUpWallet === 'function');

  assert('driverCrudApi.getAll is defined function', typeof driverCrudApi.getAll === 'function');
  assert('driverCrudApi.getById is defined function', typeof driverCrudApi.getById === 'function');
  assert('driverCrudApi.create is defined function', typeof driverCrudApi.create === 'function');
  assert('driverCrudApi.update is defined function', typeof driverCrudApi.update === 'function');
  assert('driverCrudApi.delete is defined function', typeof driverCrudApi.delete === 'function');
  assert('driverCrudApi.assignVehicle is defined function', typeof driverCrudApi.assignVehicle === 'function');
  assert('driverCrudApi.switchDutyStatus is defined function', typeof driverCrudApi.switchDutyStatus === 'function');

  console.log('\n====================================================');
  console.log(`CLIENT CRUD TEST SUITE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runClientCrudVerification().catch((err) => {
  console.error(err);
  process.exit(1);
});
