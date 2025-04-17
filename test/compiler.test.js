import { Collection, $check, $ } from "@axel669/aegis";

import { dbPrepareStatements } from "../lib/query.js";


/******************************************************************************/


export default Collection`Statement Compilation`({
  /* This set of tests exercises whether or not our prepared statement helper
   * behaves as expected.
   *
   * Of specific note here is that tests on this cannot detect errors in the SQL
   * because Miniflare doesn't actually try to compile the SQL in a statement
   * until the point where a query is actually executed (as least in Miniflare).
   *
   * As such, errors like invalid SQL pass here and fail when executed. Thus we
   * only vet that statements are prepared as expected. */
  "Statement Preparation": ({ runScope: ctx }) => {
    // A single statement should compile to a single object.
    $check`Single statement, no binds`
      .value(dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = 1;'))
      .neq($, undefined)
      .isNotArray();

    // A single statement should compile to a single object, even with a bind.
    $check`Single statement, one bind`
      .value(dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = ?;', [1]))
      .neq($, undefined)
      .isNotArray();

    // A single statement with two binds should result in two statements.
    $check`Single statement, two binds`
      .value(dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = ?;', [1], [69]))
      .isArray()
      .eq($.length, 2);

    // The same should happen if it's just two statements.
    $check`Two statements, no binds`
      .value(dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = 1;',
                                         'SELECT * FROM Users WHERE userId = 69;'))
      .isArray()
      .eq($.length, 2);

    // Two statements each with one bind is still two statements.
    $check`Two statements, two binds`
      .value(dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = ?;', [1],
                                         'SELECT * FROM Users WHERE userId = ?;', [69]))
      .isArray()
      .eq($.length, 2);

    // Two statements with three binds should be three statements.
    $check`Two statements, three binds`
      .value(dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = ?;', [1],
                                         'SELECT * FROM Users WHERE userId = ?;', [69], [42]))
      .isArray()
      .eq($.length, 3);
  },


  /****************************************************************************/


  /* These tests verify that a statement that has previously been prepared can
   * be used in a call to the statement preparation function, which should
   * result in a new statement that reuses the state of the original one back.
   *
   * The tests here mimic the ones from the above test suite, but they use a
   * precompiled statement instead. */
  "Statement Re-Use": ({ runScope: ctx }) => {
    // Create a regular and bound statement for reuse purposes below.
    const stmt = dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = 1;');
    const boundStmt = dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = ?;');

    // A single statement should compile to a single object.
    $check`Single statement, no binds`
      .value(dbPrepareStatements(ctx.db, stmt))
      .neq($, undefined)
      .isNotArray();

    // A single statement should compile to a single object, even with a bind.
    $check`Single statement, one bind`
      .value(dbPrepareStatements(ctx.db, boundStmt, [1]))
      .neq($, undefined)
      .isNotArray();

    // A single statement with two binds should result in two statements.
    $check`Single statement, two binds`
      .value(dbPrepareStatements(ctx.db, boundStmt, [1], [69]))
      .isArray()
      .eq($.length, 2);

    // The same should happen if it's just two statements.
    $check`Two statements, no binds`
      .value(dbPrepareStatements(ctx.db, stmt, stmt))
      .isArray()
      .eq($.length, 2);

    // Two statements each with one bind is still two statements.
    $check`Two statements, two binds`
      .value(dbPrepareStatements(ctx.db, boundStmt, [1],
                                       boundStmt, [69]))
      .isArray()
      .eq($.length, 2);

    // Two statements with three binds should be three statements.
    $check`Two statements, three binds`
      .value(dbPrepareStatements(ctx.db, boundStmt, [1],
                                       boundStmt, [69], [42]))
      .isArray()
      .eq($.length, 3);
  },


  /****************************************************************************/


  /* This set of tests checks situations in which the dbPrepareStatements helper
   * fails to prepare statements due to known problems.
   *
   * As mentioned previously, Miniflare does not actually try to compile the
   * statement until its executed, so for our purposes here we don't (and can't)
   * check for SQL errors. */
  "Statement Failures": ({ runScope: ctx }) => {
    // Simple statement for testing with.
    const boundStmt = dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = ?;');

    // It is a failure to not provide any arguments to the prepare function.
    $check`No arguments`
      .call(() => dbPrepareStatements(ctx.db))
      .throws($, 'no statements provided to dbPrepareStatements()');

    // Providing an array prior to a statement is not valid.
    $check`Bind args before statements`
      .call(() => dbPrepareStatements(ctx.db, [69], boundStmt))
      .throws($, 'bind arguments given before statement in input list');

    // The function only supports being passed SQL, prepared statements, and
    // bind arrays. All possible correct values were tested in the other
    // sections, so here we only need to test one situation here.
    $check`Function arg is not SQL,pre-compiled statement or bind args`
      .call(() => dbPrepareStatements(ctx.db, 69))
      .throws($, 'must provide SQL strings or previously compiled statements');
  },
});


/******************************************************************************/
