import { Collection, $check, $ } from "@axel669/aegis";

import { execSQLFiles } from "../aegis/index.js";


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
});


/******************************************************************************/
