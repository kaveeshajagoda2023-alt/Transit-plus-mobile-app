// Seeds routes, demo users and a few demo tickets.
// Run with: npm run seed   (uses MONGODB_URI from .env)
// Only touches Member 2 data: routes are upserted by code and only the demo
// accounts' tickets/payments are replaced, so other members' data is safe.
const mongoose = require('mongoose');
const Route = require('../models/Route');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Payment = require('../models/Payment');
const SavedPaymentMethod = require('../models/SavedPaymentMethod');
const ScanLog = require('../models/ScanLog');
const { ROUTES, USERS } = require('./seedData');
const { calculateFare } = require('../utils/fare');
const { validityWindow } = require('../utils/ticketRules');
const { ticketNumber, transactionRef, receiptNumber } = require('../utils/ids');

const HOUR = 60 * 60 * 1000;

const seed = async ({ log = console.log } = {}) => {
  // The first version of this module stored tickets/payments with a different shape and
  // unique indexes (ticketId, paymentId) that would block new documents. Remove both.
  const legacyTickets = await Ticket.collection.deleteMany({ ticketId: { $exists: true } });
  const legacyPayments = await Payment.collection.deleteMany({ paymentId: { $exists: true } });
  if (legacyTickets.deletedCount || legacyPayments.deletedCount) {
    log(`[Seed] Removed ${legacyTickets.deletedCount} legacy tickets and ${legacyPayments.deletedCount} legacy payments`);
  }
  await Promise.all([Ticket, Payment, Route, User, SavedPaymentMethod, ScanLog].map((m) => m.syncIndexes()));

  for (const r of ROUTES) {
    await Route.updateOne({ code: r.code }, { $set: { ...r, isActive: true } }, { upsert: true });
  }
  log(`[Seed] ${ROUTES.length} routes ready`);

  const users = {};
  for (const u of USERS) {
    const { password, ...profile } = u;
    users[u.email] = await User.findOneAndUpdate(
      { email: u.email },
      { $set: { ...profile, passwordHash: await User.hashPassword(password) } },
      { upsert: true, new: true }
    );
  }
  log(`[Seed] ${USERS.length} demo users ready`);

  // Reset the demo passenger's history
  const passenger = users['passenger@transitpulse.lk'];
  const demoUserIds = Object.values(users).map((u) => u._id);
  const demoTicketIds = await Ticket.find({ user: { $in: demoUserIds } }).distinct('_id');
  await Promise.all([
    Ticket.deleteMany({ user: { $in: demoUserIds } }),
    Payment.deleteMany({ user: { $in: demoUserIds } }),
    SavedPaymentMethod.deleteMany({ user: { $in: demoUserIds } }),
    ScanLog.deleteMany({ $or: [{ scannedBy: { $in: demoUserIds } }, { ticket: { $in: demoTicketIds } }] }),
  ]);

  await SavedPaymentMethod.create({
    user: passenger._id, brand: 'VISA', last4: '4242', expiry: '12/30', holderName: 'K PERERA', isDefault: true,
  });

  const route138 = await Route.findOne({ code: '138' });
  const route100 = await Route.findOne({ code: '100' });
  const now = Date.now();

  const makeTicket = async ({ route, from, to, travelDate, status, passengers = 1, extra = {} }) => {
    const fare = calculateFare(route, from, to, 'adult', passengers);
    const ticket = await Ticket.create({
      ticketNumber: ticketNumber(travelDate),
      user: passenger._id,
      route: route._id,
      fromStop: fare.from,
      toStop: fare.to,
      passengerType: 'adult',
      passengers,
      unitFare: fare.unitFare,
      totalFare: fare.totalFare,
      travelDate,
      ...validityWindow(travelDate),
      status,
      ...extra,
    });
    const payment = await Payment.create({
      ticket: ticket._id,
      user: passenger._id,
      amount: fare.totalFare,
      method: 'CARD',
      cardBrand: 'VISA',
      cardLast4: '4242',
      status: status === 'REFUNDED' ? 'REFUNDED' : 'SUCCESS',
      refundAmount: extra.refundAmount || 0,
      transactionRef: transactionRef(),
      receiptNumber: receiptNumber(),
    });
    ticket.payment = payment._id;
    await ticket.save();
    return ticket;
  };

  await makeTicket({ route: route138, from: 'Colombo Fort', to: 'Nugegoda', travelDate: new Date(now + 20 * 60 * 1000), status: 'ACTIVE' });
  await makeTicket({ route: route100, from: 'Pettah', to: 'Mount Lavinia', travelDate: new Date(now + 26 * HOUR), status: 'ACTIVE', passengers: 2 });
  await makeTicket({
    route: route138, from: 'Nugegoda', to: 'Homagama', travelDate: new Date(now - 24 * HOUR), status: 'USED',
    extra: { usedAt: new Date(now - 24 * HOUR + 5 * 60 * 1000) },
  });
  await makeTicket({ route: route100, from: 'Wellawatte', to: 'Panadura', travelDate: new Date(now - 72 * HOUR), status: 'EXPIRED' });
  const refunded = await makeTicket({
    route: route138, from: 'Pettah', to: 'Maharagama', travelDate: new Date(now + 48 * HOUR), status: 'REFUNDED',
    extra: { cancelledAt: new Date(now - 2 * HOUR), refundAmount: 0 },
  });
  refunded.refundAmount = refunded.totalFare;
  await refunded.save();
  await Payment.updateOne({ _id: refunded.payment }, { refundAmount: refunded.totalFare, refundedAt: new Date(now - 2 * HOUR) });

  log('[Seed] Demo tickets created for passenger@transitpulse.lk');
};

if (require.main === module) {
  require('dotenv').config();
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transitpulse';
  // Same public DNS workaround as config/db.js for Atlas SRV lookups on some networks
  require('dns').setServers(['8.8.8.8', '1.1.1.1']);
  mongoose
    .connect(uri)
    .then(() => seed())
    .then(() => {
      console.log('[Seed] Done');
      return mongoose.disconnect();
    })
    .catch((err) => {
      console.error('[Seed] Failed:', err.message);
      process.exit(1);
    });
}

module.exports = seed;
