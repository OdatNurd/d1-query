/******************************************************************************/


/* Examine all of the keys in the passed in object and return the list of keys
 * that are named as boolean keys, returning them as a list. The returned list
 * may be empty. */
const boolNameKeysOf = o => Object.keys(o).filter(k => k.match(/^is[A-Z]/));


/******************************************************************************/


/* Examine all of the keys in the passed in object to find those that are named
 * as if their values are booleans and modify them in place.
 *
 * Such fields are expected to have an integer value, which is converted into a
 * boolean.
 *
 * D1 supports sending a boolean into the DB and will coerce it into an integer
 * value, but does not convert them back to booleans on the way out. */
const boolifyIntFields = inputObj => {
  for (const key of boolNameKeysOf(inputObj)) {
    inputObj[key] = inputObj[key] !== 0;
  }
  return inputObj;
}


/******************************************************************************/


/* Given the action being taken, the result of a D1 query, and an optional
 * separator string, generate a log message that provides details on the result.
 *
 * This provides some locus information on the queries being performed, as well
 * as statistics on how they performed, which is helpful for tracing and tuning
 * of the code and DB schema. */
function logD1Result(action, result, sep) {
  // Default the separator there is not one.
  sep ??= '';

  // Alias the result meta section for easier access
  const m = result.meta;

  // Pull out the key information from the object.
  const duration = `[${m.duration}ms]`;
  const status = `${result.success ? ' OK ' : 'FAIL'}`;
  const stats = `last_row_id=${m.last_row_id}, reads=${m.rows_read ?? '?'}, writes=${m.rows_written ?? '?'}`

  // Result set size is special since the result can end up being null.
  const count = `, resultSize=${result.results !== null ? result.results.length : 'null'}`

  // Log it.
  console.log(`${duration} ${sep} ${action} : ${status} : ${stats}${count}`);
}


/******************************************************************************/


/* Given a database binding and an array of sqlargs (see below), return back a
 * prepared statement or statements ready to be executed on the given database.
 *
 * The provided sqlargs are an open ended array that can consist of:
 *   1. D1PreparedStatement instances from previously compiled SQL statements
 *   2. strings that contain SQL queries to be compiled
 *   3. arrays that contain parameter values to be bound to statements
 *
 * When an array is seen, it is presumed to associate with the statement that
 * preceded it in the list, and will be used to bind arguments to the statement
 * to control the execution. It is possible for multiple entries in a row to be
 * arrays, allowing you to bind two versions of the same statement at once if
 * desired.
 *
 * The return value is either a single prepared statement ready to execute, or
 * an array of prepared statements, depending on whether or not the input array
 * contains information for more than one statement or not. */
export function dbPrepareStatements(db, ...sqlargs) {
  const statements = [];

  // The last seen statement in the input, and whether or not it has been pushed
  // at least once onto the output statement list.
  let lastStatement = null;
  let pushed = false;

  // Iterate over all of the input arguments and handle them.
  //
  // Arrays hold values to be bound to the most recently seen statement in the
  // input, but this causes an error if no statement has been seen yet.
  //
  // Everything else is either a previously compiled statement or a string that
  // need to be compiled into one. In both cases we store that this is the last
  // seen statement but don't push it right away because an array might bind to
  // it.
  for (const arg of sqlargs) {
    if (Array.isArray(arg) === true) {
      if (lastStatement !== null) {
        statements.push(lastStatement.bind(...arg));
        pushed = true;
      } else {
        throw new Error('bind arguments given before statement in input list')
      }
    } else {
      const newStatement = (typeof arg === "string") ? db.prepare(arg) : arg;
      if (lastStatement !== null && pushed === false) {
        statements.push(lastStatement);
      }

      lastStatement = newStatement;
      pushed = false;
    }
  }

  // If there is a last statement but it hasn't been pushed yet, push it now.
  if (lastStatement !== null && pushed === false) {
    statements.push(lastStatement);
  }

  // If we ended up with no statements, that is an error
  if (statements.length === 0) {
    throw new Error('no statements provided to dbPrepareStatements()');
  }

  // Return either a single statement or the set, depending on the length. This
  // is a convenience for easily preparing single statements without having to
  // destructure on the calling end.
  return statements.length === 1 ? statements[0] : statements;
}


/******************************************************************************/


/* Take as arguments the database in use, either a single prepared statement or
 * an array of prepared statements, and an indication of what is making the
 * query, and perform it.
 *
 * A single statement is executed normally while an array is executed as a batch
 * of queries.
 *
 * Logs will be generated outlining the results, and the results will be
 * returned back.
 *
 * The returned results have the D1 metadata stripped from them, so that they're
 * more useful to the caller. */
export async function dbRawQuery(db, statements, action) {
  let resultSet = undefined;

  // Execute either as a batch or as a single statement.
  if (Array.isArray(statements) === true) {
      resultSet = await db.batch(statements);
  } else {
      resultSet = await statements.all();
  }

  // If the result set is an array, then this is a batch operation, so we need
  // to generate a log once for each item in the batch.
  if (Array.isArray(resultSet)) {
    for (const item of resultSet) {
      logD1Result(action, item, '  =>');
    }

    // Unfold the results so the caller gets the usable data.
    return resultSet.map(item => item.results.map(i => boolifyIntFields(i)));
  }

  // Single result set, so log it and return the inner result back.
  logD1Result(action, resultSet);
  return resultSet.results.map(item => boolifyIntFields(item));
}


/******************************************************************************/


/* Execute a fetch operation on the provided database, using the data in sqlargs
 * to create the statement(s) to be executed, and return the result(s) of the
 * query after logging statistics such as the rows read and written, which will
 * be annotated with the action string provided to give context to the
 * operation.
 *
 * The provided sqlargs is a variable length list of arguments that consists of
 * strings to be compiled to SQL, previously compiled statements, and/or arrays
 * of values to bind to statements.
 *
 * For the purposes of binding, arrays will bind to the most recently seen
 * statement, allowing you to compile one statement and bind it multiple times
 * if desired.
 *
 * When more than one statement is provided, all statements will be executed as
 * a batch operation, which implicitly runs as a transaction.
 *
 * The return value is the direct result of executing the query or queries given
 * in sqlargs; this is either a (potentially empty) array of result rows, or an
 * array of such arrays (if a batch). */
export async function dbFetch(db, action, ...sqlargs) {
  const statements = dbPrepareStatements(db, ...sqlargs);
  return await dbRawQuery(db, statements, action);
}


/******************************************************************************/


/* This executes as dbFetch() does, except that the return value is either
 * the first element of the result, or null if the result did not contain any
 * rows.
 *
 * When executed on a batch statement this will return the entire result set of
 * the first query in the batch, which may or may not be what you expect. */
export async function dbFetchOne(db, action, ...sqlargs) {
  const result = await dbFetch(db, action, ...sqlargs);
  return (result.length >= 1) ? result[0] : null;
}


/******************************************************************************/

