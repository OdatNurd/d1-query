import { aegis, $ } from "@axel669/aegis";

import { dbPrepareStatements } from "../lib/query.js";
import { setupDatabase, teardownDatabase } from "./aegis_setup.js";


/******************************************************************************/


export const name = "Statement Compilation";


setupDatabase();


/******************************************************************************/


/* This set of tests exercises whether or not our prepared statement helper
 * behaves as expected.
 *
 * Of specific note here is that tests on this cannot detect errors in the SQL
 * because Miniflare doesn't actually try to compile the SQL in a statement
 * until the point where a query is actually executed (as least in Miniflare).
 *
 * As such, errors like invalid SQL pass here and fail when executed. Thus we
 * only vet that statements are prepared as expected. */
aegis.test`Statement Preparation`(async (state) => {
  const ctx = state.ctx;

  // A single statement should compile to a single object.
  const one = dbPrepareStatements(ctx.env.DB, 'test_action',
    'SELECT * FROM Users WHERE userId = 1;');
  $.check`Single statement, no binds`(
    $.neq(one, undefined),
    $.isNotArray(one)
  );

  // A single statement should compile to a single object, even with a bind.
  const boundOne = dbPrepareStatements(ctx.env.DB, 'test_action',
    'SELECT * FROM Users WHERE userId = ?;', [1]);
  $.check`Single statement, one bind`(
    $.neq(boundOne, undefined),
    $.isNotArray(boundOne)
  );

  // A single statement with two binds should result in two statements.
  const boundTwo = dbPrepareStatements(ctx.env.DB, 'test_action',
    'SELECT * FROM Users WHERE userId = ?;', [1], [69]);
  $.check`Single statement, two binds`(
    $.isArray(boundTwo),
    $.eq(boundTwo.length, 2)
  );

  // The same should happen if it's just two statements.
  const two = dbPrepareStatements(ctx.env.DB, 'test_action',
    'SELECT * FROM Users WHERE userId = 1;',
    'SELECT * FROM Users WHERE userId = 69;');
  $.check`Two statements, no binds`(
    $.isArray(two),
    $.eq(two.length, 2)
  );

  // Two statements each with one bind is still two statements.
  const twoBound = dbPrepareStatements(ctx.env.DB, 'test_action',
    'SELECT * FROM Users WHERE userId = ?;', [1],
    'SELECT * FROM Users WHERE userId = ?;', [69]);
  $.check`Two statements, two binds`(
    $.isArray(twoBound),
    $.eq(twoBound.length, 2)
  );

  // Two statements with three binds should be three statements.
  const threeBound = dbPrepareStatements(ctx.env.DB, 'test_action',
    'SELECT * FROM Users WHERE userId = ?;', [1],
    'SELECT * FROM Users WHERE userId = ?;', [69], [42]);
  $.check`Two statements, three binds`(
    $.isArray(threeBound),
    $.eq(threeBound.length, 3)
  );
});


/******************************************************************************/


/* These tests verify that a statement that has previously been prepared can
 * be used in a call to the statement preparation function, which should result
 * in a new statement that reuses the state of the original one back.
 *
 * The tests here mimic the ones from the above test suite, but they use a
 * precompiled statement instead. */
aegis.test`Statement Re-Use`(async (state) => {
  const ctx = state.ctx;

  // Create a regular and bound statement for reuse purposes below.
  const stmt = dbPrepareStatements(ctx.env.DB, 'test_action',
    'SELECT * FROM Users WHERE userId = 1;');
  const boundStmt = dbPrepareStatements(ctx.env.DB, 'test_action',
    'SELECT * FROM Users WHERE userId = ?;');

  // A single statement should compile to a single object.
  const one = dbPrepareStatements(ctx.env.DB, 'test_action', stmt);
  $.check`Single statement, no binds`(
    $.neq(one, undefined),
    $.isNotArray(one)
  );

  // A single statement should compile to a single object, even with a bind.
  const boundOne = dbPrepareStatements(ctx.env.DB, 'test_action', boundStmt, [1]);
  $.check`Single statement, one bind`(
    $.neq(boundOne, undefined),
    $.isNotArray(boundOne)
  );

  // A single statement with two binds should result in two statements.
  const boundTwo = dbPrepareStatements(ctx.env.DB, 'test_action', boundStmt, [1], [69]);
  $.check`Single statement, two binds`(
    $.isArray(boundTwo),
    $.eq(boundTwo.length, 2)
  );

  // The same should happen if it's just two statements.
  const two = dbPrepareStatements(ctx.env.DB, 'test_action', stmt, stmt);
  $.check`Two statements, no binds`(
    $.isArray(two),
    $.eq(two.length, 2)
  );

  // Two statements each with one bind is still two statements.
  const twoBound = dbPrepareStatements(ctx.env.DB, 'test_action',
    boundStmt, [1],
    boundStmt, [69]);
  $.check`Two statements, two binds`(
    $.isArray(twoBound),
    $.eq(twoBound.length, 2)
  );

  // Two statements with three binds should be three statements.
  const threeBound = dbPrepareStatements(ctx.env.DB, 'test_action',
    boundStmt, [1],
    boundStmt, [69], [42]);
  $.check`Two statements, three binds`(
    $.isArray(threeBound),
    $.eq(threeBound.length, 3)
  );
});


/******************************************************************************/


/* This set of tests checks situations in which the dbPrepareStatements helper
 * fails to prepare statements due to known problems.
 *
 * As mentioned previously, Miniflare does not actually try to compile the
 * statement until its executed, so for our purposes here we don't (and can't)
 * check for SQL errors. */
aegis.test`Statement Failures`(async (state) => {
  const ctx = state.ctx;

  // Simple statement for testing with.
  const boundStmt = dbPrepareStatements(ctx.env.DB, 'test_action',
    'SELECT * FROM Users WHERE userId = ?;');

  // It is a failure to not provide any arguments to the prepare function.
  $.check`No arguments`(
    $.throwsMessage(
      () => dbPrepareStatements(ctx.env.DB, 'test_action'),
      'no statements provided to dbPrepareStatements()'
    )
  );

  // Providing an array prior to a statement is not valid.
  $.check`Bind args before statements`(
    $.throwsMessage(
      () => dbPrepareStatements(ctx.env.DB, 'test_action', [69], boundStmt),
      'bind arguments given before statement in input list'
    )
  );

  // The function only supports being passed SQL, prepared statements, and
  // bind arrays. All possible correct values were tested in the other
  // sections, so here we only need to test one situation here.
  $.check`Function arg is not SQL,pre-compiled statement or bind args`(
    $.throwsMessage(
      () => dbPrepareStatements(ctx.env.DB, 'test_action', 69),
      'arguments must be SQL strings, SQLStatement instances, or bind values (arrays/objects)'
    )
  );
});


/******************************************************************************/


teardownDatabase();


/******************************************************************************/
