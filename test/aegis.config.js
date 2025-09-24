/******************************************************************************/


import { initializeCustomChecks, aegisSetup, aegisTeardown } from "@odatnurd/cf-aegis";

import { initializeD1Checks, execSQLFiles } from "../aegis/index.js";


/******************************************************************************/


// Initialize custom Aegis checks for this test suite.
initializeCustomChecks();
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
    setup: async (ctx) => {
      await aegisSetup(ctx, {
        d1_databases: [
          {
            binding: 'DB',
            database_name: 'test-db',
            database_id: 'test-db-id'
          }
        ]
      });
      await execSQLFiles(ctx.env.DB, 'test/setup.sql')
    },
    teardown: async (ctx) => aegisTeardown(ctx),
  },

  // Can be set to "afterSection" or "afterCollection" to have the test suite
  // exit as soon as a check fails in a section or collection. Default of
  // "ignore" runs all tests without stopping on failures.
  failAction: "afterSection",
}


/******************************************************************************/
