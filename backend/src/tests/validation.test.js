const Ticket = require('../models/Ticket');
const { createQrToken } = require('../utils/qrToken');
const { app, request, startDb, stopDb, registerUser, auth, inMinutes, buyTicket, createTicket } = require('./helpers');

beforeAll(startDb);
afterAll(stopDb);

describe('Dynamic QR + validation', () => {
  let passenger;
  let conductor;
  beforeAll(async () => {
    passenger = await registerUser();
    conductor = await registerUser({ name: 'Conductor' });
  });

  const getQr = (ticketId) => request(app).get(`/api/tickets/${ticketId}/qr`).set(auth(passenger.token));
  const scan = (token) => request(app).post('/api/validation/scan').set(auth(conductor.token)).send({ token });

  test('issues a QR token that expires in 30 seconds', async () => {
    const t = await buyTicket(passenger.token);
    const res = await getQr(t._id);
    expect(res.status).toBe(200);
    expect(res.body.data.token).toMatch(/^TP1\./);
    expect(res.body.data.expiresAt - res.body.data.issuedAt).toBe(30000);
  });

  test('no QR for an unpaid ticket', async () => {
    const pending = (await createTicket(passenger.token)).body.data;
    expect((await getQr(pending._id)).status).toBe(409);
  });

  test('valid scan marks the ticket USED, and reusing the same QR is rejected', async () => {
    const t = await buyTicket(passenger.token);
    const { token } = (await getQr(t._id)).body.data;

    const first = await scan(token);
    expect(first.status).toBe(200);
    expect(first.body.data.result).toBe('VALID');
    expect(first.body.data.ticket.status).toBe('USED');

    const again = await scan(token);
    expect(again.body.data.result).toBe('ALREADY_USED');
    expect(again.body.success).toBe(false);
  });

  test('an expired QR (e.g. a screenshot) is rejected', async () => {
    const t = await buyTicket(passenger.token);
    const doc = await Ticket.findById(t._id);
    const old = createQrToken(doc, Date.now() - 60 * 1000);
    const res = await scan(old.token);
    expect(res.body.data.result).toBe('EXPIRED');
    expect(res.body.data.reason).toBe('QR_EXPIRED');
  });

  test('a tampered QR is rejected', async () => {
    const t = await buyTicket(passenger.token);
    const { token } = (await getQr(t._id)).body.data;
    const [prefix, body, sig] = token.split('.');
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    payload.expiresAt += 24 * 60 * 60 * 1000; // try to extend the lifetime
    const forged = `${prefix}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.${sig}`;

    const res = await scan(forged);
    expect(res.body.data.result).toBe('INVALID');
    expect(res.body.data.reason).toBe('BAD_SIGNATURE');

    expect((await scan('hello world')).body.data.reason).toBe('MALFORMED');
  });

  test('rotating the QR invalidates the previous one', async () => {
    const t = await buyTicket(passenger.token);
    const oldToken = (await getQr(t._id)).body.data.token;
    const rotated = await request(app).post(`/api/tickets/${t._id}/qr/rotate`).set(auth(passenger.token));
    expect(rotated.status).toBe(200);

    expect((await scan(oldToken)).body.data.reason).toBe('QR_REPLACED');
    expect((await scan(rotated.body.data.token)).body.data.result).toBe('VALID');
  });

  test('cancelled and not-yet-valid tickets are rejected', async () => {
    const later = await buyTicket(passenger.token, { travelDate: inMinutes(5 * 60) });
    const laterQr = (await getQr(later._id)).body.data.token;
    expect((await scan(laterQr)).body.data.reason).toBe('NOT_YET_VALID');

    await request(app).post(`/api/tickets/${later._id}/cancel`).set(auth(passenger.token));
    expect((await scan(laterQr)).body.data.reason).toBe('TICKET_CANCELLED');
  });

  test('every scan is logged and the log can be read', async () => {
    const res = await request(app).get('/api/validation/logs').set(auth(conductor.token));
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBeGreaterThanOrEqual(8);
    expect(res.body.data.items[0]).toHaveProperty('message');

    // logs are per scanner
    const other = await request(app).get('/api/validation/logs').set(auth(passenger.token));
    expect(other.body.data.total).toBe(0);
  });

  test('missing token is a 400', async () => {
    const res = await request(app).post('/api/validation/scan').set(auth(conductor.token)).send({});
    expect(res.status).toBe(400);
  });
});
