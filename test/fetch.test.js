import { dbFetch, dbFetchOne } from "../lib/query.js";


/******************************************************************************/


/* These tests mimic the tests that were carried out by the raw query test code,
 * except that here we're using the fetch API which prepares the statements
 * for us. */
async function simple_fetch_queries(ctx, Section, Assert) {
  Section `Simple Fetch Queries`;

  // Querying with a single select statement should return back an array of
  // exactly one object, where the userId and the name are the known quantities
  // from the test file.
  Assert(await dbFetch(ctx.db, 'fetch_test_one',
                       'SELECT * FROM Users WHERE userId = 1;'))
    .arrayof(1)
    `0.userId`.eq(1)
    `0.username`.eq("bob");

  // This query should return a batch of two results, where the two values come
  // out in the designated order.
  Assert(await dbFetch(ctx.db, 'fetch_test_two',
                       'SELECT * FROM Users WHERE userId IN (1, 69) ORDER BY userId ASC;'))
    .arrayof(2)
    `0.userId`.eq(1)
    `0.username`.eq("bob")
    `1.userId`.eq(69)
    `1.username`.eq("jim");

  // This query is an insert and should return a single result array that has
  // no content in it because inserts in D1 do not return the value of the
  // inserted object.
  Assert(await dbFetch(ctx.db, 'fetch_test_three',
                       'INSERT INTO Users VALUES(80, "bobert", true);'))
    .arrayof(0);

  // This query is two inserts, which will run as a batch. The result of this
  // should be two result arrays, both of which are empty for the same reasons
  // as above.
  Assert(await dbFetch(ctx.db, 'fetch_test_four',
                       'INSERT INTO Users VALUES(?1, ?2, ?3);',
                       [81, "jimbo", 1],
                       [82, "frankbert", false]))
    .arrayof(2)
    `0.length`.eq(0)
    `1.length`.eq(0);

  // This query is an insert followed by a select; since there are two
  // statements this should run in a batch, ensuring integrity. Thus we should
  // be able to select out the value that was just inserted.
  const result5 = await dbFetch(ctx.db, 'fetch_test_five',
                                'INSERT INTO Users VALUES(?1, ?2, ?3);',
                                [83, "bohjimbo", 0],
                                'SELECT * FROM Users WHERE userId = 83;');
  Assert(result5)
    .arrayof(2)
    `0.length`.eq(0)
    `1.length`.eq(1);
  Assert(result5[1])
    `0.userId`.eq(83)
    `0.username`.eq("bohjimbo");

  // This query is a select followed by an insert; since there are two
  // statements this should run in a batch, ensuring integrity. Thus we should
  // not be able to select out the value that we insert because it is inserted
  // after.
  Assert(await dbFetch(ctx.db, 'fetch_test_six',
                       'SELECT * FROM Users WHERE userId = 84;',
                       'INSERT INTO Users VALUES(?1, ?2, ?3);',
                        [84, "jimbozo", true],))
    .arrayof(2)
    `0.length`.eq(0)
    `1.length`.eq(0);

  // As a test of the code that converts fields whose names start with an "is"
  // prefix to booleans regardless of how they were inserted into the database,
  // select out records that we inserted and ensure that when we query them, we
  // get back what we expect.
  Assert(await dbFetch(ctx.db, 'fetch_test_seven',
                       `SELECT * FROM Users
                         WHERE userId IN (80, 81, 82, 83)
                         ORDER BY userId ASC;`))
    .arrayof(4)
    `0.isCool`.eq(true)
    `1.isCool`.eq(true)
    `2.isCool`.eq(false)
    `3.isCool`.eq(false);
}


/******************************************************************************/


/* This smaller set of queries exercises the dbFetchOne() API, which instead of
 * returning an array of items that might be empty, always returns only the
 * first item, if any, and otherwise returns null.
 *
 * Since it is otherwise identical, it is not tested as extensively here. */
async function simple_fetch_one_queries(ctx, Section, Assert) {
  Section `Simple Fetch One Queries`;

  // Querying with a single select statement when we know that a single item
  // should be returned should return that item, but not as an array.
  Assert(await dbFetchOne(ctx.db, 'fetch1_test_one',
                          'SELECT * FROM Users WHERE userId = 1;'))
    .isarray(false)
    .neq(null)
    `userId`.eq(1)
    `username`.eq("bob");

  // In a query that returns two items, we should still see exactly the same
  // thing because we only get one.
  Assert(await dbFetchOne(ctx.db, 'fetch1_test_two',
                          'SELECT * FROM Users WHERE userId IN (1, 69) ORDER BY userId ASC;'))
    .isarray(false)
    .neq(null)
    `userId`.eq(1)
    `username`.eq("bob");

  // If the query produces no results, it should return null instead of an
  // empty array.
  Assert(await dbFetchOne(ctx.db, 'fetch1_test_three',
                          'SELECT * FROM Users WHERE userId = 1000;'))
    .isarray(false)
    .eq(null);

  // The above also holds true when the query returns no results because it just
  // does not result in any data, such as an insert.
  Assert(await dbFetchOne(ctx.db, 'fetch1_test_four',
                          'INSERT INTO Users VALUES(?1, ?2, ?3);',
                          [91, "jimbo", 1]))
    .isarray(false)
    .eq(null);

  // If we execute a batch of statements, in this case two selects, then the
  // return value should be the entire result set of the first query, even if
  // that returns more than one result.
  Assert(await dbFetchOne(ctx.db, 'fetch1_test_five',
                          'SELECT * FROM Users WHERE userId IN (1, 69) ORDER BY userId ASC;',
                          'SELECT * FROM Users WHERE userId >= 70;'))
    .arrayof(2)
    `0.userId`.eq(1)
    `0.username`.eq("bob")
    `1.userId`.eq(69)
    `1.username`.eq("jim");

  // In a batch of statements where the first staetment does not return a
  // result, what we get back is still the whole result, which should be an
  // empty array.
  Assert(await dbFetchOne(ctx.db, 'fetch1_test_six',
                          'INSERT INTO Users VALUES(?1, ?2, ?3);',
                          [101, "jimbo", 1], [102, "frankbert", false]))
    .arrayof(0);
}


/******************************************************************************/


/* This is the main test entry point; it executes all of the tests in order. */
export async function test({Assert, Section}, ctx) {
  await simple_fetch_queries(ctx, Section, Assert);
  await simple_fetch_one_queries(ctx, Section, Assert);
}


/******************************************************************************/
