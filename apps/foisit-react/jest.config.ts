export default {
  displayName: 'foisit-react',
  preset: '../../jest.preset.js',
  moduleNameMapper: {
    '^./app$': '<rootDir>/src/app/__mocks__/app.tsx',
  },
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/foisit-react',
};
