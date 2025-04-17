import { addCheck } from "@axel669/aegis"

import { Miniflare } from "miniflare";

import Parser from 'node-sql-parser';
import fs from 'fs-jetpack';


/******************************************************************************/


/* Include a custom check that validates that a value is an array. */
addCheck.value.isArray(
    source => Array.isArray(source) === true
);

/* Include a custom check that validates that a value is not an array. */
addCheck.value.isNotArray(
    source => Array.isArray(source) === false
);


/******************************************************************************/


/* Given a context that has a property named db that is a Miniflare D1 database
 * wrapper, load up the SQL file from the given filename, and execute all of the
 * statements it contains one after the other, executing them in ctx.db.
 *
  * This uses a robust SQL parsing library that can accept any number of
  * statements and comments within those statements and execute them. This does
  * require that the SQL file be valid. */
async function setupTestDatabase(ctx, sqlFilename) {
  // Load the SQL file in as text so that we can insert it into the DB.
  const setup = fs.read(sqlFilename, 'utf8');

  // Create a SQL parser that knows that it's dealing with the SQLite dialect of
  // SQL and parse the input file with it.
  const parser = new Parser.Parser();
  const ast = parser.astify(setup, { database: "SQLite" });

  // For each statement, execute it, so that the database is set up as per the
  // tests.
  for (const statement of ast) {
    const sql = parser.sqlify(statement, { database: "SQLite" });
    console.log(`> ${sql}`);
    await ctx.db.exec(sql);
  }
}


/******************************************************************************/


export const config = {
    files: [
        "test/compiler.test.js",
        "test/raw_query.test.js",
        "test/fetch.test.js",
    ],
    hooks: {
        async setup(ctx) {
            // Set up the Miniflare instance that we will be using to conduct our tests.
            ctx.worker = new Miniflare({
              script: 'export default {}',
              // script: 'export default { async fetch(request, env, ctx) { return new Response("Hello World!"); }}',
              modules: true,
              d1Databases: ['DB']
            });

            // Before we can proceed, ensure that the worker is available and fully set up
            // and then create an alias for it in the context.
            await ctx.worker.ready;
            ctx.db = await ctx.worker.getD1Database('DB');

            // Set up the database for our tests
            await setupTestDatabase(ctx, 'test/setup.sql');
        },

        async teardown(ctx) {
            await ctx.worker.dispose();
        },
    },

    // Can be set to "afterSection" or "afterCollection" to have the test suite
    // exit as soon as a check fails in a section or collection. Default of
    // "ignore" runs all tests without stopping on failures.
    failAction: "afterCollection",
}


/******************************************************************************/
