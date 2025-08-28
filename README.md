# Simple D1 Query

Cloudflare `D1` is a serverless database built on the rock-solid foundation of
[SQLite](https://sqlite.org/), offering data storage to your applications
without managing any infrastructure. All interactions with the database are
performed using standard `SQL`, making it straightforward to query and manage
your data.

`D1` is designed to be tightly integrated with
[Cloudflare Workers](https://developers.cloudflare.com/workers/) and
[Cloudflare Pages](https://developers.cloudflare.com/pages/), providing a
powerful and direct way to build full-stack applications.

One of its most attractive features is the cost model, which is often low to
completely free depending on your traffic. Usage is calculated based on
straightforward metrics; the number of rows read and rows written. This makes
it a highly predictable and affordable solution for projects of any scale.

`d1-query` is a simple interface to D1, offering convenience in managing and
executing your queries, while at the same time making it easier for you to track
the performance of your queries by way of logging that tells you what operations
you are undertaking.

Being based on `SQLite`, `D1` allows you to use
[bound parameters](https://www.sqlite.org/lang_expr.html#parameters) in your
queries for data safety and to allow easy statement reuse. However, as
(currently) implemented by `D1`, only anonymous (`?`) binds are allowed.

`d1-query` contains a built in wrapper that allows you to use all styles of
binds in your queries, transforming such queries on the fly into a version that
`D1` can understand, and allowing you to create more readable and
understandable queries.

> ⚠️ Although it is technically value SQL to mix different types of binding
> parameters together within the same statement, `d1-query` forcibly disallows
> this, requiring you to be consistent with how you bind. You're welcome.

> ℹ️ In order to accomplish this, your SQL must be parsed by the library before
> it is handed over to `D1` to execute. This parse will only happen once (if you
> reuse the resulting prepared statement) but will add a small overhead.
>
> When using the [Rollup plugin](#rollup-plugin) that ships with the package,
> this step happens during bundling and not at runtime, removing this overhead.


## Installation

Install `d1-query` via `npm`, `pnpm`, and so on, in the usual way.

```sh
npm install @odatnurd/d1-query
```


## Usage Examples

The following examples assume that a `Cloudflare` worker has been configured
with a database binding such as the following:

```toml
[[d1_databases]]
binding = "DB"
database_name = "my-db-here"
database_id = "9c171c69-1142-1234-b2f4-e1e5d9c81928"
```

```js
// Prepare a single statement for later execution
const stmt1 = dbPrepareStatements(ctx.env.DB,
    'SELECT * FROM Users'
);

// Single statement, but searching for a specific user via anonymous binds,
// which are provided via array.
const stmt2 = dbPrepareStatements(ctx.env.DB,
    'SELECT * FROM Users WHERE userId = ? OR username = ?'
    [1, 'bob']
);

// Another single statement, augmented to use named binds instead; here the
// binds are provided via an object.
const stmt3 = dbPrepareStatements(ctx.env.DB,
    'SELECT * FROM Users WHERE userId = :userId OR username = :userName'
    { userId: 69, userName: 'jim'}
);

// Once a statement has been prepared once, you can re-use it and bind it to
// different arguments; this does not need to recompile the SQL; this works for
// any statement that takes bind parameters.
const stmt4 = dbPrepareStatements(ctx.env.DB, stmt2,
    [69, 'jim']
);

// A single statement (either prepared or just a SQL string) can be bound to
// multiple sets of bind values at once, producing an array of statements that
// can executed singly or via a batch operation, which implicitly wraps the
// execution in a transaction.
const inserts = await dbPrepareStatements(ctx.env.DB,
    'INSERT INTO Users (userId, username) VALUES (:userId, :userName)',

    // Three objects all bind to the same statement, creating a batch that
    // executes the same statement three times, with different arguments each
    // time. Also works with numbered or anonymous binds (but then you would
    // use an array).
    { userId: 67, userName: 'frank'  },
    { userId: 68, userName: 'stuart' },
    { userId: 69, userName: 'nice'   }
);
```

Once you have prepared statements, you can execute them via `dbRawQuery`; this
takes the result of a previous call to `dbPrepareStatements` and executes them.
See the [Library Methods](#library-methods) section for more details.

When given a single statement, the statement is executed and the result is
returned back as a (potentially empty) array of objects that represent the
matched rows.

When given an array of statements, all statements are executed as a `batch`; in
this mode, a `transaction` is used; so all statements either succeed or fail.
In this mode, the return value is an array of results; the resulting return
will contain one array for each of the statements in the batch, even if that
statement does not return any output (i.e. an `INSERT`).

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

// This can also execute multiple statements as a batch; in this case the result
// is a set of empty arrays, since insert do not generate results on their own.
result = await dbRawQuery(ctx.env.DB, inserts, 'insert_users');
console.log(result);

// Produces:
// [0ms]   => insert_users :  OK  : last_row_id=67, reads=1, writes=1, resultSize=0
// [1ms]   => insert_users :  OK  : last_row_id=68, reads=1, writes=1, resultSize=0
// [0ms]   => insert_users :  OK  : last_row_id=69, reads=1, writes=1, resultSize=0
// [ [], [], [] ]
```

`dbFetch` is a convenience wrapper around the prior two functions, and is
useful for cases where you do not need to capture the statements that are
compiled and you just need to execute them as a one-off operation.

The two examples above could also be expressed as the following; note that in
this form, the `action` comes before the SQL statements, since there are a
variable number of arguments.

```js
let result = await dbFetch(ctx.env.DB, 'fetch_users', 'SELECT * FROM Users');

// Unlike above, this example uses a numbered bind style just to showcase
// possible options; named binds still work here.
result = await dbFetch(ctx.env.DB, 'insert_users',
    'INSERT INTO Users (userId, username) VALUES (?1, ?2)',

    // Three arrays all bind to the same statement, creating a batch that
    // executes the same statement three times, with different arguments each
    // time.
    [67, 'frank'],
    [68, 'stuart'],
    [69, 'nice']
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


## Rollup Plugin

The package also includes a [Rollup](https://rollupjs.org/) plugin that allows
you to import a SQL file and have it directly wrapped in a call to
`dbPrepareStatements`, allowing for easily handling more complex queries
without them having to be inlined as strings in your code. This makes it easier
to leverage your editor of choice to maintain your SQL queries. In addition,
convenience exports allow you to prepare and execute in a single call.

To use the plugin, import it in your `rollup.config.js` file, and then include
it in the `plugins` list:

```js
// import the plugin
import d1sql from '@odatnurd/d1-query/rollup';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/index.js',
    format: 'es',
  },
  plugins: [
    // Add the plugin to the plugin list.
    d1sql(),
  ]
};
```

Once you've done this, you can import SQL files directly. The result of the
import is a module that provides both a `default` and several `named` exports,
for convenience.

### Exports

The generated module for an imported SQL file provided the following exports:

```js
export default function statements(db, ...binds) {}
```

Regardless of the number of bind arguments provided, the return value from the
call is either a single statement (when the SQL contains a single statement) or
an array of statements.

When no `binds` are provided, the function returns the statement or statements
that were imported from the SQL, already prepared and ready for further
execution.

If binds are given and the SQL contains a single statement that is bindable,
the call can contain any number of `binds` that are suitable for the statement,
and the result of the call is one copy of the statement for each bind that was
provided. A single bind will produce a single statement, while multiple binds
will return an array.

If binds are given and the SQL file contains multiple bindable statements, the
number of binds provided must exactly match the number of statements that take
bind arguments; the arguments will be bound to the statements in the order that
they appear in the file, and the result is an array of statements, where those
that have taken arguments will be bound.

```js
export async function fetch(db, action, ...binds) {}
export async function fetchOne(db, action, ...binds) {}
export async function execute(db, action, ...binds) {}
```

These functions simplify the query process by first calling `statements()` with
the provided binds, and then carrying out the actual query via `dbFetch()` or
`dbFetchOne()`. `execute()` performs as `fetch()` but does not return any
results back.


### Basic Usage: No Binds

```js
import { dbFetch } from '@odatnurd/d1-query';
import getUser from './get-user.sql';

// getUser is a function; calling it with the database gives you the
// prepared SQL statement, ready for execution.
const statements = getUser(ctx.env.DB);
const result = await dbFetch(ctx.env.DB, 'get_user_query', statements);
```


### Single Statement with multiple binds
```js
import { dbFetch } from '@odatnurd/d1-query';
import insertUser from './insert-user.sql';

// Assume insert-user.sql contains a single INSERT statement.
// We can provide multiple bind objects to create a batch operation.
const statements = insertUser(ctx.env.DB,
  { userId: 10, username: 'Alice' },
  { userId: 11, username: 'Bob' }
);

// This will execute the INSERT statement twice as a single batch; note that
// you need to spread the resulting statements because it is an array.
const result = await dbFetch(ctx.env.DB, 'batch_insert_users', ...statements);
```

An alternative to the above using the convenience method would be:

```js
import { fetch } from './insert-user.sql';

// Using fetch, execute directly while also performing the bind.
const result = await fetch(ctx.env.DB, 'batch_insert_users',
  { userId: 10, username: 'Alice' },
  { userId: 11, username: 'Bob' }
);
```


## Testing Utilities (Optional)

This package includes an optional set of helpers to facilitate testing your own
projects with the [Aegis](https://www.npmjs.com/package/@axel669/aegis) test
runner and an in-memory D1 database powered by Miniflare.

To use these utilities, you must install the required peer dependencies into
your own project's `devDependencies` if you have not already done so.

```sh
pnpm add -D @axel669/aegis miniflare fs-jetpack
```

The `@odatnurd/d1-query/aegis` module exports the following helper functions:

### Helper Functions

```javascript
export function initializeD1Checks() {}
```
Registers all [custom checks](#custom-checks) with Aegis. This should be called
once at the top of your `aegis.config.js` file.

---

```javascript
export async function aegisSetup(ctx, sqlSetupFiles = undefined, dbName = 'DB') {}
```
An async function to be called from the `setup` hook in your Aegis config. It
creates a new Miniflare instance with an in-memory D1 database and, if
provided, executes one or more SQL files to prepare the database schema and
data.

The provided Aegis scope (e.g. runScope) object will be populated with a `db`
property that provides the database context, and a `worker` property that
stores the Miniflare worker. You can control the Miniflare DB binding name with
dbName if desired.

You may also optionally pass either a SQL file name as a string or an array of
SQL file names to populate the database.

---

```javascript
export async function aegisTeardown(ctx) {}
```
An async function to be called from the `teardown` hook in your Aegis config
that aligns with the `setup` hook. It safely disposes of the Miniflare instance
created by `aegisSetup`.


### Configuration

You can import the helper functions into your `aegis.config.js` file to easily
set up a test environment, optionally also populating one or more SQL files into
the database first in order to set up testing.

**Example `aegis.config.js`:**

```js
import { initializeD1Checks, aegisSetup, aegisTeardown } from '@odatnurd/d1-query/aegis';

// Register the custom checks provided by the library (see below)
initializeD1Checks();

export const config = {
    files: [
        "test/**/*.test.js",
    ],
    hooks: {
        async setup(ctx) {
            await aegisSetup(ctx, 'test/setup.sql', 'DB');
        },

        async teardown(ctx) {
            await aegisTeardown(ctx);
        },
    },
    failAction: "afterSection",
}
```


### Custom Checks

The `initializeD1Checks()` function registers several custom checks with Aegis
to simplify testing database-related logic.

* `.isArray($)`: Checks if a value is an array.
* `.isNotArray($)`: Checks if a value is not an array.
* `.isObject($)`: Checks if a value is a plain object.
* `.isNotObject($)`: Checks if a value is not a plain object.
* `.keyCount($, count)`: Checks if an object has an exact number of keys.
* `.isFunction($)`: A shortcut to check if a value is an instance of
  `Function`.
* `.isStatement($)`: A shortcut to check if a value is an instance of
  `SQLStatement`.
* `.bindType($, type)`: Assumes the value is an `SQLStatement` and checks that
  its `bindMetadata.style` property matches the provided string
  (e.g., `'anonymous'`, `'named'`).
* `.argCount($, count)`: Assumes the value is an `SQLStatement` and checks that
  its `bindMetadata.argCount` property matches the provided number.
* `.argNames($, names)`: Assumes the value is an `SQLStatement` with named
  parameters.
    * If `names` is an **array**, it validates that the statement's bind
      parameters are exactly those in the array, regardless of order.
    * If `names` is an **object**, it validates that the statement's bind
      parameters and their numeric positions match the keys and values of the
      object exactly.


## Library Methods

```js
export function dbPrepareStatements(db, ...sqlargs) {}
```

Given a database binding and an array of `sqlargs` (see below), return back a
prepared statement or statements ready to be executed on the given database.

The provided `sqlargs` are an open ended array that can consist of:

1. `SQLStatement` instances from previously compiled SQL statements
2. strings that contain SQL queries to be compiled
3. arrays or objects that contain parameter values to be bound to statements

When an array or object is seen, it is presumed to associate with the statement
that preceded it in the list, and will be used to bind arguments to the
statement to control the execution. Arrays are used to bind to statements that
use the `?` or `?NNN` style bind arguments, while objects are used for statements
that use the `$name`, `:name` or `@name` style of bind.

It is possible for multiple entries in a row to be arrays or objects, allowing
you to bind multiple versions of the same statement at once if desired.

The return value is either a single `SQLStatement` instance ready to execute
via the functions in the library, or an array of  `SQLStatement` instances,
depending on whether or not the input contains information for more than one
statement or not.

---

```js
export async function dbRawQuery(db, statements, action) {}
```

Take as arguments the database binding use, either a single `SQLStatement`
instance or an array of `SQLStatement` instances, and an indication of what is
making the query, and perform it.

A single statement is executed normally while an array is executed as a batch
of queries (and thus implicitly execute within a `D1` transaction).

Logs will be generated outlining the results, and the results will be returned
back.

The returned results have the `D1` metadata stripped from them, so that they're
more useful to the caller.

---

```js
export async function dbFetch(db, action, ...sqlargs) {}
```

Execute a fetch operation on the provided database binding, using the data in
`sqlargs` to create the statement(s) to be executed, and return the result(s)
of the query after logging statistics such as the rows read and written, which
will be annotated with the action string provided to give context to the
operation.

The provided `sqlargs` is a variable length list of arguments that consists of
strings to be compiled to SQL, previously compiled SQLStatement instances,
and/or arrays/objects for values to bind to statements.

For the purposes of binding, arrays and objects will bind to the most recently
seen statement, allowing you to provide one statement and bind it multiple
times, or multiple statements each bound multiple times, etc.

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


## Acknowledgements

This project includes a modified SQL parser derived from the node-sql-parser`
library, which is licensed under the Apache License 2.0. The original project
can be found at [https://github.com/taozhi8833998/node-sql-
parser](https://github.com/taozhi8833998/node-sql-parser).

A copy of the Apache License 2.0 is included in this repository as `LICENSE
.node-sql-parser`.
