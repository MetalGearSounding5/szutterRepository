import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    // mangleProps: new RegExp('.*_', 'gm'), TODO: Add TS properties transformer
  },
  build: {
    minify: true,
    target: 'es2022',
    polyfillModulePreload: false
  }
})
