import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { fileURLToPath, URL } from 'node:url';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

// The news server (healing-news-server) runs on port 3001.
// The app asks its own address for /api/news and Vite forwards the request there.
const newsProxy = {
  '/api/news': { target: 'http://localhost:3001', changeOrigin: true },
};

// Set PLAIN_HTTP=1 to serve over plain http. Needed to test the offline install on this PC,
// because browsers refuse the offline engine on a page with an untrusted test certificate.
const plainHttp = process.env.PLAIN_HTTP === '1';

// After a build, writes the list of every built file into dist/sw.js, so the whole app is saved on the phone.
function precachePlugin(): Plugin {
  const dist = fileURLToPath(new URL('./dist', import.meta.url));
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const full = join(dir, name);
      return statSync(full).isDirectory() ? walk(full) : [full];
    });

  return {
    name: 'healing-precache',
    apply: 'build',
    closeBundle() {
      const swPath = join(dist, 'sw.js');
      if (!existsSync(swPath)) return;
      const urls = walk(dist)
        .map((file) => '/' + relative(dist, file).split(sep).join('/'))
        .filter((u) => u !== '/sw.js' && !u.endsWith('.map'));
      urls.push('/');
      const sw = readFileSync(swPath, 'utf8')
        .replace('__PRECACHE__', () => JSON.stringify(urls))
        .replace('__VERSION__', () => String(Date.now()));
      writeFileSync(swPath, sw);
      console.log(`Offline install: ${urls.length} files listed in dist/sw.js`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  // basicSsl() makes a test certificate, so the camera, microphone, motion sensors
  // and location are allowed on your phone. For testing only.
  plugins: [react(), ...(plainHttp ? [] : [basicSsl()]), precachePlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true, // lets your phone reach the app over Wi-Fi
    proxy: newsProxy,
    port: 3000, // or another preferred dev port
  },
  preview: {
    host: true,
    proxy: newsProxy,
    port: 4174, // changes the preview port to avoid conflicts
  },
});