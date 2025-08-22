/******************************************************************************/


import { SQLSyntaxError, SQLBindError } from './errors.js';

import { Parser } from './sqlite.js';


/******************************************************************************/


/* The style of bind parameters that are in use in a given statement; this is
 * either anonymous, in which case there are just unnamed `?` parameters,
 * numbered to indicate the ?NNN type bind, or it is named, in which case
 * parameters are specified by name. */
export const BIND_STYLE_ANONYMOUS = 'anonymous';
export const BIND_STYLE_NUMBERED = 'numbered';
export const BIND_STYLE_NAMED = 'named';

/* Create a single parser instance at module load time which will be used for
 * all of our SQL parsing needs. */
const sqlParser = new Parser();


/******************************************************************************/


/* Whenever as statement is compiled, we wrap it in an instance of this class.
 * This allows us to track not only the compiled statement, but information on
 * any bound parameters so that we can ensure that we're binding correctly. */
export class SQLStatement {
  /* The compiled (and possibly bound) SQL statement, ready to be executed via
   * D1. When binding parameters, D1 creates a new statement that references the
   * original statement but alters the binds. */
  statement;

  /* The metadata on binds for the given statement. This has a field named
   * "style" that specifies whether the binds are anonymous or named, and then
   * either a field named "params" that specifies the named bind arguments and
   * their numbered location, or a "count" field that says how many anonymous
   * fields there are. */
  bindMetadata;

  constructor(statement, bindMetadata = null) {
    this.statement = statement;
    this.bindMetadata = bindMetadata;
  }
}


/******************************************************************************/


/* This helper function is used by processSQLString() to recursively walk the
 * nodes in the AST produced by the SQL parser and invoke the given callback
 * function on each node that's visited.
 *
 * This is used to detect places where bind arguments are in the AST so that
 * they can be processed and converted into a different style. */
function walkAST(node, callback) {
  // We can leave if there's no node.
  if (node === null || typeof node !== 'object') {
    return;
  }

  // Invoke the callback with this node so it can adjust as needed.
  callback(node);

  // Iterate over all of the properties in this node, skipping any that are
  // inherited, and recursively call ourselves for each of the nodes.
  for (const key in node) {
    if (Object.hasOwn(node, key) === false) {
      continue;
    }

    const value = node[key];
    if (Array.isArray(value) === true) {
      value.forEach(item => walkAST(item, callback));
    } else if (value !== null && typeof value === 'object') {
      walkAST(value, callback);
    }
  }
}


/******************************************************************************/


/* This helper function processes the AST for a single statement that has been
 * compiled from SQL by our parser, in order to look for bind parameter nodes,
 * as well as nodes that could be inferred to bind parameters, such as fields
 * that start with a "$" or ":".
 *
 * Any bind arguments are collected into a metadata object, and the AST is
 * modified to replace the bind parameter with a numbered bind instead. For
 * example a statement like:
 *     "SELECT * FROM Table WHERE a = :one and b = :two"
 *
 * would get rewritten to:
 *     "SELECT * FROM Table WHERE a = ?1 and b = ?2"
 *
 * A mapping metadata object indicates that the "one" key should be passed as
 * the first bind and the "two" key as the second, thus converting from a
 * named bind (which D1 does not support) to a numbered bind (which D1 supports)
 * transparently.
 *
 * Note that a side effect of this is that numbered binds cannot be used in the
 * input directly, because (at the moment) the parsing library does not support
 * them.
 *
 * The function returns an object that contains the rewritten XML as well as
 * the bind arguments.
 *
 * The intent is that once the SQL is parsed once (by D1 eventually) it never
 * needs to be parsed again and the same prepared statement would be re-used,
 * so extra time spent is negligible in the grand scheme of things. */
