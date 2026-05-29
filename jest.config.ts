import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  transformIgnorePatterns: ["/node_modules/(?!(framer-motion)/)"],
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  globals: {
    "ts-jest": {
      isolatedModules: true, // Включаем для более быстрого компилятора TypeScript
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Если у вас есть алиасы
  },
  moduleDirectories: ["node_modules", "<rootDir>/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  // Поддержка ESModules
  extensionsToTreatAsEsm: [".ts", ".tsx"],
};

module.exports = createJestConfig(customJestConfig);
