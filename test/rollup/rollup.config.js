import d1sql from '../../rollup/rollup-plugin.js';

export default {
  input: 'test/rollup/sqlTest.js',
  output: {
    file: 'test/rollup/output/sqlTest.js',
    format: 'es',
  },
  external: [
    '@odatnurd/d1-query'
  ],
  plugins: [
    d1sql()
  ]
};