import { aegis, $ } from "@axel669/aegis";

import { dbPrepareStatements, dbRawQuery } from "../lib/query.js";
import { setupDatabase, teardownDatabase, caught } from "./aegis_setup.js";


/******************************************************************************/


export const name = "Raw Data Queries";


setupDatabase();


/******************************************************************************/


/* This set of tests checks that we can successfully query from the database
 * using prepared statements.
 *
 * The tests here only test for success conditions; there is a seperate set of
 * tests for validating what happens when statements are not valid. */
aegis.test`Raw Queries`(async (state) => {
  const ctx = state.ctx;

  // Testing that a single result arrives as expected
  const single = await dbRawQuery(ctx.env.DB,
    dbPrepareStatements(ctx.env.DB, 'raw_test_one', 'SELECT * FROM Users WHERE userId = 1;'),
    'raw_test_one');
  $.check`SELECT a single row`(
    $.isArray(single),
    $.eq(single[0].userId, 1),
    $.eq(single[0].username, 'bob')
  );

  // Testing that multiple results arrive as expected.
  const multiple = await dbRawQuery(ctx.env.DB,
    dbPrepareStatements(ctx.env.DB, 'raw_test_two', 'SELECT * FROM Users WHERE userId IN (1, 69) ORDER BY userId ASC;'),
    'raw_test_two');
  $.check`SELECT two rows`(
    $.isArray(multiple),
    $.eq(multiple[0].userId, 1),
    $.eq(multiple[0].username, 'bob'),
    $.eq(multiple[1].userId, 69),
    $.eq(multiple[1].username, 'jim')
  );

  // Inserts produce an empty data set.
  const inserted = await dbRawQuery(ctx.env.DB,
    dbPrepareStatements(ctx.env.DB, 'raw_test_three', 'INSERT INTO Users VALUES(70, "bobert", true);'),
    'raw_test_three');
  $.check`INSERT single row`(
    $.isArray(inserted),
    $.eq(inserted.length, 0)
  );

  // As a batch, the result is an array of results; both inserts return no
  // values.
  const batchInsert = await dbRawQuery(ctx.env.DB,
    dbPrepareStatements(ctx.env.DB, 'raw_test_four', 'INSERT INTO Users VALUES(?1, ?2, ?3);',
      [71, "jimbo", 1],
      [72, "frankbert", false]),
    'raw_test_four');
  $.check`INSERT two rows as batch`(
    $.isArray(batchInsert),
    $.eq(batchInsert.length, 2),
    $.eq(batchInsert[0].length, 0),
    $.eq(batchInsert[1].length, 0)
  );

  // Verify that D1 is batching as part of a transaction; here the data should
  // be returned since it is inserting prior to selecting.
  const insertSelect = await dbRawQuery(ctx.env.DB,
    dbPrepareStatements(ctx.env.DB, 'raw_test_five', 'INSERT INTO Users VALUES(?1, ?2, ?3);',
      [73, "bohjimbo", 0],
      'SELECT * FROM Users WHERE userId = 73;'),
    'raw_test_five');
  $.check`INSERT/SELECT as a batch`(
    $.isArray(insertSelect),
    $.eq(insertSelect.length, 2),
    $.eq(insertSelect[0].length, 0),
    $.eq(insertSelect[1].length, 1),
    $.eq(insertSelect[1][0].userId, 73),
    $.eq(insertSelect[1][0].username, 'bohjimbo')
  );

  // Verify that D1 is batching as part of a transaction; here it should not
  // find the data because it selects before it adds the data.
  const selectInsert = await dbRawQuery(ctx.env.DB,
    dbPrepareStatements(ctx.env.DB, 'raw_test_six', 'SELECT * FROM Users WHERE userId = 74;',
      'INSERT INTO Users VALUES(?1, ?2, ?3);',
      [74, "jimbozo", true]),
    'raw_test_six');
  $.check`SELECT/INSERT as a batch`(
    $.isArray(selectInsert),
    $.eq(selectInsert.length, 2),
    $.eq(selectInsert[0].length, 0),
    $.eq(selectInsert[1].length, 0)
  );

  // Here the batch is trying to insert some new data and also some data that
  // already exists; as a result this should fail.
  const insertError = await caught(() => dbRawQuery(ctx.env.DB,
    dbPrepareStatements(ctx.env.DB, 'raw_test_seven', 'INSERT INTO Users VALUES(?1, ?2, ?3);',
      [75, "neverseeme", true],
      [73, "bohjimbo", 0]),
    'raw_test_seven'));
  $.check`INSERT new data and try to reinsert old data`(
    $.instanceof(insertError, Error),
    $.eq(insertError.message,
      'D1_ERROR: UNIQUE constraint failed: Users.userId: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_PRIMARYKEY)')
  );

  // Now try to select the data that the previous batch would have inserted if
  // it did not fail; this tests that batches are properly wrapped in
  // transactions.
  const rolledBack = await dbRawQuery(ctx.env.DB,
    dbPrepareStatements(ctx.env.DB, 'raw_test_eight', 'SELECT * FROM Users WHERE userId = 75;'),
    'raw_test_eight');
  $.check`SELECT row that should not exist due to transaction rollback`(
    $.isArray(rolledBack),
    $.eq(rolledBack.length, 0)
  );

  // Verify that the code that converts fields with r"is*" names to booleans
  // works as expected.
  const converted = await dbRawQuery(ctx.env.DB,
    dbPrepareStatements(ctx.env.DB, 'raw_test_nine', `SELECT * FROM Users
                               WHERE userId IN (70, 71, 72, 73)
                               ORDER BY userId ASC;`),
    'raw_test_nine');
  $.check`Boolean Conversions`(
    $.isArray(converted),
    $.eq(converted.length, 4),
    $.eq(converted[0].isCool, true),
    $.eq(converted[1].isCool, true),
    $.eq(converted[2].isCool, false),
    $.eq(converted[3].isCool, false)
  );
});


