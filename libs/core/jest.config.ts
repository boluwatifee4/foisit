export default {
  displayName: 'core',
  preset: 'ts-jest',
  testEnvironment: 'node', // For framework-agnostic testing
  setupFilesAfterEnv: [],
  coverageDirectory: '../../coverage/libs/core',
  transform: {
    '^.+\\.(ts|js)$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
};
