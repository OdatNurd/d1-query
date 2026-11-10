import { aegis, $ } from "@axel669/aegis";

import {
  processSQLString,
  renderSQLStatements,
  mapBinds,
  BIND_STYLE_ANONYMOUS,
  BIND_STYLE_NUMBERED,
  BIND_STYLE_NAMED
} from "../lib/statement.js";
import "./aegis_setup.js";


/******************************************************************************/


export const name = "Statement Preparation";


/******************************************************************************/


/* Check the common shape of a parsed statement without repeating the same three
 * assertions for every bind style. */
function checkStatement(label, sql, expectedSQL, style, metadata = {}) {
  const statement = processSQLString(sql);
  const assertions = [
    $.eq(statement.sql, expectedSQL),
    $.bindType(statement, style)
  ];

  if (metadata.argCount !== undefined) {
    assertions.push($.argCount(statement, metadata.argCount));
  }
  if (metadata.argNames !== undefined) {
    assertions.push($.argNames(statement, metadata.argNames));
  }

  $.check`${label}`(...assertions);
}


/* Check an error message from a synchronous parser or binder operation. */
function checkThrows(label, fn, message) {
  $.check`${label}`(
    $.throwsMessage(fn, message)
  );
}


/* Check whether a parsed statement can produce a result. */
function checkFlag(label, sql, expected) {
  const statement = processSQLString(sql);
  $.check`${label}`(
    $.eq(statement.canProduceResult, expected)
  );
}


/******************************************************************************/


/* This set of tests exercises the SQL processing capabilities to ensure that
 * we can correctly parse SQL, extract bind parameter metadata, and reject
 * invalid SQL. */
