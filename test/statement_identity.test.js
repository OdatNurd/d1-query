import { aegis, $ } from "@axel669/aegis";

import { dbPrepareStatements } from "../lib/query.js";
import { processSQLString, SQLStatement } from "../lib/statement.js";
import { setupDatabase, teardownDatabase } from "./aegis_setup.js";


/******************************************************************************/


/* The mark that identifies one of our statement objects. Symbol.for() looks the
 * key up in a registry that every copy of the library in an isolate shares. */
const BRAND = Symbol.for('@odatnurd/d1-query/statement');


/* Build something shaped exactly like a statement from another copy of the
 * library: it carries the shared brand and the fields that the library reads,
 * but it is not an instance of this copy's SQLStatement class. */
function foreignStatement(sql) {
  const { bindMetadata, canProduceResult } = processSQLString(sql);

  return {
    [BRAND]: true,
    statement: { marker: 'from another copy' },
    bindMetadata,
    canProduceResult,
  };
}


/* Run the given function and report either what it returned or the message of
 * the error it raised, so that a failure is reported as a wrong value instead
 * of aborting the test. */
function outcome(fn) {
  try {
    return fn();
  } catch (err) {
    return `error: ${err.message}`;
  }
}


/******************************************************************************/


export const name = "Statement Identity";


setupDatabase();


/******************************************************************************/


aegis.test`Statements From Another Copy`(async (state) => {
  const ctx = state.ctx;
  const foreign = foreignStatement('SELECT * FROM Users WHERE userId = 1;');

  // Sanity check on the fixture itself; if this were true, the checks below
  // would not be testing the brand at all.
  $.check`foreign statement is not an instance of this copy's class`(
    $.eq(foreign instanceof SQLStatement, false)
  );

  // The custom check registered by the aegis helper is what tests use to assert
  // on statements, so it has to recognise them too.
  $.check`isStatement check accepts a foreign statement`(
    $.isStatement(foreign)
  );

  // A foreign statement used as input must be executed as given rather than
  // being treated as an object of bind values.
  $.check`foreign statement is used as a statement`(
    $.eq(
      outcome(() => dbPrepareStatements(ctx.env.DB, 'identity_one', foreign).statement.marker),
      'from another copy'
    )
  );

  // The same must hold when the foreign statement is one of several inputs.
  $.check`foreign statement works alongside local ones`(
    $.eq(
      outcome(() => {
        const prepared = dbPrepareStatements(ctx.env.DB, 'identity_two',
          foreign,
          'SELECT * FROM Users WHERE userId = 2;');

        return prepared.map(stmt => stmt.statement.marker ?? 'local').join(',');
      }),
      'from another copy,local'
    )
  );
});


/******************************************************************************/


aegis.test`Ordinary Objects Are Not Statements`(async (state) => {
  const ctx = state.ctx;

  /* The brand must not make ordinary objects look like statements; binding
   * still has to work, and objects that are not ours are still bind values. */
  $.check`an object without the brand is still treated as bind values`(
    $.eq(
      outcome(() => dbPrepareStatements(ctx.env.DB, 'identity_three', { userId: 1 })),
      'error: bind arguments given before statement in input list'
    )
  );

  $.check`a local statement can still be bound`(
    $.eq(
      outcome(() => dbPrepareStatements(ctx.env.DB, 'identity_four',
        'SELECT * FROM Users WHERE userId = ?;',
        [1]).bindMetadata.argCount),
      1
    )
  );
});


/******************************************************************************/


teardownDatabase();


/******************************************************************************/
