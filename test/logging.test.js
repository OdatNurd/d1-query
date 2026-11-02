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
