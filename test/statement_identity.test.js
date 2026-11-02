import { Collection, $check, $ } from "@axel669/aegis";

import { dbPrepareStatements } from "../lib/query.js";
import { processSQLString, SQLStatement } from "../lib/statement.js";


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
 * of aborting the section. */
function outcome(fn) {
  try {
    return fn();
  } catch (err) {
    return `error: ${err.message}`;
  }
}


/******************************************************************************/


export default Collection`Statement Identity`({
  /* A statement object that came from a different copy of the library must
   * still be recognised as a statement, and not mistaken for an object of bind
   * values; the generated code and the application can otherwise each hold
   * their own copy of the library. */
  "Statements From Another Copy": async ({ runScope: ctx }) => {
    const foreign = foreignStatement('SELECT * FROM Users WHERE userId = 1;');

    // Sanity check on the fixture itself; if this were true, the checks below
    // would not be testing the brand at all.
    $check`foreign statement is not an instance of this copy's class`
      .value(foreign instanceof SQLStatement)
      .eq($, false);

    // The custom check registered by the aegis helper is what tests use to
    // assert on statements, so it has to recognise them too.
    $check`isStatement check accepts a foreign statement`
      .value(foreign)
      .isStatement($);

    // A foreign statement used as input must be executed as given rather than
    // being treated as an object of bind values.
    $check`foreign statement is used as a statement`
      .value(outcome(() => dbPrepareStatements(ctx.env.DB, 'identity_one', foreign).statement.marker))
      .eq($, 'from another copy');

    // The same must hold when the foreign statement is one of several inputs.
    $check`foreign statement works alongside local ones`
      .value(outcome(() => {
        const prepared = dbPrepareStatements(ctx.env.DB, 'identity_two',
          foreign,
          'SELECT * FROM Users WHERE userId = 2;');

        return prepared.map(stmt => stmt.statement.marker ?? 'local').join(',');
      }))
      .eq($, 'from another copy,local');
  },


  /****************************************************************************/

  /* The brand must not make ordinary objects look like statements; binding
   * still has to work the way it did, and objects that are not ours are still
   * bind values. */
  "Ordinary Objects Are Not Statements": async ({ runScope: ctx }) => {
    $check`an object without the brand is still treated as bind values`
      .value(outcome(() => dbPrepareStatements(ctx.env.DB, 'identity_three', { userId: 1 })))
      .eq($, 'error: bind arguments given before statement in input list');

    $check`a local statement can still be bound`
      .value(outcome(() => dbPrepareStatements(ctx.env.DB, 'identity_four',
        'SELECT * FROM Users WHERE userId = ?;',
        [1]).bindMetadata.argCount))
      .eq($, 1);
  },
});


/******************************************************************************/
