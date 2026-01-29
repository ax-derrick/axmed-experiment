import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/axmed-experiment/' : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api/chat': {
        target: 'https://axmed.app.n8n.cloud',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, '/webhook/d94f602f-3cf2-4be4-823d-e3ec6c0a8543'),
      },
    },
  },
});
