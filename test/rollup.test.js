import { aegis, $ } from "@axel669/aegis";
import { rollup } from 'rollup';
import fs from 'fs-jetpack';

import rollupConfig from './rollup/rollup.config.js';
import { dbFetch } from "../lib/index.js";
import { setupDatabase, teardownDatabase, caught } from "./aegis_setup.js";


/******************************************************************************/


export const name = "Rollup Plugin";


setupDatabase();


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


/* This set of tests exercises the rollup plugin to ensure that it works as
 * expected and can generate an output file which can be imported and which
 * will contain the desired symbols. */
aegis.test`File Generation`(async (state) => {
  const ctx = state.ctx;

  // Invoking rollup to perform the build should result in a bundle and, more to
  // the point, should write the module that the rest of this collection
  // imports.
  const bundle = await runRollupBuild();
  $.check`Execute rollup build`(
    $.neq(bundle, undefined)
  );

  $.check`Rollup wrote the SQL module`(
    $.eq(fs.exists(rollupConfig.output.file), 'file')
  );

  // We should be able to import the queries and end up with an object; this is
  // also placed into the context as queries.
  const queries = await importQueries(ctx, rollupConfig.output.file);
  $.check`Import bundled SQL`(
    $.instanceof(queries, Object)
  );

  // Test that the file contains the queries that we expect it to.
  $.check`Query functons imported`(
    $.isObject(queries),
    $.isFunction(queries.single),
    $.isFunction(queries.single_bindable),
    $.isFunction(queries.fetchRoles),
    $.isFunction(queries.fetchOneRole),
    $.isFunction(queries.executeRole),
    $.isFunction(queries.one_bindable),
    $.isFunction(queries.two_bindable),
    $.isFunction(queries.three_two_bindable),
    $.isFunction(queries.create_roles),
    $.isFunction(queries.insert_select),
    $.isFunction(queries.insert_role),
    $.isFunction(queries.executeInsertRole),
    $.isFunction(queries.fetchFirst_single_result),
    $.isFunction(queries.fetchFirst_batch_first_returns),
    $.isFunction(queries.fetchFirst_batch_later_returns),
    $.isFunction(queries.fetchFirst_no_results),
    $.isFunction(queries.fetchFirst_multiple_rows),
    $.isFunction(queries.fetchFirst_no_rows),
    $.isFunction(queries.fetchFirst_potential_no_result),
    $.isFunction(queries.fetchFirst_multiple_potential_no_results),
    $.isFunction(queries.fetchFirst_first_potential_empty)
  );
});


/******************************************************************************/


/* This set of tests validates the the content that was imported by the
 * rollup plugin tests behaves as expected. */