aegis.test`SQL Processing`(() => {
  // A simple anonymous bind should be correctly identified.
  checkStatement('Anonymous Bind',
    'SELECT * FROM Users WHERE userId = ? AND username = ?;',
    'SELECT * FROM Users WHERE userId = ? AND username = ?',
    BIND_STYLE_ANONYMOUS, { argCount: 2 });

  // Numbered binds should be correctly identified.
  checkStatement('Numbered binds',
    'SELECT * FROM Users WHERE userId = ?1 AND username = ?2;',
    'SELECT * FROM Users WHERE userId = ?1 AND username = ?2',
    BIND_STYLE_NUMBERED, { argCount: 2 });

  // Numbered binds with a gap should report the highest number as the count.
  checkStatement('Numbered binds with a gap',
    'SELECT * FROM Users WHERE userId = ?1 AND username = ?3;',
    'SELECT * FROM Users WHERE userId = ?1 AND username = ?3',
    BIND_STYLE_NUMBERED, { argCount: 3 });

  // Numbered binds out of order should report the highest number as the count.
  checkStatement('Numbered binds out of order',
    'SELECT * FROM Users WHERE userId = ?3 AND username = ?1;',
    'SELECT * FROM Users WHERE userId = ?3 AND username = ?1',
    BIND_STYLE_NUMBERED, { argCount: 3 });

  // Numbered binds can also be written with a dollar sign; these are the same
  // style as ?NNN binds and are rewritten to them, since D1 does not accept
  // the $nr form.
  checkStatement('Numbered binds using dollar',
    'SELECT * FROM Users WHERE userId = $1 AND username = $2;',
    'SELECT * FROM Users WHERE userId = ?1 AND username = ?2',
    BIND_STYLE_NUMBERED, { argCount: 2 });

  // Dollar numbered binds with a gap should report the highest number.
  checkStatement('Numbered binds using dollar with a gap',
    'SELECT * FROM Users WHERE userId = $1 AND username = $3;',
    'SELECT * FROM Users WHERE userId = ?1 AND username = ?3',
    BIND_STYLE_NUMBERED, { argCount: 3 });

  // Mixing dollar numbered binds with question numbered binds is not mixing
  // styles; both are the numbered style.
  checkStatement('Dollar and question numbered binds are the same style',
    'SELECT * FROM Users WHERE userId = $1 AND username = ?2;',
    'SELECT * FROM Users WHERE userId = ?1 AND username = ?2',
    BIND_STYLE_NUMBERED, { argCount: 2 });

  // Bind indexes are 1 based; 0 is not a valid index and would otherwise be
  // reported as a statement with no binds at all.
  checkThrows('Numbered bind of zero',
    () => processSQLString('SELECT * FROM Users WHERE userId = ?0;'),
    "invalid bind parameter '?0'");

  checkThrows('Dollar numbered bind of zero',
    () => processSQLString('SELECT * FROM Users WHERE userId = $0;'),
    "invalid bind parameter '$0'");

  // A simple named bind should be correctly identified and mapped.
  checkStatement('Named binds using colon',
    'SELECT * FROM Users WHERE userId = :id AND username = :name;',
    'SELECT * FROM Users WHERE userId = ?1 AND username = ?2',
    BIND_STYLE_NAMED, { argNames: { id: 0, name: 1 } });

  // This should also work with a $
  checkStatement('Named binds using dollar',
    'SELECT * FROM Users WHERE userId = $id AND username = $name;',
    'SELECT * FROM Users WHERE userId = ?1 AND username = ?2',
    BIND_STYLE_NAMED, { argNames: { id: 0, name: 1 } });

  // This should also work with a @
  checkStatement('Named binds using at-sign',
    'SELECT * FROM Users WHERE userId = @id AND username = @name;',
    'SELECT * FROM Users WHERE userId = ?1 AND username = ?2',
    BIND_STYLE_NAMED, { argNames: { id: 0, name: 1 } });

  // Anonymous binds in LIMIT and OFFSET
  checkStatement('Anonymous binds in LIMIT and OFFSET',
    'SELECT * FROM Users LIMIT ? OFFSET ?;',
    'SELECT * FROM Users LIMIT ? OFFSET ?',
    BIND_STYLE_ANONYMOUS, { argCount: 2 });

  // Numbered binds in LIMIT and OFFSET
  checkStatement('Numbered binds in LIMIT and OFFSET',
    'SELECT * FROM Users LIMIT ?1 OFFSET ?2;',
    'SELECT * FROM Users LIMIT ?1 OFFSET ?2',
    BIND_STYLE_NUMBERED, { argCount: 2 });

  // Named binds (colon) in LIMIT and OFFSET
  checkStatement('Named binds (colon) in LIMIT and OFFSET',
    'SELECT * FROM Users LIMIT :count OFFSET :start;',
    'SELECT * FROM Users LIMIT ?1 OFFSET ?2',
    BIND_STYLE_NAMED, { argNames: { count: 0, start: 1 } });

  // Named binds (dollar) in LIMIT and OFFSET
  checkStatement('Named binds (dollar) in LIMIT and OFFSET',
    'SELECT * FROM Users LIMIT $count OFFSET $start;',
    'SELECT * FROM Users LIMIT ?1 OFFSET ?2',
    BIND_STYLE_NAMED, { argNames: { count: 0, start: 1 } });

  // Named binds (at-sign) in LIMIT and OFFSET
  checkStatement('Named binds (at-sign) in LIMIT and OFFSET',
    'SELECT * FROM Users LIMIT @count OFFSET @start;',
    'SELECT * FROM Users LIMIT ?1 OFFSET ?2',
    BIND_STYLE_NAMED, { argNames: { count: 0, start: 1 } });

  // Repeated named binds should result in a single parameter entry in the metadata.
  checkStatement('Repeated named binds using colon',
    'SELECT * FROM Users WHERE userId = :id AND username = :id;',
    'SELECT * FROM Users WHERE userId = ?1 AND username = ?1',
    BIND_STYLE_NAMED, { argNames: ['id'] });

  // This should also work if we use a dollar sign.
  checkStatement('Repeated named binds using dollar',
    'SELECT * FROM Users WHERE userId = $id AND username = $id;',
    'SELECT * FROM Users WHERE userId = ?1 AND username = ?1',
    BIND_STYLE_NAMED, { argNames: ['id'] });

  // Mixing anonymous and named binds should throw an error.
  checkThrows('Mixing anonymous and named binds using colon',
    () => processSQLString('SELECT * FROM Users WHERE userId = ? AND username = :name;'),
    "cannot mix bind parameter styles; expected '?' but found ':'");

  // The same also applies for the other named bind type.
  checkThrows('Mixing anonymous and named binds using dollar',
    () => processSQLString('SELECT * FROM Users WHERE userId = ? AND username = $name;'),
    "cannot mix bind parameter styles; expected '?' but found '$'");

  // Mixing anonymous and numbered binds should throw an error.
  checkThrows('Mixing anonymous and numbered binds',
    () => processSQLString('SELECT * FROM Users WHERE userId = ? AND username = ?1;'),
    "cannot mix bind parameter styles; expected '?' but found '?#'");

  // Mixing numbered and anonymous binds should throw an error.
  checkThrows('Mixing numbered and anonymous binds',
    () => processSQLString('SELECT * FROM Users WHERE userId = ?1 AND username = ?;'),
    "cannot mix bind parameter styles; expected '?#' but found '?'");

  // Mixing numbered and named binds should throw an error.
  checkThrows('Mixing numbered and named binds',
    () => processSQLString('SELECT * FROM Users WHERE userId = ?1 AND username = :name;'),
    "cannot mix bind parameter styles; expected '?#' but found ':'");

  checkThrows('Mixing named and numbered binds',
    () => processSQLString('SELECT * FROM Users WHERE userId = :id AND username = ?1;'),
    "cannot mix bind parameter styles; expected ':' but found '?#'");

  // Mixing different named bind styles should throw an error as well.
  checkThrows('Mixing named bind styles',
    () => processSQLString('SELECT * FROM Users WHERE userId = :id AND username = $name;'),
    "cannot mix bind parameter styles; expected ':' but found '$'");

  checkThrows('Mixing named bind styles, opposite order',
    () => processSQLString('SELECT * FROM Users WHERE userId = $id AND username = :name;'),
    "cannot mix bind parameter styles; expected '$' but found ':'");

  // Multiple statements should throw an error by default.
  checkThrows('Multiple statements not allowed by default',
    () => processSQLString('SELECT 1; SELECT 2;'),
    'multiple statements found, but allowMultiple is false');

  // Multiple statements should be allowed when the flag is passed.
  const multiple = processSQLString('SELECT 1; SELECT 2;', 'test_action', true);
  $.check`Multiple statements allowed when requested`(
    $.isArray(multiple),
    $.eq(multiple.length, 2)
  );

  // A single statement with a trailing semicolon should still be treated as a
  // single statement.
  const single = processSQLString('SELECT 1;', 'test_action', true);
  $.check`Single statement with trailing semicolon is a single statement`(
    $.isArray(single),
    $.eq(single.length, 1)
  );

  // A string with no SQL in it has no statements to process; report that
  // rather than returning undefined and letting the caller fail on it later.
  checkThrows('Empty SQL string',
    () => processSQLString(''),
    'no SQL statements found');

  checkThrows('Whitespace only SQL string',
    () => processSQLString('   \n\t  '),
    'no SQL statements found');

  checkThrows('Comment only SQL string',
    () => processSQLString('-- nothing to see here\n'),
    'no SQL statements found');

  // The same is true when multiple statements are allowed, since an empty SQL
  // file cannot produce a query module.
  checkThrows('Empty SQL string when multiple statements are allowed',
    () => processSQLString('', 'test_action', true),
    'no SQL statements found');
});