/******************************************************************************/


/* This set of tests validates the conversion of integer fields that are named
 * as if they were booleans into actual boolean values.
 *
 * A field is converted only if its name starts with "is" and is followed by an
 * upper case letter or an underscore, and only if its value is 0 or 1; any
 * other value (including NULL) is left exactly as D1 provided it. */
aegis.test`Boolean Field Conversion`(async (state) => {
  const ctx = state.ctx;

  // Fetch the rows in the Flags table, which is what contains the various
  // shapes of boolean fields that we want to test against.
  const flags = await dbRawQuery(ctx.env.DB,
    dbPrepareStatements(ctx.env.DB, 'raw_bool_one',
      'SELECT * FROM Flags ORDER BY id ASC;'),
    'raw_bool_one');

  // The first row has a true boolean, a false snake_case boolean, a NULL
  // nullable boolean, and a number that happens to have a boolean name.
  $.check`Converting boolean fields`(
    $.isObject(flags[0]),
    $.eq(flags[0].isActive, true),
    $.eq(flags[0].is_visible, false),
    $.eq(flags[0].isEnabled, null),
    $.eq(flags[0].isCount, 2)
  );

  // The second row flips the first two values but keeps the rest.
  $.check`Converting boolean fields, opposite values`(
    $.isObject(flags[1]),
    $.eq(flags[1].isActive, false),
    $.eq(flags[1].is_visible, true),
    $.eq(flags[1].isEnabled, null),
    $.eq(flags[1].isCount, 5)
  );

  // A NULL must survive as NULL; converting it to a boolean would turn a
  // missing value into a definite false.
  const nullable = flags.map(flag => flag.isEnabled);
  $.check`Nullable boolean is not converted`(
    $.isArray(nullable),
    $.eq(nullable[0], null),
    $.eq(nullable[1], null)
  );

  // A field with a boolean name but a non-boolean value must be left alone so
  // that the value is not silently lost.
  const counts = flags.map(flag => flag.isCount);
  $.check`Non-boolean value with boolean name is not converted`(
    $.isArray(counts),
    $.eq(counts[0], 2),
    $.eq(counts[1], 5)
  );
});


/******************************************************************************/


/* This set of tests validates that we correctly catch errors in fetch calls
 * that relate to the statements provided not being valid.
 *
 * The checks below only require that an error is raised, not which text it
 * carries. Passed the wrong input the library dereferences it, so the message
 * is the platform's wording for that dereference, which is not something this
 * package controls or promises to keep. */
