const {User} = require('../db/User');
const {Class} = require('../db/Class');
const {Classroom} = require('../db/Classroom');
const {Course} = require('../db/Course');
const {mongoose} = require('../db/connectdb');

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

// ─────────────────────────────────────
//   USERS
// ─────────────────────────────────────

describe('Read Tests - Users', () => {

  test('should read user data correctly - Alice Student', async () => {
    const result = await User.findUserNoPopulate("alice@student.edu");
    expect(result).toBeDefined();
    expect(result.name).toBe("Alice Student");
    expect(result.email).toBe("alice@student.edu");
  });

  test('should read user data correctly - Bob Professor', async () => {
    const result = await User.findUserNoPopulate("bob@faculty.edu");
    expect(result).toBeDefined();
    expect(result.name).toBe("Bob Professor");
    expect(result.email).toBe("bob@faculty.edu");
  });

  test('should read user data correctly - Carol Admin', async () => {
    const result = await User.findUserNoPopulate("carol@admin.edu");
    expect(result).toBeDefined();
    expect(result.name).toBe("Carol Admin");
    expect(result.email).toBe("carol@admin.edu");
  });

});

// ─────────────────────────────────────
//   CLASSES
// ─────────────────────────────────────

describe('Read Tests - Classes', () => {

  test('should read a specific class', async() => {
    const result = await Class.findClass("6713a0000000000000000001");
    expect(result).toBeDefined();
    expect(result.name).toBe("Algorithms");
  });

  test('should contain a list of classes based on the requirements', async() => {
    const result = await Class.findCLasesNotInUser("6713a0000000000000000001");
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  test('should contain a list of classes ', async() => {
    const result = await Class.findClasses();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('total');
    expect(Array.isArray(result.users)).toBe(true);
    expect(result.total).toBeGreaterThan(0);
  });

});

// ─────────────────────────────────────
//   CLASSROOMS
// ─────────────────────────────────────

describe('Read Tests - Classrooms', () => {

  test('should return a list of classrooms ', async() => {
  const result = await Classroom.findClassroom();
  expect(result).toBeDefined();
  });

});

// ─────────────────────────────────────
//   COURSES
// ─────────────────────────────────────

describe('Read Tests - Courses', () => {

  test('should return a list of courses ', async () => {
  const result = await Course.findCourse();
  expect(result).toBeDefined();
  });

});

