import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/index.html',
    }
  },
  plugins: [commonjs()],
  optimizeDeps: {
    include: ['google-protobuf'], // Ensure `google-protobuf` is pre-bundled
  },
});