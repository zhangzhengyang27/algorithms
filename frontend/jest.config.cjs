module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
    // ts-blank-space 是 ESM-only 依赖（package.json 里 "type": "module"，无 CJS 产物），
    // 三个 tracer 都经由 solution-tracer 传递性 import 它。不放开这一条，
    // solution-tracer / python-tracer / java-tracer 在 Jest 里连模块都加载不了。
    '^.+\\.js$': ['ts-jest', { tsconfig: { allowJs: true, esModuleInterop: true, module: 'commonjs' } }],
  },
  // 只放开 ts-blank-space 一个包；pnpm 下真实路径形如
  // node_modules/.pnpm/ts-blank-space@0.9.0/node_modules/ts-blank-space/...，
  // 因此按 .pnpm 后的包名判定，其余依赖维持默认不转换（否则整个 node_modules 都会被编译，极慢）。
  transformIgnorePatterns: ['node_modules/.pnpm/(?!ts-blank-space@)'],
};
