
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === "production" ? "/nibacos/" : "/",
  server: {
    port: 3000,
    host: '127.0.0.1',
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
