const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const test = require('node:test');
const jwt = require('jsonwebtoken');
const { app } = require('../server');
const { verifyToken } = require('../middleware/authMiddleware');

let server;
let baseUrl;

test.before(async () => {
    server = createServer(app);
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
    if (server) {
        server.closeAllConnections();
        await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
});

test('health endpoint responds without a database connection', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true, message: 'API đang hoạt động.' });
});

test('serves the frontend from the backend origin', async () => {
    const response = await fetch(baseUrl);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Chia Sẻ Học Liệu/);
});

test('requires a bearer token for protected API routes', async () => {
    const response = await fetch(`${baseUrl}/api/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: 1, type: 'VIEW' })
    });
    assert.equal(response.status, 401);
});

test('verifies bearer tokens and attaches the authenticated user id', () => {
    const originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-secret-long-enough-for-local-unit-tests';
    const token = jwt.sign({}, process.env.JWT_SECRET, { subject: '42' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {
        statusCode: 200,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
    let nextCalled = false;

    try {
        verifyToken(req, res, () => {
            nextCalled = true;
        });
        assert.equal(nextCalled, true);
        assert.deepEqual(req.user, { id: 42 });
    } finally {
        if (originalSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = originalSecret;
    }
});
