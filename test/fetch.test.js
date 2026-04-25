import { Collection, $check, $ } from "@axel669/aegis";

import { dbFetch, dbFetchOne, dbFetchFirst } from "../lib/query.js";


/******************************************************************************/


export default Collection`Simple Fetch Queries`({
  /* These tests mimic the tests that were carried out by the raw query test
   * code, except that here we're using the fetch API which prepares the
   * statements for us. */
  "Fetch Queries": async ({ runScope: ctx}) => {
    // Testing that a single result arrives as expected
    await $check`SELECT a single row`
      .value(dbFetch(ctx.env.DB, 'raw_test_one',
        'SELECT * FROM Users WHERE userId = 1;',
        ))
      .isArray()
      .eq($[0].userId, 1)
      .eq($[0].username, 'bob');

    // Testing that multiple results arrive as expected.
    await $check`SELECT two rows`
      .value(dbFetch(ctx.env.DB, 'raw_test_two' ,
        'SELECT * FROM Users WHERE userId IN (1, 69) ORDER BY userId ASC;',
        ))
      .isArray()
      .eq($[0].userId, 1)
      .eq($[0].username, 'bob')
      .eq($[1].userId, 69)
      .eq($[1].username, 'jim');

    // Inserts produce an empty data set.
    await $check`INSERT single row`
      .value(dbFetch(ctx.env.DB, 'raw_test_three' ,
        'INSERT INTO Users VALUES(80, "bobert", true);',
        ))
      .isArray()
      .eq($.length, 0);

    // As a batch, the result is an array of results; both inserts return no
    // values.
    await $check`INSERT two rows as batch`
      .value(dbFetch(ctx.env.DB, 'raw_test_four' ,
        'INSERT INTO Users VALUES(?1, ?2, ?3);',
          [81, "jimbo", 1],
          [82, "frankbert", false],
        ))
      .isArray()
      .eq($.length, 2)
      .eq($[0].length, 0)
      .eq($[1].length, 0);

    // Verify that D1 is batching as part of a transaction; here the data should
    // be returned since it is inserting prior to selecting.
    await $check`INSERT/SELECT as a batch`
      .value(dbFetch(ctx.env.DB, 'raw_test_five' ,
        'INSERT INTO Users VALUES(?1, ?2, ?3);',
          [83, "bohjimbo", 0],
          'SELECT * FROM Users WHERE userId = 83;',
        ))
      .isArray()
      .eq($.length, 2)
      .eq($[0].length, 0)
      .eq($[1].length, 1)
      .eq($[1][0].userId, 83)
      .eq($[1][0].username, 'bohjimbo');

    // Verify that D1 is batching as part of a transaction; here it should not
    // find the data because it selects before it adds the data.
    await $check`SELECT/INSERT as a batch`
      .value(dbFetch(ctx.env.DB, 'raw_test_six' ,
        'SELECT * FROM Users WHERE userId = 84;',
        'INSERT INTO Users VALUES(?1, ?2, ?3);',
          [84, "jimbozo", true],
        ))
      .isArray()
      .eq($.length, 2)
      .eq($[0].length, 0)
      .eq($[1].length, 0);

    // Here the batch is trying to insert some new data and also some data that
    // already exists; as a result this should fail.
    await $check`INSERT new data and try to reinsert old data`
      .call(async () => dbFetch(ctx.env.DB, 'raw_test_seven' ,
        'INSERT INTO Users VALUES(?1, ?2, ?3);',
          [85, "neverseeme", true],
          [83, "bohjimbo", 0],
        ))
      .throws($, 'D1_ERROR: UNIQUE constraint failed: Users.userId: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_PRIMARYKEY)');

    // Now try to select the data that the previous batch would have inserted if
    // it did not fail; this tests that batches are properly wrapped in
    // transactions.
    await $check`SELECT row that should not exist due to transaction rollback`
      .value(dbFetch(ctx.env.DB, 'raw_test_eight' ,
        'SELECT * FROM Users WHERE userId = 85;',
        ))
      .isArray()
      .eq($.length, 0);

    // Verify that the code that converts fields with r"is*" names to booleans
    // works as expected.
    await $check`Boolean Conversions`
      .value(dbFetch(ctx.env.DB, 'raw_test_nine' ,
        `SELECT * FROM Users
          WHERE userId IN (70, 71, 72, 73)
          ORDER BY userId ASC;`,
        ))
      .isArray()
      .eq($.length, 4)
      .eq($[0].isCool, true)
      .eq($[1].isCool, true)
      .eq($[2].isCool, false)
      .eq($[3].isCool, false);
  },


  /****************************************************************************/


  /* This smaller set of queries exercises the dbFetchOne() API, which instead of
   * returning an array of items that might be empty, always returns only the
   * first item, if any, and otherwise returns null.
   *
   * Since it is otherwise identical, it is not tested as extensively here. */
  "Fetch One Queries": async ({ runScope: ctx}) => {
    // Querying with a single select statement when we know that a single item
    // should be returned should return that item, but not as an array.
    await $check`Fetch that returns a single result`
      .value(dbFetchOne(ctx.env.DB, 'fetch1_test_one',
                        'SELECT * FROM Users WHERE userId = 1;'))
      .isNotArray()
      .neq($, null)
      .eq($.userId, 1)
      .eq($.username, "bob");

    // In a query that returns two items, we should still see exactly the same
    // thing because we only get one result back.
    await $check`Fetch that returns two results`
      .value(dbFetchOne(ctx.env.DB, 'fetch1_test_two',
               'SELECT * FROM Users WHERE userId IN (1, 69) ORDER BY userId ASC;'))
      .isNotArray()
      .neq($, null)
      .eq($.userId, 1)
      .eq($.username, "bob");

    // If the query produces no results, it should return null instead of an
    // empty array.
    await $check`Fetch that returns no result`
      .value(dbFetchOne(ctx.env.DB, 'fetch1_test_three',
               'SELECT * FROM Users WHERE userId = 1000;'))
      .isNotArray()
      .eq($, null);

    // The above also holds true when the query returns no results because it just
    // does not result in any data, such as an insert.
    await $check`Fetch of an insert statement`
      .value(dbFetchOne(ctx.env.DB, 'fetch1_test_four',
               'INSERT INTO Users VALUES(?1, ?2, ?3);',
                 [91, "jimbo", 1]))
      .isNotArray()
      .eq($, null);

    // If we execute a batch of statements, in this case two selects, then the
    // return value should be the entire result set of the first query, even if
    // that returns more than one result.
    await $check`Fetch of a batch of statements`
      .value(dbFetchOne(ctx.env.DB, 'fetch1_test_five',
               'SELECT * FROM Users WHERE userId IN (1, 69) ORDER BY userId ASC;',
               'SELECT * FROM Users WHERE userId >= 70;'))
      .isArray()
      .eq($.length, 2)
      .eq($[0].userId, 1)
      .eq($[0].username, "bob")
      .eq($[1].userId, 69)
      .eq($[1].username, "jim")

    // In a batch of statements where the first staetment does not return a
    // result, what we get back is still the whole result, which should be an
    // empty array.
    await $check`Fetch of a batch of inserts`
      .value(dbFetchOne(ctx.env.DB, 'fetch1_test_six',
               'INSERT INTO Users VALUES(?1, ?2, ?3);',
                 [101, "jimbo", 1],
                 [102, "frankbert", false]))
      .isArray()
      .eq($.length, 0);
  },

  /****************************************************************************/

  /* This set of queries exercises the dbFetchFirst() API, which finds the
   * first statement in a potential batch that can return a result and
   * returns the first row of that result set. */
  "Fetch First Queries": async ({ runScope: ctx}) => {
    // A single select that returns a result should return the first row.
    await $check`Fetch first with a single result`
      .value(dbFetchFirst(ctx.env.DB, 'fetchFirst_test_one',
                        'SELECT * FROM Users WHERE userId = 1;'))
      .isNotArray()
      .neq($, null)
      .eq($.userId, 1)
      .eq($.username, "bob");

    // A batch where the first statement returns a result.
    await $check`Fetch first with a batch, first statement returns`
      .value(dbFetchFirst(ctx.env.DB, 'fetchFirst_test_two',
               'SELECT * FROM Users WHERE userId IN (1, 69) ORDER BY userId ASC;',
               'INSERT INTO Users VALUES(200, "test", 0);'))
      .isNotArray()
      .neq($, null)
      .eq($.userId, 1)
      .eq($.username, "bob");

    // A batch where a later statement is the first to return a result.
    await $check`Fetch first with a batch, later statement returns`
      .value(dbFetchFirst(ctx.env.DB, 'fetchFirst_test_three',
               'INSERT INTO Users VALUES(201, "test", 0);',
               'SELECT * FROM Users WHERE userId = 69;'))
      .isNotArray()
      .neq($, null)
      .eq($.userId, 69)
      .eq($.username, "jim");

    // A batch where no statements return results.
    await $check`Fetch first with no result-producing statements`
      .value(dbFetchFirst(ctx.env.DB, 'fetchFirst_test_four',
               'INSERT INTO Users VALUES(202, "test", 0);',
               'UPDATE Users SET isCool=1 WHERE userId=1;'))
      .eq($, null);

    // A query that returns multiple rows should still only return the first.
    await $check`Fetch first that returns multiple rows`
      .value(dbFetchFirst(ctx.env.DB, 'fetchFirst_test_five',
               'SELECT * FROM Users WHERE userId IN (1, 69) ORDER BY userId ASC;'))
      .isNotArray()
      .neq($, null)
      .eq($.userId, 1)
      .eq($.username, "bob");

    // A query that returns no rows should return null.
    await $check`Fetch first that returns no rows`
      .value(dbFetchFirst(ctx.env.DB, 'fetchFirst_test_six',
               'SELECT * FROM Users WHERE userId = 1000;'))
      .eq($, null);

    // A batch where a later statement could return a result but doesn't.
    await $check`Fetch first with a batch, potential but no result`
      .value(dbFetchFirst(ctx.env.DB, 'fetchFirst_test_seven',
               'INSERT INTO Users VALUES(203, "test", 0);',
               'SELECT * FROM Users WHERE userId = 1001;'))
      .eq($, null);

    // A batch with two statements that can return results, but neither do.
    await $check`Fetch first with multiple potential results, but none found`
      .value(dbFetchFirst(ctx.env.DB, 'fetchFirst_test_eight',
               'SELECT * FROM Users WHERE userId = 1002;',
               'SELECT * FROM Users WHERE userId = 1003;'))
      .eq($, null);

    // A batch where the first statement that can return a result doesn't, so
    // the result is null even though a later statement does return a result.
    await $check`Fetch first with a batch, first potential result is empty`
      .value(dbFetchFirst(ctx.env.DB, 'fetchFirst_test_nine',
               'SELECT * FROM Users WHERE userId = 1004;',
               'SELECT * FROM Users WHERE userId = 1;'))
      .eq($, null);
  }
});


/******************************************************************************/
