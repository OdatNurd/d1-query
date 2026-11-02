import { Collection, $check, $ } from "@axel669/aegis";

import fs from 'fs-jetpack';

import { execSQLFiles } from "../aegis/index.js";
import { dbFetch } from "../lib/query.js";


/******************************************************************************/


export default Collection`Aegis Helpers`({
  /* The SQL setup files are read and executed before the tests run, so a bad
   * filename has to be reported as a problem with the file rather than as a
   * parse error from passing nothing to the parser. */
  "SQL Setup Files": async ({ runScope: ctx }) => {
    await $check`missing SQL file names the file it could not read`
      .call(() => execSQLFiles(ctx.env.DB, 'test/not-a-real-file.sql'))
      .throws($, 'cannot read SQL setup file: test/not-a-real-file.sql');
  },


  /****************************************************************************/

  /* A setup file is split into statements and each one is executed on its own, so
   * a compound statement has to survive the split: a trigger contains semicolons
   * in its body, and a version of it cut in half would not create anything (or
   * would create something that does not work). */
  "SQL Setup File Execution": async ({ runScope: ctx }) => {
    const setupPath = 'test/tmp trigger setup.sql';

    fs.write(setupPath, `
      -- A table and an audit table, kept in step by a trigger.
      CREATE TABLE TriggerThing (
        id INTEGER PRIMARY KEY,
        label TEXT NOT NULL
      );

      CREATE TABLE TriggerAudit (
        id INTEGER PRIMARY KEY,
        label TEXT NOT NULL
      );

      CREATE TRIGGER trigger_thing_audit
      AFTER INSERT ON TriggerThing
      BEGIN
        INSERT INTO TriggerAudit (label) VALUES (NEW.label);
      END;
    `);

    const lines = [];
    const original = console.log;
    console.log = (...args) => lines.push(args.join(' '));

    try {
      await execSQLFiles(ctx.env.DB, setupPath);
    } finally {
      console.log = original;
      fs.remove(setupPath);
    }

    // The file holds three statements; splitting the trigger at its body
    // semicolons would have produced more, and none of them would have worked.
    $check`every statement in the file was executed`
      .value(lines.filter(line => line.startsWith('> ')).length)
      .eq($, 3);

    $check`comments are not executed as SQL`
      .value(lines.some(line => line.includes('--')))
      .eq($, false);

    // The trigger only fires if it survived the split intact.
    await dbFetch(ctx.env.DB, 'trigger_setup_insert',
      "INSERT INTO TriggerThing (label) VALUES ('first');");

    $check`the trigger created by the file fires`
      .value(await dbFetch(ctx.env.DB, 'trigger_setup_check',
        'SELECT * FROM TriggerAudit;'))
      .isArray()
      .eq($.length, 1)
      .eq($[0].label, 'first');
  },
});


/******************************************************************************/
