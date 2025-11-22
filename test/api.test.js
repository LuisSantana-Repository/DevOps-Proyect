const request = require('supertest');
const express = require('express');
const UserRoutes = require('../routes/UserRoutes');
const authRoute = require('../routes/authRoutes');
const ClassRoutes = require('../routes/ClassRoutes');
const CourseRoutes = require('../routes/CourseRoutes');
const ScheduleRoutes = require('../routes/ScheduleRoutes');
const ClassroomRoutes = require('../routes/ClassroomRoutes');
const cookieParser = require('cookie-parser');

// Create Express app for testing
const app = express();
app.use(cookieParser());
app.use(express.json());

// Setup routes
app.get('/', (req, res) => {
  res.send("hello");
});

app.use('/api/User', UserRoutes);
app.use('/api/login', authRoute);
app.use('/api/Class', ClassRoutes);
app.use('/api/Course', CourseRoutes);
app.use('/api/Schedule', ScheduleRoutes);
app.use('/api/Classroom', ClassroomRoutes);

// ─────────────────────────────────────
//   ROOT ENDPOINT
// ─────────────────────────────────────

describe('GET /', () => {
  test('should return hello message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('hello');
  });
});

// ─────────────────────────────────────
//   USER API ENDPOINTS
// ─────────────────────────────────────

describe('User API Endpoints', () => {

  test('GET /api/User should require authentication', async () => {
    const response = await request(app).get('/api/User');
    // Should return 401 Unauthorized without authentication cookie
    expect(response.status).toBe(401);
  });

  test('GET /api/User/:email should require authentication', async () => {
    const response = await request(app).get('/api/User/alice@student.edu');
    // Routes require authentication, expect 401 or 404
    expect([401, 404]).toContain(response.status);
  });

});

// ─────────────────────────────────────
//   CLASS API ENDPOINTS
// ─────────────────────────────────────

describe('Class API Endpoints', () => {

  test('GET /api/Class should require authentication', async () => {
    const response = await request(app).get('/api/Class');
    // Should return 401 Unauthorized without authentication cookie
    expect(response.status).toBe(401);
  });

  test('GET /api/Class/populate/:id should require authentication', async () => {
    const response = await request(app).get('/api/Class/populate/6713a0000000000000000001');
    // Routes require authentication, expect 401
    expect(response.status).toBe(401);
  });

});

// ─────────────────────────────────────
//   COURSE API ENDPOINTS
// ─────────────────────────────────────

describe('Course API Endpoints', () => {

  test('GET /api/Course should return courses list', async () => {
    const response = await request(app).get('/api/Course');
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

});

// ─────────────────────────────────────
//   CLASSROOM API ENDPOINTS
// ─────────────────────────────────────

describe('Classroom API Endpoints', () => {

  test('GET /api/Classroom should require authentication', async () => {
    const response = await request(app).get('/api/Classroom');
    // Should return 401 Unauthorized without authentication cookie
    expect(response.status).toBe(401);
  });

});

// ─────────────────────────────────────
//   SCHEDULE API ENDPOINTS
// ─────────────────────────────────────

describe('Schedule API Endpoints', () => {

  test('POST /api/Schedule should require authentication', async () => {
    const response = await request(app)
      .post('/api/Schedule')
      .send({ name: 'Test Schedule' });
    // Should return 401 Unauthorized without authentication cookie
    expect(response.status).toBe(401);
  });

});

// ─────────────────────────────────────
//   LOGIN API ENDPOINT
// ─────────────────────────────────────

describe('Login API Endpoints', () => {

  test('POST /api/login should handle login request', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'alice@student.edu',
        password: 'password123'
      });

    // Check if response is valid (either success or proper error)
    expect(response.status).toBeDefined();
    expect([200, 400, 401, 404]).toContain(response.status);
  });

  test('POST /api/login should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'invalid@test.com',
        password: 'wrongpassword'
      });

    expect([400, 401, 404]).toContain(response.status);
  });

});
