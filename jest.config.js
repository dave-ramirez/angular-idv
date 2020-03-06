// https://github.com/thymikee/jest-preset-angular#brief-explanation-of-config
module.exports = {
  verbose: true,
  preset: "jest-preset-angular",
  collectCoverage: true,
  coverageDirectory: "dist/test-coverage",
  setupFilesAfterEnv: [
    '<rootDir>/setup-jest.ts',
  ],
  coveragePathIgnorePatterns: [
    "setup-jest.ts",
    "public_api.ts",
    ".module.ts",
    ".interface.ts",
    ".utils.ts",
    ".story.ts"
  ],
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 85,
      functions: 75,
      lines: 80
    }
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-test))'
  ],
  testPathIgnorePatterns: [
    "<rootDir>/dist/",
    "<rootDir>/node_modules/",
  ],
};
