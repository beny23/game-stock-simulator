import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  // GitHub Pages serves project sites under /<repo>/.
  // Keep relative paths for local/offline builds.
  base: mode === 'gh-pages' ? '/game-stock-simulator/' : './',
  server: {
    port: 5173
  }
}));
