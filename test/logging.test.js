import { Collection, $check, $ } from "@axel669/aegis";

import { dbFetch } from "../lib/query.js";


/******************************************************************************/


/* Collect the lines that the library logs while running the given function; the
 * library logs unconditionally, so this is the only way to see what it actually
 * wrote. */
async function captureLogs(fn) {
  const lines = [];
  const original = console.log;

  console.log = (...args) => lines.push(args.join(' '));
  try {
    await fn();
  } finally {
    console.log = original;
  }

  return lines;
}


/* A stand-in for the D1 binding that returns whatever result it is given; this
 * lets us produce result shapes that a real database will not produce on
 * demand, such as a meta object with fields missing. */
function resultDb(result) {
  return {
    prepare: () => ({
      bind: (...binds) => ({ all: async () => result }),
      all: async () => result,
    }),
  };
}


/******************************************************************************/


export default Collection`Query Logging`({
  /* The log line is built by string interpolation of the meta fields, so a meta
   * object that does not carry every field produces "undefined" in the output
   * instead of a placeholder. */
  "Incomplete Result Metadata": async ({ runScope: ctx }) => {
    const lines = await captureLogs(() => dbFetch(resultDb({
      results: [],
      success: true,
      meta: {},
    }), 'log_test_one', 'SELECT 1;'));

    $check`duration falls back to a placeholder`
      .value(lines[0] ?? '')
      .eq($.includes('[?ms]'), true);

    $check`last row id falls back to a placeholder`
      .value(lines[0] ?? '')
      .eq($.includes('last_row_id=?'), true);

    $check`log line has no undefined in it`
      .value(lines[0] ?? '')
      .eq($.includes('undefined'), false);
  },


  /****************************************************************************/

  /****************************************************************************/

  /* A result object with no results array at all is not something a binding
   * produces, but the shape turns up in stand-ins, and treating it as a failure
   * would throw after the query itself had already succeeded. */
  "Missing Result Set": async ({ runScope: ctx }) => {
    let value;
    const lines = await captureLogs(async () => {
      value = await dbFetch(resultDb({
        success: true,
        meta: { duration: 1, last_row_id: 2 },
      }), 'log_test_three', 'SELECT 1;');
    });

    $check`missing result set is returned as no rows`
      .value(value)
      .isArray()
      .eq($.length, 0);

    $check`missing result set is logged as a null size`
      .value((lines[0] ?? '').includes('resultSize=null'))
      .eq($, true);
  },


  /****************************************************************************/

  /* The guards in the library are written against the real shape of a result,
   * so the real shape is recorded here: a statement that writes rows still
   * returns an empty results array rather than a null one. */
  "Write Statement Result": async ({ runScope: ctx }) => {
    let value;
    const lines = await captureLogs(async () => {
      value = await dbFetch(ctx.env.DB, 'log_insert', `
        INSERT INTO Flags (id, isActive, is_visible, isEnabled, isCount)
        VALUES (777, 1, 0, NULL, 1);`);
    });

    $check`insert returns an empty result set`
      .value(value)
      .isArray()
      .eq($.length, 0);

    $check`insert logs an empty result size`
      .value((lines[0] ?? '').includes('resultSize=0'))
      .eq($, true);
  },


  /****************************************************************************/

  /* A complete meta object must still be logged in full. */
  "Complete Result Metadata": async ({ runScope: ctx }) => {
    const lines = await captureLogs(() => dbFetch(resultDb({
      results: [],
      success: true,
      meta: { duration: 3, last_row_id: 7, rows_read: 1, rows_written: 0 },
    }), 'log_test_two', 'SELECT 1;'));

    $check`complete metadata is logged`
      .value(lines[0] ?? '')
      .eq($.includes('[3ms]'), true);

    $check`complete last row id is logged`
      .value(lines[0] ?? '')
      .eq($.includes('last_row_id=7'), true);
  },
});


/******************************************************************************/
