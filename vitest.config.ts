import { defineConfig } from 'vitest/config';

// Отдельный конфиг, чтобы не конфликтовать с версией Vite внутри Vitest.
// Тесты движка не требуют DOM и React-плагина.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
