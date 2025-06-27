import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for Electron
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure compatibility with Electron
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      // External packages that shouldn't be bundled
      external: ['electron']
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});