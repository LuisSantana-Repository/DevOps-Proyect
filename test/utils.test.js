const {User} = require('../db/User'); 
const {Class} = require('../db/Class'); 
const {Classroom} = require('../db/Classroom'); 
const {Course} = require('../db/Course'); 

// ─────────────────────────────────────
//   USERS
// ─────────────────────────────────────

describe('Read Tests - Users', () => {

  test('should read user data correctly', async () => {
    const result = await User.findUserNoPopulate("alice@student.edu");
    expect(result).toEqual({ name: "Alice"});
  });

  test('should read user data correctly', async () => {
    const result = await User.findUserNoPopulate("bob@faculty.edu");
    expect(result).toEqual({ name: "Bob Professor"});
  });

  test('should read user data correctly', async () => {
    const result = await User.findUserNoPopulate("carol@admin.edu");
    expect(result).toEqual({ name: "Carol Admin"});
  });

});

// ─────────────────────────────────────
//   CLASSES
// ─────────────────────────────────────

describe('Read Tests - Classes', () => {

  test('should read a specific class', async() => {
    const result = await Class.findClass("6713a0000000000000000001");
    expect(result).toEqual({ name: "Algorithms"});
  });

  test('should contain a list of classes based on the requirements', async() => {
  const result = await Class.findCLasesNotInUser("6713a0000000000000000001");
  expect(result).toBeDefined();
  });

  test('should contain a list of classes ', async() => {
  const result = await Class.findClasses();
  expect(result).toBeDefined();
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

