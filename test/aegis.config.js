/******************************************************************************/


import { initializeD1Checks, aegisSetup, aegisTeardown } from "../aegis/index.js";


/******************************************************************************/


// Initialize custom Aegis checks for this test suite.
initializeD1Checks();


/******************************************************************************/


export const config = {
  files: [
    "test/sqlparser.test.js",
    "test/compiler.test.js",
    "test/raw_query.test.js",
    "test/fetch.test.js",
    "test/rollup.test.js",
  ],
  hooks: {
    setup: async (ctx) => aegisSetup(ctx, 'test/setup.sql'),
    teardown: async (ctx) => aegisTeardown(ctx),
  },

  // Can be set to "afterSection" or "afterCollection" to have the test suite
  // exit as soon as a check fails in a section or collection. Default of
  // "ignore" runs all tests without stopping on failures.
  failAction: "afterSection",
}


/******************************************************************************/
