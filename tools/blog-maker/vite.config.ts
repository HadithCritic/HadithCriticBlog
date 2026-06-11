import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const apiOrigin = process.env.BLOG_MAKER_API_ORIGIN || 'http://127.0.0.1:8787';
const editorPort = Number(process.env.BLOG_MAKER_EDITOR_PORT || 5173);

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: editorPort,
    strictPort: false,
    proxy: {
      '/api': apiOrigin,
    },
  },
});
