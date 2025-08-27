/******************************************************************************/


import { readFileSync } from 'fs';
import { processSQLString } from '../lib/query.js';


/******************************************************************************/


/**
 * A Rollup plugin that allows for importing a SQL file directly in code.
 *
 * At build time, it reads the SQL file, processes it using the same logic as
 * the main library (allowing for multiple statements), and embeds the rewritten
 * SQL and its bind metadata into the generated module.
 *
 * The result of the import is a module with a default export of a function.
 * When you call this function with a D1 database instance, it returns either a
 * single prepared SQLStatement or an array of them, ready for execution.
 */
export default function d1sql() {
  const sqlRegex = /\.sql$/;

  return {
    name: 'd1-sql-importer',

    load(id) {
      // Skip non-SQL files
      if (sqlRegex.test(id) === false) {
        return null;
      }

      // Read the entire file content as a single string.
      const fileContent = readFileSync(id, 'utf8');

      // Using the internal handler, process the SQL into a series of objects
      // Process the SQL, allowing for multiple statements. This will return an
      // array of objects, each with the rewritten SQL and its bind metadata.
      const processedStatements = processSQLString(fileContent, true);

      // Generate the code for the module that will be imported by the user.
      const code = `
import { SQLStatement } from '@odatnurd/d1-query';

// A cache to store prepared statements, keyed by the DB instance.
const cache = new Map();

// The processed statements and their metadata, embedded at build time.
const processedStatements = ${JSON.stringify(processedStatements, null, 2)};

/**
 * Given a D1 Database object, prepares the statements from the imported
 * SQL file. The results are cached for performance.
 */
export default (db) => {
  // If we've already prepared these statements for this DB, return from cache.
  if (cache.has(db)) {
    return cache.get(db);
  }

  // For each processed statement, prepare it with D1 and wrap it in our custom
  // SQLStatement class with its corresponding metadata; this mimics the
  // API that prepares statements.
  const statements = processedStatements.map(info => {
    const prepared = db.prepare(info.sql);
    return new SQLStatement(prepared, info.bindMetadata);
  });

  // If the original file had only one statement, return a single object
  // to match the behavior of dbPrepareStatements. Otherwise, return the array.
  const result = statements.length === 1 ? statements[0] : statements;

  cache.set(db, result);
  return result;
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
