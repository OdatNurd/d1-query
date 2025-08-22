/******************************************************************************/


import { SQLStatement, SQLBindError, mapBinds } from '@odatnurd/d1-query';


/******************************************************************************/


/* A cache of statements that have been prepared; the primary key here is the
 * DB that the statement was prepared for. We're using a weak key here, even
 * though in D1 the DB context should never go away while the worker is
 * actively running.
 *
 * Values in here are maps that are keyed on the processed SQL objects. */
const dbCache = new WeakMap();


/******************************************************************************/


/* Fo the work of preparing the SQL that was imported and converted so that it
 * can be executed on the given database.
 *
 * This utilizes the cache so that it only prepares statements if it has never
 * done so before, and also handlings any binding that needs to be done based on
 * the given binds, if any. */
export function prepare(db, processedSQL, bindableIndices, ...binds) {
  // Get the cache specific to this database handle, creating one if there is
  // not already one. We then pull it out and alias it as the statement cache.
  if (dbCache.has(db) === false) {
    dbCache.set(db, new Map());
  }
  const statementCache = dbCache.get(db);

  // If the statement cache does not have an entry for this SQL, then prepare it
  // now and add it to the cache.
  if (statementCache.has(processedSQL) === false) {
    const prepared = processedSQL.map(info => {
      return new SQLStatement(db.prepare(info.sql), info.bindMetadata);
    });
    statementCache.set(processedSQL, prepared);
  }

  // Get the prepared statements out of the cache.
  const statements = statementCache.get(processedSQL);

  // When there are no binds, we can return back directly. If there is only one
  // statement, return it directly instead of in an array.
  if (binds.length === 0) {
    return statements.length === 1 ? statements[0] : statements;
  }

  // If the number of binds is not the same as the number of bindable statements
  // the only way forward is if there is a single statement, in which case bind
  // the statement once for each of the binds we were given; otherwise this is
  // an error due to the mismatch.
  if (binds.length !== bindableIndices.length) {
    if (statements.length === 1 && statements[0].bindMetadata.argCount > 0) {
      const boundStmts = binds.map(bindValue => {
        const orderedBinds = mapBinds(statements[0].bindMetadata, bindValue);
        const newD1Stmt = statements[0].statement.bind(...orderedBinds);
        return new SQLStatement(newD1Stmt, statements[0].bindMetadata);
      });
      return boundStmts.length === 1 ? boundStmts[0] : boundStmts;
    }

    throw new SQLBindError(`query file contains ${bindableIndices.length} bindable statements, but ${binds.length} bind(s) provided`);
  }

  // There is one bind per statement that needs one, so create a new array of
  // statements, binding as needed on the statements that take binds.
  let bindIndex = 0;
  const boundStmts = statements.map((stmt, i) => {
    if (bindableIndices.includes(i)) {
      const bindValue = binds[bindIndex++];
      const orderedBinds = mapBinds(stmt.bindMetadata, bindValue);
      const newD1Stmt = stmt.statement.bind(...orderedBinds);
      return new SQLStatement(newD1Stmt, stmt.bindMetadata);
    }
    return stmt;
  });

  return statements.length === 1 ? boundStmts[0] : boundStmts;
};


/******************************************************************************/
