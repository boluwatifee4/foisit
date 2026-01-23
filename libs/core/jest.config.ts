export default {
  displayName: 'core',
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Use jsdom for DOM-dependent tests
  setupFilesAfterEnv: [],
  coverageDirectory: '../../coverage/libs/core',
  transform: {
    '^.+\\.(ts|js)$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
};