/******************************************************************************/


/* This set of tests validates that the mapBinds() helper can correctly
 * convert user-provided bind values into the ordered array that D1 expects,
 * and that it correctly rejects invalid inputs. */
aegis.test`Bind Mapping`(() => {
  // Sample metadata for the tests below.
  const anonMeta = { style: BIND_STYLE_ANONYMOUS, argCount: 2 };
  const numberedMeta = { style: BIND_STYLE_NUMBERED, argCount: 2 };
  const namedMeta = { style: BIND_STYLE_NAMED, argCount: 2, params: { id: 1, name: 0 } };
  const noParamsMeta = { style: BIND_STYLE_ANONYMOUS, argCount: 0 };

  // Correctly passing an array for an anonymous query.
  const anonymous = mapBinds(anonMeta, [1, 'bob']);
  $.check`mapping anonymous binds`(
    $.isArray(anonymous),
    $.eq(anonymous.length, 2),
    $.eq(anonymous[0], 1),
    $.eq(anonymous[1], 'bob')
  );

  // Correctly passing an array for a numbered query.
  const numbered = mapBinds(numberedMeta, [1, 'bob']);
  $.check`mapping numbered binds`(
    $.isArray(numbered),
    $.eq(numbered.length, 2),
    $.eq(numbered[0], 1),
    $.eq(numbered[1], 'bob')
  );

  // Correctly passing an object for a named query.
  const named = mapBinds(namedMeta, { name: 'bob', id: 1 });
  $.check`mapping named binds`(
    $.isArray(named),
    $.eq(named.length, 2),
    $.eq(named[0], 'bob'),
    $.eq(named[1], 1)
  );

  // Passing an array to a named query should fail.
  checkThrows('array for named query',
    () => mapBinds(namedMeta, [1, 'bob']),
    'an array of bind values cannot be used with named parameters');

  // Passing an object to an anonymous query should fail.
  checkThrows('object for anonymous query',
    () => mapBinds(anonMeta, { name: 'bob', id: 1 }),
    'an object of bind values can only be used with named parameters');

  // Passing an object to a numbered query should fail.
  checkThrows('object for numbered query',
    () => mapBinds(numberedMeta, { name: 'bob', id: 1 }),
    'an object of bind values can only be used with named parameters');

  // Passing an array with too few elements should fail.
  checkThrows('anonymous binds with too few arguments',
    () => mapBinds(anonMeta, [1]),
    'incorrect number of bind parameters; expected 2, got 1');

  // Passing an object with missing keys should fail.
  checkThrows('named binds with missing arguments',
    () => mapBinds(namedMeta, { name: 'bob' }),
    'incorrect number of bind parameters; expected 2, got 1');

  // Passing an object with extra keys should fail.
  checkThrows('named binds with extra arguments',
    () => mapBinds(namedMeta, { name: 'bob', id: 1, extra: 'field' }),
    "'extra' is not a valid bind parameter for this query");

  // Passing binds to a statement that expects none should fail.
  checkThrows('binds for statement with no parameters',
    () => mapBinds(noParamsMeta, []),
    'statement does not accept any bind parameters');

  // Properties that are inherited rather than owned are not bind arguments;
  // iterating them makes an object that inherits from another look like it
  // carries bind values that it does not.
  const inherited = mapBinds(namedMeta, Object.assign(Object.create({ extra: 'inherited' }),
    { name: 'bob', id: 1 }));
  $.check`named binds ignore inherited properties`(
    $.isArray(inherited),
    $.eq(inherited.length, 2),
    $.eq(inherited[0], 'bob'),
    $.eq(inherited[1], 1)
  );
});


