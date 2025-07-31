/******************************************************************************/


import { readFileSync } from 'fs';
import Parser from 'node-sql-parser';


/******************************************************************************/


/**
 * A Rollup plugin that allows for importing a SQL file directly in code,
 * returning a function which, when called, will return back a prepared version
 * of the statement or statements from the SQL file.
 *
 * The result of the import is a module with a default export of a function that
 * behaves as dbPrepareStatements(), except that the SQL is sourced from the
 * file that was imported.
 *
 * The resulting function is memoized on the DB that it is called with, such
 * that if multiple files import the same SQL, or if the function is called
 * more than once, the SQL does not have to be recompiled. */
export default function d1sql() {
  const sqlRegex = /\.sql$/;

  return {
    name: 'd1-sql-importer',

    load(id) {
      // Skip non-SQL files
      if (sqlRegex.test(id) === false) {
        return null;
      }

      // Read the SQL file and parse it into an Abstract Syntax Tree. This is
      // the same mechanism used by the test suite to load SQL for execution,
      // and ensures at compile time that the SQL is correct while also getting
      // around D1's potential issues with being confused by comments or
      // multiple statements in the input SQL.
      //
      // The output of astify is either a list of statements or just a single
      // statement, where each statement is an object. It transpires that what
      // makes statements is a semicolon, but the parser is not smart enough to
      // notice when a statement is empty, so you may or may not get an array
      // for a single statement depending on whether or not you put a semicolon
      // on the end of it.
      const fileContent = readFileSync(id, 'utf8');
      const parser = new Parser.Parser();
      let ast = parser.astify(fileContent, { database: "SQLite" });
      if (Array.isArray(ast) === false) {
        ast = [ast];
      }

      // We can put each statement back into a SQL string now.
      const statements = ast.map(statement => {
        return parser.sqlify(statement, { database: "SQLite" });
      });

      // Generate the code for the module.
      const code = `
import { dbPrepareStatements } from '@odatnurd/d1-query';

// A cache to store prepared statements, keyed by the DB instance.
const cache = new Map();

// The list of raw SQL statements.
const statements = ${JSON.stringify(statements)};

/**
 * Given a D1 Database object, prepare the statements from the imported
 * SQL file.
 *
 * The results are cached, so subsequent calls with the same DB object
 * will return the same prepared statements without recompiling.
 */
export default (db) => {
  // If we've already prepared these statements for this DB, return from cache.
  if (cache.has(db) === true) {
    return cache.get(db);
  }

  // Otherwise, prepare the statements, cache them, and then return them.
  const prepared = dbPrepareStatements(db, ...statements);
  cache.set(db, prepared);

  return prepared;
};
`;

      return {
        code: code,
        map: null
      };
    }
  };
}


/******************************************************************************/
