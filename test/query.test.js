import { dbPrepareStatements, dbRawQuery, dbFetch, dbFetchOne } from "../lib/query.js";


/******************************************************************************/


export async function test({Assert, Section}, ctx) {
  Section `D1 Test; query that returns results`;

  const result = await ctx.db.prepare('SELECT * FROM Users WHERE userId = 1;').all();

  Assert(result)
    `success`.eq(true)
    `meta.rows_read`.eq(1)
    `meta.rows_written`.eq(0)
    `results.length`.eq(1);
  Assert(result.results)
    `0.userId`.eq(1)
    `0.username`.eq("bob");

// {
//   success: true,
//   meta: {
//     served_by: 'miniflare.db',
//     duration: 0,
//     changes: 0,
//     last_row_id: 1,
//     changed_db: false,
//     size_after: 12288,
//     rows_read: 1,
//     rows_written: 0
//   },
//   results: [ { id: 1, name: 'Bob' } ]
// }
}

/******************************************************************************/
