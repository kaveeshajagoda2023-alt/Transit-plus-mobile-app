const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('http');
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
        response.on('data', (chunk) => (payload += chunk));
        response.on('end', () =>
          resolve({
            statusCode: response.statusCode,
            body: payload ? JSON.parse(payload) : null,
          })
        );
      }
    );
    request.on('error', reject);
    if (body) request.write(JSON.stringify(body));
    request.end();
  });

const withTestServer = async (callback) => {
  const app = express();
  app.use(express.json());
  app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'TransitPulse API is running' });
  });
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

test('Member 2 API health, QR validation, and cancellation contract', async () => {
  await withTestServer(async (server) => {
    const health = await requestJson(server, 'GET', '/api/health');
    assert.equal(health.statusCode, 200);
    assert.equal(health.body.success, true);

    const created = await requestJson(server, 'POST', '/api/tickets', {
      userId: 'USR-TEST-001',
      route: 'Colombo Fort to Kandy',
      boardingPoint: 'Colombo Fort',
      destination: 'Kandy',
      travelDate: '2026-10-08',
      travelTime: '10:30 AM',
      fare: 50,
      paymentMethod: 'Simulated Pay',
    });
    assert.equal(created.statusCode, 201);
    const ticketId = created.body.ticket.ticketId;

    const validQr = await requestJson(server, 'POST', '/api/tickets/validate-qr', {
      ticketId,
    });
    assert.equal(validQr.statusCode, 200);
    assert.equal(validQr.body.status, 'VALID');

    const cancelled = await requestJson(
      server,
      'PUT',
      `/api/tickets/${ticketId}/status`,
      { ticketStatus: 'Cancelled' }
    );
    assert.equal(cancelled.statusCode, 200);
    assert.equal(cancelled.body.ticket.ticketStatus, 'Cancelled');

    const invalidQr = await requestJson(server, 'POST', '/api/tickets/validate-qr', {
      ticketId: 'NOT-A-TICKET',
    });
    assert.equal(invalidQr.statusCode, 404);
    assert.equal(invalidQr.body.status, 'INVALID');
  });
});
