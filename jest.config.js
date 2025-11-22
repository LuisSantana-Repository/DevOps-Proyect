module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'cobertura', 'lcov', 'html', 'json', 'json-summary'],
  
  // Collect coverage from these files
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/test-results/**',
    '!**/public/**',        // Exclude frontend JavaScript
    '!**/scripts/**',       // Exclude shell scripts helper files
    '!**/seed/**',          // Exclude seed data scripts
    '!jest.config.js',
    '!**/*.test.js',
    '!**/__tests__/**',
    '!test/db.js',          // Exclude test database connection file
    '!server.js'            // Exclude server entry point (tested via API tests)
  ],

  // Coverage thresholds - Adjusted for integration tests
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 40,
      statements: 40
    }
  },
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js',
    '**/*.spec.js'
  ],
  
  // Reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'jest-junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ],
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true
};
