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

  test('should return null for non-existent user', async () => {
    const result = await User.findUserNoPopulate("nonexistent@test.com");
    expect(result).toBeNull();
  });

  test('should verify user has correct userType - Student', async () => {
    const result = await User.findUserNoPopulate("alice@student.edu");
    expect(result).toBeDefined();
    expect(result.userType).toBe(0); // Student
  });

  test('should verify user has correct userType - Professor', async () => {
    const result = await User.findUserNoPopulate("bob@faculty.edu");
    expect(result).toBeDefined();
    expect(result.userType).toBe(1); // Professor
  });

  test('should verify user has correct userType - Admin', async () => {
    const result = await User.findUserNoPopulate("carol@admin.edu");
    expect(result).toBeDefined();
    expect(result.userType).toBe(2); // Admin
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

  test('should contain a list of classes', async() => {
    const result = await Class.findClasses();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('total');
    expect(Array.isArray(result.users)).toBe(true);
    expect(result.total).toBeGreaterThan(0);
  });

  test('should return paginated classes with custom page size', async() => {
    const result = await Class.findClasses({}, 1, 3);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('total');
    expect(Array.isArray(result.users)).toBe(true);
    expect(result.users.length).toBeLessThanOrEqual(3);
  });

  test('should filter classes by name', async() => {
    const result = await Class.findClasses({ name: /Algorithms/i });
    expect(result).toBeDefined();
    expect(result).toHaveProperty('users');
    expect(Array.isArray(result.users)).toBe(true);
  });

  test('should return class with all properties', async() => {
    const result = await Class.findClass("6713a0000000000000000001");
    expect(result).toBeDefined();
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('credits');
    expect(result).toHaveProperty('Curiculum');
    expect(result.name).toBe("Algorithms");
  });

});

// ─────────────────────────────────────
//   CLASSROOMS
// ─────────────────────────────────────

describe('Read Tests - Classrooms', () => {

  test('should return a list of classrooms', async() => {
    const result = await Classroom.findClassroom();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  test('should return classrooms with specific building filter', async() => {
    const result = await Classroom.findClassroom({ building: 'Engineering' });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  test('should return empty array for non-existent building', async() => {
    const result = await Classroom.findClassroom({ building: 'NonExistent' });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test('should return all classrooms when no filter provided', async() => {
    const result = await Classroom.findClassroom({});
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

});

// ─────────────────────────────────────
//   COURSES
// ─────────────────────────────────────

describe('Read Tests - Courses', () => {

  test('should return a list of courses', async () => {
    const result = await Course.findCourses();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  test('should return courses with specific filter', async () => {
    const result = await Course.findCourses({ professorName: 'Dr. Smith' });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  test('should find a single course', async () => {
    const courses = await Course.findCourses();
    if (courses.length > 0) {
      const result = await Course.findCourse({ _id: courses[0]._id });
      expect(result).toBeDefined();
      expect(result._id).toEqual(courses[0]._id);
    }
  });

  test('should return false for non-existent course', async () => {
    const result = await Course.findCourse({ professorName: 'NonExistent' });
    expect(result).toBe(false);
  });

});

