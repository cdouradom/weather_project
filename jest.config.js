// jest.config.js
export default {
  testEnvironment: "jsdom", // garante document e window
  testMatch: ["**/tests/**/*.test.js"], // pega todos os arquivos de teste
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.js$": ["babel-jest", { configFile: "./babel.config.js" }]
  },
  verbose: true
};
