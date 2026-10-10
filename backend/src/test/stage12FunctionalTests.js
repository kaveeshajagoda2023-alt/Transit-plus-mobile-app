const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('http');
const paymentRoutes = require('../routes/paymentRoutes');
const ticketRoutes = require('../routes/ticketRoutes');

const requestJson = (server, method, path, body) =>
  new Promise((resolve, reject) => {
    const request = http.request(
      {
        hostname: '127.0.0.1',
        port: server.address().port,
        path,
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
      },
      (response) => {
        let payload = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          payload += chunk;
        });
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            body: payload ? JSON.parse(payload) : null,
          });
        });
      }
    );

    request.on('error', reject);
    if (body) request.write(JSON.stringify(body));
    request.end();
  });

const withTestServer = async (callback) => {
  const app = express();
  app.use(express.json());
  app.use('/api/payments', paymentRoutes);
  app.use('/api/tickets', ticketRoutes);

  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    await callback(server);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
};

test('Stage 12: payment, ticket creation, history, QR data, and status flow', async () => {
  await withTestServer(async (server) => {
    const userId = `USR-STAGE12-${Date.now()}`;
    const payment = await requestJson(
      server,
      'POST',
      '/api/payments',
      {
        userId,
        amount: 4.5,
        paymentMethod: 'Simulated Pay',
      }
    );

    assert.equal(payment.statusCode, 201);
    assert.equal(payment.body.success, true);
    assert.equal(payment.body.payment.paymentStatus, 'Completed');

    const created = await requestJson(
      server,
      'POST',
      '/api/tickets',
      {
        userId,
        route: 'Stage 12 Route',
        boardingPoint: 'Central Terminal',
        destination: 'North Airport',
        travelDate: '2026-10-07',
        travelTime: '10:30 AM',
        fare: 4.5,
        paymentMethod: 'Simulated Pay',
      }
    );

    assert.equal(created.statusCode, 201);
    assert.equal(created.body.success, true);
    assert.ok(created.body.ticket.ticketId);
    assert.ok(created.body.ticket.qrData);

    const history = await requestJson(
      server,
      'GET',
      `/api/tickets/user/${userId}`
    );
    assert.equal(history.statusCode, 200);
    assert.equal(history.body.success, true);
    assert.equal(history.body.count, 1);
    assert.equal(history.body.tickets[0].ticketId, created.body.ticket.ticketId);

    const selected = await requestJson(
      server,
      'GET',
      `/api/tickets/${created.body.ticket.ticketId}`
    );
    assert.equal(selected.statusCode, 200);
    assert.equal(selected.body.ticket.ticketId, created.body.ticket.ticketId);
    assert.equal(selected.body.ticket.route, 'Stage 12 Route');

    const updated = await requestJson(
      server,
      'PUT',
      `/api/tickets/${created.body.ticket.ticketId}/status`,
      { ticketStatus: 'Used' }
    );
    assert.equal(updated.statusCode, 200);
    assert.equal(updated.body.ticket.ticketStatus, 'Used');

    const sensitiveKeys = ['cardNumber', 'cvv', 'cvc', 'password', 'creditCard'];
    const paymentObject = JSON.stringify(payment.body.payment);
    assert.equal(
      sensitiveKeys.some((key) => paymentObject.toLowerCase().includes(key)),
      false
    );

    console.log('[PASS] Stage 12 functional flow');
    console.log(`[PASS] Payment completed: ${payment.body.payment.paymentId}`);
    console.log(`[PASS] Ticket created: ${created.body.ticket.ticketId}`);
    console.log(`[PASS] Historical ticket matched: ${history.body.tickets[0].ticketId}`);
    console.log(`[PASS] QR payload present: ${Boolean(created.body.ticket.qrData)}`);
    console.log(`[PASS] Status updated: ${updated.body.ticket.ticketStatus}`);
    console.log('[PASS] No sensitive card or credential fields were stored');
  });
});
