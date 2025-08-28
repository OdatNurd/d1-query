import { Collection, $check, $ } from "@axel669/aegis";
import { rollup } from 'rollup';
import rollupConfig from './rollup/rollup.config.js';
import { dbFetch } from "../lib/index.js";


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
      .isObject($)
      .isFunction($.single)
      .isFunction($.single_bindable)
      .isFunction($.fetchRoles)
      .isFunction($.fetchOneRole)
      .isFunction($.executeRole)
      .isFunction($.one_bindable)
      .isFunction($.two_bindable)
      .isFunction($.three_two_bindable)
      .isFunction($.create_roles)
      .isFunction($.insert_select)
      .isFunction($.insert_role)
      .isFunction($.executeInsertRole);
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
    // should produce a single statement back (which is not bound).
    $check`Single bindable with no binds specified`
      .call(() => ctx.queries.single_bindable(ctx.db))
      .isNotArray();

    // If we do the same thing and pass a single bind, we should get back a
    // single statement, because one bind.
    $check`Single bindable with one bind specified`
      .call(() => ctx.queries.single_bindable(ctx.db, { roleId: 69 }))
      .isNotArray();

    // If we pass two binds, we should get two statements, one per bind.
    $check`Single bindable with two binds specified`
      .call(() => ctx.queries.single_bindable(ctx.db,
                                              { roleId: 69 },
                                              { roleId: 70 }))
      .isArray()
      .eq($.length, 2);

    // A file with two statements and no binds should return 2 (unbound)
    // statements.
    $check`Two bindable with no binds`
      .call(() => ctx.queries.two_bindable(ctx.db))
      .isArray()
      .eq($.length, 2);

    // Since there are two statements, a single bind is an error.
    $check`Two bindable with one bind (error)`
      .call(() => ctx.queries.two_bindable(ctx.db, { roleId: 1 }))
      .throws($, 'query file contains 2 bindable statements, but 1 bind(s) provided');

    // With two statements and two binds, the return should be two statements.
    $check`Two bindable with two binds`
      .call(() => ctx.queries.two_bindable(ctx.db, { roleId: 1 }, { roleId: 2, roleName: 'test' }))
      .isArray()
      .eq($.length, 2);

    // WIth two statements, three binds is an error because it does not match.
    $check`Two bindable with three binds (error)`
      .call(() => ctx.queries.two_bindable(ctx.db, { roleId: 1 }, { roleId: 2, roleName: 'test' }, { roleId: 3 }))
      .throws($, 'query file contains 2 bindable statements, but 3 bind(s) provided');

    // With two statements and only one is bindable, we get two statements if
    // we don't provide any binds.
    $check`One bindable with no binds`
      .call(() => ctx.queries.one_bindable(ctx.db))
      .isArray()
      .eq($.length, 2);

    // With two statements and one bindable, a single bind still returns two
    // statements, but in this case the one that is bindable is bound.
    $check`One bindable with one bind`
      .call(() => ctx.queries.one_bindable(ctx.db, { roleName: 'bob' }))
      .isArray()
      .eq($.length, 2);

    // Providing two binds even though there are two statements is an error
    // because only one of them is bindable.
    $check`One bindable with two binds (error)`
     .call(() => ctx.queries.one_bindable(ctx.db, { roleName: 'bob' }, { roleName: 'jim' }))
     .throws($, 'query file contains 1 bindable statements, but 2 bind(s) provided');

    // Three statements with no binds returns three (unbound) statements.
    $check`Three with two bindable with no binds`
      .call(() => ctx.queries.three_two_bindable(ctx.db))
      .isArray()
      .eq($.length, 3);

    // Three staetments with two of them bindable is an error if only one bind
    // is provided.
    $check`Three with two bindable with one bind (error)`
      .call(() => ctx.queries.three_two_bindable(ctx.db, { roleId: 1 }))
      .throws($, 'query file contains 2 bindable statements, but 1 bind(s) provided');

    // When two binds are provied, this should succeed with three statements.
    $check`Three with two bindable with two binds`
      .call(() => ctx.queries.three_two_bindable(ctx.db, { roleId: 1 }, { roleId: 2, roleName: 'test' }))
      .isArray()
      .eq($.length, 3);

    // Three statements when two are bindable, but three binds, is an error.
    $check`Three with two bindable with three binds (error)`
      .call(() => ctx.queries.three_two_bindable(ctx.db, { roleId: 1 }, { roleId: 2, roleName: 'test' }, { roleId: 3 }))
      .throws($, 'query file contains 2 bindable statements, but 3 bind(s) provided');
  },


  /****************************************************************************/


  /* This set of tests validates the the content that was imported by the
   * rollup plugin tests behaves as expected when the statements are actually
   * executed. */
  "Raw Statement Execution": async ({ runScope: ctx }) => {
    // Test a simple single query; function returns a single statement; a
    // creation returns no result.
    await $check`Create Roles table`
      .value(dbFetch(ctx.db, 'create_roles', ctx.queries.create_roles(ctx.db)))
      .isArray()
      .eq($.length, 0);

    // Insert two roles to test with; the SQL is a single statement, but two
    // binds means that it's going to return an array, so we need to spread the
    // result.
    await $check`Insert initial roles`
      .value(dbFetch(ctx.db, 'insert_roles', ...ctx.queries.insert_role(ctx.db,
        { roleId: 1, roleName: 'Admin' },
        { roleId: 2, roleName: 'User' }
      )))
      .isArray()
      .eq($.length, 2)
      .eq($[0].length, 0)
      .eq($[1].length, 0);

    // Attempt to select a single role out; the single bind should return a
    // single statement, and thus not need to be spread.
    await $check`Select a single role`
      .value(dbFetch(ctx.db, 'select_role', ctx.queries.single_bindable(ctx.db, { roleId: 1 })))
      .isArray()
      .eq($.length, 1)
      .eq($[0].roleName, 'Admin');

    // A file with two statements should require two binds and return two
    // statements that need to be spread.
    await $check`Batch insert and select a role`
      .value(dbFetch(ctx.db, 'insert_select_role', ...ctx.queries.insert_select(ctx.db,
        { roleId: 3, roleName: 'Guest' },
        { roleId: 3 }
      )))
      .isArray()
      .eq($.length, 2)
      .eq($[1].length, 1)
      .eq($[1][0].roleName, 'Guest');

    // Validate that we get appropriate handling for transaction failures; this
    // should raise a uniqueness constrain because Admin exists, and not insert
    // the moderator role.
    await $check`Transaction rollback on failed batch insert`
      .call(() => dbFetch(ctx.db, 'insert_existing_role', ...ctx.queries.insert_role(ctx.db,
        { roleId: 1, roleName: 'Admin' }, // This one already exists
        { roleId: 4, roleName: 'Moderator' }
      )))
      .throws($, 'D1_ERROR: UNIQUE constraint failed: Roles.roleId: SQLITE_CONSTRAINT');

    // Validate that the transaction stopped the moderator from being inserted.
    await $check`Verify transaction rollback`
      .value(dbFetch(ctx.db, 'select_nonexistent_role', ctx.queries.single_bindable(ctx.db, { roleId: 4 })))
      .isArray()
      .eq($.length, 0);
  },


  /****************************************************************************/


  /* This set of tests validates the wrapper functions that the rollup plugin
   * generates work as expected. */
  "Wrapped Statement Execution": async ({ runScope: ctx }) => {
    // When there is a single bind, a single statement is executed; the wrapper
    // should return a single result without complaint.
    await $check`fetch() with a single statement`
      .value(ctx.queries.fetchRoles(ctx.db, 'fetch_single_role', { roleId: 1 }))
      .isArray()
      .eq($.length, 1)
      .eq($[0].roleName, 'Admin');

    // When there are two binds, there are two statements to execute; this
    // should still seamlessly work.
    await $check`fetch() with multiple binds`
      .value(ctx.queries.fetchRoles(ctx.db, 'fetch_multiple_roles', { roleId: 1 }, { roleId: 2 }))
      .isArray()
      .eq($.length, 2)
      .eq($[0][0].roleName, 'Admin')
      .eq($[1][0].roleName, 'User');

    // The fetchOne() wrapper works like the fetch wrapper, so it should work with
    // a single bind.
    await $check`fetchOne() with a single statement`
      .value(ctx.queries.fetchOneRole(ctx.db, 'fetchOne_single_role', { roleId: 1 }))
      .isNotArray()
      .eq($.roleName, 'Admin');

    // If there are multiple binds, then there would be multiple statements, but
    // this should still return only a single item.
    await $check`fetchOne() with multiple binds`
      .value(ctx.queries.fetchOneRole(ctx.db, 'fetchOne_multiple_roles', { roleId: 1 }, { roleId: 2 }))
      .isArray()
      .eq($.length, 1)
      .eq($[0].roleName, 'Admin');

    // Execution of a single statement results in nothing.
    await $check`execute() with a single statement`
      .value(ctx.queries.executeRole(ctx.db, 'execute_single_role', { roleId: 1 }))
      .eq($, undefined);

    // Still nothing with multiple binds in the batch, but this verifies that
    // the wrapper correctly handles having to execute multiple statments.
    await $check`execute() with multiple binds`
      .value(ctx.queries.executeRole(ctx.db, 'execute_multiple_roles', { roleId: 1 }, { roleId: 2 }))
      .eq($, undefined);
  }
});


/******************************************************************************/
