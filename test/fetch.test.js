import { aegis, $ } from "@axel669/aegis";

import { dbFetch, dbFetchOne, dbFetchFirst } from "../lib/query.js";
import { setupDatabase, teardownDatabase, caught } from "./aegis_setup.js";


/******************************************************************************/


export const name = "Simple Fetch Queries";


setupDatabase();


/******************************************************************************/


/* These tests mimic the tests that were carried out by the raw query test code
 * except that here we're using the fetch API which prepares the statements for
 * us. */
aegis.test`Fetch Queries`(async (state) => {
  const ctx = state.ctx;

  // Testing that a single result arrives as expected
  const single = await dbFetch(ctx.env.DB, 'raw_test_one',
    'SELECT * FROM Users WHERE userId = 1;');
  $.check`SELECT a single row`(
    $.isArray(single),
    $.eq(single[0].userId, 1),
    $.eq(single[0].username, 'bob')
  );

  // Testing that multiple results arrive as expected.
  const multiple = await dbFetch(ctx.env.DB, 'raw_test_two',
    'SELECT * FROM Users WHERE userId IN (1, 69) ORDER BY userId ASC;');
  $.check`SELECT two rows`(
    $.isArray(multiple),
    $.eq(multiple[0].userId, 1),
    $.eq(multiple[0].username, 'bob'),
    $.eq(multiple[1].userId, 69),
    $.eq(multiple[1].username, 'jim')
  );

  // Inserts produce an empty data set.
  const inserted = await dbFetch(ctx.env.DB, 'raw_test_three',
    'INSERT INTO Users VALUES(80, "bobert", true);');
  $.check`INSERT single row`(
    $.isArray(inserted),
    $.eq(inserted.length, 0)
  );

  // As a batch, the result is an array of results; both inserts return no
  // values.
  const batchInsert = await dbFetch(ctx.env.DB, 'raw_test_four',
    'INSERT INTO Users VALUES(?1, ?2, ?3);',
    [81, "jimbo", 1],
    [82, "frankbert", false]);
  $.check`INSERT two rows as batch`(
    $.isArray(batchInsert),
    $.eq(batchInsert.length, 2),
    $.eq(batchInsert[0].length, 0),
    $.eq(batchInsert[1].length, 0)
  );

  // Verify that D1 is batching as part of a transaction; here the data should
  // be returned since it is inserting prior to selecting.
  const insertSelect = await dbFetch(ctx.env.DB, 'raw_test_five',
    'INSERT INTO Users VALUES(?1, ?2, ?3);',
    [83, "bohjimbo", 0],
    'SELECT * FROM Users WHERE userId = 83;');
  $.check`INSERT/SELECT as a batch`(
    $.isArray(insertSelect),
    $.eq(insertSelect.length, 2),
    $.eq(insertSelect[0].length, 0),
    $.eq(insertSelect[1].length, 1),
    $.eq(insertSelect[1][0].userId, 83),
    $.eq(insertSelect[1][0].username, 'bohjimbo')
  );

  // Verify that D1 is batching as part of a transaction; here it should not
  // find the data because it selects before it adds the data.
  const selectInsert = await dbFetch(ctx.env.DB, 'raw_test_six',
    'SELECT * FROM Users WHERE userId = 84;',
    'INSERT INTO Users VALUES(?1, ?2, ?3);',
    [84, "jimbozo", true]);
  $.check`SELECT/INSERT as a batch`(
    $.isArray(selectInsert),
    $.eq(selectInsert.length, 2),
    $.eq(selectInsert[0].length, 0),
    $.eq(selectInsert[1].length, 0)
  );

  // Here the batch is trying to insert some new data and also some data that
  // already exists; as a result this should fail.
  const insertError = await caught(() => dbFetch(ctx.env.DB, 'raw_test_seven',
    'INSERT INTO Users VALUES(?1, ?2, ?3);',
    [85, "neverseeme", true],
    [83, "bohjimbo", 0]));
  $.check`INSERT new data and try to reinsert old data`(
    $.instanceof(insertError, Error),
    $.eq(insertError.message,
      'D1_ERROR: UNIQUE constraint failed: Users.userId: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_PRIMARYKEY)')
  );

  // Now try to select the data that the previous batch would have inserted if
  // it did not fail; this tests that batches are properly wrapped in
  // transactions.
  const rolledBack = await dbFetch(ctx.env.DB, 'raw_test_eight',
    'SELECT * FROM Users WHERE userId = 85;');
  $.check`SELECT row that should not exist due to transaction rollback`(
    $.isArray(rolledBack),
    $.eq(rolledBack.length, 0)
  );

  // Verify that the code that converts fields with r"is*" names to booleans
  // works as expected. This file creates these four rows itself now that each
  // test file has an isolated database.
  const converted = await dbFetch(ctx.env.DB, 'raw_test_nine',
    `SELECT * FROM Users
      WHERE userId IN (80, 81, 82, 83)
      ORDER BY userId ASC;`);
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


/* This smaller set of queries exercises the dbFetchOne() API, which instead of
 * returning an array of items that might be empty, always returns only the
 * first item, if any, and otherwise returns null.
 *
 * Since it is otherwise identical, it is not tested as extensively here. */
aegis.test`Fetch One Queries`(async (state) => {
  const ctx = state.ctx;

  // Querying with a single select statement when we know that a single item
  // should be returned should return that item, but not as an array.
  const one = await dbFetchOne(ctx.env.DB, 'fetch1_test_one',
    'SELECT * FROM Users WHERE userId = 1;');
  $.check`Fetch that returns a single result`(
    $.isNotArray(one),
    $.neq(one, null),
    $.eq(one.userId, 1),
    $.eq(one.username, "bob")
  );

  // In a query that returns two items, we should still see exactly the same
  // thing because we only get one result back.
  const firstOfTwo = await dbFetchOne(ctx.env.DB, 'fetch1_test_two',
    'SELECT * FROM Users WHERE userId IN (1, 69) ORDER BY userId ASC;');
  $.check`Fetch that returns two results`(
    $.isNotArray(firstOfTwo),
    $.neq(firstOfTwo, null),
    $.eq(firstOfTwo.userId, 1),
    $.eq(firstOfTwo.username, "bob")
  );

  // If the query produces no results, it should return null instead of an
  // empty array.
  const none = await dbFetchOne(ctx.env.DB, 'fetch1_test_three',
    'SELECT * FROM Users WHERE userId = 1000;');
  $.check`Fetch that returns no result`(
    $.isNotArray(none),
    $.eq(none, null)
  );

  // The above also holds true when the query returns no results because it just
  // does not result in any data, such as an insert.
  const insert = await dbFetchOne(ctx.env.DB, 'fetch1_test_four',
    'INSERT INTO Users VALUES(?1, ?2, ?3);',
    [91, "jimbo", 1]);
  $.check`Fetch of an insert statement`(
    $.isNotArray(insert),
    $.eq(insert, null)
  );

  // If we execute a batch of statements, in this case two selects, then the
  // return value should be the entire result set of the first query, even if
  // that returns more than one result.
  const batch = await dbFetchOne(ctx.env.DB, 'fetch1_test_five',
    'SELECT * FROM Users WHERE userId IN (1, 69) ORDER BY userId ASC;',
    'SELECT * FROM Users WHERE userId >= 70;');
  $.check`Fetch of a batch of statements`(
    $.isArray(batch),
    $.eq(batch.length, 2),
    $.eq(batch[0].userId, 1),
    $.eq(batch[0].username, "bob"),
    $.eq(batch[1].userId, 69),
    $.eq(batch[1].username, "jim")
  );

  // In a batch of statements where the first staetment does not return a
  // result, what we get back is still the whole result, which should be an
  // empty array.
  const insertBatch = await dbFetchOne(ctx.env.DB, 'fetch1_test_six',
    'INSERT INTO Users VALUES(?1, ?2, ?3);',
    [101, "jimbo", 1],
    [102, "frankbert", false]);
  $.check`Fetch of a batch of inserts`(
    $.isArray(insertBatch),
    $.eq(insertBatch.length, 0)
  );
});


/******************************************************************************/


/* This set of queries exercises the dbFetchFirst() API, which finds the
 * first statement in a potential batch that can return a result and
 * returns the first row of that result set. */
aegis.test`Fetch First Queries`(async (state) => {
  const ctx = state.ctx;

  // A single select that returns a result should return the first row.
  const single = await dbFetchFirst(ctx.env.DB, 'fetchFirst_test_one',
    'SELECT * FROM Users WHERE userId = 1;');
  $.check`Fetch first with a single result`(
    $.isNotArray(single),
    $.neq(single, null),
    $.eq(single.userId, 1),
    $.eq(single.username, "bob")
  );

  // A batch where the first statement returns a result.
  const firstReturns = await dbFetchFirst(ctx.env.DB, 'fetchFirst_test_two',
    'SELECT * FROM Users WHERE userId IN (1, 69) ORDER BY userId ASC;',
    'INSERT INTO Users VALUES(200, "test", 0);');
  $.check`Fetch first with a batch, first statement returns`(
    $.isNotArray(firstReturns),
    $.neq(firstReturns, null),
    $.eq(firstReturns.userId, 1),
    $.eq(firstReturns.username, "bob")
  );

  // A batch where a later statement is the first to return a result.
  const laterReturns = await dbFetchFirst(ctx.env.DB, 'fetchFirst_test_three',
    'INSERT INTO Users VALUES(201, "test", 0);',
    'SELECT * FROM Users WHERE userId = 69;');
  $.check`Fetch first with a batch, later statement returns`(
    $.isNotArray(laterReturns),
    $.neq(laterReturns, null),
    $.eq(laterReturns.userId, 69),
    $.eq(laterReturns.username, "jim")
  );

  // A batch where no statements return results.
  const noResults = await dbFetchFirst(ctx.env.DB, 'fetchFirst_test_four',
    'INSERT INTO Users VALUES(202, "test", 0);',
    'UPDATE Users SET isCool=1 WHERE userId=1;');
  $.check`Fetch first with no result-producing statements`(
    $.eq(noResults, null)
  );

  // A query that returns multiple rows should still only return the first.
  const multipleRows = await dbFetchFirst(ctx.env.DB, 'fetchFirst_test_five',
    'SELECT * FROM Users WHERE userId IN (1, 69) ORDER BY userId ASC;');
  $.check`Fetch first that returns multiple rows`(
    $.isNotArray(multipleRows),
    $.neq(multipleRows, null),
    $.eq(multipleRows.userId, 1),
    $.eq(multipleRows.username, "bob")
  );

  // A query that returns no rows should return null.
  const noRows = await dbFetchFirst(ctx.env.DB, 'fetchFirst_test_six',
    'SELECT * FROM Users WHERE userId = 1000;');
  $.check`Fetch first that returns no rows`(
    $.eq(noRows, null)
  );

  // A batch where a later statement could return a result but doesn't.
  const potentialNoResult = await dbFetchFirst(ctx.env.DB, 'fetchFirst_test_seven',
    'INSERT INTO Users VALUES(203, "test", 0);',
    'SELECT * FROM Users WHERE userId = 1001;');
  $.check`Fetch first with a batch, potential but no result`(
    $.eq(potentialNoResult, null)
  );

  // A batch with two statements that can return results, but neither do.
  const multiplePotential = await dbFetchFirst(ctx.env.DB, 'fetchFirst_test_eight',
    'SELECT * FROM Users WHERE userId = 1002;',
    'SELECT * FROM Users WHERE userId = 1003;');
  $.check`Fetch first with multiple potential results, but none found`(
    $.eq(multiplePotential, null)
  );

  // A batch where the first statement that can return a result doesn't, so the
  // result is null even though a later statement does return a result.
  const firstPotentialEmpty = await dbFetchFirst(ctx.env.DB, 'fetchFirst_test_nine',
    'SELECT * FROM Users WHERE userId = 1004;',
    'SELECT * FROM Users WHERE userId = 1;');
  $.check`Fetch first with a batch, first potential result is empty`(
    $.eq(firstPotentialEmpty, null)
  );
});


/******************************************************************************/


teardownDatabase();


/******************************************************************************/
