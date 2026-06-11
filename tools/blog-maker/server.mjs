import { createApp } from './lib/app.mjs';

const host = '127.0.0.1';
const port = Number(process.env.BLOG_MAKER_PORT || 8787);
const app = createApp({
  apiOrigin: `http://${host}:${port}`,
  astroOrigin: process.env.BLOG_MAKER_ASTRO_ORIGIN || 'http://127.0.0.1:4321',
  editorOrigin: process.env.BLOG_MAKER_EDITOR_ORIGIN || 'http://127.0.0.1:5173',
});

app.listen(port, host, () => {
  console.log(`Blog Maker API listening at http://${host}:${port}`);
});
