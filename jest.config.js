module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
};