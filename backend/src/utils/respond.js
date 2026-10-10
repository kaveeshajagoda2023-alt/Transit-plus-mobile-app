// Consistent JSON envelope: { success, message, data }
const ok = (res, data = null, message = 'OK', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data, message = 'Created') => ok(res, data, message, 201);

module.exports = { ok, created };
