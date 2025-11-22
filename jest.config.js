module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'cobertura', 'lcov', 'html', 'json'],
  
  // Collect coverage from these files
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/test-results/**',
    '!jest.config.js',
    '!**/*.test.js',
    '!**/__tests__/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
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
