const { app, request, startDb, stopDb, registerUser, auth } = require('./helpers');

beforeAll(startDb);
afterAll(stopDb);

describe('Auth & profile', () => {
  test('registers a passenger and never returns the password hash', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Amaya Jayasinghe', email: 'amaya@test.lk', password: 'Secret123', passengerType: 'student',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.passengerType).toBe('student');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  test('rejects a duplicate email with 409', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Amaya Again', email: 'AMAYA@test.lk', password: 'Secret123',
    });
    expect(res.status).toBe(409);
  });

  test('returns field errors for invalid input', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'A', email: 'nope', password: 'short' });
    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'password']));
  });

  test('logs in with correct credentials and rejects a wrong password', async () => {
    const good = await request(app).post('/api/auth/login').send({ email: 'amaya@test.lk', password: 'Secret123' });
    expect(good.status).toBe(200);
    expect(good.body.data.token).toBeTruthy();

    const bad = await request(app).post('/api/auth/login').send({ email: 'amaya@test.lk', password: 'Wrong1234' });
    expect(bad.status).toBe(401);
  });

  test('protects /api/users/me', async () => {
    expect((await request(app).get('/api/users/me')).status).toBe(401);
    expect((await request(app).get('/api/users/me').set(auth('not-a-jwt'))).status).toBe(401);
  });

  test('reads and updates the profile', async () => {
    const { token } = await registerUser();
    const me = await request(app).get('/api/users/me').set(auth(token));
    expect(me.status).toBe(200);
    expect(me.body.data.stats).toEqual({ activeTickets: 0, completedTrips: 0, savedMethods: 0 });

    const upd = await request(app).put('/api/users/me').set(auth(token)).send({ name: 'New Name', passengerType: 'senior' });
    expect(upd.status).toBe(200);
    expect(upd.body.data.user.name).toBe('New Name');
    expect(upd.body.data.user.passengerType).toBe('senior');

    const invalid = await request(app).put('/api/users/me').set(auth(token)).send({ passengerType: 'vip' });
    expect(invalid.status).toBe(400);
  });

  test('deletes the account only with the right password', async () => {
    const { token, password } = await registerUser();
    const wrong = await request(app).delete('/api/users/me').set(auth(token)).send({ password: 'Wrong1234' });
    expect(wrong.status).toBe(401);

    const ok = await request(app).delete('/api/users/me').set(auth(token)).send({ password });
    expect(ok.status).toBe(200);
    expect((await request(app).get('/api/users/me').set(auth(token))).status).toBe(401);
  });
});
