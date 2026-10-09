const mongoose = require('mongoose');
const { app, request, startDb, stopDb, registerUser, auth, createTicket } = require('./helpers');

beforeAll(startDb);
afterAll(stopDb);

const GOOD_CARD = { cardNumber: '4242 4242 4242 4242', expiry: '12/30', cvv: '123', holderName: 'K PERERA' };
const DECLINE_CARD = { cardNumber: '4000 0000 0000 0002', expiry: '12/30', cvv: '123' };

describe('Checkout', () => {
  let token;
  beforeAll(async () => {
    ({ token } = await registerUser());
  });

  const pay = (ticketId, body) =>
    request(app).post('/api/payments/checkout').set(auth(token)).send({ ticketId, ...body });

  test('successful card payment activates the ticket and issues a receipt', async () => {
    const ticket = (await createTicket(token)).body.data;
    const res = await pay(ticket._id, { method: 'CARD', card: GOOD_CARD, saveCard: true });
    expect(res.status).toBe(201);
    expect(res.body.data.payment.status).toBe('SUCCESS');
    expect(res.body.data.payment.receiptNumber).toMatch(/^RCPT-/);
    expect(res.body.data.payment.cardLast4).toBe('4242');
    expect(res.body.data.ticket.status).toBe('ACTIVE');
    expect(res.body.data.savedMethod.last4).toBe('4242');

    const receipt = await request(app).get(`/api/payments/${res.body.data.payment._id}`).set(auth(token));
    expect(receipt.status).toBe(200);
    expect(receipt.body.data.ticket.ticketNumber).toBe(ticket.ticketNumber);

    // paying the same ticket again is rejected
    expect((await pay(ticket._id, { method: 'WALLET' })).status).toBe(409);
  });

  test('test card ending 0002 is declined and the ticket stays unpaid', async () => {
    const ticket = (await createTicket(token)).body.data;
    const res = await pay(ticket._id, { method: 'CARD', card: DECLINE_CARD });
    expect(res.status).toBe(402);
    expect(res.body.success).toBe(false);
    expect(res.body.data.payment.status).toBe('FAILED');
    expect(res.body.data.ticket.status).toBe('PENDING_PAYMENT');

    // the passenger can retry with another method
    const retry = await pay(ticket._id, { method: 'WALLET' });
    expect(retry.status).toBe(201);
  });

  test('invalid card details return field errors (Luhn, expiry, CVV)', async () => {
    const ticket = (await createTicket(token)).body.data;
    const res = await pay(ticket._id, { method: 'CARD', card: { cardNumber: '4242 4242 4242 4241', expiry: '01/20', cvv: '12' } });
    expect(res.status).toBe(400); // cvv fails the route validator first
    const res2 = await pay(ticket._id, { method: 'CARD', card: { cardNumber: '4242 4242 4242 4241', expiry: '01/20', cvv: '123' } });
    expect(res2.status).toBe(422);
    expect(res2.body.errors.map((e) => e.field)).toEqual(['cardNumber', 'expiry']);
  });

  test('cash on board activates the ticket with a pending payment', async () => {
    const ticket = (await createTicket(token)).body.data;
    const res = await pay(ticket._id, { method: 'CASH_ON_BOARD' });
    expect(res.status).toBe(201);
    expect(res.body.data.payment.status).toBe('PENDING');
    expect(res.body.data.ticket.status).toBe('ACTIVE');
  });

  test('payment history lists my payments', async () => {
    const res = await request(app).get('/api/payments').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBeGreaterThanOrEqual(4);
  });

  test('full card numbers and CVVs are never stored', async () => {
    const collections = ['payments', 'savedpaymentmethods'];
    for (const name of collections) {
      const docs = await mongoose.connection.collection(name).find().toArray();
      const raw = JSON.stringify(docs);
      expect(raw).not.toContain('4242424242424242');
      expect(raw).not.toContain('cvv');
    }
  });
});

describe('Saved payment methods', () => {
  test('add, update, set default and delete', async () => {
    const { token } = await registerUser();
    const add = (card) => request(app).post('/api/payments/methods').set(auth(token)).send(card);

    const first = await add(GOOD_CARD);
    expect(first.status).toBe(201);
    expect(first.body.data.isDefault).toBe(true);
    expect(first.body.data.cardNumber).toBeUndefined();

    const second = await add({ cardNumber: '5555 5555 5555 4444', expiry: '10/29', cvv: '321' });
    expect(second.body.data.brand).toBe('MASTERCARD');
    expect(second.body.data.isDefault).toBe(false);

    const upd = await request(app).put(`/api/payments/methods/${second.body.data._id}`).set(auth(token)).send({ holderName: 'NEW NAME' });
    expect(upd.body.data.holderName).toBe('NEW NAME');

    const def = await request(app).put(`/api/payments/methods/${second.body.data._id}/default`).set(auth(token));
    expect(def.status).toBe(200);
    let list = await request(app).get('/api/payments/methods').set(auth(token));
    expect(list.body.data[0]._id).toBe(second.body.data._id);
    expect(list.body.data.filter((m) => m.isDefault).length).toBe(1);

    const del = await request(app).delete(`/api/payments/methods/${second.body.data._id}`).set(auth(token));
    expect(del.status).toBe(200);
    list = await request(app).get('/api/payments/methods').set(auth(token));
    expect(list.body.data.length).toBe(1);
    expect(list.body.data[0].isDefault).toBe(true);

    expect((await add({ cardNumber: '1234 5678 9012 3456', expiry: '12/30', cvv: '123' })).status).toBe(422);
  });
});
