/******************************************************************************/


import { aegis } from "@axel669/aegis";
import {
  initializeCustomChecks,
  aegisSetup,
  aegisTeardown
} from "@odatnurd/cf-aegis";

import { initializeD1Checks, execSQLFiles } from "../aegis/index.js";


/******************************************************************************/


// Aegis 0.4 runs each test file in its own worker thread, so custom checks have
// to be registered in the worker rather than in aegis.config.js. Pass this
// package's Aegis instance explicitly: a linked cf-aegis can resolve its own
// copy of @axel669/aegis, and assertions are registered per module instance.
initializeCustomChecks(aegis);
initializeD1Checks(aegis);


/******************************************************************************/


/* Create a fresh Miniflare D1 database for the current file and load the shared
 * test fixture into it. Call this at the top of a test file that needs a
 * database, and call teardownDatabase() after the last test in that file. */
export function setupDatabase() {
  aegis.setup(async (state) => {
    state.ctx = {};
    await aegisSetup(state.ctx, {
      d1_databases: [
        {
          binding: 'DB',
          database_name: 'test-db',
          database_id: 'test-db-id'
        }
      ]
    });
    await execSQLFiles(state.ctx.env.DB, 'test/setup.sql');
  });
}


/******************************************************************************/


/* Dispose of the database after the final test entry in the file. Aegis runs
 * setup entries in declaration order, so this must be called after all tests. */
export function teardownDatabase() {
  aegis.setup(async (state) => {
    if (state.ctx !== undefined) {
      await aegisTeardown(state.ctx);
    }
  });
}


/******************************************************************************/


/* Run a function that may reject and return either its value or the error it
 * raised. This keeps asynchronous failure checks in the same assertion style as
 * the rest of the suite; Aegis' built-in throws assertion is synchronous. */
export async function caught(fn) {
  try {
    return await fn();
  } catch (error) {
    return error;
  }
}


/******************************************************************************/