function processSingleAST(ast) {
  // The detected bind arguments in the statement (if any). This tracks the
  // style of the binds, as well as either the number of anonymous binds (for
  // error checking purposes) or a map that maps the named binds to their
  // numeric position in the rewritten statement.
  const params = {
    style: null,
    argCount: 0,
    named: new Map()
  };

  // Set the style of arguments that we're using, doing a quick test to ensure
  // that the style matches what has been seen thus far and raising an error if
  // it does not.
  const setStyle = (newStyle) => {
    if (params.style === null) {
      params.style = newStyle;
    } else if (params.style !== newStyle) {
      throw new SQLSyntaxError(`cannot mix bind parameter styles; expected '${params.style}' but found '${newStyle}'`);
    }
  };

  // Walk the compiled AST that we were given, looking for the various types
  // of node that indicate that this is a potential bind parameter. When found
  // the node is altered as needed to a version valid for D1, while keeping any
  // metadata we need to allow us to provide the named argument to D1 properly.
  walkAST(ast, (node) => {
    // Nodes of this type are straight anonymous bind arguments; in the case of
    // these, we just update the count of parameters and we're done.
    if (node.type === 'origin' && node.value === '?') {
      setStyle('?');
      params.argCount++;
      return;
    }

    // This is a numbered bind parameter; make sure it doesn't mix with other
    // styles and then update the max count seen so far.
    if (node.type === 'origin' && node.value.startsWith('?')) {
      setStyle('?#');
      const bindIndex = parseInt(node.value.substring(1), 10);
      if (bindIndex > params.argCount) {
        params.argCount = bindIndex;
      }
      return;
    }

    let paramName = null;
    let paramStyle = null;

    // Check to see if this node type is one of the ones we can use for bind
    // arguments; if so, we can pull the name out and set the appropriate style
    // of the argument.
    if (node.type === 'param' && node.value !== null) {
      paramName = node.value;
      paramStyle = ':';
    } else if (node.type === 'var' && (node.prefix === '$' || node.prefix === '@')) {
      paramName = node.name;
      paramStyle = node.prefix;
    }

    // Did we find a parameter?
    if (paramName !== null) {
      // Set the style, and put this parameter into the map if it's not already
      // there. The map stores as a value for the parameter the 0 based index of
      // parameter based on where it was seen.
      setStyle(paramStyle);
      if (params.named.has(paramName) === false) {
        params.named.set(paramName, params.argCount);
        params.argCount++;
      }

      // Update the node so that instead of being the type we thought it was, it
      // becomes a numbered bind argument; the bind needs to use a number one
      // higher since numbered binds are 1 based.
      node.type = 'origin';
      node.value = `?${params.named.get(paramName) + 1}`;
      delete node.name;
      delete node.prefix;
      delete node.members;
    }
  });

  // Set up the bind metadata we want to return; note that no bind arguments
  // at all are conveyed as anonymous bind arguments, but with no arguments
  // given.
  let bindMetadata;
  if (params.style === ':' || params.style === '$' || params.style === '@') {
    bindMetadata = {
      style: BIND_STYLE_NAMED,
      argCount: params.argCount,
      params: Object.fromEntries(params.named)
    };
  } else if (params.style === '?#') {
    bindMetadata = {
      style: BIND_STYLE_NUMBERED,
      argCount: params.argCount
    };
  } else {
    bindMetadata = {
      style: BIND_STYLE_ANONYMOUS,
      argCount: params.argCount
    };
  }

  // Convert the AST back into SQL and return that and the bind metadata back.
  const newSql = sqlParser.sqlify(ast);
  return { sql: newSql, bindMetadata };
}


/******************************************************************************/


/* Given a string that contains one or more SQL statements, process them to find
 * the bind arguments, rewriting the SQL as needed to turn named binds into
 * numbered ?# style binds.
 *
 * This is done by compiling the SQL to an AST and the modifying the tree as
 * needed.
 *
 * The return value is an object that contains the newly modified SQL as well as
 * a metadata object that describes the binds.
 *
 * if allowMultiple is false, any SQL that is provided that contains more than
 * one statement will cause an error to be raised.
 *
 * In the case of multiple statements being allowed, the return value of the
 * call is an array of the objects described above, one for each of the found
 * statements. */