aegis.test`Statement Binding`(async (state) => {
  const ctx = state.ctx;

  // Verify that caching works; we should be able to invoke the query function
  // twice in a row and get the exact same object each time due to the cache and
  // the fact that we are not binding anything.
  $.check`Validate statement cache`(
    $.eq(
      ctx.queries.single(ctx.env.DB) === ctx.queries.single(ctx.env.DB),
      true
    )
  );

  // An attempt to bind when the statement has no bind arguments should raise an
  // error, because this is invalid.
  $.check`Binding non-bindable statement`(
    $.throwsMessage(
      () => ctx.queries.single(ctx.env.DB, []),
      'query file contains 0 bindable statements, but 1 bind(s) provided'
    )
  );

  // A call to the module that contains a single statement with a single bind
  // should produce a single statement back (which is not bound).
  const single = ctx.queries.single_bindable(ctx.env.DB);
  $.check`Single bindable with no binds specified`(
    $.isNotArray(single)
  );

  // If we do the same thing and pass a single bind, we should get back a single
  // statement, because one bind.
  const one = ctx.queries.single_bindable(ctx.env.DB, { roleId: 69 });
  $.check`Single bindable with one bind specified`(
    $.isNotArray(one)
  );

  // If we pass two binds, we should get two statements, one per bind.
  const two = ctx.queries.single_bindable(ctx.env.DB,
    { roleId: 69 },
    { roleId: 70 });
  $.check`Single bindable with two binds specified`(
    $.isArray(two),
    $.eq(two.length, 2)
  );

  // A file with two statements and no binds should return 2 (unbound)
  // statements.
  const twoUnbound = ctx.queries.two_bindable(ctx.env.DB);
  $.check`Two bindable with no binds`(
    $.isArray(twoUnbound),
    $.eq(twoUnbound.length, 2)
  );

  // Since there are two statements, a single bind is an error.
  $.check`Two bindable with one bind (error)`(
    $.throwsMessage(
      () => ctx.queries.two_bindable(ctx.env.DB, { roleId: 1 }),
      'query file contains 2 bindable statements, but 1 bind(s) provided'
    )
  );

  // With two statements and two binds, the return should be two statements.
  const twoBound = ctx.queries.two_bindable(ctx.env.DB,
    { roleId: 1 },
    { roleId: 2, roleName: 'test' });
  $.check`Two bindable with two binds`(
    $.isArray(twoBound),
    $.eq(twoBound.length, 2)
  );

  // With two statements, three binds is an error because it does not match.
  $.check`Two bindable with three binds (error)`(
    $.throwsMessage(
      () => ctx.queries.two_bindable(ctx.env.DB,
        { roleId: 1 },
        { roleId: 2, roleName: 'test' },
        { roleId: 3 }),
      'query file contains 2 bindable statements, but 3 bind(s) provided'
    )
  );

  // With two statements and only one is bindable, we get two statements if we
  // don't provide any binds.
  const oneUnbound = ctx.queries.one_bindable(ctx.env.DB);
  $.check`One bindable with no binds`(
    $.isArray(oneUnbound),
    $.eq(oneUnbound.length, 2)
  );

  // With two statements and one bindable, a single bind still returns two
  // statements, but in this case the one that is bindable is bound.
  const oneBound = ctx.queries.one_bindable(ctx.env.DB,
    { roleName: 'bob' });
  $.check`One bindable with one bind`(
    $.isArray(oneBound),
    $.eq(oneBound.length, 2)
  );

  // Providing two binds even though there are two statements is an error
  // because only one of them is bindable.
  $.check`One bindable with two binds (error)`(
    $.throwsMessage(
      () => ctx.queries.one_bindable(ctx.env.DB,
        { roleName: 'bob' },
        { roleName: 'jim' }),
      'query file contains 1 bindable statements, but 2 bind(s) provided'
    )
  );

  // Three statements with no binds returns three (unbound) statements.
  const threeUnbound = ctx.queries.three_two_bindable(ctx.env.DB);
  $.check`Three with two bindable with no binds`(
    $.isArray(threeUnbound),
    $.eq(threeUnbound.length, 3)
  );

  // Three staetments with two of them bindable is an error if only one bind is
  // provided.
  $.check`Three with two bindable with one bind (error)`(
    $.throwsMessage(
      () => ctx.queries.three_two_bindable(ctx.env.DB,
        { roleId: 1 }),
      'query file contains 2 bindable statements, but 1 bind(s) provided'
    )
  );

  // When two binds are provied, this should succeed with three statements.
  const threeBound = ctx.queries.three_two_bindable(ctx.env.DB,
    { roleId: 1 },
    { roleId: 2, roleName: 'test' });
  $.check`Three with two bindable with two binds`(
    $.isArray(threeBound),
    $.eq(threeBound.length, 3)
  );

  // Three statements when two are bindable, but three binds, is an error.
  $.check`Three with two bindable with three binds (error)`(
    $.throwsMessage(
      () => ctx.queries.three_two_bindable(ctx.env.DB,
        { roleId: 1 },
        { roleId: 2, roleName: 'test' },
        { roleId: 3 }),
      'query file contains 2 bindable statements, but 3 bind(s) provided'
    )
  );
});


/******************************************************************************/


/* This set of tests validates the the content that was imported by the
 * rollup plugin tests behaves as expected when the statements are actually
 * executed. */
