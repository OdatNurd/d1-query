/******************************************************************************/


import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';


/******************************************************************************/


/* Regenerate the vendored version of the SQLite parser.
 *
 * The build artifact here is minified for size, although this still leaves us
 * with an almost 700kb file. */
export default {
  input: 'vendor/parser.js',
  output: {
    file: 'lib/sqlite.js',
    format: 'esm',
  },

  onwarn(warning, handler) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      if(warning.message.includes('node_modules/sql-parser-cst/')) {
        return;
      }
    }
    handler(warning);
  },

  plugins: [
    resolve(),
    commonjs(),
    terser({
      toplevel: true,
      compress: {
        passes: 2,
        drop_console: true
      },
      format: {
        comments: false
      }
    })
  ]
};


/******************************************************************************/
