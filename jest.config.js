const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  testRunner: "jest-jasmine2",
  transform: {
    ...tsJestTransformCfg,
  },
  // Enable coverage
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html", "json"],
  setupFilesAfterEnv: ["jest-allure/dist/setup"],

  // Reports for CI/CD
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "reports",
        outputName: "junit.xml",
      },
    ],
  ],
};