aegis.test`Raw Statement Execution`(async (state) => {
  const ctx = state.ctx;

  // Test a simple single query; function returns a single statement; a creation
  // returns no result.
  const created = await dbFetch(ctx.env.DB, 'create_roles',
    ctx.queries.create_roles(ctx.env.DB));
  $.check`Create Roles table`(
    $.isArray(created),
    $.eq(created.length, 0)
  );

  // Insert two roles to test with; the SQL is a single statement, but two binds
  // means that it's going to return an array, so we need to spread the result.
  const inserted = await dbFetch(ctx.env.DB, 'insert_roles',
    ...ctx.queries.insert_role(ctx.env.DB,
      { roleId: 1, roleName: 'Admin' },
      { roleId: 2, roleName: 'User' }));
  $.check`Insert initial roles`(
    $.isArray(inserted),
    $.eq(inserted.length, 2),
    $.eq(inserted[0].length, 0),
    $.eq(inserted[1].length, 0)
  );

  // Attempt to select a single role out; the single bind should return a single
  // statement, and thus not need to be spread.
  const selected = await dbFetch(ctx.env.DB, 'select_role',
    ctx.queries.single_bindable(ctx.env.DB, { roleId: 1 }));
  $.check`Select a single role`(
    $.isArray(selected),
    $.eq(selected.length, 1),
    $.eq(selected[0].roleName, 'Admin')
  );

  // A file with two statements should require two binds and return two
  // statements that need to be spread.
  const insertedSelected = await dbFetch(ctx.env.DB, 'insert_select_role',
    ...ctx.queries.insert_select(ctx.env.DB,
      { roleId: 3, roleName: 'Guest' },
      { roleId: 3 }));
  $.check`Batch insert and select a role`(
    $.isArray(insertedSelected),
    $.eq(insertedSelected.length, 2),
    $.eq(insertedSelected[1].length, 1),
    $.eq(insertedSelected[1][0].roleName, 'Guest')
  );

  // Validate that we get appropriate handling for transaction failures; this
  // should raise a uniqueness constrain because Admin exists, and not insert
  // the moderator role.
  const transactionError = await caught(() =>
    dbFetch(ctx.env.DB, 'insert_existing_role',
      ...ctx.queries.insert_role(ctx.env.DB,
        { roleId: 1, roleName: 'Admin' },
        { roleId: 4, roleName: 'Moderator' })));
  $.check`Transaction rollback on failed batch insert`(
    $.instanceof(transactionError, Error),
    $.eq(transactionError.message,
      'D1_ERROR: UNIQUE constraint failed: Roles.roleId: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_PRIMARYKEY)')
  );

  // Validate that the transaction stopped the moderator from being inserted.
  const moderator = await dbFetch(ctx.env.DB, 'select_nonexistent_role',
    ctx.queries.single_bindable(ctx.env.DB, { roleId: 4 }));
  $.check`Verify transaction rollback`(
    $.isArray(moderator),
    $.eq(moderator.length, 0)
  );
});


/******************************************************************************/


/* This set of tests validates the wrapper functions that the rollup plugin
 * generates work as expected. */
