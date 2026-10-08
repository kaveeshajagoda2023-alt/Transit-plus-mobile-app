import http from 'http';
import { createServer } from '../src/server.js';
import { wsServer } from '../src/websocket/wsServer.js';

const app = createServer();
const server = http.createServer(app);
wsServer.initialize(server);

const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}/api`;

async function request(path: string, options: RequestInit = {}): Promise<{ status: number; body: any }> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  let body: any = null;
  const text = await res.text();
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

async function runCrudTestSuite() {
  console.log('====================================================');
  console.log('TRANSITPULSE PASSENGER & DRIVER CRUD TEST SUITE');
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

  await new Promise<void>((resolve) => {
    server.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}\n`);
      resolve();
    });
  });

  try {
    // ==========================================
    // 1. PASSENGER CRUD OPERATIONS
    // ==========================================
    console.log('--- 1. PASSENGER CRUD OPERATIONS ---');

    // CREATE
    const newPassengerPayload = {
      name: 'Nimal Jayawardena',
      email: 'nimal.jaya@testmail.com',
      phone: '+94771234567',
      concessionType: 'STUDENT_YOUTH',
      metroPayBalance: 25.5,
    };
    const createPassRes = await request('/passengers', {
      method: 'POST',
      body: JSON.stringify(newPassengerPayload),
    });
    assert(
      'Create Passenger',
      createPassRes.status === 201 && createPassRes.body.success,
      `ID: ${createPassRes.body.data?.id}, Name: ${createPassRes.body.data?.name}`
    );
    const createdPassengerId = createPassRes.body.data?.id;

    // READ ALL
    const listPassRes = await request('/passengers');
    assert(
      'List All Passengers',
      listPassRes.status === 200 && Array.isArray(listPassRes.body.data) && listPassRes.body.data.length > 0,
      `Total: ${listPassRes.body.pagination?.total}`
    );

    // SEARCH PASSENGER
    const searchPassRes = await request('/passengers?search=Nimal');
    assert(
      'Search Passenger by Name',
      searchPassRes.status === 200 &&
        searchPassRes.body.data.some((p: any) => p.name.includes('Nimal')),
      `Found: ${searchPassRes.body.data?.length} match(es)`
    );

    // READ BY ID
    const getPassRes = await request(`/passengers/${createdPassengerId}`);
    assert(
      'Read Single Passenger by ID',
      getPassRes.status === 200 && getPassRes.body.data?.email === 'nimal.jaya@testmail.com',
      `Email: ${getPassRes.body.data?.email}`
    );

    // UPDATE
    const updatePassRes = await request(`/passengers/${createdPassengerId}`, {
      method: 'PATCH',
      body: JSON.stringify({ phone: '+94779998888', concessionType: 'STANDARD_ADULT' }),
    });
    assert(
      'Update Passenger Profile',
      updatePassRes.status === 200 &&
        updatePassRes.body.data?.phone === '+94779998888' &&
        updatePassRes.body.data?.concessionType === 'STANDARD_ADULT',
      `New Phone: ${updatePassRes.body.data?.phone}`
    );

    // TOP-UP WALLET
    const topUpRes = await request(`/passengers/${createdPassengerId}/top-up`, {
      method: 'POST',
      body: JSON.stringify({ amount: 50.0 }),
    });
    assert(
      'Top-up Commuter MetroPay Wallet',
      topUpRes.status === 200 && topUpRes.body.balance === 75.5,
      `Updated Balance: $${topUpRes.body.balance}`
    );

    // DELETE
    const deletePassRes = await request(`/passengers/${createdPassengerId}`, {
      method: 'DELETE',
    });
    assert(
      'Delete Passenger',
      deletePassRes.status === 200 && deletePassRes.body.success,
      `Deleted ID: ${deletePassRes.body.deletedId}`
    );

    // VERIFY DELETION
    const verifyPassDel = await request(`/passengers/${createdPassengerId}`);
    assert(
      'Verify Passenger Deletion (404)',
      verifyPassDel.status === 404,
      `Status code: ${verifyPassDel.status}`
    );

    // ==========================================
    // 2. DRIVER CRUD OPERATIONS
    // ==========================================
    console.log('\n--- 2. DRIVER & OPERATOR CRUD OPERATIONS ---');

    // CREATE
    const newDriverPayload = {
      name: 'Rohan Wickramasinghe',
      email: 'rohan.w@transitpulse.gov',
      staffId: 'DRV-77123',
      phone: '+94715556677',
      assignedVehicle: 'Bus #4030',
      dispatchZone: 'DISPATCH ZONE 2',
      badgeLabel: 'Master Coach Operator',
      shiftHours: '14:00 - 22:00',
    };
    const createDriverRes = await request('/drivers', {
      method: 'POST',
      body: JSON.stringify(newDriverPayload),
    });
    assert(
      'Create Driver Profile',
      createDriverRes.status === 201 && createDriverRes.body.success,
      `StaffID: ${createDriverRes.body.data?.staffId}, Name: ${createDriverRes.body.data?.name}`
    );
    const createdDriverStaffId = createDriverRes.body.data?.staffId;
    const createdDriverId = createDriverRes.body.data?.id;

    // READ ALL
    const listDriversRes = await request('/drivers');
    assert(
      'List All Drivers',
      listDriversRes.status === 200 && Array.isArray(listDriversRes.body.data) && listDriversRes.body.data.length > 0,
      `Total Drivers: ${listDriversRes.body.pagination?.total}`
    );

    // SEARCH DRIVER
    const searchDriverRes = await request('/drivers?search=Rohan');
    assert(
      'Search Driver by Name',
      searchDriverRes.status === 200 &&
        searchDriverRes.body.data.some((d: any) => d.name.includes('Rohan')),
      `Found: ${searchDriverRes.body.data?.length} match(es)`
    );

    // READ BY ID / STAFF ID
    const getDriverRes = await request(`/drivers/${createdDriverStaffId}`);
    assert(
      'Read Single Driver by Staff ID',
      getDriverRes.status === 200 && getDriverRes.body.data?.staffId === 'DRV-77123',
      `Assigned: ${getDriverRes.body.data?.assignedVehicle}`
    );

    // UPDATE DRIVER
    const updateDriverRes = await request(`/drivers/${createdDriverStaffId}`, {
      method: 'PATCH',
      body: JSON.stringify({ shiftHours: '08:00 - 16:00', badgeLabel: 'Senior Highway Captain' }),
    });
    assert(
      'Update Driver Profile',
      updateDriverRes.status === 200 &&
        updateDriverRes.body.data?.shiftHours === '08:00 - 16:00' &&
        updateDriverRes.body.data?.badgeLabel === 'Senior Highway Captain',
      `Updated Badge: ${updateDriverRes.body.data?.badgeLabel}`
    );

    // ASSIGN VEHICLE
    const assignVehicleRes = await request(`/drivers/${createdDriverStaffId}/assign-vehicle`, {
      method: 'POST',
      body: JSON.stringify({ vehicleNumber: 'Bus #4999' }),
    });
    assert(
      'Assign New Fleet Vehicle',
      assignVehicleRes.status === 200 && assignVehicleRes.body.data?.assignedVehicle === 'Bus #4999',
      `New Vehicle: ${assignVehicleRes.body.data?.assignedVehicle}`
    );

    // SWITCH DUTY STATUS
    const dutyStatusRes = await request(`/drivers/${createdDriverStaffId}/duty-status`, {
      method: 'POST',
      body: JSON.stringify({ status: 'OFF_DUTY' }),
    });
    assert(
      'Switch Driver Duty Status',
      dutyStatusRes.status === 200 && dutyStatusRes.body.data?.status === 'OFF_DUTY',
      `Status: ${dutyStatusRes.body.data?.status}`
    );

    // DELETE DRIVER
    const deleteDriverRes = await request(`/drivers/${createdDriverId}`, {
      method: 'DELETE',
    });
    assert(
      'Delete Driver Profile',
      deleteDriverRes.status === 200 && deleteDriverRes.body.success,
      `Deleted Driver ID: ${deleteDriverRes.body.deletedId}`
    );

    // VERIFY DRIVER DELETION
    const verifyDriverDel = await request(`/drivers/${createdDriverStaffId}`);
    assert(
      'Verify Driver Deletion (404)',
      verifyDriverDel.status === 404,
      `Status code: ${verifyDriverDel.status}`
    );
  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`CRUD TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runCrudTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
