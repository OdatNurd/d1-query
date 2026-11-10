import { aegis, $ } from "@axel669/aegis";

import fs from 'fs-jetpack';
import "./aegis_setup.js";


/******************************************************************************/


/* Every module in the shipped source; imports that are never used mean either a
 * leftover from a refactor or a module that is loaded for no reason. */
const SOURCE_FILES = [
  'lib/errors.js',
  'lib/index.js',
  'lib/query.js',
  'lib/statement.js',
  'aegis/index.js',
  'rollup/rollup-plugin.js',
  'rollup/rollup-plugin-helper.js',
];


/* The names brought into scope by the import statements in a module, paired
 * with the local name that the module body would use for them. */
function importedNames(source) {
  const names = [];
  const importRe = /^import\s+(?:(\w+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s*['"][^'"]+['"];?/gm;

  let match;
  while ((match = importRe.exec(source)) !== null) {
    if (match[1] !== undefined) {
      names.push(match[1]);
    }

    if (match[2] !== undefined) {
      for (const specifier of match[2].split(',')) {
        const name = specifier.trim().split(/\s+as\s+/).pop().trim();
        if (name !== '') {
          names.push(name);
        }
      }
    }
  }

  return names;
}


/* The imported names that the module body never mentions; the import statements
 * themselves are removed before looking so that the import can not count as a
 * use of the name it brings in. */
function unusedImports(source) {
  const body = source.replace(/^import\b[\s\S]*?from\s*['"][^'"]+['"];?/gm, '');

  return importedNames(source)
    .filter(name => new RegExp(`\\b${name}\\b`).test(body) === false);
}


/******************************************************************************/


export const name = "Source Hygiene";


/******************************************************************************/


aegis.test`Unused Imports`(() => {
  const found = [];

  for (const file of SOURCE_FILES) {
    const source = fs.read(file, 'utf8');

    for (const name of unusedImports(source)) {
      found.push(`${file}: ${name}`);
    }
  }

  $.check`no module imports a name it does not use`(
    $.isArray(found),
    $.eq(found.length, 0)
  );
});


/******************************************************************************/
