import { aegis, $ } from "@axel669/aegis";

import fs from 'fs-jetpack';
import "./aegis_setup.js";


/******************************************************************************/


/* The package manifest, read once for all of the checks here; these are checks
 * on the package metadata rather than on the running database code, so no
 * database is used. */
const pkg = JSON.parse(fs.read('package.json', 'utf8'));


/* The package.json manifest does not use module specifiers, so the leading
 * "./" that the exports map requires is not expected (or allowed) in main. */
const entryFile = path => (path ?? '').replace(/^\.\//, '');


/******************************************************************************/


export const name = "Package Metadata";


/******************************************************************************/


aegis.test`Entry Points`(() => {
  const main = entryFile(pkg.main);
  const dotExport = entryFile(pkg.exports?.['.']);

  /* Both entry points that consumers can arrive through must name the same
   * module, otherwise the package resolves to different code depending on how
   * it was loaded. */
  $.check`main matches the "." export`(
    $.eq(main, dotExport)
  );

  $.check`the "." export is the library index`(
    $.eq(dotExport, 'lib/index.js')
  );
});


/******************************************************************************/


aegis.test`Peer Dependencies`(() => {
  // Any metadata entry must be a plain optional flag; a stray key means the
  // intent is recorded somewhere npm will not read it.
  const malformed = Object.entries(pkg.peerDependenciesMeta ?? {})
    .filter(([, meta]) => JSON.stringify(meta) !== JSON.stringify({ optional: true }))
    .map(([name]) => name);

  $.check`every peerDependenciesMeta entry is an optional flag`(
    $.isArray(malformed),
    $.eq(malformed.length, 0)
  );

  // Every peer is optional here; the package is usable without any of the
  // testing helpers, and miniflare only comes up when using them.
  const notOptional = Object.keys(pkg.peerDependencies ?? {})
    .filter(name => pkg.peerDependenciesMeta?.[name]?.optional !== true);

  $.check`every peer dependency is marked optional`(
    $.isArray(notOptional),
    $.eq(notOptional.length, 0)
  );

  // Nothing in the package imports these, so declaring them asks consumers to
  // install something that will never be loaded.
  const unused = ['json5', 'smol-toml']
    .filter(name => ['dependencies', 'devDependencies', 'peerDependencies']
      .some(section => pkg[section]?.[name] !== undefined));

  $.check`unused dependencies are not declared`(
    $.isArray(unused),
    $.eq(unused.length, 0)
  );
});


/******************************************************************************/


aegis.test`Build Scripts`(() => {
  const pretest = pkg.scripts?.pretest ?? null;
  const prepublishOnly = pkg.scripts?.prepublishOnly ?? null;

  /* The vendored SQL parser is a build artifact that is not committed, so the
   * build has to run before anything tries to test or publish the package. */
  $.check`tests build the vendored parser first`(
    $.neq(pretest, null),
    $.eq(pretest.includes('build:vendor'), true)
  );

  $.check`publishing builds the vendored parser first`(
    $.neq(prepublishOnly, null),
    $.eq(prepublishOnly.includes('build:vendor'), true)
  );
});


/******************************************************************************/
