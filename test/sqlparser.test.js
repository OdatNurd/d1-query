import { Collection, $check, $ } from "@axel669/aegis";

import {
  processSQLString,
  mapBinds,
  BIND_STYLE_ANONYMOUS,
  BIND_STYLE_NUMBERED,
  BIND_STYLE_NAMED
} from "../lib/statement.js";


/******************************************************************************/


export default Collection`Statement Preparation`({
  /* This set of tests exercises the SQL processing capabilities to ensure that
   * we can correctly parse SQL, extract bind parameter metadata, and reject
   * invalid SQL. */
  "SQL Processing": ({ runScope: ctx }) => {
    // A simple anonymous bind should be correctly identified.
    $check`Anonymous Bind`
      .value(processSQLString('SELECT * FROM Users WHERE userId = ? AND username = ?;'))
      .eq($.sql, 'SELECT * FROM "Users" WHERE "userId" = ? AND "username" = ?')
      .eq($.bindMetadata.style, BIND_STYLE_ANONYMOUS)
      .eq($.bindMetadata.argCount, 2);

    // Numbered binds should be correctly identified.
    $check`Numbered binds`
      .value(processSQLString('SELECT * FROM Users WHERE userId = ?1 AND username = ?2;'))
      .eq($.sql, 'SELECT * FROM "Users" WHERE "userId" = ?1 AND "username" = ?2')
      .eq($.bindMetadata.style, BIND_STYLE_NUMBERED)
      .eq($.bindMetadata.argCount, 2);

    // Numbered binds with a gap should report the highest number as the count.
    $check`Numbered binds with a gap`
      .value(processSQLString('SELECT * FROM Users WHERE userId = ?1 AND username = ?3;'))
      .eq($.sql, 'SELECT * FROM "Users" WHERE "userId" = ?1 AND "username" = ?3')
      .eq($.bindMetadata.style, BIND_STYLE_NUMBERED)
      .eq($.bindMetadata.argCount, 3);

    // Numbered binds out of order should report the highest number as the count.
    $check`Numbered binds out of order`
      .value(processSQLString('SELECT * FROM Users WHERE userId = ?3 AND username = ?1;'))
      .eq($.sql, 'SELECT * FROM "Users" WHERE "userId" = ?3 AND "username" = ?1')
      .eq($.bindMetadata.style, BIND_STYLE_NUMBERED)
      .eq($.bindMetadata.argCount, 3);

    // A simple named bind should be correctly identified and mapped.
    $check`Named binds using colon`
      .value(processSQLString('SELECT * FROM Users WHERE userId = :id AND username = :name;'))
      .eq($.sql, 'SELECT * FROM "Users" WHERE "userId" = ?1 AND "username" = ?2')
      .eq($.bindMetadata.style, BIND_STYLE_NAMED)
      .eq($.bindMetadata.params.id, 0)
      .eq($.bindMetadata.params.name, 1);

    // This should also work with a $
    $check`Named binds using dollar`
      .value(processSQLString('SELECT * FROM Users WHERE userId = $id AND username = $name;'))
      .eq($.sql, 'SELECT * FROM "Users" WHERE "userId" = ?1 AND "username" = ?2')
      .eq($.bindMetadata.style, BIND_STYLE_NAMED)
      .eq($.bindMetadata.params.id, 0)
      .eq($.bindMetadata.params.name, 1);

    // This should also work with a @
    $check`Named binds using at-sign`
      .value(processSQLString('SELECT * FROM Users WHERE userId = @id AND username = @name;'))
      .eq($.sql, 'SELECT * FROM "Users" WHERE "userId" = ?1 AND "username" = ?2')
      .eq($.bindMetadata.style, BIND_STYLE_NAMED)
      .eq($.bindMetadata.params.id, 0)
      .eq($.bindMetadata.params.name, 1);

    // Anonymous binds in LIMIT and OFFSET
    $check`Anonymous binds in LIMIT and OFFSET`
      .value(processSQLString('SELECT * FROM Users LIMIT ? OFFSET ?;'))
      .eq($.sql, 'SELECT * FROM "Users" LIMIT ? OFFSET ?')
      .eq($.bindMetadata.style, BIND_STYLE_ANONYMOUS)
      .eq($.bindMetadata.argCount, 2);

    // Numbered binds in LIMIT and OFFSET
    $check`Numbered binds in LIMIT and OFFSET`
      .value(processSQLString('SELECT * FROM Users LIMIT ?1 OFFSET ?2;'))
      .eq($.sql, 'SELECT * FROM "Users" LIMIT ?1 OFFSET ?2')
      .eq($.bindMetadata.style, BIND_STYLE_NUMBERED)
      .eq($.bindMetadata.argCount, 2);

    // Named binds (colon) in LIMIT and OFFSET
    $check`Named binds (colon) in LIMIT and OFFSET`
      .value(processSQLString('SELECT * FROM Users LIMIT :count OFFSET :start;'))
      .eq($.sql, 'SELECT * FROM "Users" LIMIT ?1 OFFSET ?2')
      .eq($.bindMetadata.style, BIND_STYLE_NAMED)
      .eq($.bindMetadata.params.count, 0)
      .eq($.bindMetadata.params.start, 1);

    // Named binds (dollar) in LIMIT and OFFSET
    $check`Named binds (dollar) in LIMIT and OFFSET`
      .value(processSQLString('SELECT * FROM Users LIMIT $count OFFSET $start;'))
      .eq($.sql, 'SELECT * FROM "Users" LIMIT ?1 OFFSET ?2')
      .eq($.bindMetadata.style, BIND_STYLE_NAMED)
      .eq($.bindMetadata.params.count, 0)
      .eq($.bindMetadata.params.start, 1);

    // Named binds (at-sign) in LIMIT and OFFSET
    $check`Named binds (at-sign) in LIMIT and OFFSET`
      .value(processSQLString('SELECT * FROM Users LIMIT @count OFFSET @start;'))
      .eq($.sql, 'SELECT * FROM "Users" LIMIT ?1 OFFSET ?2')
      .eq($.bindMetadata.style, BIND_STYLE_NAMED)
      .eq($.bindMetadata.params.count, 0)
      .eq($.bindMetadata.params.start, 1);

    // Repeated named binds should result in a single parameter entry in the metadata.
    $check`Repeated named binds using colon`
      .value(processSQLString('SELECT * FROM Users WHERE userId = :id AND username = :id;'))
      .eq($.sql, 'SELECT * FROM "Users" WHERE "userId" = ?1 AND "username" = ?1')
      .eq($.bindMetadata.style, BIND_STYLE_NAMED)
      .keyCount($.bindMetadata.params, 1)
      .eq($.bindMetadata.params.id, 0);

    // This should also work if we use a dollar sign.
    $check`Repeated named binds using dollar`
      .value(processSQLString('SELECT * FROM Users WHERE userId = $id AND username = $id;'))
      .eq($.sql, 'SELECT * FROM "Users" WHERE "userId" = ?1 AND "username" = ?1')
      .eq($.bindMetadata.style, BIND_STYLE_NAMED)
      .keyCount($.bindMetadata.params, 1)
      .eq($.bindMetadata.params.id, 0);

    // Mixing anonymous and named binds should throw an error.
    $check`Mixing anonymous and named binds using colon`
      .call(() => processSQLString('SELECT * FROM Users WHERE userId = ? AND username = :name;'))
      .throws($, "cannot mix bind parameter styles; expected '?' but found ':'");

    // The same also applies for the other named bind type.
    $check`Mixing anonymous and named binds using dollar`
      .call(() => processSQLString('SELECT * FROM Users WHERE userId = ? AND username = $name;'))
      .throws($, "cannot mix bind parameter styles; expected '?' but found '$'");

    // Mixing anonymous and numbered binds should throw an error.
    $check`Mixing anonymous and numbered binds`
      .call(() => processSQLString('SELECT * FROM Users WHERE userId = ? AND username = ?1;'))
      .throws($, "cannot mix bind parameter styles; expected '?' but found '?#'");

    // Mixing numbered and anonymous binds should throw an error.
    $check`Mixing numbered and anonymous binds`
      .call(() => processSQLString('SELECT * FROM Users WHERE userId = ?1 AND username = ?;'))
      .throws($, "cannot mix bind parameter styles; expected '?#' but found '?'");

    // Mixing numbered and named binds should throw an error.
    $check`Mixing numbered and named binds`
      .call(() => processSQLString('SELECT * FROM Users WHERE userId = ?1 AND username = :name;'))
      .throws($, "cannot mix bind parameter styles; expected '?#' but found ':'");

    $check`Mixing named and numbered binds`
      .call(() => processSQLString('SELECT * FROM Users WHERE userId = :id AND username = ?1;'))
      .throws($, "cannot mix bind parameter styles; expected ':' but found '?#'");

    // Mixing different named bind styles should throw an error as well.
    $check`Mixing named bind styles`
      .call(() => processSQLString('SELECT * FROM Users WHERE userId = :id AND username = $name;'))
      .throws($, "cannot mix bind parameter styles; expected ':' but found '$'");

    $check`Mixing named bind styles, opposite order`
      .call(() => processSQLString('SELECT * FROM Users WHERE userId = $id AND username = :name;'))
      .throws($, "cannot mix bind parameter styles; expected '$' but found ':'");

    // Multiple statements should throw an error by default.
    $check`Multiple statements not allowed by default`
      .call(() => processSQLString('SELECT 1; SELECT 2;'))
      .throws($, 'multiple statements found, but allowMutliple is false');

    // Multiple statements should be allowed when the flag is passed.
    $check`Multiple statements allowed when requested`
      .value(processSQLString('SELECT 1; SELECT 2;', true))
      .isArray()
      .eq($.length, 2);

    // A single statement with a trailing semicolon should still be treated as a
    // single statement.
    $check`Single statement with trailing semicolon is a single statement`
      .value(processSQLString('SELECT 1;', true))
      .isArray()
      .eq($.length, 1);
  },


  /****************************************************************************/


  /* This set of tests validates that the mapBinds() helper can correctly
   * convert user-provided bind values into the ordered array that D1 expects,
   * and that it correctly rejects invalid inputs. */
  "Bind Mapping": ({ runScope: ctx }) => {
    // Sample metadata for the tests below.
    const anonMeta = { style: BIND_STYLE_ANONYMOUS, argCount: 2 };
    const numberedMeta = { style: BIND_STYLE_NUMBERED, argCount: 2 };
    const namedMeta = { style: BIND_STYLE_NAMED, argCount: 2, params: { id: 1, name: 0 } };
    const noParamsMeta = { style: BIND_STYLE_ANONYMOUS, argCount: 0 };

    // Correctly passing an array for an anonymous query.
    $check`mapping anonymous binds`
      .value(mapBinds(anonMeta, [1, 'bob']))
      .isArray()
      .eq($.length, 2)
      .eq($[0], 1)
      .eq($[1], 'bob');

    // Correctly passing an array for a numbered query.
    $check`mapping numbered binds`
      .value(mapBinds(numberedMeta, [1, 'bob']))
      .isArray()
      .eq($.length, 2)
      .eq($[0], 1)
      .eq($[1], 'bob');

    // Correctly passing an object for a named query.
    $check`mapping named binds`
      .value(mapBinds(namedMeta, { name: 'bob', id: 1 }))
      .isArray()
      .eq($.length, 2)
      .eq($[0], 'bob')
      .eq($[1], 1);

    // Passing an array to a named query should fail.
    $check`array for named query`
      .call(() => mapBinds(namedMeta, [1, 'bob']))
      .throws($, 'an array of bind values cannot be used with named parameters');

    // Passing an object to an anonymous query should fail.
    $check`object for anonymous query`
      .call(() => mapBinds(anonMeta, { name: 'bob', id: 1 }))
      .throws($, 'an object of bind values can only be used with named parameters');

    // Passing an object to a numbered query should fail.
    $check`object for numbered query`
      .call(() => mapBinds(numberedMeta, { name: 'bob', id: 1 }))
      .throws($, 'an object of bind values can only be used with named parameters');

    // Passing an array with too few elements should fail.
    $check`anonymous binds with too few arguments`
      .call(() => mapBinds(anonMeta, [1]))
      .throws($, 'incorrect number of bind parameters; expected 2, got 1');

    // Passing an object with missing keys should fail.
    $check`named binds with missing arguments`
      .call(() => mapBinds(namedMeta, { name: 'bob' }))
      .throws($, 'incorrect number of bind parameters; expected 2, got 1');

    // Passing an object with extra keys should fail.
    $check`named binds with extra arguments`
      .call(() => mapBinds(namedMeta, { name: 'bob', id: 1, extra: 'field' }))
      .throws($, "'extra' is not a valid bind parameter for this query");

    // Passing binds to a statement that expects none should fail.
    $check`binds for statement with no parameters`
      .call(() => mapBinds(noParamsMeta, []))
      .throws($, 'statement does not accept any bind parameters');
  },
});


/******************************************************************************/
