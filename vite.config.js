import { defineConfig } from 'vite'
import typescript from "@rollup/plugin-typescript";
import ttypescript from "ttypescript";

export default defineConfig({
  esbuild: {
    mangleProps: new RegExp('_.*', 'gm')
  },
  build: {
    minify: true,
    target: 'es2022',
    polyfillModulePreload: false
  },
  plugins: [
    typescript({
      typescript: ttypescript
    })
  ]
});
