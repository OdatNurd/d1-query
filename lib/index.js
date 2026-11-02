/******************************************************************************/


export {
  SQLSyntaxError,
  SQLBindError
} from './errors.js';


/* The supported API is the database helpers, the SQLStatement type handed back
 * by them, the error types they raise and the bind style constants that name
 * what a statement expects.
 *
 * processSQLString() and mapBinds() are exported because the Rollup plugin uses
 * them; they are deliberately undocumented and carry no compatibility promise.
 *
 * Everything a caller needs from a statement is visible through SQLStatement,
 * and its internals are meant to stay opaque. */
export {
  BIND_STYLE_ANONYMOUS,
  BIND_STYLE_NUMBERED,
  BIND_STYLE_NAMED,
  SQLStatement,
  processSQLString,
  mapBinds
} from './statement.js';


export {
  dbPrepareStatements,
  dbRawQuery,
  dbFetch,
  dbFetchOne,
  dbFetchFirst
} from './query.js';


/******************************************************************************/
