import { Miniflare } from "miniflare";

import Parser from 'node-sql-parser';
import fs from 'fs-jetpack';


/******************************************************************************/


/* Executed before all tests begin; this is given an object that is shared
 * between all test runs; it's also sent to the teardown hook when testing is
 * completed. */
export async function setup(ctx, assertions) {
  /* Assumes that value() is a function that takes no arguments and returns no
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
   * The return from here is true or false to indicate if the function performed
   * as expected. */
  assertions.throws = (value, target) => {
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
      return target === true;
    }
  }

  ctx.worker = new Miniflare({
    script: 'export default {}',
    modules: true,
    d1Databases: ['TEST_DB']
  });

  await ctx.worker.ready;

  // Load and parse the SQL used to set up the test
  const setup = fs.read('test/setup.sql', 'utf8');
  const parser = new Parser.Parser();
  const ast = parser.astify(setup, { database: "SQLite" });

  // Execute the statements one by one.
  ctx.db = await ctx.worker.getD1Database('TEST_DB');
  for (const statement of ast) {
    const sql = parser.sqlify(statement, { database: "SQLite" });
    console.log(`> ${sql}`);
    await ctx.db.exec(sql);
  }
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