aegis.test`Wrapped Statement Execution`(async (state) => {
  const ctx = state.ctx;

  // When there is a single bind, a single statement is executed; the wrapper
  // should return a single result without complaint.
  const single = await ctx.queries.fetchRoles(ctx.env.DB, 'fetch_single_role',
    { roleId: 1 });
  $.check`fetch() with a single statement`(
    $.isArray(single),
    $.eq(single.length, 1),
    $.eq(single[0].roleName, 'Admin')
  );

  // When there are two binds, there are two statements to execute; this should
  // still seamlessly work.
  const multiple = await ctx.queries.fetchRoles(ctx.env.DB, 'fetch_multiple_roles',
    { roleId: 1 },
    { roleId: 2 });
  $.check`fetch() with multiple binds`(
    $.isArray(multiple),
    $.eq(multiple.length, 2),
    $.eq(multiple[0][0].roleName, 'Admin'),
    $.eq(multiple[1][0].roleName, 'User')
  );

  // The fetchOne() wrapper works like the fetch wrapper, so it should work with
  // a single bind.
  const one = await ctx.queries.fetchOneRole(ctx.env.DB, 'fetchOne_single_role',
    { roleId: 1 });
  $.check`fetchOne() with a single statement`(
    $.isNotArray(one),
    $.eq(one.roleName, 'Admin')
  );

  // If there are multiple binds, then there would be multiple statements, but
  // this should still return only a single item.
  const oneOfMultiple = await ctx.queries.fetchOneRole(ctx.env.DB, 'fetchOne_multiple_roles',
    { roleId: 1 },
    { roleId: 2 });
  $.check`fetchOne() with multiple binds`(
    $.isArray(oneOfMultiple),
    $.eq(oneOfMultiple.length, 1),
    $.eq(oneOfMultiple[0].roleName, 'Admin')
  );

  const firstSingle = await ctx.queries.fetchFirst_single_result(ctx.env.DB, 'fetchFirst_test_one',
    { roleId: 1 });
  $.check`fetchFirst() with a single result`(
    $.isNotArray(firstSingle),
    $.neq(firstSingle, null),
    $.eq(firstSingle.roleId, 1),
    $.eq(firstSingle.roleName, "Admin")
  );

  // A batch where the first statement returns a result.
  const firstBatch = await ctx.queries.fetchFirst_batch_first_returns(ctx.env.DB, 'fetchFirst_test_two',
    { roleId1: 1, roleId2: 2 },
    { roleId3: 500, roleName: 'Test Role'});
  $.check`fetchFirst() with a batch, first statement returns`(
    $.isNotArray(firstBatch),
    $.neq(firstBatch, null),
    $.eq(firstBatch.roleId, 1),
    $.eq(firstBatch.roleName, "Admin")
  );

  // A batch where a later statement is the first to return a result.
  const laterBatch = await ctx.queries.fetchFirst_batch_later_returns(ctx.env.DB, 'fetchFirst_test_three',
    { roleId: 501, roleName: 'Test Role 2' },
    { roleName: 'User' });
  $.check`fetchFirst() with a batch, later statement returns`(
    $.isNotArray(laterBatch),
    $.neq(laterBatch, null),
    $.eq(laterBatch.roleId, 2),
    $.eq(laterBatch.roleName, "User")
  );

  // A batch where no statements return results.
  const noResults = await ctx.queries.fetchFirst_no_results(ctx.env.DB, 'fetchFirst_test_four',
    { roleId: 502, roleName: 'New Role 1' },
    { roleId: 1, roleName: 'Admin' });
  $.check`fetchFirst() with no result-producing statements`(
    $.eq(noResults, null)
  );

  // A query that returns multiple rows should still only return the first.
  const multipleRows = await ctx.queries.fetchFirst_multiple_rows(ctx.env.DB, 'fetchFirst_test_five',
    { roleId1: 1, roleId2: 2 });
  $.check`fetchFirst() that returns multiple rows`(
    $.isNotArray(multipleRows),
    $.neq(multipleRows, null),
    $.eq(multipleRows.roleId, 1),
    $.eq(multipleRows.roleName, "Admin")
  );

  // A query that returns no rows should return null.
  const noRows = await ctx.queries.fetchFirst_no_rows(ctx.env.DB, 'fetchFirst_test_six',
    { roleId: 1000 });
  $.check`fetchFirst() that returns no rows`(
    $.eq(noRows, null)
  );

  // A batch where a later statement could return a result but doesn't.
  const potentialNoResult = await ctx.queries.fetchFirst_potential_no_result(ctx.env.DB, 'fetchFirst_test_seven',
    { roleId: 503, roleName: 'Test Role 3' },
    { roleName: 'NonExistent' });
  $.check`fetchFirst() with a batch, potential but no result`(
    $.eq(potentialNoResult, null)
  );

  // A batch with two statements that can return results, but neither do.
  const multiplePotential = await ctx.queries.fetchFirst_multiple_potential_no_results(ctx.env.DB, 'fetchFirst_test_eight',
    { roleId1: 1002 },
    { roleId2: 1003 });
  $.check`fetchFirst() with multiple potential results, but none found`(
    $.eq(multiplePotential, null)
  );

  // A batch where the first statement that can return a result doesn't, so the
  // result is null even though a later statement does return a result.
  const firstPotentialEmpty = await ctx.queries.fetchFirst_first_potential_empty(ctx.env.DB, 'fetchFirst_test_nine',
    { roleId1: 1004 },
    { roleId2: 1 });
  $.check`fetchFirst() with a batch, first potential result is empty`(
    $.eq(firstPotentialEmpty, null)
  );

  // Execution of a single statement results in nothing.
  const executed = await ctx.queries.executeRole(ctx.env.DB, 'execute_single_role',
    { roleId: 1 });
  $.check`execute() with a single statement`(
    $.eq(executed, undefined)
  );

  // Still nothing with multiple binds in the batch, but this verifies that the
  // wrapper correctly handles having to execute multiple statments.
  const executedMultiple = await ctx.queries.executeRole(ctx.env.DB, 'execute_multiple_roles',
    { roleId: 1 },
    { roleId: 2 });
  $.check`execute() with multiple binds`(
    $.eq(executedMultiple, undefined)
  );
});


/******************************************************************************/


teardownDatabase();


/******************************************************************************/
