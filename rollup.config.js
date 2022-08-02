import { terser } from 'rollup-plugin-terser';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import copy from 'rollup-plugin-copy';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  output: {
    file: 'build/bundle.js',
    sourcemap: true,
  },
  plugins: [
    serve({
      open: true,
      contentBase: 'build',
    }),
    livereload({
      watch: 'build',
    }),
    copy({
      targets: [
        {src: 'src/index.html', dest: 'build'},
      ],
    }),
    production && terser(), // minify, but only in production
  ],
};
