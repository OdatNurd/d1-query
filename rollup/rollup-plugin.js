/******************************************************************************/


import { readFileSync } from 'fs';
import {
  processSQLString,
  SQLStatement,
  SQLBindError,
  mapBinds
} from '../lib/index.js';


/******************************************************************************/


// Define a unique ID for the virtual module that holds the preparation code for
// the imported SQL. Per the documentation on plugins, the convention is to lead
// with a null byte to make sure other plugins don't try to process it.
const HELPER_MODULE_ID = '\0d1-sql-helpers';
const HELPER_MODULE_PATH = new URL('./rollup-plugin-helper.js', import.meta.url).pathname;


/******************************************************************************/


/**
 * A Rollup plugin that allows for importing a SQL file directly in code.
 *
 * At build time, it reads the SQL file, processes it using the same logic as
 * the main library (except allowing for multiple statements), and embeds the
 * rewritten SQL and its bind metadata into the generated module.
 *
 * The result of the import is a module with a default export of a function.
 * When you call this function with a D1 database instance, it returns either a
 * single prepared SQLStatement or an array of them, ready for execution.
 *
 * This function can also take optional binds, which will be applied to the
 * statements. There needs to be either exactly 1 bind for each statement that
 * requires them (and they wil be applied in order), or exactly one bindable
 * statement and any number of binds, and you will get back as many bound
 * copies of the statement as needed.
 */
export default function d1sql() {
  const sqlRegex = /\.sql$/;

  return {
    name: 'd1-sql-import',

    // Hook into the module resolver to see if someone is trying to resolve our
    // particular module or not. Using our virtual ID, we signal the module name
    // back if it's our module, so that we get invoked to load it.
    resolveId(id) {
      if (id === HELPER_MODULE_ID) {
        return id;
      }

      // Defer to other resolvers.
      return null;
    },

    load(id) {
      // Produce the source code for our virtual module, if someone tries to
      // load it.
      if (id === HELPER_MODULE_ID) {
        return readFileSync(HELPER_MODULE_PATH, 'utf-8');
      }

      // Skip non-SQL files
      if (sqlRegex.test(id) === false) {
        return null;
      }

      // Read the entire file content as a single string, then process it into
      // as many statements as the file content happens to contain. This gets
      // us an array of objects that contain the modified SQL and the metadata
      // on their binds (if any).
      const sqlContent = readFileSync(id, 'utf8');
      const statements = processSQLString(sqlContent, true);

      // Determine which of the statements in the processed statement array take
      // bind arguments.
      const bindableIndices = statements
        .map((info, index) => info.bindMetadata.argCount > 0 ? index : -1)
        .filter(index => index !== -1);

      // Generate module output for the file; this uses the helper module to
      // do the heavy lifting.
      return {
        code: `
import { prepare } from '${HELPER_MODULE_ID}';
import { dbFetch, dbFetchOne } from '@odatnurd/d1-query';

const sqlInfo = ${JSON.stringify(statements)};
const bindables = ${JSON.stringify(bindableIndices)};

export function statements(db, ...binds) {
  return prepare(db, sqlInfo, bindables, ...binds);
}

export async function fetch(db, action, ...binds) {
  const prepared = statements(db, ...binds);
  const args = Array.isArray(prepared) ? prepared : [prepared];
  return dbFetch(db, action, ...args);
}

export async function fetchOne(db, action, ...binds) {
  const prepared = statements(db, ...binds);
  const args = Array.isArray(prepared) ? prepared : [prepared];
  return dbFetchOne(db, action, ...args);
}

export async function execute(db, action, ...binds) {
  const prepared = statements(db, ...binds);
  const args = Array.isArray(prepared) ? prepared : [prepared];
  await dbFetch(db, action, ...args);
}

export default statements;
`,
        map: null
      };
    }
  };
}


/******************************************************************************/
