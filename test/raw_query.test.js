import { Collection, $check, $ } from "@axel669/aegis";

import { dbPrepareStatements, dbRawQuery } from "../lib/query.js";


/******************************************************************************/


export default Collection`Raw Data Queries`({
  /* This set of tests checks that we can successfully query from the database
   * using prepared statements.
   *
   * The tests here only test for success conditions; there is a seperate set of
   * tests for validating what happens when statements are not valid. */
  "Raw Queries": async ({ runScope: ctx}) => {
    // Testing that a single result arrives as expected
    await $check`SELECT a single row`
      .value(dbRawQuery(ctx.db,
        dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = 1;'),
        'raw_test_one'))
      .isArray()
      .eq($[0].userId, 1)
      .eq($[0].username, 'bob');

    // Testing that multiple results arrive as expected.
    await $check`SELECT two rows`
      .value(dbRawQuery(ctx.db,
        dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId IN (1, 69) ORDER BY userId ASC;'),
        'raw_test_two'))
      .isArray()
      .eq($[0].userId, 1)
      .eq($[0].username, 'bob')
      .eq($[1].userId, 69)
      .eq($[1].username, 'jim');

    // Inserts produce an empty data set.
    await $check`INSERT single row`
      .value(dbRawQuery(ctx.db,
        dbPrepareStatements(ctx.db, 'INSERT INTO Users VALUES(70, "bobert", true);'),
        'raw_test_three'))
      .isArray()
      .eq($.length, 0);

    // As a batch, the result is an array of results; both inserts return no
    // values.
    await $check`INSERT two rows as batch`
      .value(dbRawQuery(ctx.db,
        dbPrepareStatements(ctx.db, 'INSERT INTO Users VALUES(?1, ?2, ?3);',
                                      [71, "jimbo", 1],
                                      [72, "frankbert", false]),
        'raw_test_four'))
      .isArray()
      .eq($.length, 2)
      .eq($[0].length, 0)
      .eq($[1].length, 0);

    // Verify that D1 is batching as part of a transaction; here the data should
    // be returned since it is inserting prior to selecting.
    await $check`INSERT/SELECT as a batch`
      .value(dbRawQuery(ctx.db,
        dbPrepareStatements(ctx.db, 'INSERT INTO Users VALUES(?1, ?2, ?3);',
                                      [73, "bohjimbo", 0],
                                    'SELECT * FROM Users WHERE userId = 73;'),
        'raw_test_five'))
      .isArray()
      .eq($.length, 2)
      .eq($[0].length, 0)
      .eq($[1].length, 1)
      .eq($[1][0].userId, 73)
      .eq($[1][0].username, 'bohjimbo');

    // Verify that D1 is batching as part of a transaction; here it should not
    // find the data because it selects before it adds the data.
    await $check`SELECT/INSERT as a batch`
      .value(dbRawQuery(ctx.db,
        dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = 74;',
                                    'INSERT INTO Users VALUES(?1, ?2, ?3);',
                                      [74, "jimbozo", true]),
        'raw_test_six'))
      .isArray()
      .eq($.length, 2)
      .eq($[0].length, 0)
      .eq($[1].length, 0);

    // Here the batch is trying to insert some new data and also some data that
    // already exists; as a result this should fail.
    await $check`INSERT new data and try to reinsert old data`
      .call(async () => dbRawQuery(ctx.db,
        dbPrepareStatements(ctx.db, 'INSERT INTO Users VALUES(?1, ?2, ?3);',
                                      [75, "neverseeme", true],
                                      [73, "bohjimbo", 0]),
        'raw_test_seven'))
      .throws($, 'D1_ERROR: UNIQUE constraint failed: Users.userId: SQLITE_CONSTRAINT');

    // Now try to select the data that the previous batch would have inserted if
    // it did not fail; this tests that batches are properly wrapped in
    // transactions.
    await $check`SELECT row that should not exist due to transaction rollback`
      .value(dbRawQuery(ctx.db,
        dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = 75;'),
        'raw_test_eight'))
      .isArray()
      .eq($.length, 0);

    // Verify that the code that converts fields with r"is*" names to booleans
    // works as expected.
    await $check`Boolean Conversions`
      .value(dbRawQuery(ctx.db,
        dbPrepareStatements(ctx.db, `SELECT * FROM Users
                                     WHERE userId IN (70, 71, 72, 73)
                                     ORDER BY userId ASC;`),
        'raw_test_nine'))
      .isArray()
      .eq($.length, 4)
      .eq($[0].isCool, true)
      .eq($[1].isCool, true)
      .eq($[2].isCool, false)
      .eq($[3].isCool, false);
  },


  /****************************************************************************/


  /* This set of tests validates that we correctly catch errors in fetch calls
   * that relate to the statements provided not being valid. */
  "Raw Query Failures": async ({ runScope: ctx}) => {
    // Selecting with no statement should fail.
    await $check`SELECT with an undefined statement`
      .value(dbRawQuery(ctx.db, undefined, 'raw_fail_test_one'))
      .throws($, "Cannot read properties of undefined (reading 'statement')");

    // With more than one undefined statement, the error changes because it is
    // a batch and is handled differently.
    await $check`Batch of undefined statements`
      .value(dbRawQuery(ctx.db, [undefined], 'raw_fail_test_two'))
      .throws($, "Cannot read properties of undefined (reading 'statement')");

    // Selecting with a null statement should fail too.
    await $check`SELECT with a null statement`
      .value(dbRawQuery(ctx.db, null, 'raw_fail_test_three'))
      .throws($, "Cannot read properties of null (reading 'statement')");

    // Selecting with a null statement should fail too.
    await $check`Batch of null statements`
      .value(dbRawQuery(ctx.db, [null], 'raw_fail_test_four'))
      .throws($, "Cannot read properties of null (reading 'statement')");

    // Selecting with an empty batch
    await $check`Batch that is empty`
      .value(dbRawQuery(ctx.db, [], 'raw_fail_test_five'))
      .throws($, "D1_ERROR: No SQL statements detected.");

    // If one of the items in the batch is undefined, it should behave like they
    // all are.
    await $check`Batch with one undefined statement`
      .value(dbRawQuery(ctx.db,
        [
          dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = 1;'),
          undefined
        ],
        'raw_fail_test_six'))
      .throws($, "Cannot read properties of undefined (reading 'statement')");

    // If one of the items in the batch is null, it should behave like they
    // all are.
    await $check`Batch with one null statement`
      .value(dbRawQuery(ctx.db,
        [
          dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = 1;'),
          null
        ],
        'raw_fail_test_seven'))
      .throws($, "Cannot read properties of null (reading 'statement')");

    // Selecting where the statement consists of invalid SQL.
    await $check`Query with invalid SQL`
      .call(() => dbRawQuery(ctx.db,
        dbPrepareStatements(ctx.db, 'SELUCT * FROM Users WHERE userId = 1;'),
        'raw_fail_test_eight'))
      .throws($, 'invalid SQL syntax');

    // Selecting where the SQL is valid but the statement is not should flag an
    // error.
    await $check`Query with unknown table name`
      .value(dbRawQuery(ctx.db,
        dbPrepareStatements(ctx.db, 'SELECT * FROM NotRealltyUsers WHERE userId = 1;'),
        'raw_fail_test_nine'))
      .throws($, 'D1_ERROR: no such table: NotRealltyUsers: SQLITE_ERROR');

    // Binding with the wrong number of arguments should cause a failure.
    await $check`Statement with not enough bind arguments`
      .value(dbRawQuery(ctx.db,
        dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = ?;'),
        'raw_fail_test_ten'))
      .throws($, 'D1_ERROR: Wrong number of parameter bindings for SQL query.');

    // Same test as above, but testing with too many instead of too few.
    await $check`Statement with too many bind arguments`
      .call(() => dbRawQuery(ctx.db,
        dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = ?;', [1, 2]),
        'raw_fail_test_eleven'))
      .throws($, 'incorrect number of bind parameters; expected 1, got 2');

    // Same test as above, but testing with args then none are required.
    await $check`Statement with bind arguments when not required`
      .call(() => dbRawQuery(ctx.db,
        dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = 1;', [1, 2]),
        'raw_fail_test_eleven'))
      .throws($, 'statement does not accept any bind parameters');
  },
});