export function processSQLString(sql, allowMultiple = false) {
  let ast;
  try {
    ast = sqlParser.astify(sql);
    if (Array.isArray(ast) === false) {
      ast = [ast];
    }
  } catch (err) {
    throw new SQLSyntaxError('invalid SQL syntax', { cause: err });
  }

  // If we found more than one statement but we were not asked to allow that,
  // then trigger an error.
  if (allowMultiple === false && ast.length > 1) {
    throw new SQLSyntaxError('multiple statements found, but allowMutliple is false');
  }

  // Using our helper, map each AST in order to find and rewrite any named binds
  // and get the appropriate metadata.
  const results = ast.map(singleAst => processSingleAST(singleAst));

  // console.log("\nOrg SQL\n-------\n", sql);
  // results.forEach(({ sql: newSql, bindMetadata }) => {
  //   console.log("\nNew SQL\n-------\n", newSql);
  //   console.log("\nBind Metadata\n", bindMetadata);
  // });

  return allowMultiple ? results : results[0];
}


/******************************************************************************/


/* This function takes the bind metadata that was obtained during the initial
 * processing of a SQL statement and the values to be used for binds, and
 * converts the incoming values into an array for passing to the D1 bind
 * function for the statement.
 *
 * The values provided can be either an array if the bind arguments are of the
 * anonymous style, or an object if the statement uses the name style.
 *
 * The returned value is an array that has the arguments from the input values
 * suitably placed to work with the rewritten statement.
 *
 * This will raise exceptions if the number or type of bind arguments does not
 * match the statement; we error that here rather than waiting for the round
 * trip to D1 to have D1 tell us itself. */
export function mapBinds(metadata, values) {
  // Determine how many arguments we should have; for anonymous this is a
  // direct count, while for named arguments it's inferred from the number of
  // keys in the metadata parameter object.
  let orderedParams;
  const paramCount = metadata.argCount;

  // If the statement expects no parameters, any attempt to bind is an error.
  if (paramCount === 0) {
    throw new SQLBindError('statement does not accept any bind parameters');
  }

  // Array-style bind arguments are only allowed for statements using the
  // anonymous or numbered bind style; otherwise, the array that we got can be
  // directly used in the bind, after we validate it a little further down.
  if (Array.isArray(values)) {
    if (metadata.style === BIND_STYLE_NAMED) {
      throw new SQLBindError('an array of bind values cannot be used with named parameters');
    }
    orderedParams = values;

  // Objects are allowed for binds, but only for statements that have named
  // bind parameters.
  } else if (typeof values === 'object' && values !== null) {
    if (metadata.style !== BIND_STYLE_NAMED) {
      throw new SQLBindError('an object of bind values can only be used with named parameters');
    }

    const paramMap = metadata.params;
    orderedParams = new Array(paramCount);

    // Iterate over the keys in the provided values object and put them into
    // the appropriate position; throw an error if any of the bind arguments
    // does not exist.
    for (const key in values) {
      if (Object.hasOwn(paramMap, key) === false) {
        throw new SQLBindError(`'${key}' is not a valid bind parameter for this query`);
      }

      const index = paramMap[key];
      orderedParams[index] = values[key];
    }

  // If the input was neither, the caller did something dumb.
  } else {
    throw new SQLBindError('bind values must be an array or an object');
  }

  // Ensure that the number of arguments that were required were actually given
  // to us; check length but also that there are no holes, since for named binds
  // we create an array that's already the right length; thus the first test
  // will never trip if a named argument is missing.
  if (orderedParams.length !== paramCount || orderedParams.includes(undefined)) {
    const actualParamCount = orderedParams.filter(param => param !== undefined).length;
    throw new SQLBindError(`incorrect number of bind parameters; expected ${paramCount}, got ${actualParamCount}`);
  }

  return orderedParams;
}


/******************************************************************************/