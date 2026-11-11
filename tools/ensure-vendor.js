/******************************************************************************/


import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';


/******************************************************************************/


// Get the root of the package, which is the parent of the folder that this file
// is inside of.
const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

// The name of the build artifact.
const ARTIFACT = 'lib/sqlite.js';

// The files that contribute to the build artifact.
const HASHED_INPUTS = [
  'vendor/parser.js',
  'rollup.vendor.config.js',
  'pnpm-lock.yaml',
  'node_modules/sql-parser-cst/package.json',
  'tools/ensure-vendor.js',
];

// The name of a cache file to use to see if we need to build the output file
// or not.
const CACHE_VERSION = 1;
const CACHE_FILE = path.join(ROOT, 'node_modules', '.cache', 'd1-query', 'sqlite-build.json');


/******************************************************************************/


/* Grab the content of a JSON file and return it back as a decoded object.
 *
 * If there are any errors in this process, null is returned. */
async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return null;
  }
}


/******************************************************************************/


/* Create and return a SHA-256 hex digest of the content of the given file.
 *
 * The file is assumed to be relative to the root of the project. */
async function hashFile(file) {
  return createHash('sha256')
    .update(await readFile(path.join(ROOT, file)))
    .digest('hex');
}


/******************************************************************************/


/* Compute a SHA-256 fingerpring representing the current state of the build
 * environment.
 *
 * This uses a schema version, the node version, the list of all of the files
 * that contribute to the build artifact for the parser, and any other files and
 * dependencies needed. */
async function buildFingerprint() {
  const hash = createHash('sha256');

  // Include our cache schema and the node version.
  hash.update(`schema:${CACHE_VERSION}\0`);
  hash.update(`node:${process.version}\0`);

  // Include the hashes for all of the tracked inputs.
  for (const file of HASHED_INPUTS) {
    hash.update(`file:${file}\0`);
    hash.update(await readFile(path.join(ROOT, file)));
    hash.update('\0');
  }

  // Load the package file.
  const pkg = await readJson(path.join(ROOT, 'package.json'));
  if (pkg === null) {
    console.error("Failed to load package.json. Make sure the file exists and is valid JSON.");
    process.exit(1);
  }

  // We want to include in the manifest the package manager used, the script
  // that does the build, and the development dependencies. Any of then could
  // have a potential impact on the resulting file.
  const buildManifest = {
    packageManager: pkg.packageManager,
    buildScript: pkg.scripts?.['build:vendor'],
    devDependencies: pkg.devDependencies,
  };

  // Include the object in the hash.
  hash.update('build-manifest\0');
  hash.update(JSON.stringify(buildManifest));
  hash.update('\0');

  return hash.digest('hex');
}


/******************************************************************************/


/* Trigger a build of the vendored SQLite parser now, via pnpm.
 *
 * If the build fails, this will stop the entire script from running.
 *
 * Note that this is really only tested under Linux, so lets hope that this code
 * I ripped off of the internet is smarter than I am. */
function runBuild() {
  // Determine the appropriate command, and then spawn it.
  const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const result = spawnSync(pnpm, ['run', 'build:vendor'], {
    cwd: ROOT,
    stdio: 'inherit',
  });

  // If it failed, then bomb.
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  // If it ran to completion but did not indicate success, then bail.
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}


/******************************************************************************/


/* Write out a cache file for the current project state. This ensures that the
 * location that we are going to try to write the file to actually exists.
 *
 * In order to be atomic, we wrte the file to a temporary file first before
 * putting it at the correct name when we're done, so that errors or our dumb
 * boneheaded code errors don't leave broken files laying around and make us
 * even more confused. */
async function writeCacheJSON(cacheData) {
  // Create a temporary version of the name.
  const temp = `${CACHE_FILE}.${process.pid}.tmp`;

  // Make sure the folder exists, write the file out, and then rename it.
  await mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await writeFile(temp, `${JSON.stringify(cacheData, null, 2)}\n`);
  await rename(temp, CACHE_FILE);
}


/******************************************************************************/


// Get the current fingerprint and the hash for the artifact, and then load the
// cache file.
const fingerprint = await buildFingerprint();
const artifactHash = await hashFile(ARTIFACT).catch(() => null);
const cache = await readJson(CACHE_FILE);

// If we're up to date, we're done.
if (artifactHash !== null && cache?.schema === CACHE_VERSION &&
    cache.fingerprint === fingerprint && cache.artifactHash === artifactHash) {
  console.log('Vendored SQLite parser is up to date.');
  process.exit(0);
}

// We need to produce the build.
console.log('Building vendored SQLite parser...');
runBuild();

// Get the hash for the output file; if this is not present, then something went
// awry during the build.
const builtArtifactHash = await hashFile(ARTIFACT).catch(() => null);
if (builtArtifactHash === null) {
  console.error('Vendor build did not produce lib/sqlite.js.');
  process.exit(1);
}

// We can write out the cache file now.
try {
  await writeCacheJSON({
    schema: CACHE_VERSION,
    fingerprint,
    artifactHash: builtArtifactHash,
    builtAt: new Date().toISOString(),
  });
} catch (error) {
  console.warn(
    `Vendored SQLite parser built, but the cache was not written: ${error.message}`
  );
}


/******************************************************************************/
