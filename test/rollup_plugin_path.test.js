import { Collection, $check, $ } from "@axel669/aegis";

import path from 'node:path';
import { pathToFileURL } from 'node:url';

import fs from 'fs-jetpack';
import { rollup } from 'rollup';


/******************************************************************************/


/* The plugin locates its helper module relative to its own file, so the only
 * way to exercise an install path that contains a space is to place a copy of
 * the plugin somewhere that has one. This directory is created for the test and
 * removed once it is done. */
const SPACE_PATH = 'test/tmp plugin space';


/* Copy the plugin and its helper into the space containing directory; the
 * helper must sit beside the plugin because that is where the plugin looks for
 * it. */
function stagePluginIn(dir) {
  fs.remove(dir);

  // The plugin imports the library relative to its own file, which would break
  // for a copy in another directory, so the copy is pointed at the real module.
  // That leaves the lookup of the helper module, which is derived from the
  // plugin's own location, as the only thing under test here.
  const libraryUrl = pathToFileURL(path.resolve('lib/index.js')).href;
  const pluginSource = fs.read('rollup/rollup-plugin.js', 'utf8')
    .replace("'../lib/index.js'", `'${libraryUrl}'`);

  fs.write(path.join(dir, 'rollup-plugin.js'), pluginSource);
  fs.copy('rollup/rollup-plugin-helper.js', path.join(dir, 'rollup-plugin-helper.js'));
}


/* Import the staged plugin and use it to bundle the SQL test module, returning
 * the generated code; if the plugin cannot locate its helper module, this is
 * where the build fails. */
async function buildWithStagedPlugin(dir) {
  const pluginUrl = pathToFileURL(path.resolve(dir, 'rollup-plugin.js')).href;
  const { default: d1sql } = await import(`${pluginUrl}?${Date.now()}`);

  const bundle = await rollup({
    input: 'test/rollup/sqlTest.js',
    external: ['@odatnurd/d1-query'],
    plugins: [d1sql()],
  });

  try {
    const { output } = await bundle.generate({ format: 'es' });
    return output[0].code;
  } finally {
    await bundle.close();
  }
}


/******************************************************************************/


export default Collection`Rollup Plugin Paths`({
  /* The generated module imports the helper by an absolute path that the plugin
   * derives from its own location. A pathname taken straight from a file URL is
   * percent encoded, so a space in the install path produces a path that does
   * not exist and the build fails to resolve it. */
  "Paths With Spaces": async ({ runScope: ctx }) => {
    let code = null;
    let error = null;

    stagePluginIn(SPACE_PATH);
    try {
      code = await buildWithStagedPlugin(SPACE_PATH);
    } catch (err) {
      error = err;
    } finally {
      fs.remove(SPACE_PATH);
    }

    $check`plugin builds when its path contains a space`
      .value(error)
      .eq($, null);

    $check`generated module does not reference a percent encoded path`
      .value(code ?? '')
      .eq($.includes('%20'), false);
  },
});


/******************************************************************************/
