const { app, request, startDb, stopDb, registerUser, auth, inMinutes, getRoute, createTicket, buyTicket } = require('./helpers');

beforeAll(startDb);
afterAll(stopDb);

describe('Routes & fares', () => {
  test('lists seeded routes and calculates a discounted fare', async () => {
    const list = await request(app).get('/api/routes');
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBe(8);

    const route = await getRoute('138');
    // Colombo Fort -> Nugegoda = 5 stops = 30 + 4*12 = 78 adult; student = 39
    const fare = await request(app)
      .get(`/api/routes/${route._id}/fare`)
      .query({ from: 'Colombo Fort', to: 'Nugegoda', type: 'student', passengers: 2 });
    expect(fare.status).toBe(200);
    expect(fare.body.data.adultFare).toBe(78);
    expect(fare.body.data.unitFare).toBe(39);
    expect(fare.body.data.totalFare).toBe(78);
  });
});

describe('Tickets', () => {
  let token;
  beforeAll(async () => {
    ({ token } = await registerUser());
  });

  test('creates a PENDING_PAYMENT ticket with a TP-YYYYMMDD-XXXX number', async () => {
    const res = await createTicket(token, { passengers: 2 });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('PENDING_PAYMENT');
    expect(res.body.data.ticketNumber).toMatch(/^TP-\d{8}-[A-Z0-9]{4}$/);
    expect(res.body.data.totalFare).toBe(156);
    expect(res.body.data.actions.canPay).toBe(true);
  });

  test('rejects invalid stops, same stops and past dates', async () => {
    expect((await createTicket(token, { toStop: 'Jaffna' })).status).toBe(400);
    expect((await createTicket(token, { toStop: 'Colombo Fort' })).status).toBe(400);
    expect((await createTicket(token, { travelDate: inMinutes(-24 * 60) })).status).toBe(400);
    expect((await createTicket(token, { routeId: 'abc' })).status).toBe(400);
  });

  test('another user cannot read my ticket', async () => {
    const mine = await createTicket(token);
    const other = await registerUser();
    const res = await request(app).get(`/api/tickets/${mine.body.data._id}`).set(auth(other.token));
    expect(res.status).toBe(404);
  });

  test('edits passengers before payment but not after', async () => {
    const pending = await createTicket(token);
    const upd = await request(app).put(`/api/tickets/${pending.body.data._id}`).set(auth(token)).send({ passengers: 3 });
    expect(upd.status).toBe(200);
    expect(upd.body.data.passengers).toBe(3);
    expect(upd.body.data.totalFare).toBe(234);

    const active = await buyTicket(token);
    const blocked = await request(app).put(`/api/tickets/${active._id}`).set(auth(token)).send({ passengers: 2 });
    expect(blocked.status).toBe(409);

    const moved = await request(app).put(`/api/tickets/${active._id}`).set(auth(token)).send({ travelDate: inMinutes(120) });
    expect(moved.status).toBe(200);
    expect(moved.body.data.qrVersion).toBe(active.qrVersion + 1);
  });

  test('cancellation refunds 100% when more than 2h before validity starts', async () => {
    const t = await buyTicket(token, { travelDate: inMinutes(5 * 60) });
    const res = await request(app).post(`/api/tickets/${t._id}/cancel`).set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('REFUNDED');
    expect(res.body.data.refundAmount).toBe(t.totalFare);
    expect(res.body.data.payment.status).toBe('REFUNDED');
  });

  test('cancellation refunds 50% when less than 2h before validity starts', async () => {
    const t = await buyTicket(token, { travelDate: inMinutes(60) });
    const res = await request(app).post(`/api/tickets/${t._id}/cancel`).set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.refundAmount).toBe(Math.round(t.totalFare / 2));
  });

  test('cancellation after the window starts refunds nothing', async () => {
    const t = await buyTicket(token, { travelDate: inMinutes(5) });
    const res = await request(app).post(`/api/tickets/${t._id}/cancel`).set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
    expect(res.body.data.refundAmount).toBe(0);
  });

  test('cannot cancel twice, and only terminal tickets can be hidden', async () => {
    const t = await buyTicket(token);
    expect((await request(app).delete(`/api/tickets/${t._id}`).set(auth(token))).status).toBe(409);

    await request(app).post(`/api/tickets/${t._id}/cancel`).set(auth(token));
    expect((await request(app).post(`/api/tickets/${t._id}/cancel`).set(auth(token))).status).toBe(409);

    const hide = await request(app).delete(`/api/tickets/${t._id}`).set(auth(token));
    expect(hide.status).toBe(200);
    const list = await request(app).get('/api/tickets').set(auth(token)).query({ limit: 50 });
    expect(list.body.data.items.find((i) => i._id === t._id)).toBeUndefined();
  });

  test('filters, searches and paginates history', async () => {
    const { token: fresh } = await registerUser();
    await buyTicket(fresh);
    await buyTicket(fresh);
    await createTicket(fresh);

    const active = await request(app).get('/api/tickets').set(auth(fresh)).query({ status: 'ACTIVE' });
    expect(active.body.data.total).toBe(2);

    const page = await request(app).get('/api/tickets').set(auth(fresh)).query({ limit: 2, page: 2 });
    expect(page.body.data.items.length).toBe(1);
    expect(page.body.data.totalPages).toBe(2);

    const search = await request(app).get('/api/tickets').set(auth(fresh)).query({ search: 'nugegoda' });
    expect(search.body.data.total).toBe(3);

    const bad = await request(app).get('/api/tickets').set(auth(fresh)).query({ status: 'LOST' });
    expect(bad.status).toBe(400);
  });

  test('rebooks a trip as a new pending ticket', async () => {
    const t = await buyTicket(token);
    const res = await request(app).post(`/api/tickets/${t._id}/rebook`).set(auth(token)).send({ travelDate: inMinutes(90) });
    expect(res.status).toBe(201);
    expect(res.body.data._id).not.toBe(t._id);
    expect(res.body.data.status).toBe('PENDING_PAYMENT');
    expect(res.body.data.fromStop).toBe(t.fromStop);
  });
});
