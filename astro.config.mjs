import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.raana.icu',
  output: 'static',
  build: {
    assets: '_assets',
  },
});
