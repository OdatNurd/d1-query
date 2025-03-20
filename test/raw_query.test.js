import { dbPrepareStatements, dbRawQuery } from "../lib/query.js";
import { emitWarning } from 'process';

// We currently don't have a good way to test that an async function throws an
// exception, and although we could work it out Axel is currently working on a
// newer version of Aegis that will do it and changes some other syntax, so
// there is no reason to spend time doing it at the moment.
emitWarning("Tests in this file are currently not complete while we await a new version of Aegis")


/******************************************************************************/


/* This set of tests checks that we can successfully query from the database
 * using prepared statements.
 *
 * The tests here only test for success conditions; there is a seperate set of
 * tests for validating what happens when statements are not valid. */
async function raw_queries(ctx, Section, Assert) {
  Section `Raw Query`;

  // Querying with a single select statement should return back an array of
  // exactly one object, where the userId and the name are the known quantities
  // from the test file.
  const stmt1 = dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = 1;');
  Assert(await dbRawQuery(ctx.db, stmt1, 'raw_test_one'))
    .arrayof(1)
    `0.userId`.eq(1)
    `0.username`.eq("bob");

  // This query should return a batch of two results, where the two values come
  // out in the designated order.
  const stmt2 = dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId IN (1, 69) ORDER BY userId ASC;');
  Assert(await dbRawQuery(ctx.db, stmt2, 'raw_test_two'))
    .arrayof(2)
    `0.userId`.eq(1)
    `0.username`.eq("bob")
    `1.userId`.eq(69)
    `1.username`.eq("jim");

  // This query is an insert and should return a single result array that has
  // no content in it because inserts in D1 do not return the value of the
  // inserted object.
  const stmt3 = dbPrepareStatements(ctx.db, 'INSERT INTO Users VALUES(70, "bobert", true);');
  Assert(await dbRawQuery(ctx.db, stmt3, 'raw_test_three'))
    .arrayof(0);

  // This query is two inserts, which will run as a batch. The result of this
  // should be two result arrays, both of which are empty for the same reasons
  // as above.
  const stmt4 = dbPrepareStatements(ctx.db, 'INSERT INTO Users VALUES(?1, ?2, ?3);',
                                             [71, "jimbo", 1], [72, "frankbert", false]);
  Assert(await dbRawQuery(ctx.db, stmt4, 'raw_test_four'))
    .arrayof(2)
    `0.length`.eq(0)
    `1.length`.eq(0);

  // This query is an insert followed by a select; since there are two
  // statements this should run in a batch, ensuring integrity. Thus we should
  // be able to select out the value that was just inserted.
  const stmt5 = dbPrepareStatements(ctx.db, 'INSERT INTO Users VALUES(?1, ?2, ?3);',
                                             [73, "bohjimbo", 0],
                                            'SELECT * FROM Users WHERE userId = 73;');
  const result5 = await dbRawQuery(ctx.db, stmt5, 'raw_test_five');
  Assert(result5)
    .arrayof(2)
    `0.length`.eq(0)
    `1.length`.eq(1);
  Assert(result5[1])
    `0.userId`.eq(73)
    `0.username`.eq("bohjimbo");

  // This query is a select followed by an insert; since there are two
  // statements this should run in a batch, ensuring integrity. Thus we should
  // not be able to select out the value that we insert because it is inserted
  // after.
  const stmt6 = dbPrepareStatements(ctx.db, 'SELECT * FROM Users WHERE userId = 74;',
                                            'INSERT INTO Users VALUES(?1, ?2, ?3);',
                                             [74, "jimbozo", true],
                                            );
  Assert(await dbRawQuery(ctx.db, stmt6, 'raw_test_six'))
    .arrayof(2)
    `0.length`.eq(0)
    `1.length`.eq(0);

  // As a test of the code that converts fields whose names start with an "is"
  // prefix to booleans regardless of how they were inserted into the database,
  // select out records that we inserted and ensure that when we query them, we
  // get back what we expect.
  const stmt7 = dbPrepareStatements(ctx.db, `SELECT * FROM Users
                                             WHERE userId IN (70, 71, 72, 73)
                                             ORDER BY userId ASC;`);
  Assert(await dbRawQuery(ctx.db, stmt7, 'raw_test_seven'))
    .arrayof(4)
    `0.isCool`.eq(true)
    `1.isCool`.eq(true)
    `2.isCool`.eq(false)
    `3.isCool`.eq(false);
}



/******************************************************************************/


/* This set of tests validates that we correctly catch errors in fetch calls
 * that relate to the statements provided not being valid. */
async function raw_query_failures(ctx, Section, Assert) {
  Section `Raw Query Failures`;

  // Errors:
  //   Providing undefined as a statement
  //   Providing null as a statement
  //   Providing an empty list of statements
  //   Providing a list of statements where one item is undefined
  //   Providing a list of statements where one item is null
  //
  //   Statement that is not valid SQL
  //   Statement that does not have enough bind arguments
  //   Statement that is bound when it does not have any arguments

// export async function dbRawQuery(db, statements, action)
}


/******************************************************************************/


/* This is the main test entry point; it executes all of the tests in order. */
export async function test({Assert, Section}, ctx) {
  await raw_queries(ctx, Section, Assert);
  await raw_query_failures(ctx, Section, Assert);
}

/******************************************************************************/