aegis.test`Raw Query Failures`(async (state) => {
  const ctx = state.ctx;

  // Selecting with no statement should fail.
  const undefinedStatement = await caught(() =>
    dbRawQuery(ctx.env.DB, undefined, 'raw_fail_test_one'));
  $.check`SELECT with an undefined statement`(
    $.instanceof(undefinedStatement, Error)
  );

  // With more than one undefined statement, the error changes because it is a
  // batch and is handled differently.
  const undefinedBatch = await caught(() =>
    dbRawQuery(ctx.env.DB, [undefined], 'raw_fail_test_two'));
  $.check`Batch of undefined statements`(
    $.instanceof(undefinedBatch, Error)
  );

  // Selecting with a null statement should fail too.
  const nullStatement = await caught(() =>
    dbRawQuery(ctx.env.DB, null, 'raw_fail_test_three'));
  $.check`SELECT with a null statement`(
    $.instanceof(nullStatement, Error)
  );

  // Selecting with a null statement should fail too.
  const nullBatch = await caught(() =>
    dbRawQuery(ctx.env.DB, [null], 'raw_fail_test_four'));
  $.check`Batch of null statements`(
    $.instanceof(nullBatch, Error)
  );

  // Selecting with an empty batch
  const emptyBatch = await caught(() =>
    dbRawQuery(ctx.env.DB, [], 'raw_fail_test_five'));
  $.check`Batch that is empty`(
    $.instanceof(emptyBatch, Error),
    $.eq(emptyBatch.message, 'D1_ERROR: No SQL statements detected.')
  );

  // If one of the items in the batch is undefined, it should behave like they
  // all are.
  const mixedUndefined = await caught(() =>
    dbRawQuery(ctx.env.DB,
      [
        dbPrepareStatements(ctx.env.DB, 'raw_fail_test_six', 'SELECT * FROM Users WHERE userId = 1;'),
        undefined
      ],
      'raw_fail_test_six'));
  $.check`Batch with one undefined statement`(
    $.instanceof(mixedUndefined, Error)
  );

  // If one of the items in the batch is null, it should behave like they all
  // are.
  const mixedNull = await caught(() =>
    dbRawQuery(ctx.env.DB,
      [
        dbPrepareStatements(ctx.env.DB, 'raw_fail_test_seven', 'SELECT * FROM Users WHERE userId = 1;'),
        null
      ],
      'raw_fail_test_seven'));
  $.check`Batch with one null statement`(
    $.instanceof(mixedNull, Error)
  );

  // Selecting where the statement consists of invalid SQL.
  const invalidSQL = await caught(() =>
    dbRawQuery(ctx.env.DB,
      dbPrepareStatements(ctx.env.DB, 'raw_fail_test_eight', 'SELUCT * FROM Users WHERE userId = 1;'),
      'raw_fail_test_eight'));
  $.check`Query with invalid SQL`(
    $.instanceof(invalidSQL, Error),
    $.eq(invalidSQL.message, 'invalid SQL syntax')
  );

  // Selecting where the SQL is valid but the statement is not should flag an
  // error.
  const unknownTable = await caught(() =>
    dbRawQuery(ctx.env.DB,
      dbPrepareStatements(ctx.env.DB, 'raw_fail_test_nine', 'SELECT * FROM NotRealltyUsers WHERE userId = 1;'),
      'raw_fail_test_nine'));
  $.check`Query with unknown table name`(
    $.instanceof(unknownTable, Error),
    $.eq(unknownTable.message, 'D1_ERROR: no such table: NotRealltyUsers: SQLITE_ERROR')
  );

  // Binding with the wrong number of arguments should cause a failure.
  const tooFew = await caught(() =>
    dbRawQuery(ctx.env.DB,
      dbPrepareStatements(ctx.env.DB, 'raw_fail_test_ten', 'SELECT * FROM Users WHERE userId = ?;'),
      'raw_fail_test_ten'));
  $.check`Statement with not enough bind arguments`(
    $.instanceof(tooFew, Error),
    $.eq(tooFew.message, 'D1_ERROR: Wrong number of parameter bindings for SQL query.')
  );

  // Same test as above, but testing with too many instead of too few.
  const tooMany = await caught(() =>
    dbRawQuery(ctx.env.DB,
      dbPrepareStatements(ctx.env.DB, 'raw_fail_test_eleven', 'SELECT * FROM Users WHERE userId = ?;', [1, 2]),
      'raw_fail_test_eleven'));
  $.check`Statement with too many bind arguments`(
    $.instanceof(tooMany, Error),
    $.eq(tooMany.message, 'incorrect number of bind parameters; expected 1, got 2')
  );

  // Same test as above, but testing with args then none are required.
  const unwanted = await caught(() =>
    dbRawQuery(ctx.env.DB,
      dbPrepareStatements(ctx.env.DB, 'raw_fail_test_twelve', 'SELECT * FROM Users WHERE userId = 1;', [1, 2]),
      'raw_fail_test_twelve'));
  $.check`Statement with bind arguments when not required`(
    $.instanceof(unwanted, Error),
    $.eq(unwanted.message, 'statement does not accept any bind parameters')
  );
});


/******************************************************************************/


teardownDatabase();


/******************************************************************************/
