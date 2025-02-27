# Simple D1 Query

`d1-query` is a very simple set of wrapper functions that allow for working with
[Cloudflare D1](https://developers.cloudflare.com/d1/) queries in a
[Cloudflare Worker](https://developers.cloudflare.com/workers/) or in
[Cloudflare Pages](https://developers.cloudflare.com/pages/).

`D1` wraps [SQLite](https://sqlite.org/) and requires you to make queries via
`SQL` statements.

This library is a small convenience around this which in no way shields you
from having to write the actual SQL, but which makes it slightly more
expressive to create queries and batches of queries.

In addition, the library does logging to help trace the queries that are being
made, and how many rows were read and written as a part of it.


## Installation

Install `d1-query` via `npm`, `pnpm`, and so on, in the usual way.

```sh
npm install @odatnurd/d1-query
```

## Usage

`D1` requires you to provide it `SQL` statements to execute; this is generally
done via preparing a statement, optionally binding values to parameters in the
statement, and then executing it to fetch the results back.

The results of a D1 query take the form:

```json
{
  "success": true,
  "meta": {
    "served_by": "miniflare.db",
    "duration": 0,
    "changes": 0,
    "last_row_id": 1,
    "changed_db": false,
    "size_after": 12288,
    "rows_read": 1,
    "rows_written": 0
  },
  "results": [ { "id": 1, "name": "Bob" } ]
}
```

where the `meta` field provides information about the query, including how
many rows in the database had to be read or written to provide the data, with
the actual results (if any) showing up in the `results` key.

The routines in `d1-query` make it a bit easier and shorter to make requests,
particularly when reusing the same query multiple times via binds.

When queries are made, the return is stripped of the `meta`, providing you just
the value of the `results` (or in the case of `dbFetchOne`, the first argument
in the `results` array rather than the whole list).

As an addition convenience, returned results have any fields whose names start
with `is[A-Z]` converted into `bool` values, since `D1` accepts `true` or
`false` when doing inserts and maps them to `1` and `0` respectively, but does
not do the same mapping on the return.


## Methods

```js
export function dbPrepareStatements(db, ...sqlargs) {}
```

Given a database binding and an array of `sqlargs` (see below), return back a
prepared statement or statements ready to be executed on the given database.

The provided `sqlargs` are an open ended array that can consist of:

1. `D1PreparedStatement` instances from previously compiled SQL statements
2. strings that contain SQL queries to be compiled
3. arrays that contain parameter values to be bound to statements

When an array is seen, it is presumed to associate with the statement that
preceded it in the list, and will be used to bind arguments to the statement to
control the execution. It is possible for multiple entries in a row to be
arrays, allowing you to bind two versions of the same statement at once if
desired.

The return value is either a single prepared statement ready to execute, or an
array of prepared statements, depending on whether or not the input array
contains information for more than one statement or not.

---

```js
export async function dbRawQuery(db, statements, action) {}
```

Take as arguments the database in use, either a single prepared statement or an
array of prepared statements, and an indication of what is making the query,
and perform it.

A single statement is executed normally while an array is executed as a batch
of queries.

Logs will be generated outlining the results, and the results will be
returned back.

The returned results have the `D1` metadata stripped from them, so that they're
more useful to the caller.

---

```js
export async function dbFetch(db, action, ...sqlargs) {}
```

Execute a fetch operation on the provided database, using the data in `sqlargs`
to create the statement(s) to be executed, and return the result(s) of the
query after logging statistics such as the rows read and written, which will be
annotated with the action string provided to give context to the operation.

The provided `sqlargs` is a variable length list of arguments that consists of
strings to be compiled to SQL, previously compiled statements, and/or arrays of
values to bind to statements.

For the purposes of binding, arrays will bind to the most recently seen
statement, allowing you to compile one statement and bind it multiple times if
desired.

When more than one statement is provided, all statements will be executed as a
batch operation, which implicitly runs as a transaction.

The return value is the direct result of executing the query or queries given
in `sqlargs`; this is either a (potentially empty) array of result rows, or an
array of such arrays (if a batch). As with `dbRawQuery`, the `meta` is stripped
from the results, providing you just the actual query result.

---

```js
export async function dbFetchOne(db, action, ...sqlargs) {}
```

This executes as `dbFetch()` does, except that the return value is either the
first element of the result, or null if the result did not contain any rows.

When executed on a batch statement this will return the entire result set of
the first query in the batch, which may or may not be what you expect.


## Examples

The following examples assume that a `Cloudflare` worker has been configured
with a database binding such as the following in the `wrangler.toml` file:

```toml
[[d1_databases]]
binding = "DB"
database_name = "my-db-here"
database_id = "9c171c69-1142-1234-b2f4-e1e5d9c81928"
```

```js
// Prepare a single statement for later execution
const stmt1 = await dbPrepareStatements(ctx.env.DB,
    'SELECT * FROM Users'
);

// Single statement, but searching for a specific user.
const stmt2 = await dbPrepareStatements(ctx.env.DB,
    'SELECT * FROM Users WHERE userId = ? OR username = ?'
    [1, 'bob']
);

// Reuse a previously compiled statement, but bind a new user.
const stmt3 = await dbPrepareStatements(ctx.env.DB,
    stmt2,
    [69, 'jim']
);

// Perform an insert; arrays of bind parameters always apply to the most
// recently seen statement in the array, so batches of queries can easily re-use
// the same compiled statement.
const inserts = await dbPrepareStatements(ctx.env.DB,
    'INSERT INTO Users (userId, username) VALUES (?, ?)',

    // Three arrays all bind to the same statement, creating a batch that
    // executes the same statement three times, with different arguments each
    // time.
    [2, 'frank'],
    [3, 'john'],
    [4, 'alice']
);
```

Once you have prepared statements, you can execute them via `dbRawQuery`; this
takes the result of a previous call to `dbPrepareStatements` and executes them.

When given a single statement, the statement is executed and the result is
returned back as a (potentially empty) array of objects that represent the
matched rows.

When given an array of statements, all statements are executed as a `batch`; in
this mode, a `transaction` is used; so all statements either succeed or fail.

In this mode, the return value is an array of results; the resulting return will
contain one array for each of the statements.

The `action` argument to the method is a description of where or why the
query is being made; it is used in the resulting logged output to provide a
trace for why the query was made.

```js
// Execute the statement
let result = await dbRawQuery(ctx.env.DB, stmt1, 'fetch_users');
console.log(result);

// Produces:
// [0ms]  fetch_users :  OK  : last_row_id=69, reads=2, writes=0, resultSize=2
// [ { userId: 1, username: 'bob' }, { userId: 69, username: 'jim' } ]

// This can also execute multiple statements as a batch.
result = await dbRawQuery(ctx.env.DB, inserts, 'insert_users');
console.log(result);

// Produces:
// [0ms]   => insert_users :  OK  : last_row_id=2, reads=1, writes=1, resultSize=0
// [1ms]   => insert_users :  OK  : last_row_id=3, reads=1, writes=1, resultSize=0
// [0ms]   => insert_users :  OK  : last_row_id=4, reads=1, writes=1, resultSize=0
// [ [], [], [] ]
```

`dbFetch` is a convenience wrapper around the prior two functions, and is
useful for cases where you do not need to capture the  statements that are
compiled and you just need to execute them.

The two examples above could also be expressed as the following; note that in
this form, the `action` comes before the SQL statements.

```js
let result = await dbFetch(ctx.env.DB, 'fetch_users', 'SELECT * FROM Users');

result = await dbFetch(ctx.env.DB, 'insert_users',
    'INSERT INTO Users (userId, username) VALUES (?, ?)',

    // Three arrays all bind to the same statement, creating a batch that
    // executes the same statement three times, with different arguments each
    // time.
    [2, 'frank'],
    [3, 'john'],
    [4, 'alice']
);
```

`dbFetchOne` is a convenience wrapper around `dbFetch`; here if the result of
the query is no rows, `null` is returned; otherwise the return value is just
the first result, even if there are many results returned.

```js
let result = await dbFetch(ctx.env.DB, 'fetch_users', 'SELECT * FROM Users');
console.log(result);

// Produces
// [0ms]  fetch_users :  OK  : last_row_id=69, reads=2, writes=0, resultSize=2
// [ { userId: 1, username: 'bob' }, { userId: 69, username: 'jim' } ]

result = await dbFetchOne(ctx.env.DB, 'fetch_users', 'SELECT * FROM Users');
console.log(result);

// Produces
// [0ms]  fetch_users :  OK  : last_row_id=69, reads=2, writes=0, resultSize=2
// { userId: 1, username: 'bob' }
```
