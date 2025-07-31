import d1sql from './rollup-plugin-d1-sql.js';

export default {
  input: 'rollup/test.js',
  output: {
    file: 'rollup/output/test.js',
    format: 'es',
  },
  external: [
    '@odatnurd/d1-query'
  ],
  plugins: [
    d1sql()
  ]
};