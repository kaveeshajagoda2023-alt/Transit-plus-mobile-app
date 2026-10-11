/**
 * Member 2 — Passenger Ticketing functional test suite
 * Run: npm run test:ticketing   (from /backend)
 *
 * Each case has an ID (TC-M2-xx) that is referenced in the traceability matrix.
 */
import http from 'http';
import { createServer } from '../src/server.js';
import { wsServer } from '../src/websocket/wsServer.js';

const app = createServer();
const server = http.createServer(app);
wsServer.initialize(server);

const PORT = 5097;
const BASE_URL = `http://localhost:${PORT}/api`;

async function request(path: string, options: RequestInit = {}): Promise<{ status: number; body: any }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const text = await res.text();
  let body: any = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

const post = (path: string, body: unknown) => request(path, { method: 'POST', body: JSON.stringify(body) });
const patch = (path: string, body: unknown) => request(path, { method: 'PATCH', body: JSON.stringify(body) });
const del = (path: string) => request(path, { method: 'DELETE' });

const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600 * 1000).toISOString();

const VALID_CARD = { holderName: 'Test Passenger', number: '4242 4242 4242 4242', expiry: '12/30', cvv: '123' };
const DECLINED_CARD = { ...VALID_CARD, number: '4000 0000 0000 0002' };

