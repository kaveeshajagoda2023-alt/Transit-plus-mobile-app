// Shared test setup: in-memory MongoDB + seeded routes + helpers
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.QR_SIGNING_SECRET = 'test-qr-secret';
process.env.PAYMENT_SUCCESS_RATE = '1'; // deterministic: only the 0002 test card fails

const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Route = require('../models/Route');
const { ROUTES } = require('../seed/seedData');

let mongo;

const startDb = async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Route.insertMany(ROUTES);
};

const stopDb = async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
};

let userCounter = 0;
const registerUser = async (overrides = {}) => {
  userCounter += 1;
  const body = {
    name: 'Test Passenger',
    email: `user${userCounter}-${Date.now()}@test.lk`,
    password: 'Password1',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(body);
  return { token: res.body.data.token, user: res.body.data.user, password: body.password };
};

const auth = (token) => ({ Authorization: `Bearer ${token}` });

const inMinutes = (m) => new Date(Date.now() + m * 60 * 1000).toISOString();

const getRoute = (code = '138') => Route.findOne({ code });

const createTicket = async (token, overrides = {}) => {
  const route = await getRoute();
  const res = await request(app)
    .post('/api/tickets')
    .set(auth(token))
    .send({ routeId: String(route._id), fromStop: 'Colombo Fort', toStop: 'Nugegoda', passengers: 1, travelDate: inMinutes(10), ...overrides });
  return res;
};

// Creates a ticket and pays for it with the always-approve test card
const buyTicket = async (token, overrides = {}) => {
  const created = await createTicket(token, overrides);
  const res = await request(app)
    .post('/api/payments/checkout')
    .set(auth(token))
    .send({ ticketId: created.body.data._id, method: 'CARD', card: { cardNumber: '4242424242424242', expiry: '12/30', cvv: '123' } });
  return res.body.data.ticket;
};

module.exports = { app, request, startDb, stopDb, registerUser, auth, inMinutes, getRoute, createTicket, buyTicket };
