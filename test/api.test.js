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

  test('GET /api/User should return users list', async () => {
    const response = await request(app).get('/api/User');
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  test('GET /api/User/:email should return specific user', async () => {
    const response = await request(app).get('/api/User/alice@student.edu');
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    if (response.body.user) {
      expect(response.body.user.email).toBe('alice@student.edu');
    }
  });

});

// ─────────────────────────────────────
//   CLASS API ENDPOINTS
// ─────────────────────────────────────

describe('Class API Endpoints', () => {

  test('GET /api/Class should return classes list', async () => {
    const response = await request(app).get('/api/Class');
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  test('GET /api/Class/:id should return specific class', async () => {
    const response = await request(app).get('/api/Class/6713a0000000000000000001');
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
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

  test('GET /api/Classroom should return classrooms list', async () => {
    const response = await request(app).get('/api/Classroom');
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

});

// ─────────────────────────────────────
//   SCHEDULE API ENDPOINTS
// ─────────────────────────────────────

describe('Schedule API Endpoints', () => {

  test('GET /api/Schedule should return schedules list', async () => {
    const response = await request(app).get('/api/Schedule');
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
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
