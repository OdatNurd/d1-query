/******************************************************************************/


/* A custom error class for reporting SQL syntax errors in a consistent way,
 * abstracting away the underlying parser's specific error messages. */
export class SQLSyntaxError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'SQLSyntaxError';
  }
}


/* A custom error class for reporting SQL bind errors in a consistent way. */
export class SQLBindError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'SQLBindError';
  }
}


/******************************************************************************/
