import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' — относительные пути к ассетам, чтобы сборка работала
// и на GitHub Pages (в подкаталоге /jurassic-cycle/), и локально.
export default defineConfig({
  base: './',
  plugins: [react()],
});
