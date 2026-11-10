import { aegis, $ } from "@axel669/aegis";

import path from 'node:path';
import { pathToFileURL } from 'node:url';

import fs from 'fs-jetpack';

import { processSQLString } from '../lib/index.js';


/******************************************************************************/


export const name = "Rollup Helper Cache";


/******************************************************************************/


/* The helper imports the library by package name, which does not resolve inside
 * this checkout, so the test stages a copy pointed at the library's own entry
 * point. The copy is otherwise the file that ships. */
const STAGE_DIR = 'test/tmp helper';


async function stageHelper() {
  fs.remove(STAGE_DIR);

  const libraryUrl = pathToFileURL(path.resolve('lib/index.js')).href;
  const source = fs.read('rollup/rollup-plugin-helper.js', 'utf8')
    .replace("'@odatnurd/d1-query'", `'${libraryUrl}'`);

  const file = path.join(STAGE_DIR, 'rollup-plugin-helper.js');
  fs.write(file, source);

  return await import(`${pathToFileURL(path.resolve(file)).href}?${Date.now()}`);
}


/* A stand-in for a D1 binding that records the SQL prepared against it. A
 * prepared statement can be bound and reports what it was given, which is
 * enough to see whether a cached statement was re-used or made fresh. */
function trackingDb(name) {
  const prepared = [];

  return {
    name,
    prepared,
    prepare(sql) {
      prepared.push(sql);
      return {
        sql,
        bind: (...binds) => ({ sql, binds }),
      };
    },
  };
}


/******************************************************************************/


/* The cache lives for as long as a database handle does. That is the scope D1
 * allows: a prepared statement belongs to the handle that created it, and a
 * Worker gets a new handle for each request, so the statements are prepared
 * once per statement per request and never re-parsed. */
aegis.test`Cache Scope`(async () => {
  const sqlInfo = processSQLString('SELECT * FROM Users WHERE userId = ?;', 'helper_cache.sql', true);
  const bindables = [0];

  const dbA = trackingDb('a');
  const dbB = trackingDb('b');

  const seen = {};
  let helper;

  try {
    helper = await stageHelper();

    // Two calls with the same handle and no binds must produce the very same
    // statements, without preparing the SQL a second time.
    seen.sameHandleIdentity = helper.prepare(dbA, sqlInfo, bindables) ===
                              helper.prepare(dbA, sqlInfo, bindables);
    seen.preparationsForA = dbA.prepared.length;

    const fromA = helper.prepare(dbA, sqlInfo, bindables);
    const fromB = helper.prepare(dbB, sqlInfo, bindables);

    // A second handle is a second request; its statements are prepared
    // against it rather than borrowed from the first handle's cache.
    seen.differentHandles = fromA.statement !== fromB.statement;
    seen.preparationsForB = dbB.prepared.length;

    // Binding creates new statements but must not send the SQL back through
    // preparation.
    const bound = helper.prepare(dbA, sqlInfo, bindables, [7]);
    seen.boundValue = bound.statement.binds?.[0];
    seen.preparationsForAAfterBind = dbA.prepared.length;
  } finally {
    fs.remove(STAGE_DIR);
  }

  $.check`same handle returns the same statements`(
    $.eq(seen.sameHandleIdentity, true)
  );

  $.check`same handle prepares the SQL once`(
    $.eq(seen.preparationsForA, 1)
  );

  $.check`a second handle gets its own statements`(
    $.eq(seen.differentHandles, true)
  );

  $.check`a second handle prepares the SQL once`(
    $.eq(seen.preparationsForB, 1)
  );

  $.check`binding does not prepare the SQL again`(
    $.eq(seen.preparationsForAAfterBind, 1)
  );

  $.check`binds are applied to the cached statement`(
    $.eq(seen.boundValue, 7)
  );
});


/******************************************************************************/
