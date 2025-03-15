import { Miniflare } from "miniflare";

import Parser from 'node-sql-parser';
import fs from 'fs-jetpack';


/******************************************************************************/


/* Check that the value provided in the target is or is not an array. If no
 * target is specified, assume that it is desirable to check for an array (i.e.
 * the default is true).
 *
 * Returns true if the object is an array, and false otherwise. */
function isarray(value, target) {
  target ??= true;
  return Array.isArray(value) === target;
}


/******************************************************************************/


/* Check that the provided value is an array and that its length is a specific
 * value.
 *
 * This is a small, more readable shorthand for:
 *    Assert(val)`.length`.eq()
 *
 * The return value is true if value is an array that has the specific length
 * provided, and false if the value is not an array, or if it is but does not
 * have this length. */
function arrayof(value, target) {
  if (Array.isArray(value) === true) {
    return value.length === target;
  }

  return false;
}


/******************************************************************************/


/* Assumes that value is a function that takes no arguments and returns no
 * values that should be invoked to see if it throws an exception or not.
 *
 * The test conducted is whether or not the value function throws an exception
 * when it is invoked.
 *
 * target specifies the desired outcome of the operation, and is one of:
 *    - false if the operation is expected to run without throwing an error
 *    - true if the operation is expected to throw some error
 *    - a string; in this case the value is implicitly true, but the test
 *      conducted is not only that the operation failed, but that the
 *      exception caught has the same message as the string provided.
 *
 * The return value is true when the function behaves as expected (either does
 * not throw, does throw, or throws a specific message). In all other cases,
 * false is returned instead. */
function throws(value, target) {
  try {
    value();

    // A target of false indicates that the operation was intended to succeed.
    return target === false;
  }
  catch(error) {
    // If the provided target was a string, then turn it into a boolean that
    // is true if the target matches the exception message and false
    // otherwise.
    target = (typeof target === 'string') ? (target === error.message) : target;

    // A target of true indicates that the operation was intended to fail.
    return target == true;
  }
}


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


/* Executed before all tests begin; this is given an object that is shared
 * between all test runs; it's also sent to the teardown hook when testing is
 * completed. */
export async function setup(ctx, assertions) {
  // Add in our own custom assertions to the built in list.
  assertions.isarray = isarray;
  assertions.arrayof = arrayof;
  assertions.throws = throws;

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
}

/* These events fire before and after a file's tests have been executed. */
export function beforeFile (filename) {}
export function afterFile (filename) {}

/* This is executed after all tests have completed, but before the results are
 * reported. This should clean up any shared resources that were created in
 * the setup, if needed. */
export async function teardown (context) {
  await context.worker.dispose();
}


/******************************************************************************/