async function run() {
  console.log('====================================================');
  console.log('MEMBER 2 — PASSENGER TICKETING TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  const assert = (id: string, name: string, condition: boolean, detail = '') => {
    if (condition) {
      console.log(`[PASS] ${id} ${name}${detail ? ` (${detail})` : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${id} ${name} — ${detail}`);
      failed++;
    }
  };

  await new Promise<void>((resolve) => server.listen(PORT, resolve));

  try {
    // Setup: a passenger with a small wallet balance
    const passengerRes = await post('/passengers', {
      name: 'Ticketing Tester',
      email: `ticketing.${Date.now()}@test.lk`,
      concessionType: 'STANDARD_ADULT',
      metroPayBalance: 50,
    });
    const passengerId: string = passengerRes.body.data.id;

    // --- Routes & fares ---
    const routes = await request('/ticketing/routes');
    const line42 = routes.body.routes?.find((r: any) => r.routeNumber === 'LINE 42');
    assert('TC-M2-01', 'Load routes and stops for booking', routes.status === 200 && !!line42 && line42.stops.length >= 2,
      `${routes.body.count} routes`);

    const [s1, , s3] = line42.stops;
    const adultQuote = await post('/ticketing/quote', { routeId: line42.id, fromStopId: s1.id, toStopId: s3.id, fareCategory: 'ADULT', passengers: 1 });
    const studentQuote = await post('/ticketing/quote', { routeId: line42.id, fromStopId: s1.id, toStopId: s3.id, fareCategory: 'STUDENT', passengers: 1 });
    assert('TC-M2-02', 'Fare quote applies 50% student concession',
      adultQuote.body.quote?.unitFare === 100 && studentQuote.body.quote?.unitFare === 50,
      `adult Rs.${adultQuote.body.quote?.unitFare}, student Rs.${studentQuote.body.quote?.unitFare}`);

    // --- CREATE ---
    const booking = { passengerId, passengerName: 'Ticketing Tester', routeId: line42.id, fromStopId: s1.id, toStopId: s3.id, fareCategory: 'ADULT', passengers: 1, travelDate: hoursFromNow(72) };
    const created = await post('/ticketing/tickets', booking);
    const ticketA = created.body.data;
    assert('TC-M2-03', 'Create ticket (status PENDING_PAYMENT)',
      created.status === 201 && ticketA?.status === 'PENDING_PAYMENT' && /^TP-[A-Z0-9]{6}$/.test(ticketA.ticketNumber),
      ticketA?.ticketNumber);

    const sameStop = await post('/ticketing/tickets', { ...booking, toStopId: s1.id });
    assert('TC-M2-04', 'Reject booking with same boarding and destination stop', sameStop.status === 400, sameStop.body.error);

    const pastDate = await post('/ticketing/tickets', { ...booking, travelDate: hoursFromNow(-2) });
    assert('TC-M2-05', 'Reject booking with a past travel date', pastDate.status === 400, pastDate.body.error);

    const tooMany = await post('/ticketing/tickets', { ...booking, passengers: 11 });
    assert('TC-M2-06', 'Reject more than 10 passengers', tooMany.status === 400, tooMany.body.error);

    // --- READ ---
    const activeList = await request(`/ticketing/tickets?passengerId=${passengerId}&view=active`);
    assert('TC-M2-07', 'List active tickets for passenger',
      activeList.status === 200 && activeList.body.data.some((t: any) => t.id === ticketA.id), `${activeList.body.count} active`);

    const single = await request(`/ticketing/tickets/${ticketA.id}`);
    assert('TC-M2-08', 'Get single ticket by ID', single.status === 200 && single.body.data.ticketNumber === ticketA.ticketNumber);

    // --- UPDATE (unpaid booking) ---
    const edited = await patch(`/ticketing/tickets/${ticketA.id}`, { passengers: 2 });
    assert('TC-M2-09', 'Edit unpaid booking recalculates fare',
      edited.status === 200 && edited.body.data.passengers === 2 && edited.body.data.totalFare === 200,
      `total Rs.${edited.body.data?.totalFare}`);

    // --- PAYMENT ---
    const badCard = await post(`/ticketing/tickets/${ticketA.id}/pay`, { method: 'CARD', card: { ...VALID_CARD, number: '4242 4242 4242 4241' } });
    assert('TC-M2-10', 'Reject invalid card number (Luhn check)', badCard.status === 400, badCard.body.error);

    const declined = await post(`/ticketing/tickets/${ticketA.id}/pay`, { method: 'CARD', card: DECLINED_CARD });
    assert('TC-M2-11', 'Declined card records FAILED payment, ticket stays unpaid',
      declined.status === 402 && declined.body.payment?.status === 'FAILED' && declined.body.data.status === 'PENDING_PAYMENT',
      declined.body.error);

    const lowWallet = await post(`/ticketing/tickets/${ticketA.id}/pay`, { method: 'WALLET' });
    assert('TC-M2-12', 'Insufficient wallet balance is rejected', lowWallet.status === 402, lowWallet.body.error);

    await post(`/passengers/${passengerId}/top-up`, { amount: 1000 });
    const paid = await post(`/ticketing/tickets/${ticketA.id}/pay`, { method: 'WALLET' });
    const wallet = await request(`/ticketing/wallet/${passengerId}`);
    assert('TC-M2-13', 'Wallet payment activates ticket and deducts balance',
      paid.status === 200 && paid.body.data.status === 'ACTIVE' && paid.body.payment.receiptNumber && wallet.body.balance === 850,
      `balance Rs.${wallet.body.balance}`);

    const payTwice = await post(`/ticketing/tickets/${ticketA.id}/pay`, { method: 'WALLET' });
    assert('TC-M2-14', 'Cannot pay twice for the same ticket', payTwice.status === 409);

    // --- UPDATE (reschedule paid ticket) ---
    const resched = await patch(`/ticketing/tickets/${ticketA.id}`, { travelDate: hoursFromNow(96) });
    assert('TC-M2-15', 'Reschedule paid ticket moves validity window',
      resched.status === 200 && resched.body.data.rescheduleCount === 1 && resched.body.data.travelDate === new Date(resched.body.data.travelDate).toISOString(),
      `reschedules: ${resched.body.data?.rescheduleCount}`);

    const changePax = await patch(`/ticketing/tickets/${ticketA.id}`, { passengers: 3 });
    assert('TC-M2-16', 'Paid ticket cannot change passenger count', changePax.status === 400, changePax.body.error);

    // --- CANCEL ---
    const preview = await request(`/ticketing/tickets/${ticketA.id}/cancellation-preview`);
    assert('TC-M2-17', 'Cancellation preview gives 100% refund well before travel',
      preview.body.data?.refundPercent === 100 && preview.body.data?.refundAmount === 200);

    const cancelled = await post(`/ticketing/tickets/${ticketA.id}/cancel`, {});
    const walletAfter = await request(`/ticketing/wallet/${passengerId}`);
    assert('TC-M2-18', 'Cancel ticket refunds wallet and marks payment REFUNDED',
      cancelled.status === 200 && cancelled.body.data.status === 'CANCELLED' && cancelled.body.payment.status === 'REFUNDED' && walletAfter.body.balance === 1050,
      `balance Rs.${walletAfter.body.balance}`);

    const scanCancelled = await post('/tickets/validate', { ticketId: ticketA.ticketNumber, method: 'QR' });
    assert('TC-M2-19', 'Conductor scanner rejects a cancelled ticket', scanCancelled.body.valid === false, scanCancelled.body.reason);

    // --- Scanner integration (Member 3) ---
    const ticketB = (await post('/ticketing/tickets', { ...booking, travelDate: hoursFromNow(0.25) })).body.data;
    await post(`/ticketing/tickets/${ticketB.id}/pay`, { method: 'CARD', card: VALID_CARD });
    const scan = await post('/tickets/validate', { ticketId: ticketB.ticketNumber, method: 'QR' });
    const afterScan = await request(`/ticketing/tickets/${ticketB.id}`);
    assert('TC-M2-20', 'Paid ticket QR passes conductor scan and becomes USED',
      scan.body.valid === true && afterScan.body.data.status === 'USED', `scan: ${scan.body.result}`);

    // --- DELETE ---
    const ticketC = (await post('/ticketing/tickets', booking)).body.data;
    await post(`/ticketing/tickets/${ticketC.id}/pay`, { method: 'CARD', card: VALID_CARD });
    const delActive = await del(`/ticketing/tickets/${ticketC.id}`);
    assert('TC-M2-21', 'Active ticket cannot be deleted', delActive.status === 409, delActive.body.error);

    const delUsed = await del(`/ticketing/tickets/${ticketB.id}`);
    const getDeleted = await request(`/ticketing/tickets/${ticketB.id}`);
    assert('TC-M2-22', 'Remove used ticket from history', delUsed.status === 200 && getDeleted.status === 404);

    const ticketD = (await post('/ticketing/tickets', booking)).body.data;
    const discard = await del(`/ticketing/tickets/${ticketD.id}`);
    assert('TC-M2-23', 'Discard unpaid booking', discard.status === 200, discard.body.message);

    // --- Payment history ---
    const payments = await request(`/ticketing/payments?passengerId=${passengerId}`);
    const receipt = await request(`/ticketing/payments/${paid.body.payment.id}`);
    assert('TC-M2-24', 'Payment history lists successful, failed and refunded payments',
      payments.status === 200 && payments.body.count >= 5 &&
      ['SUCCESS', 'FAILED', 'REFUNDED'].every((s) => payments.body.data.some((p: any) => p.status === s)),
      `${payments.body.count} payments`);
    assert('TC-M2-25', 'View payment receipt', receipt.status === 200 && receipt.body.ticket?.ticketNumber === ticketA.ticketNumber);
  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`TICKETING TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
  if (failed > 0) process.exit(1);
  process.exit(0);
}

run().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
