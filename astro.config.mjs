import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://sccc.kr',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  }
});
