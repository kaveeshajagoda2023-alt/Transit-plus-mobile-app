const seed = require('../seed/seed');
const Route = require('../models/Route');
const Ticket = require('../models/Ticket');
const { app, request, startDb, stopDb, auth } = require('./helpers');

beforeAll(startDb);
afterAll(stopDb);

test('seed is repeatable and the demo passenger can log in and see tickets', async () => {
  await seed({ log: () => {} });
  await seed({ log: () => {} }); // running twice must not duplicate data

  expect(await Route.countDocuments()).toBe(8);

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'passenger@transitpulse.lk', password: 'Passenger@123' });
  expect(login.status).toBe(200);

  const list = await request(app).get('/api/tickets').set(auth(login.body.data.token)).query({ limit: 50 });
  expect(list.body.data.total).toBe(5);
  expect(await Ticket.countDocuments({ status: 'ACTIVE' })).toBe(2);
});
