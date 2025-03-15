import { dbPrepareStatements } from "../lib/query.js";


/******************************************************************************/


/* This set of tests exercises whether or not our prepared statement helper
 * behaves as expected.
 *
 * Of specific note here is that tests on this cannot detect errors in the SQL
 * because Miniflare doesn't actualy try to compile the SQL in a statement until
 * the point where a query is actually executed (as least in Miniflare).
 *
 * As such, errors like invalid SQL pass here and fail when executed. Thus we
 * only vet that statements are prepared as expected. */
function statement_preparation(ctx, Section, Assert) {
  Section `Statement Preparation`;

  // A single statement with no binds should return a single statement back.
  Assert(dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = 1;'))
    .neq(undefined)
    .isarray(false);

  // The same should occur if there is a bind, but there is only one set of
  // bind arguments.
  Assert(dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = ?;', [1]))
    .neq(undefined)
    .isarray(false);

  // If we have two binds, then we should end up with an array of two statements
  // back.
  Assert(dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = ?;', [1], [69]))
    .arrayof(2);

  // If there are no binds but there are two statements provided, then we should
  // still end up with two statements back.
  Assert(dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = 1;',
                                     'SELECT * FROM Users WHERE userId = 69;'))
    .arrayof(2);

  // Multiple statements where each one binds one should still end up with the
  // same number of statements.
  Assert(dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = ?;', [1],
                                      'SELECT * FROM Users WHERE userId = ?;', [69]))
    .arrayof(2);

  // Here there are two statements but the second one is bound twice, and so it
  // should result in us getting three statements back.
  Assert(dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = ?;', [1],
                                     'SELECT * FROM Users WHERE userId = ?;', [69], [42]))
    .arrayof(3);
}


/******************************************************************************/


/* These tests verify that a statement that has previously been prepared can be
 * used in a call to the statement preparation function, which should result in
 * a new statement that reuses the state of the original one back.
 *
 * The tests here mimic the ones from the above test suite, but they use a
 * precompiled statement instead. */
function statement_reuse(ctx, Section, Assert) {
  // Create a regular and bound statement for reuse purposes.
  const stmt = dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = 1;');
  const boundStmt = dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = ?;');

  Section `Prepared Statement re-use`;

  // A single statement with no binds should return a single statement back.
  Assert(dbPrepareStatements(ctx.db, stmt))
    .neq(undefined)
    .isarray(false);

  // The same should occur if there is a bind, but there is only one set of
  // bind arguments.
  Assert(dbPrepareStatements(ctx.db, boundStmt, [1]))
    .neq(undefined)
    .isarray(false);

  // If we have two binds, then we should end up with an array of two statements
  // back.
  Assert(dbPrepareStatements(ctx.db, boundStmt, [1], [69]))
    .arrayof(2);

  // If there are no binds but there are two statements provided, then we should
  // still end up with two statements back.
  Assert(dbPrepareStatements(ctx.db, stmt, stmt))
    .arrayof(2);

  // Multiple statements where each one binds one should still end up with the
  // same number of statements.
  Assert(dbPrepareStatements(ctx.db, boundStmt, [1],
                                     boundStmt, [69]))
    .arrayof(2);

  // Here there are two statements but the second one is bound twice, and so it
  // should result in us getting three statements back.
  Assert(dbPrepareStatements(ctx.db, boundStmt, [1],
                                     boundStmt, [69], [42]))
    .arrayof(3);
}


/******************************************************************************/


/* This set of tests checks situations in which the dbPrepareStatements helper
 * fails to prepare statements due to known problems.
 *
 * As mentioned previously, Miniflare does not actually try to compile the
 * statement until its executed, so for our purposes here we don't (and can't)
 * check for SQL errors. */
function statement_failures(ctx, Section, Assert) {
  // Simple statement for testing with.
  const boundStmt = dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = ?;');

  Section `Prepared Statement Failures`;

  // When invoked with no arguments, it should be an error because there is
  // nothing to prepare if you don't give it statements.
  Assert(() => dbPrepareStatements(ctx.db))
    .throws('no statements provided to dbPrepareStatements()')

  // It is an error to provide the arguments for a bound statement before you
  // provide at least one statement.
  Assert(() => dbPrepareStatements(ctx.db, [69], boundStmt))
    .throws("bind arguments given before statement in input list")

  // Providing something that is not a string, a precomputed statement or an
  // array of bind arguments is an error.
  //
  // Note that as of right now objects that are not instances of prepared
  // statements are passed through because the compiler does not try to actually
  // compile or bind until you execute the statement for the first time.
  Assert(() => dbPrepareStatements(ctx.db, 69))
    .throws("must provide SQL strings or previously compiled statements")
}


/******************************************************************************/


/* This is the main test entry point; it executes all of the tests in order. */
export async function test({Section, Assert}, ctx) {
  statement_preparation(ctx, Section, Assert);
  statement_reuse(ctx, Section, Assert);
  statement_failures(ctx, Section, Assert);
}

/******************************************************************************/
