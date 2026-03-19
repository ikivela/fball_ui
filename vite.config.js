
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace(
            /%VITE_APP_SITE_TITLE%/g,
            env.VITE_APP_SITE_TITLE
          );
        },
      },
    ],
    base: mode === 'production' ? `/${env.VITE_APP_CLUB_NAME}/` : '/',
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
  };
});
