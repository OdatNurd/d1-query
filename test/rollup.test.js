import { Collection, $check, $ } from "@axel669/aegis";
import { rollup } from 'rollup';
import rollupConfig from '../rollup/rollup.config.js';


/******************************************************************************/


/* Programatically invoke rollup to generate the defined output module so that
 * we can use it in our tests.
 *
 * This returns the created bundle object, so that the test has something to
 * test against. */
async function runRollupBuild() {
  const bundle = await rollup(rollupConfig);
  await bundle.write(rollupConfig.output);
  await bundle.close();

  return bundle;
}


/* Given the overall test context and the name of the module that was generated
 * by the rollup run, import all of the queries from the generated module and
 * return them back.
 *
 * This relies on all of the queries being exported from the module by name,
 *
 * The queries are also placed into the context so that they can be executed
 * later. */
async function importQueries(ctx, filename) {
  const queries = await import(`../${filename}?${Date.now()}`);

  // Convert from a module to an object, store it into the context so we can
  // invoke later, and then return it.
  ctx.queries = { ...queries };
  return ctx.queries;
}


/******************************************************************************/


export default Collection`Rollup Plugin`({
  /* This set of tests exercises the rollup plugin to ensure that it works as
   * expected and can generate an output file which can be imported and which
   * will contain the desired symbols. */
  "File Generation": async ({ runScope: ctx }) => {
    // Invoking rollup to perform the build should result in a bundle; we only
    // care that it doesn't throw an error, so the test here just ensures that
    // it counts as a test for Aegis.
    await $check`Execute rollup build`
      .call(() => runRollupBuild())
      .instanceof($, Object);

    // We should be able to import the queries and end up with an object; this
    // is also placed into the context as queries.
    await $check`Import bundled SQL`
      .value(importQueries(ctx, rollupConfig.output.file))
      .instanceof($, Object);

    // Test that the file contains the queries that we expect it to.
    $check`Query functons imported`
      .value(ctx.queries)
      .instanceof($, Object)
      .instanceof($.single, Function)
      .instanceof($.single_bindable, Function);
  },


  /****************************************************************************/


  /* This set of tests validates the the content that was imported by the
   * rollup plugin tests behaves as expected. */
  "Statement Binding": async ({ runScope: ctx }) => {
    // Verify that caching works; we should be able to invoke the query function
    // twice in a row and get the exact same object each time due to the cache
    // and the fact that we are not binding anything.
    $check`Validate statement cache`
      .value(ctx.queries.single(ctx.db) === ctx.queries.single(ctx.db))
      .eq($, true);

    // An attempt to bind when the statement has no bind arguments should raise
    // an error, because this is invalid.
    $check`Binding non-bindable statement`
      .call(() => ctx.queries.single(ctx.db, []))
      .throws($, 'query file contains 0 bindable statements, but 1 bind(s) provided');

    // A call to the module that contains a single statement with a single bind
    // should produce a single statement back.
    $check`Single bindable with no binds specified`
      .call(() => ctx.queries.single_bindable(ctx.db))
      .isArray()
      .eq($.length, 1);

    // If we do the same thing and pass a single bind, we should get back a
    // single statement, because one bind.
    $check`Single bindable with one bind specified`
      .call(() => ctx.queries.single_bindable(ctx.db, { userId: 69 }))
      .isArray()
      .eq($.length, 1);

    // If we pass two binds, we should get two statements, one per bind.
    $check`Single bindable with one bind specified`
      .call(() => ctx.queries.single_bindable(ctx.db,
                                              { userId: 69 },
                                              { userId: 70 }))
      .isArray()
      .eq($.length, 2);

    // Add tests for two statements that are bindable, with no binds, with one
    // bind, with two binds, with three binds.
    //
    // Add tests for two statements, one is bindable, with no binds, with one
    // bind, with two binds, with three binds.
    //
    // Add tests for three statements, two are bindable, with no binds, with
    // one bind, with two binds, with three binds.
    //
    // Add tests that actually execute these things
  },

});


/******************************************************************************/