/******************************************************************************/


/* This set of tests covers the rendering that the setup file helper uses:
 * each statement comes back as the text to execute, with the comments and
 * layout of the file dropped. */
aegis.test`Statement Rendering`(() => {
  const rendered = renderSQLStatements(`
    -- create the table
    CREATE TABLE Thing (
      id INTEGER PRIMARY KEY,
      name TEXT
    );

    /* seed it */
    INSERT INTO Thing (name) VALUES ('one');
  `);
  $.check`comments and layout are dropped`(
    $.isArray(rendered),
    $.eq(rendered.length, 2),
    $.eq(rendered[0].includes('--'), false),
    $.eq(rendered[0].includes('/*'), false),
    $.eq(rendered[0].includes('CREATE TABLE Thing'), true),
    $.eq(rendered[1].includes("'one'"), true)
  );

  // Trailing semicolons produce empty statements in the parser's output,
  // which must not come back as statements to execute.
  const trailing = renderSQLStatements('SELECT 1;;');
  $.check`trailing semicolons produce no statements`(
    $.isArray(trailing),
    $.eq(trailing.length, 1)
  );

  const commentOnly = renderSQLStatements('-- nothing here\n');
  $.check`a file with only a comment has no statements`(
    $.isArray(commentOnly),
    $.eq(commentOnly.length, 0)
  );

  // A trigger body contains semicolons of its own; the statement has to come
  // back whole rather than being split at each of them.
  const trigger = renderSQLStatements(`
    CREATE TRIGGER thing_audit AFTER INSERT ON Thing
    BEGIN
      INSERT INTO Thing (name) VALUES ('audit');
    END;
  `);
  $.check`a trigger is kept as a single statement`(
    $.isArray(trigger),
    $.eq(trigger.length, 1),
    $.eq(trigger[0].includes('BEGIN'), true),
    $.eq(trigger[0].includes('END'), true)
  );
});


/******************************************************************************/


/* This set of tests validates that the canProduceResult flag is correctly
 * set on statements that can and cannot produce results. */
aegis.test`Result Producing Statement Detection`(() => {
  // Statements that can produce results
  checkFlag('SELECT statement', 'SELECT * FROM Users;', true);
  checkFlag('PRAGMA statement', 'PRAGMA table_info(Users);', true);
  checkFlag('EXPLAIN statement', 'EXPLAIN SELECT * FROM Users;', true);
  checkFlag('VALUES statement', 'VALUES (1, 2), (3, 4);', true);
  checkFlag('INSERT with RETURNING',
    'INSERT INTO Users (name) VALUES ("test") RETURNING *;', true);
  checkFlag('UPDATE with RETURNING',
    'UPDATE Users SET name = "new" WHERE id = 1 RETURNING *;', true);
  checkFlag('DELETE with RETURNING',
    'DELETE FROM Users WHERE id = 1 RETURNING *;', true);

  // Statements that do not produce results
  checkFlag('INSERT without RETURNING',
    'INSERT INTO Users (name) VALUES ("test");', false);
  checkFlag('UPDATE without RETURNING',
    'UPDATE Users SET name = "new" WHERE id = 1;', false);
  checkFlag('DELETE without RETURNING',
    'DELETE FROM Users WHERE id = 1;', false);
  checkFlag('CREATE TABLE statement',
    'CREATE TABLE Test (id INTEGER PRIMARY KEY);', false);
  checkFlag('ALTER TABLE statement',
    'ALTER TABLE Users ADD COLUMN age INTEGER;', false);
  checkFlag('DROP TABLE statement', 'DROP TABLE Users;', false);
  checkFlag('CREATE INDEX statement',
    'CREATE INDEX idx_name ON Users (name);', false);
  checkFlag('DROP INDEX statement', 'DROP INDEX idx_name;', false);
});


/******************************************************************************/
