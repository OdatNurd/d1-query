// node-sql-parser (sqlite) - v5.3.11-4cf0eed - 2025-08-27T15:59:26.946Z
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
}
function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}
function _createForOfIteratorHelper(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) {
      t && (r = t);
      var n = 0,
        F = function () {};
      return {
        s: F,
        n: function () {
          return n >= r.length ? {
            done: true
          } : {
            done: false,
            value: r[n++]
          };
        },
        e: function (r) {
          throw r;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o,
    a = true,
    u = false;
  return {
    s: function () {
      t = t.call(r);
    },
    n: function () {
      var r = t.next();
      return a = r.done, r;
    },
    e: function (r) {
      u = true, o = r;
    },
    f: function () {
      try {
        a || null == t.return || t.return();
      } finally {
        if (u) throw o;
      }
    }
  };
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

// const escapeMap = {
//   '\0'   : '\\0',
//   '\''   : '\\\'',
//   '"'    : '\\"',
//   '\b'   : '\\b',
//   '\n'   : '\\n',
//   '\r'   : '\\r',
//   '\t'   : '\\t',
//   '\x1a' : '\\Z',
//   // '\\'   : '\\\\',
// }

var DEFAULT_OPT = {
  database: "sqlite",
  type: 'table',
  trimQuery: true,
  parseOptions: {
    includeLocations: false
  }
};
var parserOpt = DEFAULT_OPT;
function commonOptionConnector(keyword, action, opt) {
  if (!opt) return;
  if (!keyword) return action(opt);
  return "".concat(keyword.toUpperCase(), " ").concat(action(opt));
}
function connector(keyword, str) {
  if (!str) return;
  return "".concat(keyword.toUpperCase(), " ").concat(str);
}

/**
 * @param {(Array|boolean|string|number|null)} value
 * @return {Object}
 */
function createValueExpr(value) {
  var type = _typeof(value);
  if (Array.isArray(value)) return {
    type: 'expr_list',
    value: value.map(createValueExpr)
  };
  if (value === null) return {
    type: 'null',
    value: null
  };
  switch (type) {
    case 'boolean':
      return {
        type: 'bool',
        value: value
      };
    case 'string':
      return {
        type: 'string',
        value: value
      };
    case 'number':
      return {
        type: 'number',
        value: value
      };
    default:
      throw new Error("Cannot convert value \"".concat(type, "\" to SQL"));
  }
}

/**
 * @param operator
 * @param left
 * @param right
 * @return {Object}
 */
function createBinaryExpr(operator, left, right) {
  var expr = {
    operator: operator,
    type: 'binary_expr'
  };
  expr.left = left.type ? left : createValueExpr(left);
  if (operator === 'BETWEEN' || operator === 'NOT BETWEEN') {
    expr.right = {
      type: 'expr_list',
      value: [createValueExpr(right[0]), createValueExpr(right[1])]
    };
    return expr;
  }
  expr.right = right.type ? right : createValueExpr(right);
  return expr;
}

/**
 * Replace param expressions
 *
 * @param {Object} ast    - AST object
 * @param {Object} keys   - Keys = parameter names, values = parameter values
 * @return {Object}     - Newly created AST object
 */
function replaceParamsInner(ast, keys) {
  Object.keys(ast).filter(function (key) {
    var value = ast[key];
    return Array.isArray(value) || _typeof(value) === 'object' && value !== null;
  }).forEach(function (key) {
    var expr = ast[key];
    if (!(_typeof(expr) === 'object' && expr.type === 'param')) return replaceParamsInner(expr, keys);
    if (typeof keys[expr.value] === 'undefined') throw new Error("no value for parameter :".concat(expr.value, " found"));
    ast[key] = createValueExpr(keys[expr.value]);
    return null;
  });
  return ast;
}
function escape(str) {
  return str;
  // const res = []
  // for (let i = 0, len = str.length; i < len; ++i) {
  //   let char = str[i]
  //   const escaped = escapeMap[char]
  //   if (escaped) char = escaped
  //   res.push(char)
  // }
  // return res.join('')
}
function getParserOpt() {
  return parserOpt;
}
function setParserOpt(opt) {
  parserOpt = opt;
}
function topToSQL(opt) {
  if (!opt) return;
  var value = opt.value,
    percent = opt.percent,
    parentheses = opt.parentheses;
  var val = parentheses ? "(".concat(value, ")") : value;
  var prefix = "TOP ".concat(val);
  if (!percent) return prefix;
  return "".concat(prefix, " ").concat(percent.toUpperCase());
}
function columnIdentifierToSql(ident) {
  var _getParserOpt = getParserOpt(),
    database = _getParserOpt.database;
  if (!ident) return;
  switch (database && database.toLowerCase()) {
    case 'athena':
    case 'db2':
    case 'postgresql':
    case 'redshift':
    case 'snowflake':
    case 'noql':
    case 'trino':
    case 'sqlite':
      return "\"".concat(ident, "\"");
    case 'transactsql':
      return "[".concat(ident, "]");
    case 'mysql':
    case 'mariadb':
    case 'bigquery':
    default:
      return "`".concat(ident, "`");
  }
}
function identifierToSql(ident, isDual, surround) {
  if (isDual === true) return "'".concat(ident, "'");
  if (!ident) return;
  if (ident === '*') return ident;
  if (surround) return "".concat(surround).concat(ident).concat(surround);
  var _getParserOpt2 = getParserOpt(),
    database = _getParserOpt2.database;
  switch (database && database.toLowerCase()) {
    case 'mysql':
    case 'mariadb':
      return "`".concat(ident, "`");
    case 'athena':
    case 'postgresql':
    case 'redshift':
    case 'snowflake':
    case 'trino':
    case 'noql':
    case 'sqlite':
      return "\"".concat(ident, "\"");
    case 'transactsql':
      return "[".concat(ident, "]");
    case 'bigquery':
    case 'db2':
      return ident;
    default:
      return "`".concat(ident, "`");
  }
}
function toUpper(val) {
  if (!val) return;
  return val.toUpperCase();
}
function hasVal(val) {
  return val;
}
function literalToSQL(literal) {
  if (!literal) return;
  var prefix = literal.prefix;
  var type = literal.type,
    parentheses = literal.parentheses,
    suffix = literal.suffix,
    value = literal.value;
  var str = _typeof(literal) === 'object' ? value : literal;
  switch (type) {
    case 'backticks_quote_string':
      str = "`".concat(escape(value), "`");
      break;
    case 'string':
      str = "'".concat(escape(value), "'");
      break;
    case 'regex_string':
      str = "r\"".concat(escape(value), "\"");
      break;
    case 'hex_string':
      str = "X'".concat(escape(value), "'");
      break;
    case 'full_hex_string':
      str = "0x".concat(escape(value));
      break;
    case 'natural_string':
      str = "N'".concat(escape(value), "'");
      break;
    case 'bit_string':
      str = "b'".concat(escape(value), "'");
      break;
    case 'double_quote_string':
      str = "\"".concat(escape(value), "\"");
      break;
    case 'single_quote_string':
      str = "'".concat(value, "'");
      break;
    case 'boolean':
    case 'bool':
      str = value ? 'TRUE' : 'FALSE';
      break;
    case 'null':
      str = 'NULL';
      break;
    case 'star':
      str = '*';
      break;
    case 'param':
      str = "".concat(prefix || ':').concat(value);
      prefix = null;
      break;
    case 'origin':
      str = value.toUpperCase();
      break;
    case 'date':
    case 'datetime':
    case 'time':
    case 'timestamp':
      str = "".concat(type.toUpperCase(), " '").concat(value, "'");
      break;
    case 'var_string':
      str = "N'".concat(escape(value), "'");
      break;
    case 'unicode_string':
      str = "U&'".concat(escape(value), "'");
      break;
  }
  var result = [];
  if (prefix) result.push(toUpper(prefix));
  result.push(str);
  if (suffix) {
    if (typeof suffix === 'string') result.push(suffix);
    if (_typeof(suffix) === 'object') {
      if (suffix.collate) result.push(collateToSQL(suffix.collate));else result.push(literalToSQL(suffix));
    }
  }
  str = result.join(' ');
  return parentheses ? "(".concat(str, ")") : str;
}
function commonTypeValue(opt) {
  if (!opt) return [];
  var type = opt.type,
    symbol = opt.symbol,
    value = opt.value;
  return [type.toUpperCase(), symbol, typeof value === 'string' ? value.toUpperCase() : literalToSQL(value)].filter(hasVal);
}
function replaceParams(ast, params) {
  return replaceParamsInner(JSON.parse(JSON.stringify(ast)), params);
}
function onPartitionsToSQL(expr) {
  var type = expr.type,
    partitions = expr.partitions;
  var result = [toUpper(type), "(".concat(partitions.map(function (partition) {
    var partitionType = partition.type;
    if (!(partitionType === 'range')) return literalToSQL(partition);
    var start = partition.start,
      end = partition.end,
      symbol = partition.symbol;
    return "".concat(literalToSQL(start), " ").concat(toUpper(symbol), " ").concat(literalToSQL(end));
  }).join(', '), ")")];
  return result.join(' ');
}
function dataTypeToSQL(expr) {
  var dataType = expr.dataType,
    length = expr.length,
    parentheses = expr.parentheses,
    scale = expr.scale,
    suffix = expr.suffix;
  var str = '';
  if (length != null) str = scale ? "".concat(length, ", ").concat(scale) : length;
  if (parentheses) str = "(".concat(str, ")");
  if (suffix && suffix.length) str += " ".concat(suffix.join(' '));
  return "".concat(dataType).concat(str);
}
function arrayStructTypeToSQL(expr) {
  if (!expr) return;
  var dataType = expr.dataType,
    definition = expr.definition,
    anglebracket = expr.anglebracket;
  var dataTypeUpper = toUpper(dataType);
  var isNotArrayOrStruct = dataTypeUpper !== 'ARRAY' && dataTypeUpper !== 'STRUCT';
  if (isNotArrayOrStruct) return dataTypeUpper;
  var result = definition && definition.map(function (field) {
    var fieldName = field.field_name,
      fieldType = field.field_type;
    var fieldResult = [fieldName, arrayStructTypeToSQL(fieldType)];
    return fieldResult.filter(hasVal).join(' ');
  }).join(', ');
  return anglebracket ? "".concat(dataTypeUpper, "<").concat(result, ">") : "".concat(dataTypeUpper, " ").concat(result);
}
function commentToSQL(comment) {
  if (!comment) return;
  var result = [];
  var keyword = comment.keyword,
    symbol = comment.symbol,
    value = comment.value;
  result.push(keyword.toUpperCase());
  if (symbol) result.push(symbol);
  result.push(literalToSQL(value));
  return result.join(' ');
}
function triggerEventToSQL(events) {
  return events.map(function (event) {
    var eventKw = event.keyword,
      args = event.args;
    var result = [toUpper(eventKw)];
    if (args) {
      var kwArgs = args.keyword,
        columns = args.columns;
      result.push(toUpper(kwArgs), columns.map(columnRefToSQL).join(', '));
    }
    return result.join(' ');
  }).join(' OR ');
}
function returningToSQL(returning) {
  if (!returning) return '';
  var columns = returning.columns;
  return ['RETURNING', columns.map(columnToSQL).filter(hasVal).join(', ')].join(' ');
}
function commonKeywordArgsToSQL(kwArgs) {
  if (!kwArgs) return [];
  return [toUpper(kwArgs.keyword), toUpper(kwArgs.args)];
}
function autoIncrementToSQL(autoIncrement) {
  if (!autoIncrement) return;
  if (typeof autoIncrement === 'string') {
    var _getParserOpt3 = getParserOpt(),
      database = _getParserOpt3.database;
    switch (database && database.toLowerCase()) {
      case 'sqlite':
        return 'AUTOINCREMENT';
      default:
        return 'AUTO_INCREMENT';
    }
  }
  var keyword = autoIncrement.keyword,
    seed = autoIncrement.seed,
    increment = autoIncrement.increment,
    parentheses = autoIncrement.parentheses;
  var result = toUpper(keyword);
  if (parentheses) result += "(".concat(literalToSQL(seed), ", ").concat(literalToSQL(increment), ")");
  return result;
}
function columnOrderListToSQL(columnOrderList) {
  if (!columnOrderList) return;
  return columnOrderList.map(columnOrderToSQL).filter(hasVal).join(', ');
}

var util = /*#__PURE__*/Object.freeze({
  __proto__: null,
  DEFAULT_OPT: DEFAULT_OPT,
  arrayStructTypeToSQL: arrayStructTypeToSQL,
  autoIncrementToSQL: autoIncrementToSQL,
  columnIdentifierToSql: columnIdentifierToSql,
  columnOrderListToSQL: columnOrderListToSQL,
  commentToSQL: commentToSQL,
  commonKeywordArgsToSQL: commonKeywordArgsToSQL,
  commonOptionConnector: commonOptionConnector,
  commonTypeValue: commonTypeValue,
  connector: connector,
  createBinaryExpr: createBinaryExpr,
  createValueExpr: createValueExpr,
  dataTypeToSQL: dataTypeToSQL,
  escape: escape,
  getParserOpt: getParserOpt,
  hasVal: hasVal,
  identifierToSql: identifierToSql,
  literalToSQL: literalToSQL,
  onPartitionsToSQL: onPartitionsToSQL,
  replaceParams: replaceParams,
  returningToSQL: returningToSQL,
  setParserOpt: setParserOpt,
  toUpper: toUpper,
  topToSQL: topToSQL,
  triggerEventToSQL: triggerEventToSQL
});

function indexTypeToSQL(indexType) {
  if (!indexType) return [];
  var keyword = indexType.keyword,
    type = indexType.type;
  return [keyword.toUpperCase(), toUpper(type)];
}
function indexOptionToSQL(indexOpt) {
  if (!indexOpt) return;
  var type = indexOpt.type,
    expr = indexOpt.expr,
    symbol = indexOpt.symbol;
  var upperType = type.toUpperCase();
  var indexOptArray = [];
  indexOptArray.push(upperType);
  switch (upperType) {
    case 'KEY_BLOCK_SIZE':
      if (symbol) indexOptArray.push(symbol);
      indexOptArray.push(literalToSQL(expr));
      break;
    case 'BTREE':
    case 'HASH':
      indexOptArray.length = 0;
      indexOptArray.push.apply(indexOptArray, _toConsumableArray(indexTypeToSQL(indexOpt)));
      break;
    case 'WITH PARSER':
      indexOptArray.push(expr);
      break;
    case 'VISIBLE':
    case 'INVISIBLE':
      break;
    case 'COMMENT':
      indexOptArray.shift();
      indexOptArray.push(commentToSQL(indexOpt));
      break;
    case 'DATA_COMPRESSION':
      indexOptArray.push(symbol, toUpper(expr.value), onPartitionsToSQL(expr.on));
      break;
    default:
      indexOptArray.push(symbol, literalToSQL(expr));
      break;
  }
  return indexOptArray.filter(hasVal).join(' ');
}
function indexOptionListToSQL(indexOptList) {
  if (!indexOptList) return [];
  return indexOptList.map(indexOptionToSQL);
}
function indexTypeAndOptionToSQL(indexDefinition) {
  var constraintType = indexDefinition.constraint_type,
    indexType = indexDefinition.index_type,
    _indexDefinition$inde = indexDefinition.index_options,
    indexOptions = _indexDefinition$inde === void 0 ? [] : _indexDefinition$inde,
    definition = indexDefinition.definition,
    on = indexDefinition.on,
    withExpr = indexDefinition["with"];
  var dataType = [];
  dataType.push.apply(dataType, _toConsumableArray(indexTypeToSQL(indexType)));
  if (definition && definition.length) {
    var definitionSQL = toUpper(constraintType) === 'CHECK' ? "(".concat(exprToSQL(definition[0]), ")") : "(".concat(definition.map(function (col) {
      return exprToSQL(col);
    }).join(', '), ")");
    dataType.push(definitionSQL);
  }
  dataType.push(indexOptionListToSQL(indexOptions).join(' '));
  if (withExpr) dataType.push("WITH (".concat(indexOptionListToSQL(withExpr).join(', '), ")"));
  if (on) dataType.push("ON [".concat(on, "]"));
  return dataType;
}
function indexDefinitionToSQL(indexDefinition) {
  var indexSQL = [];
  var keyword = indexDefinition.keyword,
    index = indexDefinition.index;
  indexSQL.push(toUpper(keyword));
  indexSQL.push(index);
  indexSQL.push.apply(indexSQL, _toConsumableArray(indexTypeAndOptionToSQL(indexDefinition)));
  return indexSQL.filter(hasVal).join(' ');
}

function binaryToSQL(expr) {
  var operator = expr.operator || expr.op;
  var rstr = exprToSQL(expr.right);
  var isBetween = false;
  if (Array.isArray(rstr)) {
    switch (operator) {
      case '=':
        operator = 'IN';
        break;
      case '!=':
        operator = 'NOT IN';
        break;
      case 'BETWEEN':
      case 'NOT BETWEEN':
        isBetween = true;
        rstr = "".concat(rstr[0], " AND ").concat(rstr[1]);
        break;
    }
    if (!isBetween) rstr = "(".concat(rstr.join(', '), ")");
  }
  var escape = expr.right.escape || {};
  var leftPart = Array.isArray(expr.left) ? expr.left.map(exprToSQL).join(', ') : exprToSQL(expr.left);
  var str = [leftPart, operator, rstr, toUpper(escape.type), exprToSQL(escape.value)].filter(hasVal).join(operator === '.' ? '' : ' ');
  var result = [expr.parentheses ? "(".concat(str, ")") : str];
  return result.join(' ');
}

function composePrefixValSuffix(stmt) {
  if (!stmt) return [];
  return [stmt.prefix.map(literalToSQL).join(' '), exprToSQL(stmt.value), stmt.suffix.map(literalToSQL).join(' ')];
}
function fetchOffsetToSQL(stmt) {
  var fetch = stmt.fetch,
    offset = stmt.offset;
  var result = [].concat(_toConsumableArray(composePrefixValSuffix(offset)), _toConsumableArray(composePrefixValSuffix(fetch)));
  return result.filter(hasVal).join(' ');
}
function limitOffsetToSQL(limit) {
  var seperator = limit.seperator,
    value = limit.value;
  if (value.length === 1 && seperator === 'offset') return connector('OFFSET', exprToSQL(value[0]));
  return connector('LIMIT', value.map(exprToSQL).join("".concat(seperator === 'offset' ? ' ' : '').concat(toUpper(seperator), " ")));
}
function limitToSQL(limit) {
  if (!limit) return '';
  if (limit.fetch || limit.offset) return fetchOffsetToSQL(limit);
  return limitOffsetToSQL(limit);
}

/**
 * @param {Array<Object>} withExpr
 */
function withToSQL(withExpr) {
  if (!withExpr || withExpr.length === 0) return;
  var isRecursive = withExpr[0].recursive ? 'RECURSIVE ' : '';
  var withExprStr = withExpr.map(function (cte) {
    var name = cte.name,
      stmt = cte.stmt,
      columns = cte.columns;
    var column = Array.isArray(columns) ? "(".concat(columns.map(columnRefToSQL).join(', '), ")") : '';
    var expr = commonOptionConnector(stmt.type === 'values' ? 'VALUES' : '', exprToSQL, stmt);
    return "".concat(name.type === 'default' ? identifierToSql(name.value) : literalToSQL(name)).concat(column, " AS (").concat(expr, ")");
  }).join(', ');
  return "WITH ".concat(isRecursive).concat(withExprStr);
}

function distinctToSQL(distinct) {
  if (!distinct) return;
  if (typeof distinct === 'string') return distinct;
  var type = distinct.type,
    columns = distinct.columns;
  var result = [toUpper(type)];
  if (columns) result.push("(".concat(columns.map(exprToSQL).join(', '), ")"));
  return result.filter(hasVal).join(' ');
}
function selectIntoToSQL(into) {
  if (!into) return;
  var position = into.position;
  if (!position) return;
  var keyword = into.keyword,
    expr = into.expr;
  var result = [];
  var intoType = toUpper(keyword);
  switch (intoType) {
    case 'VAR':
      result.push(expr.map(varToSQL).join(', '));
      break;
    default:
      result.push(intoType, typeof expr === 'string' ? identifierToSql(expr) : exprToSQL(expr));
  }
  return result.filter(hasVal).join(' ');
}
/**
 * @param {Object}      stmt
 * @param {?Array}      stmt.with
 * @param {?Array}      stmt.options
 * @param {?string}     stmt.distinct
 * @param {?Array|string}   stmt.columns
 * @param {?Array}      stmt.from
 * @param {?Object}     stmt.where
 * @param {?Array}      stmt.groupby
 * @param {?Object}     stmt.having
 * @param {?Array}      stmt.orderby
 * @param {?Array}      stmt.limit
 * @return {string}
 */

function forXmlToSQL(stmt) {
  if (!stmt) return;
  var expr = stmt.expr,
    keyword = stmt.keyword,
    type = stmt.type;
  var result = [toUpper(type), toUpper(keyword)];
  if (!expr) return result.join(' ');
  return "".concat(result.join(' '), "(").concat(exprToSQL(expr), ")");
}
function selectToSQL(stmt) {
  var asStructVal = stmt.as_struct_val,
    columns = stmt.columns,
    collate = stmt.collate,
    distinct = stmt.distinct,
    forXml = stmt["for"],
    from = stmt.from,
    _stmt$for_sys_time_as = stmt.for_sys_time_as_of,
    forSystem = _stmt$for_sys_time_as === void 0 ? {} : _stmt$for_sys_time_as,
    lockingRead = stmt.locking_read,
    groupby = stmt.groupby,
    having = stmt.having,
    _stmt$into = stmt.into,
    into = _stmt$into === void 0 ? {} : _stmt$into,
    isolation = stmt.isolation,
    limit = stmt.limit,
    options = stmt.options,
    orderby = stmt.orderby,
    parentheses = stmt.parentheses_symbol,
    qualify = stmt.qualify,
    top = stmt.top,
    windowInfo = stmt.window,
    withInfo = stmt["with"],
    where = stmt.where;
  var clauses = [withToSQL(withInfo), 'SELECT', toUpper(asStructVal)];
  if (Array.isArray(options)) clauses.push(options.join(' '));
  clauses.push(distinctToSQL(distinct), topToSQL(top), columnsToSQL(columns, from));
  var position = into.position;
  var intoSQL = '';
  if (position) intoSQL = commonOptionConnector('INTO', selectIntoToSQL, into);
  if (position === 'column') clauses.push(intoSQL);
  // FROM + joins
  clauses.push(commonOptionConnector('FROM', tablesToSQL, from));
  if (position === 'from') clauses.push(intoSQL);
  var _ref = forSystem || {},
    keyword = _ref.keyword,
    expr = _ref.expr;
  clauses.push(commonOptionConnector(keyword, exprToSQL, expr));
  clauses.push(commonOptionConnector('WHERE', exprToSQL, where));
  if (groupby) {
    clauses.push(connector('GROUP BY', getExprListSQL(groupby.columns).join(', ')));
    clauses.push(getExprListSQL(groupby.modifiers).join(', '));
  }
  clauses.push(commonOptionConnector('HAVING', exprToSQL, having));
  clauses.push(commonOptionConnector('QUALIFY', exprToSQL, qualify));
  clauses.push(commonOptionConnector('WINDOW', exprToSQL, windowInfo));
  clauses.push(orderOrPartitionByToSQL(orderby, 'order by'));
  clauses.push(collateToSQL(collate));
  clauses.push(limitToSQL(limit));
  if (isolation) clauses.push(commonOptionConnector(isolation.keyword, literalToSQL, isolation.expr));
  clauses.push(toUpper(lockingRead));
  if (position === 'end') clauses.push(intoSQL);
  clauses.push(forXmlToSQL(forXml));
  var sql = clauses.filter(hasVal).join(' ');
  return parentheses ? "(".concat(sql, ")") : sql;
}

/**
 * @param {Array} sets
 * @return {string}
 */
function setToSQL(sets) {
  if (!sets || sets.length === 0) return '';
  var clauses = [];
  var _iterator = _createForOfIteratorHelper(sets),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var set = _step.value;
      var column = {};
      var value = set.value;
      for (var key in set) {
        if (key === 'value' || key === 'keyword') continue;
        column[key] = set[key];
      }
      var str = columnRefToSQL(column);
      var setItem = [str];
      var val = '';
      if (value) {
        val = exprToSQL(value);
        setItem.push('=', val);
      }
      clauses.push(setItem.filter(hasVal).join(' '));
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return clauses.join(', ');
}
function updateToSQL(stmt) {
  var from = stmt.from,
    table = stmt.table,
    set = stmt.set,
    where = stmt.where,
    orderby = stmt.orderby,
    withInfo = stmt["with"],
    limit = stmt.limit,
    returning = stmt.returning;
  var clauses = [withToSQL(withInfo), 'UPDATE', tablesToSQL(table), commonOptionConnector('SET', setToSQL, set), commonOptionConnector('FROM', tablesToSQL, from), commonOptionConnector('WHERE', exprToSQL, where), orderOrPartitionByToSQL(orderby, 'order by'), limitToSQL(limit), returningToSQL(returning)];
  return clauses.filter(hasVal).join(' ');
}

/**
 * @param {Array} stmt
 * @return {string}
 */
function valuesToSQL(stmt) {
  var type = stmt.type;
  if (type === 'select') return selectToSQL(stmt);
  var values = type === 'values' ? stmt.values : stmt;
  var clauses = values.map(function (value) {
    var sql = exprToSQL(value);
    return [toUpper(value.prefix), "(".concat(sql, ")")].filter(hasVal).join('');
  });
  return clauses.join(', ');
}
function partitionToSQL(partition) {
  if (!partition) return '';
  var partitionArr = ['PARTITION', '('];
  if (Array.isArray(partition)) {
    partitionArr.push(partition.map(function (partitionItem) {
      return identifierToSql(partitionItem);
    }).join(', '));
  } else {
    var value = partition.value;
    partitionArr.push(value.map(exprToSQL).join(', '));
  }
  partitionArr.push(')');
  return partitionArr.filter(hasVal).join('');
}
function conflictTargetToSQL(conflictTarget) {
  if (!conflictTarget) return '';
  var type = conflictTarget.type;
  switch (type) {
    case 'column':
      return "(".concat(conflictTarget.expr.map(columnRefToSQL).join(', '), ")");
  }
}
function conflictActionToSQL(conflictAction) {
  var expr = conflictAction.expr,
    keyword = conflictAction.keyword;
  var type = expr.type;
  var result = [toUpper(keyword)];
  switch (type) {
    case 'origin':
      result.push(literalToSQL(expr));
      break;
    case 'update':
      result.push('UPDATE', commonOptionConnector('SET', setToSQL, expr.set), commonOptionConnector('WHERE', exprToSQL, expr.where));
      break;
  }
  return result.filter(hasVal).join(' ');
}
function conflictToSQL(conflict) {
  if (!conflict) return '';
  var action = conflict.action,
    target = conflict.target;
  var result = [conflictTargetToSQL(target), conflictActionToSQL(action)];
  return result.filter(hasVal).join(' ');
}
function insertToSQL(stmt) {
  var table = stmt.table,
    type = stmt.type,
    _stmt$or = stmt.or,
    orExpr = _stmt$or === void 0 ? [] : _stmt$or,
    _stmt$prefix = stmt.prefix,
    prefix = _stmt$prefix === void 0 ? 'into' : _stmt$prefix,
    columns = stmt.columns,
    conflict = stmt.conflict,
    values = stmt.values,
    where = stmt.where,
    onDuplicateUpdate = stmt.on_duplicate_update,
    partition = stmt.partition,
    returning = stmt.returning,
    set = stmt.set;
  var _ref = onDuplicateUpdate || {},
    keyword = _ref.keyword,
    duplicateSet = _ref.set;
  var clauses = [toUpper(type), orExpr.map(literalToSQL).join(' '), toUpper(prefix), tablesToSQL(table), partitionToSQL(partition)];
  if (Array.isArray(columns)) clauses.push("(".concat(columns.map(literalToSQL).join(', '), ")"));
  clauses.push(commonOptionConnector(values && values.type === 'values' ? 'VALUES' : '', valuesToSQL, values));
  clauses.push(commonOptionConnector('ON CONFLICT', conflictToSQL, conflict));
  clauses.push(commonOptionConnector('SET', setToSQL, set));
  clauses.push(commonOptionConnector('WHERE', exprToSQL, where));
  clauses.push(commonOptionConnector(keyword, setToSQL, duplicateSet));
  clauses.push(returningToSQL(returning));
  return clauses.filter(hasVal).join(' ');
}

function intervalToSQL(intervalExpr) {
  var expr = intervalExpr.expr,
    unit = intervalExpr.unit,
    suffix = intervalExpr.suffix;
  var result = ['INTERVAL', exprToSQL(expr), toUpper(unit), exprToSQL(suffix)];
  return result.filter(hasVal).join(' ');
}

function unnestToSQL(unnestExpr) {
  var type = unnestExpr.type,
    as = unnestExpr.as,
    expr = unnestExpr.expr,
    withOffset = unnestExpr.with_offset;
  var result = ["".concat(toUpper(type), "(").concat(expr && exprToSQL(expr) || '', ")"), commonOptionConnector('AS', typeof as === 'string' ? identifierToSql : exprToSQL, as), commonOptionConnector(toUpper(withOffset && withOffset.keyword), identifierToSql, withOffset && withOffset.as)];
  return result.filter(hasVal).join(' ');
}
function pivotOperatorToSQL(operator) {
  var as = operator.as,
    column = operator.column,
    expr = operator.expr,
    in_expr = operator.in_expr,
    type = operator.type;
  var result = [exprToSQL(expr), 'FOR', columnRefToSQL(column), binaryToSQL(in_expr)];
  var sql = ["".concat(toUpper(type), "(").concat(result.join(' '), ")")];
  if (as) sql.push('AS', identifierToSql(as));
  return sql.join(' ');
}
function operatorToSQL(operator) {
  if (!operator) return;
  var type = operator.type;
  switch (type) {
    case 'pivot':
    case 'unpivot':
      return pivotOperatorToSQL(operator);
    default:
      return '';
  }
}
function tableHintToSQL(tableHintExpr) {
  if (!tableHintExpr) return;
  var keyword = tableHintExpr.keyword,
    expr = tableHintExpr.expr,
    index = tableHintExpr.index,
    index_columns = tableHintExpr.index_columns,
    parentheses = tableHintExpr.parentheses,
    prefix = tableHintExpr.prefix;
  var result = [];
  switch (keyword.toLowerCase()) {
    case 'forceseek':
      result.push(toUpper(keyword), "(".concat(identifierToSql(index)), "(".concat(index_columns.map(exprToSQL).filter(hasVal).join(', '), "))"));
      break;
    case 'spatial_window_max_cells':
      result.push(toUpper(keyword), '=', exprToSQL(expr));
      break;
    case 'index':
      result.push(toUpper(prefix), toUpper(keyword), parentheses ? "(".concat(expr.map(function (indexItem) {
        return identifierToSql(indexItem);
      }).join(', '), ")") : "= ".concat(identifierToSql(expr)));
      break;
    default:
      result.push(exprToSQL(expr));
  }
  return result.filter(hasVal).join(' ');
}
function tableTumbleArgsToSQL(param, expr) {
  var name = param.name,
    symbol = param.symbol;
  return [toUpper(name), symbol, expr].filter(hasVal).join(' ');
}
function tableTumbleToSQL(tumble) {
  if (!tumble) return '';
  var tableInfo = tumble.data,
    timecol = tumble.timecol,
    offset = tumble.offset,
    size = tumble.size;
  var fullTableName = [identifierToSql(tableInfo.expr.db), identifierToSql(tableInfo.expr.schema), identifierToSql(tableInfo.expr.table)].filter(hasVal).join('.');
  var timeColSQL = "DESCRIPTOR(".concat(columnRefToSQL(timecol.expr), ")");
  var result = ["TABLE(TUMBLE(TABLE ".concat(tableTumbleArgsToSQL(tableInfo, fullTableName)), tableTumbleArgsToSQL(timecol, timeColSQL)];
  var sizeSQL = tableTumbleArgsToSQL(size, intervalToSQL(size.expr));
  if (offset && offset.expr) result.push(sizeSQL, "".concat(tableTumbleArgsToSQL(offset, intervalToSQL(offset.expr)), "))"));else result.push("".concat(sizeSQL, "))"));
  return result.filter(hasVal).join(', ');
}
function temporalTableOptionToSQL(stmt) {
  var keyword = stmt.keyword;
  var result = [];
  switch (keyword) {
    case 'as':
      result.push('AS', 'OF', exprToSQL(stmt.of));
      break;
    case 'from_to':
      result.push('FROM', exprToSQL(stmt.from), 'TO', exprToSQL(stmt.to));
      break;
    case 'between_and':
      result.push('BETWEEN', exprToSQL(stmt.between), 'AND', exprToSQL(stmt.and));
      break;
    case 'contained':
      result.push('CONTAINED', 'IN', exprToSQL(stmt["in"]));
      break;
  }
  return result.filter(hasVal).join(' ');
}
function temporalTableToSQL(stmt) {
  if (!stmt) return;
  var keyword = stmt.keyword,
    expr = stmt.expr;
  return [toUpper(keyword), temporalTableOptionToSQL(expr)].filter(hasVal).join(' ');
}
function generateVirtualTable(stmt) {
  var keyword = stmt.keyword,
    type = stmt.type,
    generators = stmt.generators;
  var generatorSQL = generators.map(function (generator) {
    return commonTypeValue(generator).join(' ');
  }).join(', ');
  return "".concat(toUpper(keyword), "(").concat(toUpper(type), "(").concat(generatorSQL, "))");
}
function tableToSQL(tableInfo) {
  if (toUpper(tableInfo.type) === 'UNNEST') return unnestToSQL(tableInfo);
  var table = tableInfo.table,
    db = tableInfo.db,
    as = tableInfo.as,
    expr = tableInfo.expr,
    operator = tableInfo.operator,
    prefixStr = tableInfo.prefix,
    schema = tableInfo.schema,
    server = tableInfo.server,
    suffix = tableInfo.suffix,
    tablesample = tableInfo.tablesample,
    temporal_table = tableInfo.temporal_table,
    table_hint = tableInfo.table_hint,
    _tableInfo$surround = tableInfo.surround,
    surround = _tableInfo$surround === void 0 ? {} : _tableInfo$surround;
  var serverName = identifierToSql(server, false, surround.server);
  var database = identifierToSql(db, false, surround.db);
  var schemaStr = identifierToSql(schema, false, surround.schema);
  var tableName = table && identifierToSql(table, false, surround.table);
  if (expr) {
    var exprType = expr.type;
    switch (exprType) {
      case 'values':
        var parentheses = expr.parentheses,
          values = expr.values,
          prefix = expr.prefix;
        var valueSQL = [parentheses && '(', '', parentheses && ')'];
        var valuesExpr = valuesToSQL(values);
        if (prefix) valuesExpr = valuesExpr.split('(').slice(1).map(function (val) {
          return "".concat(toUpper(prefix), "(").concat(val);
        }).join('');
        valueSQL[1] = "VALUES ".concat(valuesExpr);
        tableName = valueSQL.filter(hasVal).join('');
        break;
      case 'tumble':
        tableName = tableTumbleToSQL(expr);
        break;
      case 'generator':
        tableName = generateVirtualTable(expr);
        break;
      default:
        tableName = exprToSQL(expr);
    }
  }
  tableName = [toUpper(prefixStr), tableName, toUpper(suffix)].filter(hasVal).join(' ');
  var str = [serverName, database, schemaStr, tableName].filter(hasVal).join('.');
  var result = [str];
  if (tablesample) {
    var tableSampleSQL = ['TABLESAMPLE', exprToSQL(tablesample.expr), literalToSQL(tablesample.repeatable)].filter(hasVal).join(' ');
    result.push(tableSampleSQL);
  }
  result.push(temporalTableToSQL(temporal_table), commonOptionConnector('AS', typeof as === 'string' ? identifierToSql : exprToSQL, as), operatorToSQL(operator));
  if (table_hint) result.push(toUpper(table_hint.keyword), "(".concat(table_hint.expr.map(tableHintToSQL).filter(hasVal).join(', '), ")"));
  var tableSQL = result.filter(hasVal).join(' ');
  return tableInfo.parentheses ? "(".concat(tableSQL, ")") : tableSQL;
}

/**
 * @param {Array} tables
 * @return {string}
 */
function tablesToSQL(tables) {
  if (!tables) return '';
  if (!Array.isArray(tables)) {
    var expr = tables.expr,
      parentheses = tables.parentheses,
      joins = tables.joins;
    var sql = tablesToSQL(expr);
    if (parentheses) {
      var leftParentheses = [];
      var rightParentheses = [];
      var parenthesesNumber = parentheses === true ? 1 : parentheses.length;
      var i = 0;
      while (i++ < parenthesesNumber) {
        leftParentheses.push('(');
        rightParentheses.push(')');
      }
      var joinsSQL = joins && joins.length > 0 ? tablesToSQL([''].concat(_toConsumableArray(joins))) : '';
      return leftParentheses.join('') + sql + rightParentheses.join('') + joinsSQL;
    }
    return sql;
  }
  var baseTable = tables[0];
  var clauses = [];
  if (baseTable.type === 'dual') return 'DUAL';
  clauses.push(tableToSQL(baseTable));
  for (var _i = 1; _i < tables.length; ++_i) {
    var joinExpr = tables[_i];
    var on = joinExpr.on,
      using = joinExpr.using,
      join = joinExpr.join;
    var str = [];
    var isTables = Array.isArray(joinExpr) || Object.hasOwnProperty.call(joinExpr, 'joins');
    str.push(join ? " ".concat(toUpper(join)) : ',');
    str.push(isTables ? tablesToSQL(joinExpr) : tableToSQL(joinExpr));
    str.push(commonOptionConnector('ON', exprToSQL, on));
    if (using) str.push("USING (".concat(using.map(literalToSQL).join(', '), ")"));
    clauses.push(str.filter(hasVal).join(' '));
  }
  return clauses.filter(hasVal).join('');
}
function tableOptionToSQL(tableOption) {
  var keyword = tableOption.keyword,
    symbol = tableOption.symbol,
    value = tableOption.value;
  var sql = [keyword.toUpperCase()];
  if (symbol) sql.push(symbol);
  var val = literalToSQL(value);
  switch (keyword) {
    case 'partition by':
    case 'default collate':
      val = exprToSQL(value);
      break;
    case 'options':
      val = "(".concat(value.map(function (tableOptionItem) {
        return [tableOptionItem.keyword, tableOptionItem.symbol, exprToSQL(tableOptionItem.value)].join(' ');
      }).join(', '), ")");
      break;
    case 'cluster by':
      val = value.map(exprToSQL).join(', ');
      break;
  }
  sql.push(val);
  return sql.filter(hasVal).join(' ');
}

function analyzeToSQL(stmt) {
  var type = stmt.type,
    table = stmt.table;
  var action = toUpper(type);
  var tableName = tableToSQL(table);
  return [action, tableName].join(' ');
}
function attachToSQL(stmt) {
  var type = stmt.type,
    database = stmt.database,
    expr = stmt.expr,
    as = stmt.as,
    schema = stmt.schema;
  return [toUpper(type), toUpper(database), exprToSQL(expr), toUpper(as), identifierToSql(schema)].filter(hasVal).join(' ');
}

function commentOptionToSQL(stmt) {
  var name = stmt.name,
    type = stmt.type;
  switch (type) {
    case 'table':
    case 'view':
      var fullTableName = [identifierToSql(name.db), identifierToSql(name.table)].filter(hasVal).join('.');
      return "".concat(toUpper(type), " ").concat(fullTableName);
    case 'column':
      return "COLUMN ".concat(columnRefToSQL(name));
    default:
      return "".concat(toUpper(type), " ").concat(literalToSQL(name));
  }
}
function commentIsExprToSQL(stmt) {
  var keyword = stmt.keyword,
    expr = stmt.expr;
  return [toUpper(keyword), literalToSQL(expr)].filter(hasVal).join(' ');
}
function commentOnToSQL(stmt) {
  var expr = stmt.expr,
    keyword = stmt.keyword,
    target = stmt.target,
    type = stmt.type;
  var result = [toUpper(type), toUpper(keyword), commentOptionToSQL(target), commentIsExprToSQL(expr)];
  return result.filter(hasVal).join(' ');
}

function explainToSQL(stmt) {
  var type = stmt.type,
    expr = stmt.expr;
  return [toUpper(type), selectToSQL(expr)].join(' ');
}

function deleteToSQL(stmt) {
  var columns = stmt.columns,
    from = stmt.from,
    table = stmt.table,
    where = stmt.where,
    orderby = stmt.orderby,
    withInfo = stmt["with"],
    limit = stmt.limit,
    returning = stmt.returning;
  var clauses = [withToSQL(withInfo), 'DELETE'];
  var columnInfo = columnsToSQL(columns, from);
  clauses.push(columnInfo);
  if (Array.isArray(table)) {
    if (!(table.length === 1 && table[0].addition === true)) clauses.push(tablesToSQL(table));
  }
  clauses.push(commonOptionConnector('FROM', tablesToSQL, from));
  clauses.push(commonOptionConnector('WHERE', exprToSQL, where));
  clauses.push(orderOrPartitionByToSQL(orderby, 'order by'));
  clauses.push(limitToSQL(limit));
  clauses.push(returningToSQL(returning));
  return clauses.filter(hasVal).join(' ');
}

function execVariablesToSQL(stmt) {
  var name = stmt.name,
    value = stmt.value;
  var result = ["@".concat(name), '=', exprToSQL(value)];
  return result.filter(hasVal).join(' ');
}
function execToSQL(stmt) {
  var keyword = stmt.keyword,
    module = stmt.module,
    parameters = stmt.parameters;
  var result = [toUpper(keyword), tableToSQL(module), (parameters || []).map(execVariablesToSQL).filter(hasVal).join(', ')];
  return result.filter(hasVal).join(' ');
}

function loadDataFields(expr) {
  if (!expr) return '';
  var keyword = expr.keyword,
    terminated = expr.terminated,
    enclosed = expr.enclosed,
    escaped = expr.escaped;
  return [toUpper(keyword), literalToSQL(terminated), literalToSQL(enclosed), literalToSQL(escaped)].filter(hasVal).join(' ');
}
function loadDataLines(expr) {
  if (!expr) return '';
  var keyword = expr.keyword,
    starting = expr.starting,
    terminated = expr.terminated;
  return [toUpper(keyword), literalToSQL(starting), literalToSQL(terminated)].filter(hasVal).join(' ');
}
function loadDataIgnore(expr) {
  if (!expr) return '';
  var count = expr.count,
    suffix = expr.suffix;
  return ['IGNORE', literalToSQL(count), suffix].filter(hasVal).join(' ');
}
function loadDataToSQL(expr) {
  if (!expr) return '';
  var mode = expr.mode,
    local = expr.local,
    file = expr.file,
    replace_ignore = expr.replace_ignore,
    table = expr.table,
    partition = expr.partition,
    character_set = expr.character_set,
    column = expr.column,
    fields = expr.fields,
    lines = expr.lines,
    set = expr.set,
    ignore = expr.ignore;
  var result = ['LOAD DATA', toUpper(mode), toUpper(local), 'INFILE', literalToSQL(file), toUpper(replace_ignore), 'INTO TABLE', tableToSQL(table), partitionToSQL(partition), commonOptionConnector('CHARACTER SET', literalToSQL, character_set), loadDataFields(fields), loadDataLines(lines), loadDataIgnore(ignore), columnsToSQL(column), commonOptionConnector('SET', setToSQL, set)];
  return result.filter(hasVal).join(' ');
}

function assignToSQL(expr) {
  /** @type {Object} */
  var left = expr.left,
    right = expr.right,
    symbol = expr.symbol,
    keyword = expr.keyword;
  left.keyword = keyword;
  var leftVar = exprToSQL(left);
  var rightVal = exprToSQL(right);
  return [leftVar, toUpper(symbol), rightVal].filter(hasVal).join(' ');
}

function returnToSQL(stmt) {
  var type = stmt.type,
    expr = stmt.expr;
  return [toUpper(type), exprToSQL(expr)].join(' ');
}
function procToSQL(expr) {
  var stmt = expr.stmt;
  switch (stmt.type) {
    case 'assign':
      return assignToSQL(stmt);
    case 'return':
      return returnToSQL(stmt);
  }
}

function transactionToSQL(stmt) {
  var _stmt$expr = stmt.expr,
    action = _stmt$expr.action,
    keyword = _stmt$expr.keyword,
    modes = _stmt$expr.modes;
  var result = [literalToSQL(action), toUpper(keyword)];
  if (modes) result.push(modes.map(literalToSQL).join(', '));
  return result.filter(hasVal).join(' ');
}

function showEventToSQL(showEventExpr) {
  var inClause = showEventExpr["in"],
    from = showEventExpr.from,
    limit = showEventExpr.limit;
  return [commonOptionConnector('IN', literalToSQL, inClause && inClause.right), commonOptionConnector('FROM', tablesToSQL, from), limitToSQL(limit)].filter(hasVal).join(' ');
}
function showLikeAndWhereToSQL(showCharacterSetExpr) {
  var expr = showCharacterSetExpr.expr;
  if (!expr) return;
  var op = expr.op;
  if (toUpper(op) === 'LIKE') return commonOptionConnector('LIKE', literalToSQL, expr.right);
  return commonOptionConnector('WHERE', exprToSQL, expr);
}
function showGrantsForUser(showGrantsForExpr) {
  var forExpr = showGrantsForExpr["for"];
  if (!forExpr) return;
  var user = forExpr.user,
    host = forExpr.host,
    role_list = forExpr.role_list;
  var userAndHost = "'".concat(user, "'");
  if (host) userAndHost += "@'".concat(host, "'");
  return ['FOR', userAndHost, role_list && 'USING', role_list && role_list.map(function (role) {
    return "'".concat(role, "'");
  }).join(', ')].filter(hasVal).join(' ');
}
function showToSQL(showExpr) {
  var keyword = showExpr.keyword;
  var suffix = showExpr.suffix;
  var str = '';
  switch (toUpper(keyword)) {
    case 'BINLOG':
      str = showEventToSQL(showExpr);
      break;
    case 'CHARACTER':
    case 'COLLATION':
      str = showLikeAndWhereToSQL(showExpr);
      break;
    case 'COLUMNS':
    case 'INDEXES':
    case 'INDEX':
      str = commonOptionConnector('FROM', tablesToSQL, showExpr.from);
      break;
    case 'GRANTS':
      str = showGrantsForUser(showExpr);
      break;
    case 'CREATE':
      str = commonOptionConnector('', tableToSQL, showExpr[suffix]);
      break;
    case 'VAR':
      str = varToSQL(showExpr["var"]);
      keyword = '';
      break;
  }
  return ['SHOW', toUpper(keyword), toUpper(suffix), str].filter(hasVal).join(' ');
}

var typeToSQLFn = {
  alter: alterToSQL,
  analyze: analyzeToSQL,
  attach: attachToSQL,
  create: createToSQL,
  comment: commentOnToSQL,
  select: selectToSQL,
  deallocate: deallocateToSQL,
  "delete": deleteToSQL,
  exec: execToSQL,
  execute: executeToSQL,
  explain: explainToSQL,
  "for": forLoopToSQL,
  update: updateToSQL,
  "if": ifToSQL,
  insert: insertToSQL,
  load_data: loadDataToSQL,
  drop: commonCmdToSQL,
  truncate: commonCmdToSQL,
  replace: insertToSQL,
  declare: declareToSQL,
  use: useToSQL,
  rename: renameToSQL,
  call: callToSQL,
  desc: descToSQL,
  set: setVarToSQL,
  lock: lockUnlockToSQL,
  unlock: lockUnlockToSQL,
  show: showToSQL,
  grant: grantAndRevokeToSQL,
  revoke: grantAndRevokeToSQL,
  proc: procToSQL,
  raise: raiseToSQL,
  transaction: transactionToSQL
};
function unionToSQL(stmt) {
  if (!stmt) return '';
  var fun = typeToSQLFn[stmt.type];
  var _stmt = stmt,
    _parentheses = _stmt._parentheses,
    _orderby = _stmt._orderby,
    _limit = _stmt._limit;
  var res = [_parentheses && '(', fun(stmt)];
  while (stmt._next) {
    var nextFun = typeToSQLFn[stmt._next.type];
    var unionKeyword = toUpper(stmt.set_op);
    res.push(unionKeyword, nextFun(stmt._next));
    stmt = stmt._next;
  }
  res.push(_parentheses && ')', orderOrPartitionByToSQL(_orderby, 'order by'), limitToSQL(_limit));
  return res.filter(hasVal).join(' ');
}
function multipleToSQL(stmt) {
  var res = [];
  for (var i = 0, len = stmt.length; i < len; ++i) {
    var astInfo = stmt[i] && stmt[i].ast ? stmt[i].ast : stmt[i];
    var sql = unionToSQL(astInfo);
    if (i === len - 1 && astInfo.type === 'transaction') sql = "".concat(sql, " ;");
    res.push(sql);
  }
  return res.join(' ; ');
}

var supportedTypes = ['analyze', 'attach', 'select', 'deallocate', 'delete', 'exec', 'update', 'insert', 'drop', 'rename', 'truncate', 'call', 'desc', 'use', 'alter', 'set', 'create', 'lock', 'unlock', 'declare', 'show', 'replace', 'if', 'grant', 'revoke', 'proc', 'raise', 'execute', 'transaction', 'explain', 'comment', 'load_data'];
function checkSupported(expr) {
  var ast = expr && expr.ast ? expr.ast : expr;
  if (!supportedTypes.includes(ast.type)) throw new Error("".concat(ast.type, " statements not supported at the moment"));
}
function toSQL(ast) {
  if (Array.isArray(ast)) {
    ast.forEach(checkSupported);
    return multipleToSQL(ast);
  }
  checkSupported(ast);
  return unionToSQL(ast);
}
function goToSQL(stmt) {
  if (!stmt || stmt.length === 0) return '';
  var res = [toSQL(stmt.ast)];
  if (stmt.go_next) res.push(stmt.go.toUpperCase(), goToSQL(stmt.go_next));
  return res.filter(function (sqlItem) {
    return sqlItem;
  }).join(' ');
}
function astToSQL(ast) {
  var sql = ast.go === 'go' ? goToSQL(ast) : toSQL(ast);
  return sql;
}

function callToSQL(stmt) {
  var type = 'CALL';
  var storeProcessCall = exprToSQL(stmt.expr);
  return "".concat(type, " ").concat(storeProcessCall);
}
function commonCmdToSQL(stmt) {
  var type = stmt.type,
    keyword = stmt.keyword,
    name = stmt.name,
    prefix = stmt.prefix,
    suffix = stmt.suffix;
  var clauses = [toUpper(type), toUpper(keyword), toUpper(prefix)];
  switch (keyword) {
    case 'table':
      clauses.push(tablesToSQL(name));
      break;
    case 'trigger':
      clauses.push([name[0].schema ? "".concat(identifierToSql(name[0].schema), ".") : '', identifierToSql(name[0].trigger)].filter(hasVal).join(''));
      break;
    case 'database':
    case 'schema':
    case 'procedure':
      clauses.push(identifierToSql(name));
      break;
    case 'view':
      clauses.push(tablesToSQL(name), stmt.options && stmt.options.map(exprToSQL).filter(hasVal).join(' '));
      break;
    case 'index':
      clauses.push.apply(clauses, [columnRefToSQL(name)].concat(_toConsumableArray(stmt.table ? ['ON', tableToSQL(stmt.table)] : []), [stmt.options && stmt.options.map(exprToSQL).filter(hasVal).join(' ')]));
      break;
    case 'type':
      clauses.push(name.map(columnRefToSQL).join(', '), stmt.options && stmt.options.map(exprToSQL).filter(hasVal).join(' '));
      break;
  }
  if (suffix) clauses.push(suffix.map(exprToSQL).filter(hasVal).join(' '));
  return clauses.filter(hasVal).join(' ');
}
function descToSQL(stmt) {
  var type = stmt.type,
    table = stmt.table;
  var action = toUpper(type);
  return "".concat(action, " ").concat(identifierToSql(table));
}
function executeToSQL(stmt) {
  var type = stmt.type,
    name = stmt.name,
    args = stmt.args;
  var sql = [toUpper(type)];
  var nameWithArgs = [name];
  if (args) nameWithArgs.push("(".concat(exprToSQL(args).join(', '), ")"));
  sql.push(nameWithArgs.join(''));
  return sql.filter(hasVal).join(' ');
}
function forLoopToSQL(stmt) {
  var type = stmt.type,
    label = stmt.label,
    target = stmt.target,
    query = stmt.query,
    stmts = stmt.stmts;
  var sql = [label, toUpper(type), target, 'IN', multipleToSQL([query]), 'LOOP', multipleToSQL(stmts), 'END LOOP', label];
  return sql.filter(hasVal).join(' ');
}
function raiseToSQL(stmt) {
  var type = stmt.type,
    level = stmt.level,
    raise = stmt.raise,
    using = stmt.using;
  var sql = [toUpper(type), toUpper(level)];
  if (raise) sql.push([literalToSQL(raise.keyword), raise.type === 'format' && raise.expr.length > 0 && ','].filter(hasVal).join(''), raise.expr.map(function (exprInfo) {
    return exprToSQL(exprInfo);
  }).join(', '));
  if (using) sql.push(toUpper(using.type), toUpper(using.option), using.symbol, using.expr.map(function (exprInfo) {
    return exprToSQL(exprInfo);
  }).join(', '));
  return sql.filter(hasVal).join(' ');
}
function renameToSQL(stmt) {
  var type = stmt.type,
    table = stmt.table;
  var clauses = [];
  var prefix = "".concat(type && type.toUpperCase(), " TABLE");
  if (table) {
    var _iterator = _createForOfIteratorHelper(table),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var tables = _step.value;
        var renameInfo = tables.map(tableToSQL);
        clauses.push(renameInfo.join(' TO '));
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }
  return "".concat(prefix, " ").concat(clauses.join(', '));
}
function useToSQL(stmt) {
  var type = stmt.type,
    db = stmt.db;
  var action = toUpper(type);
  var database = identifierToSql(db);
  return "".concat(action, " ").concat(database);
}
function setVarToSQL(stmt) {
  var type = stmt.type,
    expr = stmt.expr,
    keyword = stmt.keyword;
  var action = toUpper(type);
  var setItems = expr.map(exprToSQL).join(', ');
  return [action, toUpper(keyword), setItems].filter(hasVal).join(' ');
}
function pgLock(stmt) {
  var lockMode = stmt.lock_mode,
    nowait = stmt.nowait;
  var lockInfo = [];
  if (lockMode) {
    var mode = lockMode.mode;
    lockInfo.push(mode.toUpperCase());
  }
  if (nowait) lockInfo.push(nowait.toUpperCase());
  return lockInfo;
}
function lockUnlockToSQL(stmt) {
  var type = stmt.type,
    keyword = stmt.keyword,
    tables = stmt.tables;
  var result = [type.toUpperCase(), toUpper(keyword)];
  if (type.toUpperCase() === 'UNLOCK') return result.join(' ');
  var tableStmt = [];
  var _iterator2 = _createForOfIteratorHelper(tables),
    _step2;
  try {
    var _loop = function _loop() {
      var tableInfo = _step2.value;
      var table = tableInfo.table,
        lockType = tableInfo.lock_type;
      var tableInfoTemp = [tableToSQL(table)];
      if (lockType) {
        var lockKeyList = ['prefix', 'type', 'suffix'];
        tableInfoTemp.push(lockKeyList.map(function (key) {
          return toUpper(lockType[key]);
        }).filter(hasVal).join(' '));
      }
      tableStmt.push(tableInfoTemp.join(' '));
    };
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      _loop();
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  result.push.apply(result, [tableStmt.join(', ')].concat(_toConsumableArray(pgLock(stmt))));
  return result.filter(hasVal).join(' ');
}
function deallocateToSQL(stmt) {
  var type = stmt.type,
    keyword = stmt.keyword,
    expr = stmt.expr;
  return [toUpper(type), toUpper(keyword), exprToSQL(expr)].filter(hasVal).join(' ');
}
function declareToSQL(stmt) {
  var type = stmt.type,
    declare = stmt.declare,
    symbol = stmt.symbol;
  var result = [toUpper(type)];
  var info = declare.map(function (dec) {
    var at = dec.at,
      name = dec.name,
      as = dec.as,
      constant = dec.constant,
      datatype = dec.datatype,
      not_null = dec.not_null,
      prefix = dec.prefix,
      definition = dec.definition,
      keyword = dec.keyword;
    var declareInfo = [[at, name].filter(hasVal).join(''), toUpper(as), toUpper(constant)];
    switch (keyword) {
      case 'variable':
        declareInfo.push(columnDataType(datatype), exprToSQL(dec.collate), toUpper(not_null));
        if (definition) declareInfo.push(toUpper(definition.keyword), exprToSQL(definition.value));
        break;
      case 'cursor':
        declareInfo.push(toUpper(prefix));
        break;
      case 'table':
        declareInfo.push(toUpper(prefix), "(".concat(definition.map(createDefinitionToSQL).join(', '), ")"));
        break;
    }
    return declareInfo.filter(hasVal).join(' ');
  }).join("".concat(symbol, " "));
  result.push(info);
  return result.join(' ');
}
function ifToSQL(stmt) {
  var boolExpr = stmt.boolean_expr,
    elseExpr = stmt.else_expr,
    elseifExpr = stmt.elseif_expr,
    ifExpr = stmt.if_expr,
    prefix = stmt.prefix,
    go = stmt.go,
    semicolons = stmt.semicolons,
    suffix = stmt.suffix,
    type = stmt.type;
  var result = [toUpper(type), exprToSQL(boolExpr), literalToSQL(prefix), "".concat(astToSQL(ifExpr.ast || ifExpr)).concat(semicolons[0]), toUpper(go)];
  if (elseifExpr) {
    result.push(elseifExpr.map(function (elseif) {
      return [toUpper(elseif.type), exprToSQL(elseif.boolean_expr), 'THEN', astToSQL(elseif.then.ast || elseif.then), elseif.semicolon].filter(hasVal).join(' ');
    }).join(' '));
  }
  if (elseExpr) result.push('ELSE', "".concat(astToSQL(elseExpr.ast || elseExpr)).concat(semicolons[1]));
  result.push(literalToSQL(suffix));
  return result.filter(hasVal).join(' ');
}
function grantUserOrRoleToSQL(stmt) {
  var name = stmt.name,
    host = stmt.host;
  var result = [literalToSQL(name)];
  if (host) result.push('@', literalToSQL(host));
  return result.join('');
}
function grantAndRevokeToSQL(stmt) {
  var type = stmt.type,
    grant_option_for = stmt.grant_option_for,
    keyword = stmt.keyword,
    objects = stmt.objects,
    on = stmt.on,
    to_from = stmt.to_from,
    user_or_roles = stmt.user_or_roles,
    withOpt = stmt["with"];
  var result = [toUpper(type), literalToSQL(grant_option_for)];
  var objStr = objects.map(function (obj) {
    var priv = obj.priv,
      columns = obj.columns;
    var privSQL = [exprToSQL(priv)];
    if (columns) privSQL.push("(".concat(columns.map(columnRefToSQL).join(', '), ")"));
    return privSQL.join(' ');
  }).join(', ');
  result.push(objStr);
  if (on) {
    result.push('ON');
    switch (keyword) {
      case 'priv':
        result.push(literalToSQL(on.object_type), on.priv_level.map(function (privLevel) {
          return [identifierToSql(privLevel.prefix), identifierToSql(privLevel.name)].filter(hasVal).join('.');
        }).join(', '));
        break;
      case 'proxy':
        result.push(grantUserOrRoleToSQL(on));
        break;
    }
  }
  result.push(toUpper(to_from), user_or_roles.map(grantUserOrRoleToSQL).join(', '));
  result.push(literalToSQL(withOpt));
  return result.filter(hasVal).join(' ');
}

function constraintDefinitionToSQL(constraintDefinition) {
  if (!constraintDefinition) return;
  var constraint = constraintDefinition.constraint,
    constraintType = constraintDefinition.constraint_type,
    enforced = constraintDefinition.enforced,
    index = constraintDefinition.index,
    keyword = constraintDefinition.keyword,
    referenceDefinition = constraintDefinition.reference_definition,
    forColumn = constraintDefinition["for"],
    withValues = constraintDefinition.with_values;
  var constraintSQL = [];
  var _getParserOpt = getParserOpt(),
    database = _getParserOpt.database;
  constraintSQL.push(toUpper(keyword));
  constraintSQL.push(identifierToSql(constraint));
  var constraintTypeStr = toUpper(constraintType);
  if (database.toLowerCase() === 'sqlite' && constraintTypeStr === 'UNIQUE KEY') constraintTypeStr = 'UNIQUE';
  constraintSQL.push(constraintTypeStr);
  constraintSQL.push(database.toLowerCase() !== 'sqlite' && identifierToSql(index));
  constraintSQL.push.apply(constraintSQL, _toConsumableArray(indexTypeAndOptionToSQL(constraintDefinition)));
  constraintSQL.push.apply(constraintSQL, _toConsumableArray(columnReferenceDefinitionToSQL(referenceDefinition)));
  constraintSQL.push(toUpper(enforced));
  constraintSQL.push(commonOptionConnector('FOR', identifierToSql, forColumn));
  constraintSQL.push(literalToSQL(withValues));
  return constraintSQL.filter(hasVal).join(' ');
}

function windowFrameExprToSQL(windowFrameExpr) {
  if (!windowFrameExpr) return;
  var type = windowFrameExpr.type;
  if (type === 'rows') {
    return [toUpper(type), exprToSQL(windowFrameExpr.expr)].filter(hasVal).join(' ');
  }
  return exprToSQL(windowFrameExpr);
}
function windowSpecificationToSQL(windowSpec) {
  var name = windowSpec.name,
    partitionby = windowSpec.partitionby,
    orderby = windowSpec.orderby,
    windowFrame = windowSpec.window_frame_clause;
  var result = [name, orderOrPartitionByToSQL(partitionby, 'partition by'), orderOrPartitionByToSQL(orderby, 'order by'), windowFrameExprToSQL(windowFrame)];
  return result.filter(hasVal).join(' ');
}
function asWindowSpecToSQL(asWindowSpec) {
  if (typeof asWindowSpec === 'string') return asWindowSpec;
  var windowSpec = asWindowSpec.window_specification;
  return "(".concat(windowSpecificationToSQL(windowSpec), ")");
}
function namedWindowExprToSQL(namedWindowExpr) {
  var name = namedWindowExpr.name,
    asWindowSpec = namedWindowExpr.as_window_specification;
  return "".concat(name, " AS ").concat(asWindowSpecToSQL(asWindowSpec));
}
function namedWindowExprListToSQL(namedWindowExprInfo) {
  var expr = namedWindowExprInfo.expr;
  return expr.map(namedWindowExprToSQL).join(', ');
}
function constructArgsList(expr) {
  var args = expr.args,
    name = expr.name,
    _expr$consider_nulls = expr.consider_nulls,
    consider_nulls = _expr$consider_nulls === void 0 ? '' : _expr$consider_nulls,
    _expr$separator = expr.separator,
    separator = _expr$separator === void 0 ? ', ' : _expr$separator;
  var argsList = args ? exprToSQL(args).join(separator) : '';
  // cover Syntax from FN_NAME(...args [RESPECT NULLS]) [RESPECT NULLS]
  var result = [name, '(', argsList, ')', consider_nulls && ' ', consider_nulls];
  return result.filter(hasVal).join('');
}
function windowFuncToSQL(expr) {
  var over = expr.over;
  var str = constructArgsList(expr);
  var overStr = overToSQL(over);
  return [str, overStr].filter(hasVal).join(' ');
}

function overToSQL(over) {
  if (!over) return;
  var asWindowSpec = over.as_window_specification,
    expr = over.expr,
    keyword = over.keyword,
    type = over.type,
    parentheses = over.parentheses;
  var upperType = toUpper(type);
  if (upperType === 'WINDOW') return "OVER ".concat(asWindowSpecToSQL(asWindowSpec));
  if (upperType === 'ON UPDATE') {
    var onUpdate = "".concat(toUpper(type), " ").concat(toUpper(keyword));
    var args = exprToSQL(expr) || [];
    if (parentheses) onUpdate = "".concat(onUpdate, "(").concat(args.join(', '), ")");
    return onUpdate;
  }
  if (over.partitionby) {
    return ['OVER', "(".concat(orderOrPartitionByToSQL(over.partitionby, 'partition by')), "".concat(orderOrPartitionByToSQL(over.orderby, 'order by'), ")")].filter(hasVal).join(' ');
  }
  throw new Error('unknown over type');
}

function anyValueFuncToSQL(stmt) {
  var args = stmt.args,
    type = stmt.type,
    over = stmt.over;
  var expr = args.expr,
    having = args.having;
  var sql = "".concat(toUpper(type), "(").concat(exprToSQL(expr));
  if (having) sql = "".concat(sql, " HAVING ").concat(toUpper(having.prefix), " ").concat(exprToSQL(having.expr));
  sql = "".concat(sql, ")");
  var overStr = overToSQL(over);
  return [sql, overStr].filter(hasVal).join(' ');
}
function arrayDimensionToSymbol(target) {
  if (!target || !target.array) return '';
  var keyword = target.array.keyword;
  if (keyword) return toUpper(keyword);
  var _target$array = target.array,
    dimension = _target$array.dimension,
    length = _target$array.length;
  var result = [];
  for (var i = 0; i < dimension; i++) {
    result.push('[');
    if (length && length[i]) result.push(literalToSQL(length[i]));
    result.push(']');
  }
  return result.join('');
}
function castToSQL(expr) {
  var targets = expr.target,
    expression = expr.expr,
    keyword = expr.keyword,
    symbol = expr.symbol,
    alias = expr.as,
    offset = expr.offset,
    outParentheses = expr.parentheses;
  var prefix = columnOffsetToSQL({
    expr: expression,
    offset: offset
  });
  var result = [];
  for (var i = 0, len = targets.length; i < len; ++i) {
    var target = targets[i];
    var angleBrackets = target.angle_brackets,
      length = target.length,
      dataType = target.dataType,
      parentheses = target.parentheses,
      quoted = target.quoted,
      scale = target.scale,
      dataTypeSuffix = target.suffix,
      targetExpr = target.expr;
    var str = targetExpr ? exprToSQL(targetExpr) : '';
    if (length != null) str = scale ? "".concat(length, ", ").concat(scale) : length;
    if (parentheses) str = "(".concat(str, ")");
    if (angleBrackets) str = "<".concat(str, ">");
    if (dataTypeSuffix && dataTypeSuffix.length) str += " ".concat(dataTypeSuffix.map(literalToSQL).join(' '));
    var symbolChar = '::';
    var suffix = '';
    var targetResult = [];
    if (symbol === 'as') {
      if (i === 0) prefix = "".concat(toUpper(keyword), "(").concat(prefix);
      suffix = ')';
      symbolChar = " ".concat(symbol.toUpperCase(), " ");
    }
    if (i === 0) targetResult.push(prefix);
    var arrayDimension = arrayDimensionToSymbol(target);
    targetResult.push(symbolChar, quoted, dataType, quoted, arrayDimension, str, suffix);
    result.push(targetResult.filter(hasVal).join(''));
  }
  if (alias) result.push(" AS ".concat(identifierToSql(alias)));
  var sql = result.filter(hasVal).join('');
  return outParentheses ? "(".concat(sql, ")") : sql;
}
function extractFunToSQL(stmt) {
  var args = stmt.args,
    type = stmt.type;
  var field = args.field,
    castType = args.cast_type,
    source = args.source;
  var result = ["".concat(toUpper(type), "(").concat(toUpper(field)), 'FROM', toUpper(castType), exprToSQL(source)];
  return "".concat(result.filter(hasVal).join(' '), ")");
}
function flattenArgToSQL(arg) {
  if (!arg) return '';
  var type = arg.type,
    symbol = arg.symbol,
    value = arg.value;
  var result = [toUpper(type), symbol, exprToSQL(value)];
  return result.filter(hasVal).join(' ');
}
function jsonObjectArgToSQL(argExpr) {
  var expr = argExpr.expr;
  var key = expr.key,
    value = expr.value,
    on = expr.on;
  var result = [exprToSQL(key), 'VALUE', exprToSQL(value)];
  if (on) result.push('ON', 'NULL', exprToSQL(on));
  return result.filter(hasVal).join(' ');
}
function flattenFunToSQL(stmt) {
  var args = stmt.args,
    type = stmt.type;
  var keys = ['input', 'path', 'outer', 'recursive', 'mode'];
  var argsStr = keys.map(function (key) {
    return flattenArgToSQL(args[key]);
  }).filter(hasVal).join(', ');
  return "".concat(toUpper(type), "(").concat(argsStr, ")");
}
function funcArgToSQL(argExpr) {
  var _argExpr$value = argExpr.value,
    name = _argExpr$value.name,
    symbol = _argExpr$value.symbol,
    expr = _argExpr$value.expr;
  return [name, symbol, exprToSQL(expr)].filter(hasVal).join(' ');
}
function withinGroupToSQL(stmt) {
  if (!stmt) return '';
  var type = stmt.type,
    keyword = stmt.keyword,
    orderby = stmt.orderby;
  return [toUpper(type), toUpper(keyword), "(".concat(orderOrPartitionByToSQL(orderby, 'order by'), ")")].filter(hasVal).join(' ');
}
function funcToSQL(expr) {
  var args = expr.args,
    array_index = expr.array_index,
    name = expr.name,
    args_parentheses = expr.args_parentheses,
    parentheses = expr.parentheses,
    withinGroup = expr.within_group,
    over = expr.over,
    suffix = expr.suffix;
  var overStr = overToSQL(over);
  var withinGroupStr = withinGroupToSQL(withinGroup);
  var suffixStr = exprToSQL(suffix);
  var funcName = [literalToSQL(name.schema), name.name.map(literalToSQL).join('.')].filter(hasVal).join('.');
  if (!args) return [funcName, withinGroupStr, overStr].filter(hasVal).join(' ');
  var separator = expr.separator || ', ';
  if (toUpper(funcName) === 'TRIM') separator = ' ';
  var str = [funcName];
  str.push(args_parentheses === false ? ' ' : '(');
  var argsList = exprToSQL(args);
  if (Array.isArray(separator)) {
    var argsSQL = argsList[0];
    for (var i = 1, len = argsList.length; i < len; ++i) {
      argsSQL = [argsSQL, argsList[i]].join(" ".concat(exprToSQL(separator[i - 1]), " "));
    }
    str.push(argsSQL);
  } else {
    str.push(argsList.join(separator));
  }
  if (args_parentheses !== false) str.push(')');
  str.push(arrayIndexToSQL(array_index));
  str = [str.join(''), suffixStr].filter(hasVal).join(' ');
  return [parentheses ? "(".concat(str, ")") : str, withinGroupStr, overStr].filter(hasVal).join(' ');
}
function tablefuncFunToSQL(expr) {
  var as = expr.as,
    name = expr.name,
    args = expr.args;
  var funcName = [literalToSQL(name.schema), name.name.map(literalToSQL).join('.')].filter(hasVal).join('.');
  var result = ["".concat(funcName, "(").concat(exprToSQL(args).join(', '), ")"), 'AS', funcToSQL(as)];
  return result.join(' ');
}
function lambdaToSQL(stmt) {
  var args = stmt.args,
    expr = stmt.expr;
  var value = args.value,
    parentheses = args.parentheses;
  var argsList = value.map(exprToSQL).join(', ');
  return [parentheses ? "(".concat(argsList, ")") : argsList, '->', exprToSQL(expr)].join(' ');
}

function createDefinitionToSQL(definition) {
  if (!definition) return [];
  var resource = definition.resource;
  switch (resource) {
    case 'column':
      return columnDefinitionToSQL(definition);
    case 'index':
      return indexDefinitionToSQL(definition);
    case 'constraint':
      return constraintDefinitionToSQL(definition);
    case 'sequence':
      return [toUpper(definition.prefix), exprToSQL(definition.value)].filter(hasVal).join(' ');
    default:
      throw new Error("unknown resource = ".concat(resource, " type"));
  }
}
function forValueItemToSQL(stmt) {
  var keyword = stmt.keyword;
  var result = [];
  switch (keyword) {
    case 'from':
      result.push('FROM', "(".concat(literalToSQL(stmt.from), ")"), 'TO', "(".concat(literalToSQL(stmt.to), ")"));
      break;
    case 'in':
      result.push('IN', "(".concat(exprToSQL(stmt["in"]), ")"));
      break;
    case 'with':
      result.push('WITH', "(MODULUS ".concat(literalToSQL(stmt.modulus), ", REMAINDER ").concat(literalToSQL(stmt.remainder), ")"));
      break;
  }
  return result.filter(hasVal).join(' ');
}
function createTablePartitionOfToSQL(stmt) {
  var keyword = stmt.keyword,
    table = stmt.table,
    forValues = stmt.for_values,
    tablespace = stmt.tablespace;
  var result = [toUpper(keyword), tableToSQL(table), toUpper(forValues.keyword), forValueItemToSQL(forValues.expr)];
  if (tablespace) result.push('TABLESPACE', literalToSQL(tablespace));
  return result.filter(hasVal).join(' ');
}
function createTableToSQL(stmt) {
  var type = stmt.type,
    keyword = stmt.keyword,
    table = stmt.table,
    like = stmt.like,
    as = stmt.as,
    temporary = stmt.temporary,
    ifNotExists = stmt.if_not_exists,
    createDefinition = stmt.create_definitions,
    tableOptions = stmt.table_options,
    ignoreReplace = stmt.ignore_replace,
    orReplace = stmt.replace,
    partitionOf = stmt.partition_of,
    queryExpr = stmt.query_expr,
    unLogged = stmt.unlogged,
    withExpr = stmt["with"];
  var sql = [toUpper(type), toUpper(orReplace), toUpper(temporary), toUpper(unLogged), toUpper(keyword), toUpper(ifNotExists), tablesToSQL(table)];
  if (like) {
    var likeType = like.type,
      likeTable = like.table;
    var likeTableName = tablesToSQL(likeTable);
    sql.push(toUpper(likeType), likeTableName);
    return sql.filter(hasVal).join(' ');
  }
  if (partitionOf) return sql.concat([createTablePartitionOfToSQL(partitionOf)]).filter(hasVal).join(' ');
  if (createDefinition) sql.push("(".concat(createDefinition.map(createDefinitionToSQL).join(', '), ")"));
  if (tableOptions) {
    var _getParserOpt = getParserOpt(),
      database = _getParserOpt.database;
    var symbol = database && database.toLowerCase() === 'sqlite' ? ', ' : ' ';
    sql.push(tableOptions.map(tableOptionToSQL).join(symbol));
  }
  if (withExpr) {
    var withSQL = withExpr.map(function (withExprItem) {
      return [literalToSQL(withExprItem.keyword), toUpper(withExprItem.symbol), literalToSQL(withExprItem.value)].join(' ');
    }).join(', ');
    sql.push("WITH (".concat(withSQL, ")"));
  }
  sql.push(toUpper(ignoreReplace), toUpper(as));
  if (queryExpr) sql.push(unionToSQL(queryExpr));
  return sql.filter(hasVal).join(' ');
}
function createTriggerToSQL(stmt) {
  var definer = stmt.definer,
    forEach = stmt.for_each,
    keyword = stmt.keyword,
    triggerBody = stmt.execute,
    type = stmt.type,
    table = stmt.table,
    ife = stmt.if_not_exists,
    temporary = stmt.temporary,
    trigger = stmt.trigger,
    triggerEvents = stmt.events,
    triggerOrder = stmt.order,
    triggerTime = stmt.time,
    when = stmt.when;
  var sql = [toUpper(type), toUpper(temporary), exprToSQL(definer), toUpper(keyword), toUpper(ife), tableToSQL(trigger), toUpper(triggerTime), triggerEvents.map(function (event) {
    var eventStr = [toUpper(event.keyword)];
    var args = event.args;
    if (args) eventStr.push(toUpper(args.keyword), args.columns.map(columnRefToSQL).join(', '));
    return eventStr.join(' ');
  }), 'ON', tableToSQL(table), toUpper(forEach && forEach.keyword), toUpper(forEach && forEach.args), triggerOrder && "".concat(toUpper(triggerOrder.keyword), " ").concat(identifierToSql(triggerOrder.trigger)), commonOptionConnector('WHEN', exprToSQL, when), toUpper(triggerBody.prefix)];
  switch (triggerBody.type) {
    case 'set':
      sql.push(commonOptionConnector('SET', setToSQL, triggerBody.expr));
      break;
    case 'multiple':
      sql.push(multipleToSQL(triggerBody.expr.ast));
      break;
  }
  sql.push(toUpper(triggerBody.suffix));
  return sql.filter(hasVal).join(' ');
}
function createConstraintTriggerToSQL(stmt) {
  var constraint = stmt.constraint,
    constraintKw = stmt.constraint_kw,
    deferrable = stmt.deferrable,
    events = stmt.events,
    execute = stmt.execute,
    forEach = stmt.for_each,
    from = stmt.from,
    location = stmt.location,
    keyword = stmt.keyword,
    or = stmt.or,
    type = stmt.type,
    table = stmt.table,
    when = stmt.when;
  var sql = [toUpper(type), toUpper(or), toUpper(constraintKw), toUpper(keyword), identifierToSql(constraint), toUpper(location)];
  var event = triggerEventToSQL(events);
  sql.push(event, 'ON', tableToSQL(table));
  if (from) sql.push('FROM', tableToSQL(from));
  sql.push.apply(sql, _toConsumableArray(commonKeywordArgsToSQL(deferrable)).concat(_toConsumableArray(commonKeywordArgsToSQL(forEach))));
  if (when) sql.push(toUpper(when.type), exprToSQL(when.cond));
  sql.push(toUpper(execute.keyword), funcToSQL(execute.expr));
  return sql.filter(hasVal).join(' ');
}
function createExtensionToSQL(stmt) {
  var extension = stmt.extension,
    from = stmt.from,
    ifNotExists = stmt.if_not_exists,
    keyword = stmt.keyword,
    schema = stmt.schema,
    type = stmt.type,
    withName = stmt["with"],
    version = stmt.version;
  var sql = [toUpper(type), toUpper(keyword), toUpper(ifNotExists), literalToSQL(extension), toUpper(withName), commonOptionConnector('SCHEMA', literalToSQL, schema), commonOptionConnector('VERSION', literalToSQL, version), commonOptionConnector('FROM', literalToSQL, from)];
  return sql.filter(hasVal).join(' ');
}
function createIndexToSQL(stmt) {
  var concurrently = stmt.concurrently,
    fileStream = stmt.filestream_on,
    keyword = stmt.keyword,
    ifNotExists = stmt.if_not_exists,
    include = stmt.include,
    indexColumns = stmt.index_columns,
    indexType = stmt.index_type,
    indexUsing = stmt.index_using,
    index = stmt.index,
    on = stmt.on,
    indexOpt = stmt.index_options,
    algorithmOpt = stmt.algorithm_option,
    lockOpt = stmt.lock_option,
    onKw = stmt.on_kw,
    table = stmt.table,
    tablespace = stmt.tablespace,
    type = stmt.type,
    where = stmt.where,
    withExpr = stmt["with"],
    withBeforeWhere = stmt.with_before_where;
  var withIndexOpt = withExpr && "WITH (".concat(indexOptionListToSQL(withExpr).join(', '), ")");
  var includeColumns = include && "".concat(toUpper(include.keyword), " (").concat(include.columns.map(function (col) {
    return typeof col === 'string' ? identifierToSql(col) : exprToSQL(col);
  }).join(', '), ")");
  var indexName = index;
  if (index) {
    indexName = typeof index === 'string' ? identifierToSql(index) : [identifierToSql(index.schema), identifierToSql(index.name)].filter(hasVal).join('.');
  }
  var sql = [toUpper(type), toUpper(indexType), toUpper(keyword), toUpper(ifNotExists), toUpper(concurrently), indexName, toUpper(onKw), tableToSQL(table)].concat(_toConsumableArray(indexTypeToSQL(indexUsing)), ["(".concat(columnOrderListToSQL(indexColumns), ")"), includeColumns, indexOptionListToSQL(indexOpt).join(' '), alterExprToSQL(algorithmOpt), alterExprToSQL(lockOpt), commonOptionConnector('TABLESPACE', literalToSQL, tablespace)]);
  if (withBeforeWhere) {
    sql.push(withIndexOpt, commonOptionConnector('WHERE', exprToSQL, where));
  } else {
    sql.push(commonOptionConnector('WHERE', exprToSQL, where), withIndexOpt);
  }
  sql.push(commonOptionConnector('ON', exprToSQL, on), commonOptionConnector('FILESTREAM_ON', literalToSQL, fileStream));
  return sql.filter(hasVal).join(' ');
}
function createSequenceToSQL(stmt) {
  var type = stmt.type,
    keyword = stmt.keyword,
    sequence = stmt.sequence,
    temporary = stmt.temporary,
    ifNotExists = stmt.if_not_exists,
    createDefinition = stmt.create_definitions;
  var sql = [toUpper(type), toUpper(temporary), toUpper(keyword), toUpper(ifNotExists), tablesToSQL(sequence)];
  if (createDefinition) sql.push(createDefinition.map(createDefinitionToSQL).join(' '));
  return sql.filter(hasVal).join(' ');
}
function createDatabaseOrSchemaToSQL(stmt) {
  var type = stmt.type,
    keyword = stmt.keyword,
    replace = stmt.replace,
    ifNotExists = stmt.if_not_exists,
    createDefinition = stmt.create_definitions;
  var _stmt$keyword = stmt[keyword],
    db = _stmt$keyword.db,
    schema = _stmt$keyword.schema;
  var name = [literalToSQL(db), schema.map(literalToSQL).join('.')].filter(hasVal).join('.');
  var sql = [toUpper(type), toUpper(replace), toUpper(keyword), toUpper(ifNotExists), name];
  if (createDefinition) sql.push(createDefinition.map(tableOptionToSQL).join(' '));
  return sql.filter(hasVal).join(' ');
}
function createViewToSQL(stmt) {
  var algorithm = stmt.algorithm,
    columns = stmt.columns,
    definer = stmt.definer,
    ifNotExists = stmt.if_not_exists,
    keyword = stmt.keyword,
    recursive = stmt.recursive,
    replace = stmt.replace,
    select = stmt.select,
    sqlSecurity = stmt.sql_security,
    temporary = stmt.temporary,
    type = stmt.type,
    view = stmt.view,
    withClause = stmt["with"],
    withOptions = stmt.with_options;
  var db = view.db,
    schema = view.schema,
    name = view.view;
  var viewName = [identifierToSql(db), identifierToSql(schema), identifierToSql(name)].filter(hasVal).join('.');
  var sql = [toUpper(type), toUpper(replace), toUpper(temporary), toUpper(recursive), algorithm && "ALGORITHM = ".concat(toUpper(algorithm)), exprToSQL(definer), sqlSecurity && "SQL SECURITY ".concat(toUpper(sqlSecurity)), toUpper(keyword), toUpper(ifNotExists), viewName, columns && "(".concat(columns.map(columnIdentifierToSql).join(', '), ")"), withOptions && ['WITH', "(".concat(withOptions.map(function (withOpt) {
    return commonTypeValue(withOpt).join(' ');
  }).join(', '), ")")].join(' '), 'AS', unionToSQL(select), toUpper(withClause)];
  return sql.filter(hasVal).join(' ');
}
function createDomainToSQL(stmt) {
  var as = stmt.as,
    domain = stmt.domain,
    type = stmt.type,
    keyword = stmt.keyword,
    target = stmt.target,
    createDefinition = stmt.create_definitions;
  var sql = [toUpper(type), toUpper(keyword), [identifierToSql(domain.schema), identifierToSql(domain.name)].filter(hasVal).join('.'), toUpper(as), dataTypeToSQL(target)];
  if (createDefinition && createDefinition.length > 0) {
    var definitionSQL = [];
    var _iterator = _createForOfIteratorHelper(createDefinition),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var definition = _step.value;
        var definitionType = definition.type;
        switch (definitionType) {
          case 'collate':
            definitionSQL.push(exprToSQL(definition));
            break;
          case 'default':
            definitionSQL.push(toUpper(definitionType), exprToSQL(definition.value));
            break;
          case 'constraint':
            definitionSQL.push(constraintDefinitionToSQL(definition));
            break;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    sql.push(definitionSQL.filter(hasVal).join(' '));
  }
  return sql.filter(hasVal).join(' ');
}
function createTypeToSQL(stmt) {
  var as = stmt.as,
    createDefinition = stmt.create_definitions,
    keyword = stmt.keyword,
    name = stmt.name,
    resource = stmt.resource,
    type = stmt.type;
  var sql = [toUpper(type), toUpper(keyword), [identifierToSql(name.schema), identifierToSql(name.name)].filter(hasVal).join('.'), toUpper(as), toUpper(resource)];
  if (createDefinition) {
    var definitionSQL = [];
    switch (resource) {
      case 'enum':
      case 'range':
        definitionSQL.push(exprToSQL(createDefinition));
        break;
      default:
        definitionSQL.push("(".concat(createDefinition.map(createDefinitionToSQL).join(', '), ")"));
        break;
    }
    sql.push(definitionSQL.filter(hasVal).join(' '));
  }
  return sql.filter(hasVal).join(' ');
}
function createFunctionReturnsOptToSQL(stmt) {
  if (stmt.dataType) return dataTypeToSQL(stmt);
  return [identifierToSql(stmt.db), identifierToSql(stmt.schema), identifierToSql(stmt.table)].filter(hasVal).join('.');
}
function createFunctionReturnsToSQL(stmt) {
  var type = stmt.type,
    keyword = stmt.keyword,
    expr = stmt.expr;
  var sql = [toUpper(type), toUpper(keyword), Array.isArray(expr) ? "(".concat(expr.map(columnDefinitionToSQL).join(', '), ")") : createFunctionReturnsOptToSQL(expr)];
  return sql.filter(hasVal).join(' ');
}
function createFunctionOptionToSQL(stmt) {
  var type = stmt.type;
  switch (type) {
    case 'as':
      return [toUpper(type), stmt.symbol, unionToSQL(stmt.declare), toUpper(stmt.begin), multipleToSQL(stmt.expr), toUpper(stmt.end), stmt.symbol].filter(hasVal).join(' ');
    case 'set':
      return [toUpper(type), stmt.parameter, toUpper(stmt.value && stmt.value.prefix), stmt.value && stmt.value.expr.map(exprToSQL).join(', ')].filter(hasVal).join(' ');
    case 'return':
      return [toUpper(type), exprToSQL(stmt.expr)].filter(hasVal).join(' ');
    default:
      return exprToSQL(stmt);
  }
}
function createFunctionToSQL(stmt) {
  var type = stmt.type,
    replace = stmt.replace,
    keyword = stmt.keyword,
    name = stmt.name,
    args = stmt.args,
    returns = stmt.returns,
    options = stmt.options,
    last = stmt.last;
  var sql = [toUpper(type), toUpper(replace), toUpper(keyword)];
  var functionName = [literalToSQL(name.schema), name.name.map(literalToSQL).join('.')].filter(hasVal).join('.');
  var argsSQL = args.map(alterArgsToSQL).filter(hasVal).join(', ');
  sql.push("".concat(functionName, "(").concat(argsSQL, ")"), createFunctionReturnsToSQL(returns), options.map(createFunctionOptionToSQL).join(' '), last);
  return sql.filter(hasVal).join(' ');
}
function aggregateOptionToSQL(stmt) {
  var type = stmt.type,
    symbol = stmt.symbol,
    value = stmt.value;
  var sql = [toUpper(type), symbol];
  switch (toUpper(type)) {
    case 'SFUNC':
      sql.push([identifierToSql(value.schema), value.name].filter(hasVal).join('.'));
      break;
    case 'STYPE':
    case 'MSTYPE':
      sql.push(dataTypeToSQL(value));
      break;
    default:
      sql.push(exprToSQL(value));
      break;
  }
  return sql.filter(hasVal).join(' ');
}
function createAggregateToSQL(stmt) {
  var type = stmt.type,
    replace = stmt.replace,
    keyword = stmt.keyword,
    name = stmt.name,
    args = stmt.args,
    options = stmt.options;
  var sql = [toUpper(type), toUpper(replace), toUpper(keyword)];
  var functionName = [identifierToSql(name.schema), name.name].filter(hasVal).join('.');
  var argsSQL = "".concat(args.expr.map(alterArgsToSQL).join(', ')).concat(args.orderby ? [' ORDER', 'BY', args.orderby.map(alterArgsToSQL).join(', ')].join(' ') : '');
  sql.push("".concat(functionName, "(").concat(argsSQL, ")"), "(".concat(options.map(aggregateOptionToSQL).join(', '), ")"));
  return sql.filter(hasVal).join(' ');
}
function createUserToSQL(stmt) {
  var attribute = stmt.attribute,
    comment = stmt.comment,
    defaultRole = stmt.default_role,
    ifNotExists = stmt.if_not_exists,
    keyword = stmt.keyword,
    lockOption = stmt.lock_option,
    passwordOptions = stmt.password_options,
    requireOption = stmt.require,
    resourceOptions = stmt.resource_options,
    type = stmt.type,
    user = stmt.user;
  var userAuthOptions = user.map(function (userAuthOption) {
    var userInfo = userAuthOption.user,
      auth_option = userAuthOption.auth_option;
    var result = [grantUserOrRoleToSQL(userInfo)];
    if (auth_option) result.push(toUpper(auth_option.keyword), auth_option.auth_plugin, literalToSQL(auth_option.value));
    return result.filter(hasVal).join(' ');
  }).join(', ');
  var sql = [toUpper(type), toUpper(keyword), toUpper(ifNotExists), userAuthOptions];
  if (defaultRole) sql.push(toUpper(defaultRole.keyword), defaultRole.value.map(grantUserOrRoleToSQL).join(', '));
  sql.push(commonOptionConnector(requireOption && requireOption.keyword, exprToSQL, requireOption && requireOption.value));
  if (resourceOptions) sql.push(toUpper(resourceOptions.keyword), resourceOptions.value.map(function (resourceOption) {
    return exprToSQL(resourceOption);
  }).join(' '));
  if (passwordOptions) passwordOptions.forEach(function (passwordOption) {
    return sql.push(commonOptionConnector(passwordOption.keyword, exprToSQL, passwordOption.value));
  });
  sql.push(literalToSQL(lockOption), commentToSQL(comment), literalToSQL(attribute));
  return sql.filter(hasVal).join(' ');
}
function createToSQL(stmt) {
  var keyword = stmt.keyword;
  var sql = '';
  switch (keyword.toLowerCase()) {
    case 'aggregate':
      sql = createAggregateToSQL(stmt);
      break;
    case 'table':
      sql = createTableToSQL(stmt);
      break;
    case 'trigger':
      sql = stmt.resource === 'constraint' ? createConstraintTriggerToSQL(stmt) : createTriggerToSQL(stmt);
      break;
    case 'extension':
      sql = createExtensionToSQL(stmt);
      break;
    case 'function':
      sql = createFunctionToSQL(stmt);
      break;
    case 'index':
      sql = createIndexToSQL(stmt);
      break;
    case 'sequence':
      sql = createSequenceToSQL(stmt);
      break;
    case 'database':
    case 'schema':
      sql = createDatabaseOrSchemaToSQL(stmt);
      break;
    case 'view':
      sql = createViewToSQL(stmt);
      break;
    case 'domain':
      sql = createDomainToSQL(stmt);
      break;
    case 'type':
      sql = createTypeToSQL(stmt);
      break;
    case 'user':
      sql = createUserToSQL(stmt);
      break;
    default:
      throw new Error("unknown create resource ".concat(keyword));
  }
  return sql;
}

function alterExprPartition(action, expr) {
  switch (action) {
    case 'add':
      var sql = expr.map(function (_ref) {
        var name = _ref.name,
          value = _ref.value;
        return ['PARTITION', literalToSQL(name), 'VALUES', toUpper(value.type), "(".concat(literalToSQL(value.expr), ")")].join(' ');
      }).join(', ');
      return "(".concat(sql, ")");
    default:
      return columnsToSQL(expr);
  }
}
function alterExprToSQL(expr) {
  if (!expr) return '';
  var action = expr.action,
    createDefinition = expr.create_definitions,
    ifNotExists = expr.if_not_exists,
    keyword = expr.keyword,
    ifExists = expr.if_exists,
    oldColumn = expr.old_column,
    prefix = expr.prefix,
    resource = expr.resource,
    symbol = expr.symbol,
    suffix = expr.suffix;
  var name = '';
  var dataType = [];
  switch (resource) {
    case 'column':
      dataType = [columnDefinitionToSQL(expr)];
      break;
    case 'index':
      dataType = indexTypeAndOptionToSQL(expr);
      name = expr[resource];
      break;
    case 'table':
    case 'schema':
      name = identifierToSql(expr[resource]);
      break;
    case 'aggregate':
    case 'function':
    case 'domain':
    case 'type':
      name = identifierToSql(expr[resource]);
      break;
    case 'algorithm':
    case 'lock':
    case 'table-option':
      name = [symbol, toUpper(expr[resource])].filter(hasVal).join(' ');
      break;
    case 'constraint':
      name = identifierToSql(expr[resource]);
      dataType = [createDefinitionToSQL(createDefinition)];
      break;
    case 'partition':
      dataType = [alterExprPartition(action, expr.partitions)];
      break;
    case 'key':
      name = identifierToSql(expr[resource]);
      break;
    default:
      name = [symbol, expr[resource]].filter(function (val) {
        return val !== null;
      }).join(' ');
      break;
  }
  var alterArray = [toUpper(action), toUpper(keyword), toUpper(ifNotExists), toUpper(ifExists), oldColumn && columnRefToSQL(oldColumn), toUpper(prefix), name && name.trim(), dataType.filter(hasVal).join(' ')];
  if (suffix) {
    alterArray.push(toUpper(suffix.keyword), suffix.expr && columnRefToSQL(suffix.expr));
  }
  return alterArray.filter(hasVal).join(' ');
}
function alterTableToSQL(stmt) {
  var type = stmt.type,
    table = stmt.table,
    if_exists = stmt.if_exists,
    prefix = stmt.prefix,
    _stmt$expr = stmt.expr,
    expr = _stmt$expr === void 0 ? [] : _stmt$expr;
  var action = toUpper(type);
  var tableName = tablesToSQL(table);
  var exprList = expr.map(exprToSQL);
  var result = [action, 'TABLE', toUpper(if_exists), literalToSQL(prefix), tableName, exprList.join(', ')];
  return result.filter(hasVal).join(' ');
}
function alterViewToSQL(stmt) {
  var type = stmt.type,
    columns = stmt.columns,
    attributes = stmt.attributes,
    select = stmt.select,
    view = stmt.view,
    withExpr = stmt["with"];
  var action = toUpper(type);
  var viewName = tableToSQL(view);
  var result = [action, 'VIEW', viewName];
  if (columns) result.push("(".concat(columns.map(columnRefToSQL).join(', '), ")"));
  if (attributes) result.push("WITH ".concat(attributes.map(toUpper).join(', ')));
  result.push('AS', selectToSQL(select));
  if (withExpr) result.push(toUpper(withExpr));
  return result.filter(hasVal).join(' ');
}
function alterArgsToSQL(arg) {
  var defaultSQL = arg["default"] && [toUpper(arg["default"].keyword), exprToSQL(arg["default"].value)].join(' ');
  return [toUpper(arg.mode), arg.name, dataTypeToSQL(arg.type), defaultSQL].filter(hasVal).join(' ');
}
function alterSchemaToSQL(stmt) {
  var expr = stmt.expr,
    keyword = stmt.keyword,
    schema = stmt.schema,
    type = stmt.type;
  var result = [toUpper(type), toUpper(keyword), identifierToSql(schema), alterExprToSQL(expr)];
  return result.filter(hasVal).join(' ');
}
function alterDomainTypeToSQL(stmt) {
  var expr = stmt.expr,
    keyword = stmt.keyword,
    name = stmt.name,
    type = stmt.type;
  var result = [toUpper(type), toUpper(keyword), [identifierToSql(name.schema), identifierToSql(name.name)].filter(hasVal).join('.'), alterExprToSQL(expr)];
  return result.filter(hasVal).join(' ');
}
function alterFunctionToSQL(stmt) {
  var args = stmt.args,
    expr = stmt.expr,
    keyword = stmt.keyword,
    name = stmt.name,
    type = stmt.type;
  var result = [toUpper(type), toUpper(keyword), [[identifierToSql(name.schema), identifierToSql(name.name)].filter(hasVal).join('.'), args && "(".concat(args.expr ? args.expr.map(alterArgsToSQL).join(', ') : '', ")")].filter(hasVal).join(''), alterExprToSQL(expr)];
  return result.filter(hasVal).join(' ');
}
function alterAggregateToSQL(stmt) {
  var args = stmt.args,
    expr = stmt.expr,
    keyword = stmt.keyword,
    name = stmt.name,
    type = stmt.type;
  var argsExpr = args.expr,
    orderby = args.orderby;
  var result = [toUpper(type), toUpper(keyword), [[identifierToSql(name.schema), identifierToSql(name.name)].filter(hasVal).join('.'), "(".concat(argsExpr.map(alterArgsToSQL).join(', ')).concat(orderby ? [' ORDER', 'BY', orderby.map(alterArgsToSQL).join(', ')].join(' ') : '', ")")].filter(hasVal).join(''), alterExprToSQL(expr)];
  return result.filter(hasVal).join(' ');
}
function alterSequenceToSQL(stmt) {
  var type = stmt.type,
    keyword = stmt.keyword,
    sequence = stmt.sequence,
    if_exists = stmt.if_exists,
    _stmt$expr2 = stmt.expr,
    expr = _stmt$expr2 === void 0 ? [] : _stmt$expr2;
  var action = toUpper(type);
  var sequenceName = tablesToSQL(sequence);
  var exprList = expr.map(createDefinitionToSQL);
  var result = [action, toUpper(keyword), toUpper(if_exists), sequenceName, exprList.join(', ')];
  return result.filter(hasVal).join(' ');
}
function alterToSQL(stmt) {
  var _stmt$keyword = stmt.keyword,
    keyword = _stmt$keyword === void 0 ? 'table' : _stmt$keyword;
  switch (keyword) {
    case 'aggregate':
      return alterAggregateToSQL(stmt);
    case 'table':
      return alterTableToSQL(stmt);
    case 'schema':
      return alterSchemaToSQL(stmt);
    case 'sequence':
      return alterSequenceToSQL(stmt);
    case 'domain':
    case 'type':
      return alterDomainTypeToSQL(stmt);
    case 'function':
      return alterFunctionToSQL(stmt);
    case 'view':
      return alterViewToSQL(stmt);
  }
}

function aggrToSQL(expr) {
  /** @type {Object} */
  var args = expr.args,
    filter = expr.filter,
    over = expr.over,
    within_group_orderby = expr.within_group_orderby;
  var str = exprToSQL(args.expr);
  str = Array.isArray(str) ? str.join(', ') : str;
  var fnName = expr.name;
  var overStr = overToSQL(over);
  var separator = ' ';
  if (args.distinct) str = ['DISTINCT', str].join(separator);
  if (args.separator && args.separator.delimiter) str = [str, literalToSQL(args.separator.delimiter)].join("".concat(args.separator.symbol, " "));
  if (args.separator && args.separator.expr) str = [str, exprToSQL(args.separator.expr)].join(' ');
  if (args.orderby) str = [str, orderOrPartitionByToSQL(args.orderby, 'order by')].join(' ');
  if (args.separator && args.separator.value) str = [str, toUpper(args.separator.keyword), literalToSQL(args.separator.value)].filter(hasVal).join(' ');
  var withinGroup = within_group_orderby ? "WITHIN GROUP (".concat(orderOrPartitionByToSQL(within_group_orderby, 'order by'), ")") : '';
  var filterStr = filter ? "FILTER (WHERE ".concat(exprToSQL(filter.where), ")") : '';
  return ["".concat(fnName, "(").concat(str, ")"), withinGroup, overStr, filterStr].filter(hasVal).join(' ');
}

function caseToSQL(expr) {
  var res = ['CASE'];
  var conditions = expr.args,
    exprItem = expr.expr,
    parentheses = expr.parentheses;
  if (exprItem) res.push(exprToSQL(exprItem));
  for (var i = 0, len = conditions.length; i < len; ++i) {
    res.push(conditions[i].type.toUpperCase());
    if (conditions[i].cond) {
      res.push(exprToSQL(conditions[i].cond));
      res.push('THEN');
    }
    res.push(exprToSQL(conditions[i].result));
  }
  res.push('END');
  return parentheses ? "(".concat(res.join(' '), ")") : res.join(' ');
}

function jsonExprToSQL(expr) {
  var keyword = expr.keyword,
    exprList = expr.expr_list;
  var result = [toUpper(keyword), exprList.map(function (exprItem) {
    return exprToSQL(exprItem);
  }).join(', ')].join(' ');
  return result;
}
function jsonVisitorExprToSQL(stmt) {
  var symbol = stmt.symbol,
    expr = stmt.expr;
  return [symbol, exprToSQL(expr)].join('');
}

function arrayExprListToSQL(expr) {
  var arrayPath = expr.array_path,
    brackets = expr.brackets,
    exprList = expr.expr_list,
    parentheses = expr.parentheses;
  if (!exprList) return "[".concat(columnsToSQL(arrayPath), "]");
  var result = Array.isArray(exprList) ? exprList.map(function (col) {
    return "(".concat(columnsToSQL(col), ")");
  }).filter(hasVal).join(', ') : exprToSQL(exprList);
  if (brackets) return "[".concat(result, "]");
  return parentheses ? "(".concat(result, ")") : result;
}
function arrayStructValueToSQL(expr) {
  var exprList = expr.expr_list,
    type = expr.type;
  switch (toUpper(type)) {
    case 'STRUCT':
      return "(".concat(columnsToSQL(exprList), ")");
    case 'ARRAY':
      return arrayExprListToSQL(expr);
    default:
      return '';
  }
}
function arrayStructExprToSQL(expr) {
  var definition = expr.definition,
    keyword = expr.keyword;
  var result = [toUpper(keyword)];
  if (definition && _typeof(definition) === 'object') {
    result.length = 0;
    result.push(arrayStructTypeToSQL(definition));
  }
  result.push(arrayStructValueToSQL(expr));
  return result.filter(hasVal).join('');
}

var exprToSQLConvertFn = {
  alter: alterExprToSQL,
  aggr_func: aggrToSQL,
  any_value: anyValueFuncToSQL,
  window_func: windowFuncToSQL,
  'array': arrayStructExprToSQL,
  assign: assignToSQL,
  binary_expr: binaryToSQL,
  "case": caseToSQL,
  cast: castToSQL,
  collate: collateToSQL,
  column_ref: columnRefToSQL,
  column_definition: columnDefinitionToSQL,
  datatype: dataTypeToSQL,
  extract: extractFunToSQL,
  flatten: flattenFunToSQL,
  fulltext_search: fullTextSearchToSQL,
  "function": funcToSQL,
  lambda: lambdaToSQL,
  load_data: loadDataToSQL,
  insert: unionToSQL,
  interval: intervalToSQL,
  json: jsonExprToSQL,
  json_object_arg: jsonObjectArgToSQL,
  json_visitor: jsonVisitorExprToSQL,
  func_arg: funcArgToSQL,
  show: showToSQL,
  struct: arrayStructExprToSQL,
  tablefunc: tablefuncFunToSQL,
  tables: tablesToSQL,
  unnest: unnestToSQL,
  values: valuesToSQL,
  'window': namedWindowExprListToSQL
};
function varToSQL(expr) {
  var _expr$prefix = expr.prefix,
    prefix = _expr$prefix === void 0 ? '@' : _expr$prefix,
    name = expr.name,
    members = expr.members,
    quoted = expr.quoted,
    suffix = expr.suffix;
  var val = [];
  var varName = members && members.length > 0 ? "".concat(name, ".").concat(members.join('.')) : name;
  var result = "".concat(prefix || '').concat(varName);
  if (suffix) result += suffix;
  val.push(result);
  return [quoted, val.join(' '), quoted].filter(hasVal).join('');
}
exprToSQLConvertFn["var"] = varToSQL;
function exprToSQL(exprOrigin) {
  if (!exprOrigin) return;
  var expr = exprOrigin;
  if (exprOrigin.ast) {
    var ast = expr.ast;
    Reflect.deleteProperty(expr, ast);
    for (var _i = 0, _Object$keys = Object.keys(ast); _i < _Object$keys.length; _i++) {
      var key = _Object$keys[_i];
      expr[key] = ast[key];
    }
  }
  var type = expr.type;
  if (type === 'expr') return exprToSQL(expr.expr);
  return exprToSQLConvertFn[type] ? exprToSQLConvertFn[type](expr) : literalToSQL(expr);
}
function unaryToSQL(unarExpr) {
  var operator = unarExpr.operator,
    parentheses = unarExpr.parentheses,
    expr = unarExpr.expr;
  var space = operator === '-' || operator === '+' || operator === '~' || operator === '!' ? '' : ' ';
  var str = "".concat(operator).concat(space).concat(exprToSQL(expr));
  return parentheses ? "(".concat(str, ")") : str;
}
function getExprListSQL(exprList) {
  if (!exprList) return [];
  if (!Array.isArray(exprList)) exprList = [exprList];
  return exprList.map(exprToSQL);
}
exprToSQLConvertFn.expr_list = function (expr) {
  var result = getExprListSQL(expr.value);
  var parentheses = expr.parentheses,
    separator = expr.separator;
  if (!parentheses && !separator) return result;
  var joinSymbol = separator || ', ';
  var str = result.join(joinSymbol);
  return parentheses ? "(".concat(str, ")") : str;
};
exprToSQLConvertFn.select = function (expr) {
  var str = _typeof(expr._next) === 'object' ? unionToSQL(expr) : selectToSQL(expr);
  return expr.parentheses ? "(".concat(str, ")") : str;
};
exprToSQLConvertFn.unary_expr = unaryToSQL;
function mapObjectToSQL(mapExpr) {
  var keyword = mapExpr.keyword,
    expr = mapExpr.expr;
  var exprStr = expr.map(function (exprItem) {
    return [literalToSQL(exprItem.key), literalToSQL(exprItem.value)].join(', ');
  }).join(', ');
  return [toUpper(keyword), "[".concat(exprStr, "]")].join('');
}
exprToSQLConvertFn.map_object = mapObjectToSQL;
function orderOrPartitionByToSQL(expr, prefix) {
  if (!Array.isArray(expr)) return '';
  var expressions = [];
  var upperPrefix = toUpper(prefix);
  switch (upperPrefix) {
    case 'ORDER BY':
      expressions = expr.map(function (info) {
        return [exprToSQL(info.expr), info.type || 'ASC', toUpper(info.nulls)].filter(hasVal).join(' ');
      });
      break;
    case 'PARTITION BY':
      expressions = expr.map(function (info) {
        return exprToSQL(info.expr);
      });
      break;
    default:
      expressions = expr.map(function (info) {
        return exprToSQL(info.expr);
      });
      break;
  }
  return connector(upperPrefix, expressions.join(', '));
}

function collateToSQL(stmt) {
  if (!stmt) return;
  var keyword = stmt.keyword,
    _stmt$collate = stmt.collate,
    name = _stmt$collate.name,
    symbol = _stmt$collate.symbol,
    value = _stmt$collate.value;
  var result = [toUpper(keyword)];
  if (!value) result.push(symbol);
  result.push(Array.isArray(name) ? name.map(literalToSQL).join('.') : literalToSQL(name));
  if (value) result.push(symbol);
  result.push(exprToSQL(value));
  return result.filter(hasVal).join(' ');
}

function columnOffsetToSQL(column, isDual) {
  if (typeof column === 'string') return identifierToSql(column, isDual);
  var expr = column.expr,
    offset = column.offset,
    suffix = column.suffix;
  var offsetExpr = offset && offset.map(function (offsetItem) {
    return ['[', offsetItem.name, "".concat(offsetItem.name ? '(' : ''), literalToSQL(offsetItem.value), "".concat(offsetItem.name ? ')' : ''), ']'].filter(hasVal).join('');
  }).join('');
  var result = [exprToSQL(expr), offsetExpr, suffix].filter(hasVal).join('');
  return result;
}
function arrayIndexToSQL(arrayIndexList) {
  if (!arrayIndexList || arrayIndexList.length === 0) return '';
  var result = [];
  var _iterator = _createForOfIteratorHelper(arrayIndexList),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var arrayIndex = _step.value;
      var arrayIndexStr = arrayIndex.brackets ? "[".concat(exprToSQL(arrayIndex.index), "]") : "".concat(arrayIndex.notation).concat(exprToSQL(arrayIndex.index));
      if (arrayIndex.property) arrayIndexStr = "".concat(arrayIndexStr, ".").concat(literalToSQL(arrayIndex.property));
      result.push(arrayIndexStr);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return result.join('');
}
function columnRefToSQL(expr) {
  var array_index = expr.array_index,
    as = expr.as,
    column = expr.column,
    collate = expr.collate,
    db = expr.db,
    isDual = expr.isDual,
    _expr$notations = expr.notations,
    notations = _expr$notations === void 0 ? [] : _expr$notations,
    options = expr.options,
    schema = expr.schema,
    table = expr.table,
    parentheses = expr.parentheses,
    suffix = expr.suffix,
    order_by = expr.order_by,
    _expr$subFields = expr.subFields,
    subFields = _expr$subFields === void 0 ? [] : _expr$subFields;
  var str = column === '*' ? '*' : columnOffsetToSQL(column, isDual);
  var prefix = [db, schema, table].filter(hasVal).map(function (val) {
    return "".concat(typeof val === 'string' ? identifierToSql(val) : exprToSQL(val));
  });
  var prefixStr = prefix[0];
  if (prefixStr) {
    var i = 1;
    for (; i < prefix.length; ++i) {
      prefixStr = "".concat(prefixStr).concat(notations[i] || '.').concat(prefix[i]);
    }
    str = "".concat(prefixStr).concat(notations[i] || '.').concat(str);
  }
  str = ["".concat(str).concat(arrayIndexToSQL(array_index))].concat(_toConsumableArray(subFields)).join('.');
  var result = [str, collateToSQL(collate), exprToSQL(options), commonOptionConnector('AS', exprToSQL, as)];
  result.push(typeof suffix === 'string' ? toUpper(suffix) : exprToSQL(suffix));
  result.push(toUpper(order_by));
  var sql = result.filter(hasVal).join(' ');
  return parentheses ? "(".concat(sql, ")") : sql;
}
function columnDataType(definition) {
  if (!definition) return;
  var dataType = definition.dataType,
    length = definition.length,
    suffix = definition.suffix,
    scale = definition.scale,
    expr = definition.expr;
  var parentheses = length != null && true || false;
  var result = dataTypeToSQL({
    dataType: dataType,
    length: length,
    suffix: suffix,
    scale: scale,
    parentheses: parentheses
  });
  if (expr) result += exprToSQL(expr);
  if (definition.array) {
    var arrayExpr = arrayDimensionToSymbol(definition);
    var space = /^\[.*\]$/.test(arrayExpr) ? '' : ' ';
    result += [space, arrayExpr].join('');
  }
  return result;
}
function columnReferenceDefinitionToSQL(referenceDefinition) {
  var reference = [];
  if (!referenceDefinition) return reference;
  var definition = referenceDefinition.definition,
    keyword = referenceDefinition.keyword,
    match = referenceDefinition.match,
    table = referenceDefinition.table,
    onAction = referenceDefinition.on_action;
  reference.push(toUpper(keyword));
  reference.push(tablesToSQL(table));
  reference.push(definition && "(".concat(definition.map(function (col) {
    return exprToSQL(col);
  }).join(', '), ")"));
  reference.push(toUpper(match));
  onAction.map(function (onRef) {
    return reference.push(toUpper(onRef.type), exprToSQL(onRef.value));
  });
  return reference.filter(hasVal);
}
function generatedExpressionToSQL(generated) {
  if (!generated) return;
  var result = [toUpper(generated.value), "(".concat(exprToSQL(generated.expr), ")"), toUpper(generated.storage_type)];
  return result.filter(hasVal).join(' ');
}
function columnOption(definition) {
  var columnOpt = [];
  var nullable = definition.nullable,
    characterSet = definition.character_set,
    check = definition.check,
    comment = definition.comment,
    constraint = definition.constraint,
    collate = definition.collate,
    storage = definition.storage,
    using = definition.using,
    defaultOpt = definition.default_val,
    generated = definition.generated,
    autoIncrement = definition.auto_increment,
    uniqueKey = definition.unique,
    primaryKey = definition.primary_key,
    columnFormat = definition.column_format,
    referenceDefinition = definition.reference_definition,
    generateByDefault = definition.generated_by_default;
  var nullSQL = [toUpper(nullable && nullable.action), toUpper(nullable && nullable.value)].filter(hasVal).join(' ');
  if (!generated) columnOpt.push(nullSQL);
  if (defaultOpt) {
    var type = defaultOpt.type,
      value = defaultOpt.value;
    columnOpt.push(type.toUpperCase(), exprToSQL(value));
  }
  var _getParserOpt = getParserOpt(),
    database = _getParserOpt.database;
  if (constraint) columnOpt.push(toUpper(constraint.keyword), literalToSQL(constraint.constraint));
  columnOpt.push(constraintDefinitionToSQL(check));
  columnOpt.push(generatedExpressionToSQL(generated));
  if (generated) columnOpt.push(nullSQL);
  columnOpt.push(autoIncrementToSQL(autoIncrement), toUpper(primaryKey), toUpper(uniqueKey), literalToSQL(generateByDefault), commentToSQL(comment));
  columnOpt.push.apply(columnOpt, _toConsumableArray(commonTypeValue(characterSet)));
  if (database.toLowerCase() !== 'sqlite') columnOpt.push(exprToSQL(collate));
  columnOpt.push.apply(columnOpt, _toConsumableArray(commonTypeValue(columnFormat)));
  columnOpt.push.apply(columnOpt, _toConsumableArray(commonTypeValue(storage)));
  columnOpt.push.apply(columnOpt, _toConsumableArray(columnReferenceDefinitionToSQL(referenceDefinition)));
  columnOpt.push(commonOptionConnector('USING', exprToSQL, using));
  return columnOpt.filter(hasVal).join(' ');
}
function columnOrderToSQL(columnOrder) {
  var column = columnOrder.column,
    collate = columnOrder.collate,
    nulls = columnOrder.nulls,
    opclass = columnOrder.opclass,
    order_by = columnOrder.order_by;
  var columnExpr = typeof column === 'string' ? {
    type: 'column_ref',
    table: columnOrder.table,
    column: column
  } : columnOrder;
  columnExpr.collate = null;
  var result = [exprToSQL(columnExpr), exprToSQL(collate), opclass, toUpper(order_by), toUpper(nulls)];
  return result.filter(hasVal).join(' ');
}
function columnDefinitionToSQL(columnDefinition) {
  var column = [];
  var name = columnRefToSQL(columnDefinition.column);
  var dataType = columnDataType(columnDefinition.definition);
  column.push(name);
  column.push(dataType);
  column.push(columnOption(columnDefinition));
  return column.filter(hasVal).join(' ');
}
function asToSQL(asStr) {
  if (!asStr) return '';
  if (_typeof(asStr) === 'object') return ['AS', exprToSQL(asStr)].join(' ');
  return ['AS', /^(`?)[a-z_][0-9a-z_]*(`?)$/i.test(asStr) ? identifierToSql(asStr) : columnIdentifierToSql(asStr)].join(' ');
}
function fullTextSearchToSQL(expr) {
  var against = expr.against,
    as = expr.as,
    columns = expr.columns,
    match = expr.match,
    mode = expr.mode;
  var matchExpr = [toUpper(match), "(".concat(columns.map(function (col) {
    return columnRefToSQL(col);
  }).join(', '), ")")].join(' ');
  var againstExpr = [toUpper(against), ['(', exprToSQL(expr.expr), mode && " ".concat(literalToSQL(mode)), ')'].filter(hasVal).join('')].join(' ');
  return [matchExpr, againstExpr, asToSQL(as)].filter(hasVal).join(' ');
}
function columnToSQL(column, isDual) {
  var expr = column.expr,
    type = column.type;
  if (type === 'cast') return castToSQL(column);
  if (isDual) expr.isDual = isDual;
  var str = exprToSQL(expr);
  var exprList = column.expr_list;
  if (exprList) {
    var result = [str];
    var columnsStr = exprList.map(function (col) {
      return columnToSQL(col, isDual);
    }).join(', ');
    result.push([toUpper(type), type && '(', columnsStr, type && ')'].filter(hasVal).join(''));
    return result.filter(hasVal).join(' ');
  }
  if (expr.parentheses && Reflect.has(expr, 'array_index') && expr.type !== 'cast') str = "(".concat(str, ")");
  if (expr.array_index && expr.type !== 'column_ref' && expr.type !== 'function') {
    str = "".concat(str).concat(arrayIndexToSQL(expr.array_index));
  }
  return [str, asToSQL(column.as)].filter(hasVal).join(' ');
}
function getDual(tables) {
  var baseTable = Array.isArray(tables) && tables[0];
  if (baseTable && baseTable.type === 'dual') return true;
  return false;
}
/**
 * Stringify column expressions
 *
 * @param {Array} columns
 * @return {string}
 */
function columnsToSQL(columns, tables) {
  if (!columns || columns === '*') return columns;
  var isDual = getDual(tables);
  return columns.map(function (col) {
    return columnToSQL(col, isDual);
  }).join(', ');
}

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var BigInteger = {exports: {}};

var hasRequiredBigInteger;

function requireBigInteger () {
	if (hasRequiredBigInteger) return BigInteger.exports;
	hasRequiredBigInteger = 1;
	(function (module) {
		var bigInt = (function (undefined$1) {

		    var BASE = 1e7,
		        LOG_BASE = 7,
		        MAX_INT = 9007199254740992,
		        MAX_INT_ARR = smallToArray(MAX_INT),
		        DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

		    var supportsNativeBigInt = typeof BigInt === "function";

		    function Integer(v, radix, alphabet, caseSensitive) {
		        if (typeof v === "undefined") return Integer[0];
		        if (typeof radix !== "undefined") return +radix === 10 && !alphabet ? parseValue(v) : parseBase(v, radix, alphabet, caseSensitive);
		        return parseValue(v);
		    }

		    function BigInteger(value, sign) {
		        this.value = value;
		        this.sign = sign;
		        this.isSmall = false;
		    }
		    BigInteger.prototype = Object.create(Integer.prototype);

		    function SmallInteger(value) {
		        this.value = value;
		        this.sign = value < 0;
		        this.isSmall = true;
		    }
		    SmallInteger.prototype = Object.create(Integer.prototype);

		    function NativeBigInt(value) {
		        this.value = value;
		    }
		    NativeBigInt.prototype = Object.create(Integer.prototype);

		    function isPrecise(n) {
		        return -MAX_INT < n && n < MAX_INT;
		    }

		    function smallToArray(n) { // For performance reasons doesn't reference BASE, need to change this function if BASE changes
		        if (n < 1e7)
		            return [n];
		        if (n < 1e14)
		            return [n % 1e7, Math.floor(n / 1e7)];
		        return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
		    }

		    function arrayToSmall(arr) { // If BASE changes this function may need to change
		        trim(arr);
		        var length = arr.length;
		        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
		            switch (length) {
		                case 0: return 0;
		                case 1: return arr[0];
		                case 2: return arr[0] + arr[1] * BASE;
		                default: return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
		            }
		        }
		        return arr;
		    }

		    function trim(v) {
		        var i = v.length;
		        while (v[--i] === 0);
		        v.length = i + 1;
		    }

		    function createArray(length) { // function shamelessly stolen from Yaffle's library https://github.com/Yaffle/BigInteger
		        var x = new Array(length);
		        var i = -1;
		        while (++i < length) {
		            x[i] = 0;
		        }
		        return x;
		    }

		    function truncate(n) {
		        if (n > 0) return Math.floor(n);
		        return Math.ceil(n);
		    }

		    function add(a, b) { // assumes a and b are arrays with a.length >= b.length
		        var l_a = a.length,
		            l_b = b.length,
		            r = new Array(l_a),
		            carry = 0,
		            base = BASE,
		            sum, i;
		        for (i = 0; i < l_b; i++) {
		            sum = a[i] + b[i] + carry;
		            carry = sum >= base ? 1 : 0;
		            r[i] = sum - carry * base;
		        }
		        while (i < l_a) {
		            sum = a[i] + carry;
		            carry = sum === base ? 1 : 0;
		            r[i++] = sum - carry * base;
		        }
		        if (carry > 0) r.push(carry);
		        return r;
		    }

		    function addAny(a, b) {
		        if (a.length >= b.length) return add(a, b);
		        return add(b, a);
		    }

		    function addSmall(a, carry) { // assumes a is array, carry is number with 0 <= carry < MAX_INT
		        var l = a.length,
		            r = new Array(l),
		            base = BASE,
		            sum, i;
		        for (i = 0; i < l; i++) {
		            sum = a[i] - base + carry;
		            carry = Math.floor(sum / base);
		            r[i] = sum - carry * base;
		            carry += 1;
		        }
		        while (carry > 0) {
		            r[i++] = carry % base;
		            carry = Math.floor(carry / base);
		        }
		        return r;
		    }

		    BigInteger.prototype.add = function (v) {
		        var n = parseValue(v);
		        if (this.sign !== n.sign) {
		            return this.subtract(n.negate());
		        }
		        var a = this.value, b = n.value;
		        if (n.isSmall) {
		            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
		        }
		        return new BigInteger(addAny(a, b), this.sign);
		    };
		    BigInteger.prototype.plus = BigInteger.prototype.add;

		    SmallInteger.prototype.add = function (v) {
		        var n = parseValue(v);
		        var a = this.value;
		        if (a < 0 !== n.sign) {
		            return this.subtract(n.negate());
		        }
		        var b = n.value;
		        if (n.isSmall) {
		            if (isPrecise(a + b)) return new SmallInteger(a + b);
		            b = smallToArray(Math.abs(b));
		        }
		        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
		    };
		    SmallInteger.prototype.plus = SmallInteger.prototype.add;

		    NativeBigInt.prototype.add = function (v) {
		        return new NativeBigInt(this.value + parseValue(v).value);
		    };
		    NativeBigInt.prototype.plus = NativeBigInt.prototype.add;

		    function subtract(a, b) { // assumes a and b are arrays with a >= b
		        var a_l = a.length,
		            b_l = b.length,
		            r = new Array(a_l),
		            borrow = 0,
		            base = BASE,
		            i, difference;
		        for (i = 0; i < b_l; i++) {
		            difference = a[i] - borrow - b[i];
		            if (difference < 0) {
		                difference += base;
		                borrow = 1;
		            } else borrow = 0;
		            r[i] = difference;
		        }
		        for (i = b_l; i < a_l; i++) {
		            difference = a[i] - borrow;
		            if (difference < 0) difference += base;
		            else {
		                r[i++] = difference;
		                break;
		            }
		            r[i] = difference;
		        }
		        for (; i < a_l; i++) {
		            r[i] = a[i];
		        }
		        trim(r);
		        return r;
		    }

		    function subtractAny(a, b, sign) {
		        var value;
		        if (compareAbs(a, b) >= 0) {
		            value = subtract(a, b);
		        } else {
		            value = subtract(b, a);
		            sign = !sign;
		        }
		        value = arrayToSmall(value);
		        if (typeof value === "number") {
		            if (sign) value = -value;
		            return new SmallInteger(value);
		        }
		        return new BigInteger(value, sign);
		    }

		    function subtractSmall(a, b, sign) { // assumes a is array, b is number with 0 <= b < MAX_INT
		        var l = a.length,
		            r = new Array(l),
		            carry = -b,
		            base = BASE,
		            i, difference;
		        for (i = 0; i < l; i++) {
		            difference = a[i] + carry;
		            carry = Math.floor(difference / base);
		            difference %= base;
		            r[i] = difference < 0 ? difference + base : difference;
		        }
		        r = arrayToSmall(r);
		        if (typeof r === "number") {
		            if (sign) r = -r;
		            return new SmallInteger(r);
		        } return new BigInteger(r, sign);
		    }

		    BigInteger.prototype.subtract = function (v) {
		        var n = parseValue(v);
		        if (this.sign !== n.sign) {
		            return this.add(n.negate());
		        }
		        var a = this.value, b = n.value;
		        if (n.isSmall)
		            return subtractSmall(a, Math.abs(b), this.sign);
		        return subtractAny(a, b, this.sign);
		    };
		    BigInteger.prototype.minus = BigInteger.prototype.subtract;

		    SmallInteger.prototype.subtract = function (v) {
		        var n = parseValue(v);
		        var a = this.value;
		        if (a < 0 !== n.sign) {
		            return this.add(n.negate());
		        }
		        var b = n.value;
		        if (n.isSmall) {
		            return new SmallInteger(a - b);
		        }
		        return subtractSmall(b, Math.abs(a), a >= 0);
		    };
		    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;

		    NativeBigInt.prototype.subtract = function (v) {
		        return new NativeBigInt(this.value - parseValue(v).value);
		    };
		    NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract;

		    BigInteger.prototype.negate = function () {
		        return new BigInteger(this.value, !this.sign);
		    };
		    SmallInteger.prototype.negate = function () {
		        var sign = this.sign;
		        var small = new SmallInteger(-this.value);
		        small.sign = !sign;
		        return small;
		    };
		    NativeBigInt.prototype.negate = function () {
		        return new NativeBigInt(-this.value);
		    };

		    BigInteger.prototype.abs = function () {
		        return new BigInteger(this.value, false);
		    };
		    SmallInteger.prototype.abs = function () {
		        return new SmallInteger(Math.abs(this.value));
		    };
		    NativeBigInt.prototype.abs = function () {
		        return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
		    };


		    function multiplyLong(a, b) {
		        var a_l = a.length,
		            b_l = b.length,
		            l = a_l + b_l,
		            r = createArray(l),
		            base = BASE,
		            product, carry, i, a_i, b_j;
		        for (i = 0; i < a_l; ++i) {
		            a_i = a[i];
		            for (var j = 0; j < b_l; ++j) {
		                b_j = b[j];
		                product = a_i * b_j + r[i + j];
		                carry = Math.floor(product / base);
		                r[i + j] = product - carry * base;
		                r[i + j + 1] += carry;
		            }
		        }
		        trim(r);
		        return r;
		    }

		    function multiplySmall(a, b) { // assumes a is array, b is number with |b| < BASE
		        var l = a.length,
		            r = new Array(l),
		            base = BASE,
		            carry = 0,
		            product, i;
		        for (i = 0; i < l; i++) {
		            product = a[i] * b + carry;
		            carry = Math.floor(product / base);
		            r[i] = product - carry * base;
		        }
		        while (carry > 0) {
		            r[i++] = carry % base;
		            carry = Math.floor(carry / base);
		        }
		        return r;
		    }

		    function shiftLeft(x, n) {
		        var r = [];
		        while (n-- > 0) r.push(0);
		        return r.concat(x);
		    }

		    function multiplyKaratsuba(x, y) {
		        var n = Math.max(x.length, y.length);

		        if (n <= 30) return multiplyLong(x, y);
		        n = Math.ceil(n / 2);

		        var b = x.slice(n),
		            a = x.slice(0, n),
		            d = y.slice(n),
		            c = y.slice(0, n);

		        var ac = multiplyKaratsuba(a, c),
		            bd = multiplyKaratsuba(b, d),
		            abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

		        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
		        trim(product);
		        return product;
		    }

		    // The following function is derived from a surface fit of a graph plotting the performance difference
		    // between long multiplication and karatsuba multiplication versus the lengths of the two arrays.
		    function useKaratsuba(l1, l2) {
		        return -0.012 * l1 - 0.012 * l2 + 0.000015 * l1 * l2 > 0;
		    }

		    BigInteger.prototype.multiply = function (v) {
		        var n = parseValue(v),
		            a = this.value, b = n.value,
		            sign = this.sign !== n.sign,
		            abs;
		        if (n.isSmall) {
		            if (b === 0) return Integer[0];
		            if (b === 1) return this;
		            if (b === -1) return this.negate();
		            abs = Math.abs(b);
		            if (abs < BASE) {
		                return new BigInteger(multiplySmall(a, abs), sign);
		            }
		            b = smallToArray(abs);
		        }
		        if (useKaratsuba(a.length, b.length)) // Karatsuba is only faster for certain array sizes
		            return new BigInteger(multiplyKaratsuba(a, b), sign);
		        return new BigInteger(multiplyLong(a, b), sign);
		    };

		    BigInteger.prototype.times = BigInteger.prototype.multiply;

		    function multiplySmallAndArray(a, b, sign) { // a >= 0
		        if (a < BASE) {
		            return new BigInteger(multiplySmall(b, a), sign);
		        }
		        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
		    }
		    SmallInteger.prototype._multiplyBySmall = function (a) {
		        if (isPrecise(a.value * this.value)) {
		            return new SmallInteger(a.value * this.value);
		        }
		        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
		    };
		    BigInteger.prototype._multiplyBySmall = function (a) {
		        if (a.value === 0) return Integer[0];
		        if (a.value === 1) return this;
		        if (a.value === -1) return this.negate();
		        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
		    };
		    SmallInteger.prototype.multiply = function (v) {
		        return parseValue(v)._multiplyBySmall(this);
		    };
		    SmallInteger.prototype.times = SmallInteger.prototype.multiply;

		    NativeBigInt.prototype.multiply = function (v) {
		        return new NativeBigInt(this.value * parseValue(v).value);
		    };
		    NativeBigInt.prototype.times = NativeBigInt.prototype.multiply;

		    function square(a) {
		        //console.assert(2 * BASE * BASE < MAX_INT);
		        var l = a.length,
		            r = createArray(l + l),
		            base = BASE,
		            product, carry, i, a_i, a_j;
		        for (i = 0; i < l; i++) {
		            a_i = a[i];
		            carry = 0 - a_i * a_i;
		            for (var j = i; j < l; j++) {
		                a_j = a[j];
		                product = 2 * (a_i * a_j) + r[i + j] + carry;
		                carry = Math.floor(product / base);
		                r[i + j] = product - carry * base;
		            }
		            r[i + l] = carry;
		        }
		        trim(r);
		        return r;
		    }

		    BigInteger.prototype.square = function () {
		        return new BigInteger(square(this.value), false);
		    };

		    SmallInteger.prototype.square = function () {
		        var value = this.value * this.value;
		        if (isPrecise(value)) return new SmallInteger(value);
		        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
		    };

		    NativeBigInt.prototype.square = function (v) {
		        return new NativeBigInt(this.value * this.value);
		    };

		    function divMod1(a, b) { // Left over from previous version. Performs faster than divMod2 on smaller input sizes.
		        var a_l = a.length,
		            b_l = b.length,
		            base = BASE,
		            result = createArray(b.length),
		            divisorMostSignificantDigit = b[b_l - 1],
		            // normalization
		            lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
		            remainder = multiplySmall(a, lambda),
		            divisor = multiplySmall(b, lambda),
		            quotientDigit, shift, carry, borrow, i, l, q;
		        if (remainder.length <= a_l) remainder.push(0);
		        divisor.push(0);
		        divisorMostSignificantDigit = divisor[b_l - 1];
		        for (shift = a_l - b_l; shift >= 0; shift--) {
		            quotientDigit = base - 1;
		            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
		                quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
		            }
		            // quotientDigit <= base - 1
		            carry = 0;
		            borrow = 0;
		            l = divisor.length;
		            for (i = 0; i < l; i++) {
		                carry += quotientDigit * divisor[i];
		                q = Math.floor(carry / base);
		                borrow += remainder[shift + i] - (carry - q * base);
		                carry = q;
		                if (borrow < 0) {
		                    remainder[shift + i] = borrow + base;
		                    borrow = -1;
		                } else {
		                    remainder[shift + i] = borrow;
		                    borrow = 0;
		                }
		            }
		            while (borrow !== 0) {
		                quotientDigit -= 1;
		                carry = 0;
		                for (i = 0; i < l; i++) {
		                    carry += remainder[shift + i] - base + divisor[i];
		                    if (carry < 0) {
		                        remainder[shift + i] = carry + base;
		                        carry = 0;
		                    } else {
		                        remainder[shift + i] = carry;
		                        carry = 1;
		                    }
		                }
		                borrow += carry;
		            }
		            result[shift] = quotientDigit;
		        }
		        // denormalization
		        remainder = divModSmall(remainder, lambda)[0];
		        return [arrayToSmall(result), arrayToSmall(remainder)];
		    }

		    function divMod2(a, b) { // Implementation idea shamelessly stolen from Silent Matt's library http://silentmatt.com/biginteger/
		        // Performs faster than divMod1 on larger input sizes.
		        var a_l = a.length,
		            b_l = b.length,
		            result = [],
		            part = [],
		            base = BASE,
		            guess, xlen, highx, highy, check;
		        while (a_l) {
		            part.unshift(a[--a_l]);
		            trim(part);
		            if (compareAbs(part, b) < 0) {
		                result.push(0);
		                continue;
		            }
		            xlen = part.length;
		            highx = part[xlen - 1] * base + part[xlen - 2];
		            highy = b[b_l - 1] * base + b[b_l - 2];
		            if (xlen > b_l) {
		                highx = (highx + 1) * base;
		            }
		            guess = Math.ceil(highx / highy);
		            do {
		                check = multiplySmall(b, guess);
		                if (compareAbs(check, part) <= 0) break;
		                guess--;
		            } while (guess);
		            result.push(guess);
		            part = subtract(part, check);
		        }
		        result.reverse();
		        return [arrayToSmall(result), arrayToSmall(part)];
		    }

		    function divModSmall(value, lambda) {
		        var length = value.length,
		            quotient = createArray(length),
		            base = BASE,
		            i, q, remainder, divisor;
		        remainder = 0;
		        for (i = length - 1; i >= 0; --i) {
		            divisor = remainder * base + value[i];
		            q = truncate(divisor / lambda);
		            remainder = divisor - q * lambda;
		            quotient[i] = q | 0;
		        }
		        return [quotient, remainder | 0];
		    }

		    function divModAny(self, v) {
		        var value, n = parseValue(v);
		        if (supportsNativeBigInt) {
		            return [new NativeBigInt(self.value / n.value), new NativeBigInt(self.value % n.value)];
		        }
		        var a = self.value, b = n.value;
		        var quotient;
		        if (b === 0) throw new Error("Cannot divide by zero");
		        if (self.isSmall) {
		            if (n.isSmall) {
		                return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
		            }
		            return [Integer[0], self];
		        }
		        if (n.isSmall) {
		            if (b === 1) return [self, Integer[0]];
		            if (b == -1) return [self.negate(), Integer[0]];
		            var abs = Math.abs(b);
		            if (abs < BASE) {
		                value = divModSmall(a, abs);
		                quotient = arrayToSmall(value[0]);
		                var remainder = value[1];
		                if (self.sign) remainder = -remainder;
		                if (typeof quotient === "number") {
		                    if (self.sign !== n.sign) quotient = -quotient;
		                    return [new SmallInteger(quotient), new SmallInteger(remainder)];
		                }
		                return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
		            }
		            b = smallToArray(abs);
		        }
		        var comparison = compareAbs(a, b);
		        if (comparison === -1) return [Integer[0], self];
		        if (comparison === 0) return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];

		        // divMod1 is faster on smaller input sizes
		        if (a.length + b.length <= 200)
		            value = divMod1(a, b);
		        else value = divMod2(a, b);

		        quotient = value[0];
		        var qSign = self.sign !== n.sign,
		            mod = value[1],
		            mSign = self.sign;
		        if (typeof quotient === "number") {
		            if (qSign) quotient = -quotient;
		            quotient = new SmallInteger(quotient);
		        } else quotient = new BigInteger(quotient, qSign);
		        if (typeof mod === "number") {
		            if (mSign) mod = -mod;
		            mod = new SmallInteger(mod);
		        } else mod = new BigInteger(mod, mSign);
		        return [quotient, mod];
		    }

		    BigInteger.prototype.divmod = function (v) {
		        var result = divModAny(this, v);
		        return {
		            quotient: result[0],
		            remainder: result[1]
		        };
		    };
		    NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger.prototype.divmod;


		    BigInteger.prototype.divide = function (v) {
		        return divModAny(this, v)[0];
		    };
		    NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function (v) {
		        return new NativeBigInt(this.value / parseValue(v).value);
		    };
		    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

		    BigInteger.prototype.mod = function (v) {
		        return divModAny(this, v)[1];
		    };
		    NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function (v) {
		        return new NativeBigInt(this.value % parseValue(v).value);
		    };
		    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;

		    BigInteger.prototype.pow = function (v) {
		        var n = parseValue(v),
		            a = this.value,
		            b = n.value,
		            value, x, y;
		        if (b === 0) return Integer[1];
		        if (a === 0) return Integer[0];
		        if (a === 1) return Integer[1];
		        if (a === -1) return n.isEven() ? Integer[1] : Integer[-1];
		        if (n.sign) {
		            return Integer[0];
		        }
		        if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");
		        if (this.isSmall) {
		            if (isPrecise(value = Math.pow(a, b)))
		                return new SmallInteger(truncate(value));
		        }
		        x = this;
		        y = Integer[1];
		        while (true) {
		            if (b & 1 === 1) {
		                y = y.times(x);
		                --b;
		            }
		            if (b === 0) break;
		            b /= 2;
		            x = x.square();
		        }
		        return y;
		    };
		    SmallInteger.prototype.pow = BigInteger.prototype.pow;

		    NativeBigInt.prototype.pow = function (v) {
		        var n = parseValue(v);
		        var a = this.value, b = n.value;
		        var _0 = BigInt(0), _1 = BigInt(1), _2 = BigInt(2);
		        if (b === _0) return Integer[1];
		        if (a === _0) return Integer[0];
		        if (a === _1) return Integer[1];
		        if (a === BigInt(-1)) return n.isEven() ? Integer[1] : Integer[-1];
		        if (n.isNegative()) return new NativeBigInt(_0);
		        var x = this;
		        var y = Integer[1];
		        while (true) {
		            if ((b & _1) === _1) {
		                y = y.times(x);
		                --b;
		            }
		            if (b === _0) break;
		            b /= _2;
		            x = x.square();
		        }
		        return y;
		    };

		    BigInteger.prototype.modPow = function (exp, mod) {
		        exp = parseValue(exp);
		        mod = parseValue(mod);
		        if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");
		        var r = Integer[1],
		            base = this.mod(mod);
		        if (exp.isNegative()) {
		            exp = exp.multiply(Integer[-1]);
		            base = base.modInv(mod);
		        }
		        while (exp.isPositive()) {
		            if (base.isZero()) return Integer[0];
		            if (exp.isOdd()) r = r.multiply(base).mod(mod);
		            exp = exp.divide(2);
		            base = base.square().mod(mod);
		        }
		        return r;
		    };
		    NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger.prototype.modPow;

		    function compareAbs(a, b) {
		        if (a.length !== b.length) {
		            return a.length > b.length ? 1 : -1;
		        }
		        for (var i = a.length - 1; i >= 0; i--) {
		            if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
		        }
		        return 0;
		    }

		    BigInteger.prototype.compareAbs = function (v) {
		        var n = parseValue(v),
		            a = this.value,
		            b = n.value;
		        if (n.isSmall) return 1;
		        return compareAbs(a, b);
		    };
		    SmallInteger.prototype.compareAbs = function (v) {
		        var n = parseValue(v),
		            a = Math.abs(this.value),
		            b = n.value;
		        if (n.isSmall) {
		            b = Math.abs(b);
		            return a === b ? 0 : a > b ? 1 : -1;
		        }
		        return -1;
		    };
		    NativeBigInt.prototype.compareAbs = function (v) {
		        var a = this.value;
		        var b = parseValue(v).value;
		        a = a >= 0 ? a : -a;
		        b = b >= 0 ? b : -b;
		        return a === b ? 0 : a > b ? 1 : -1;
		    };

		    BigInteger.prototype.compare = function (v) {
		        // See discussion about comparison with Infinity:
		        // https://github.com/peterolson/BigInteger.js/issues/61
		        if (v === Infinity) {
		            return -1;
		        }
		        if (v === -Infinity) {
		            return 1;
		        }

		        var n = parseValue(v),
		            a = this.value,
		            b = n.value;
		        if (this.sign !== n.sign) {
		            return n.sign ? 1 : -1;
		        }
		        if (n.isSmall) {
		            return this.sign ? -1 : 1;
		        }
		        return compareAbs(a, b) * (this.sign ? -1 : 1);
		    };
		    BigInteger.prototype.compareTo = BigInteger.prototype.compare;

		    SmallInteger.prototype.compare = function (v) {
		        if (v === Infinity) {
		            return -1;
		        }
		        if (v === -Infinity) {
		            return 1;
		        }

		        var n = parseValue(v),
		            a = this.value,
		            b = n.value;
		        if (n.isSmall) {
		            return a == b ? 0 : a > b ? 1 : -1;
		        }
		        if (a < 0 !== n.sign) {
		            return a < 0 ? -1 : 1;
		        }
		        return a < 0 ? 1 : -1;
		    };
		    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;

		    NativeBigInt.prototype.compare = function (v) {
		        if (v === Infinity) {
		            return -1;
		        }
		        if (v === -Infinity) {
		            return 1;
		        }
		        var a = this.value;
		        var b = parseValue(v).value;
		        return a === b ? 0 : a > b ? 1 : -1;
		    };
		    NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare;

		    BigInteger.prototype.equals = function (v) {
		        return this.compare(v) === 0;
		    };
		    NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

		    BigInteger.prototype.notEquals = function (v) {
		        return this.compare(v) !== 0;
		    };
		    NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

		    BigInteger.prototype.greater = function (v) {
		        return this.compare(v) > 0;
		    };
		    NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

		    BigInteger.prototype.lesser = function (v) {
		        return this.compare(v) < 0;
		    };
		    NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

		    BigInteger.prototype.greaterOrEquals = function (v) {
		        return this.compare(v) >= 0;
		    };
		    NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

		    BigInteger.prototype.lesserOrEquals = function (v) {
		        return this.compare(v) <= 0;
		    };
		    NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

		    BigInteger.prototype.isEven = function () {
		        return (this.value[0] & 1) === 0;
		    };
		    SmallInteger.prototype.isEven = function () {
		        return (this.value & 1) === 0;
		    };
		    NativeBigInt.prototype.isEven = function () {
		        return (this.value & BigInt(1)) === BigInt(0);
		    };

		    BigInteger.prototype.isOdd = function () {
		        return (this.value[0] & 1) === 1;
		    };
		    SmallInteger.prototype.isOdd = function () {
		        return (this.value & 1) === 1;
		    };
		    NativeBigInt.prototype.isOdd = function () {
		        return (this.value & BigInt(1)) === BigInt(1);
		    };

		    BigInteger.prototype.isPositive = function () {
		        return !this.sign;
		    };
		    SmallInteger.prototype.isPositive = function () {
		        return this.value > 0;
		    };
		    NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive;

		    BigInteger.prototype.isNegative = function () {
		        return this.sign;
		    };
		    SmallInteger.prototype.isNegative = function () {
		        return this.value < 0;
		    };
		    NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative;

		    BigInteger.prototype.isUnit = function () {
		        return false;
		    };
		    SmallInteger.prototype.isUnit = function () {
		        return Math.abs(this.value) === 1;
		    };
		    NativeBigInt.prototype.isUnit = function () {
		        return this.abs().value === BigInt(1);
		    };

		    BigInteger.prototype.isZero = function () {
		        return false;
		    };
		    SmallInteger.prototype.isZero = function () {
		        return this.value === 0;
		    };
		    NativeBigInt.prototype.isZero = function () {
		        return this.value === BigInt(0);
		    };

		    BigInteger.prototype.isDivisibleBy = function (v) {
		        var n = parseValue(v);
		        if (n.isZero()) return false;
		        if (n.isUnit()) return true;
		        if (n.compareAbs(2) === 0) return this.isEven();
		        return this.mod(n).isZero();
		    };
		    NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;

		    function isBasicPrime(v) {
		        var n = v.abs();
		        if (n.isUnit()) return false;
		        if (n.equals(2) || n.equals(3) || n.equals(5)) return true;
		        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false;
		        if (n.lesser(49)) return true;
		        // we don't know if it's prime: let the other functions figure it out
		    }

		    function millerRabinTest(n, a) {
		        var nPrev = n.prev(),
		            b = nPrev,
		            r = 0,
		            d, i, x;
		        while (b.isEven()) b = b.divide(2), r++;
		        next: for (i = 0; i < a.length; i++) {
		            if (n.lesser(a[i])) continue;
		            x = bigInt(a[i]).modPow(b, n);
		            if (x.isUnit() || x.equals(nPrev)) continue;
		            for (d = r - 1; d != 0; d--) {
		                x = x.square().mod(n);
		                if (x.isUnit()) return false;
		                if (x.equals(nPrev)) continue next;
		            }
		            return false;
		        }
		        return true;
		    }

		    // Set "strict" to true to force GRH-supported lower bound of 2*log(N)^2
		    BigInteger.prototype.isPrime = function (strict) {
		        var isPrime = isBasicPrime(this);
		        if (isPrime !== undefined$1) return isPrime;
		        var n = this.abs();
		        var bits = n.bitLength();
		        if (bits <= 64)
		            return millerRabinTest(n, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
		        var logN = Math.log(2) * bits.toJSNumber();
		        var t = Math.ceil((strict === true) ? (2 * Math.pow(logN, 2)) : logN);
		        for (var a = [], i = 0; i < t; i++) {
		            a.push(bigInt(i + 2));
		        }
		        return millerRabinTest(n, a);
		    };
		    NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

		    BigInteger.prototype.isProbablePrime = function (iterations, rng) {
		        var isPrime = isBasicPrime(this);
		        if (isPrime !== undefined$1) return isPrime;
		        var n = this.abs();
		        var t = iterations === undefined$1 ? 5 : iterations;
		        for (var a = [], i = 0; i < t; i++) {
		            a.push(bigInt.randBetween(2, n.minus(2), rng));
		        }
		        return millerRabinTest(n, a);
		    };
		    NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;

		    BigInteger.prototype.modInv = function (n) {
		        var t = bigInt.zero, newT = bigInt.one, r = parseValue(n), newR = this.abs(), q, lastT, lastR;
		        while (!newR.isZero()) {
		            q = r.divide(newR);
		            lastT = t;
		            lastR = r;
		            t = newT;
		            r = newR;
		            newT = lastT.subtract(q.multiply(newT));
		            newR = lastR.subtract(q.multiply(newR));
		        }
		        if (!r.isUnit()) throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
		        if (t.compare(0) === -1) {
		            t = t.add(n);
		        }
		        if (this.isNegative()) {
		            return t.negate();
		        }
		        return t;
		    };

		    NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger.prototype.modInv;

		    BigInteger.prototype.next = function () {
		        var value = this.value;
		        if (this.sign) {
		            return subtractSmall(value, 1, this.sign);
		        }
		        return new BigInteger(addSmall(value, 1), this.sign);
		    };
		    SmallInteger.prototype.next = function () {
		        var value = this.value;
		        if (value + 1 < MAX_INT) return new SmallInteger(value + 1);
		        return new BigInteger(MAX_INT_ARR, false);
		    };
		    NativeBigInt.prototype.next = function () {
		        return new NativeBigInt(this.value + BigInt(1));
		    };

		    BigInteger.prototype.prev = function () {
		        var value = this.value;
		        if (this.sign) {
		            return new BigInteger(addSmall(value, 1), true);
		        }
		        return subtractSmall(value, 1, this.sign);
		    };
		    SmallInteger.prototype.prev = function () {
		        var value = this.value;
		        if (value - 1 > -MAX_INT) return new SmallInteger(value - 1);
		        return new BigInteger(MAX_INT_ARR, true);
		    };
		    NativeBigInt.prototype.prev = function () {
		        return new NativeBigInt(this.value - BigInt(1));
		    };

		    var powersOfTwo = [1];
		    while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
		    var powers2Length = powersOfTwo.length, highestPower2 = powersOfTwo[powers2Length - 1];

		    function shift_isSmall(n) {
		        return Math.abs(n) <= BASE;
		    }

		    BigInteger.prototype.shiftLeft = function (v) {
		        var n = parseValue(v).toJSNumber();
		        if (!shift_isSmall(n)) {
		            throw new Error(String(n) + " is too large for shifting.");
		        }
		        if (n < 0) return this.shiftRight(-n);
		        var result = this;
		        if (result.isZero()) return result;
		        while (n >= powers2Length) {
		            result = result.multiply(highestPower2);
		            n -= powers2Length - 1;
		        }
		        return result.multiply(powersOfTwo[n]);
		    };
		    NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

		    BigInteger.prototype.shiftRight = function (v) {
		        var remQuo;
		        var n = parseValue(v).toJSNumber();
		        if (!shift_isSmall(n)) {
		            throw new Error(String(n) + " is too large for shifting.");
		        }
		        if (n < 0) return this.shiftLeft(-n);
		        var result = this;
		        while (n >= powers2Length) {
		            if (result.isZero() || (result.isNegative() && result.isUnit())) return result;
		            remQuo = divModAny(result, highestPower2);
		            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
		            n -= powers2Length - 1;
		        }
		        remQuo = divModAny(result, powersOfTwo[n]);
		        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
		    };
		    NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

		    function bitwise(x, y, fn) {
		        y = parseValue(y);
		        var xSign = x.isNegative(), ySign = y.isNegative();
		        var xRem = xSign ? x.not() : x,
		            yRem = ySign ? y.not() : y;
		        var xDigit = 0, yDigit = 0;
		        var xDivMod = null, yDivMod = null;
		        var result = [];
		        while (!xRem.isZero() || !yRem.isZero()) {
		            xDivMod = divModAny(xRem, highestPower2);
		            xDigit = xDivMod[1].toJSNumber();
		            if (xSign) {
		                xDigit = highestPower2 - 1 - xDigit; // two's complement for negative numbers
		            }

		            yDivMod = divModAny(yRem, highestPower2);
		            yDigit = yDivMod[1].toJSNumber();
		            if (ySign) {
		                yDigit = highestPower2 - 1 - yDigit; // two's complement for negative numbers
		            }

		            xRem = xDivMod[0];
		            yRem = yDivMod[0];
		            result.push(fn(xDigit, yDigit));
		        }
		        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);
		        for (var i = result.length - 1; i >= 0; i -= 1) {
		            sum = sum.multiply(highestPower2).add(bigInt(result[i]));
		        }
		        return sum;
		    }

		    BigInteger.prototype.not = function () {
		        return this.negate().prev();
		    };
		    NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger.prototype.not;

		    BigInteger.prototype.and = function (n) {
		        return bitwise(this, n, function (a, b) { return a & b; });
		    };
		    NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger.prototype.and;

		    BigInteger.prototype.or = function (n) {
		        return bitwise(this, n, function (a, b) { return a | b; });
		    };
		    NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger.prototype.or;

		    BigInteger.prototype.xor = function (n) {
		        return bitwise(this, n, function (a, b) { return a ^ b; });
		    };
		    NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger.prototype.xor;

		    var LOBMASK_I = 1 << 30, LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;
		    function roughLOB(n) { // get lowestOneBit (rough)
		        // SmallInteger: return Min(lowestOneBit(n), 1 << 30)
		        // BigInteger: return Min(lowestOneBit(n), 1 << 14) [BASE=1e7]
		        var v = n.value,
		            x = typeof v === "number" ? v | LOBMASK_I :
		                typeof v === "bigint" ? v | BigInt(LOBMASK_I) :
		                    v[0] + v[1] * BASE | LOBMASK_BI;
		        return x & -x;
		    }

		    function integerLogarithm(value, base) {
		        if (base.compareTo(value) <= 0) {
		            var tmp = integerLogarithm(value, base.square(base));
		            var p = tmp.p;
		            var e = tmp.e;
		            var t = p.multiply(base);
		            return t.compareTo(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
		        }
		        return { p: bigInt(1), e: 0 };
		    }

		    BigInteger.prototype.bitLength = function () {
		        var n = this;
		        if (n.compareTo(bigInt(0)) < 0) {
		            n = n.negate().subtract(bigInt(1));
		        }
		        if (n.compareTo(bigInt(0)) === 0) {
		            return bigInt(0);
		        }
		        return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
		    };
		    NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;

		    function max(a, b) {
		        a = parseValue(a);
		        b = parseValue(b);
		        return a.greater(b) ? a : b;
		    }
		    function min(a, b) {
		        a = parseValue(a);
		        b = parseValue(b);
		        return a.lesser(b) ? a : b;
		    }
		    function gcd(a, b) {
		        a = parseValue(a).abs();
		        b = parseValue(b).abs();
		        if (a.equals(b)) return a;
		        if (a.isZero()) return b;
		        if (b.isZero()) return a;
		        var c = Integer[1], d, t;
		        while (a.isEven() && b.isEven()) {
		            d = min(roughLOB(a), roughLOB(b));
		            a = a.divide(d);
		            b = b.divide(d);
		            c = c.multiply(d);
		        }
		        while (a.isEven()) {
		            a = a.divide(roughLOB(a));
		        }
		        do {
		            while (b.isEven()) {
		                b = b.divide(roughLOB(b));
		            }
		            if (a.greater(b)) {
		                t = b; b = a; a = t;
		            }
		            b = b.subtract(a);
		        } while (!b.isZero());
		        return c.isUnit() ? a : a.multiply(c);
		    }
		    function lcm(a, b) {
		        a = parseValue(a).abs();
		        b = parseValue(b).abs();
		        return a.divide(gcd(a, b)).multiply(b);
		    }
		    function randBetween(a, b, rng) {
		        a = parseValue(a);
		        b = parseValue(b);
		        var usedRNG = rng || Math.random;
		        var low = min(a, b), high = max(a, b);
		        var range = high.subtract(low).add(1);
		        if (range.isSmall) return low.add(Math.floor(usedRNG() * range));
		        var digits = toBase(range, BASE).value;
		        var result = [], restricted = true;
		        for (var i = 0; i < digits.length; i++) {
		            var top = restricted ? digits[i] + (i + 1 < digits.length ? digits[i + 1] / BASE : 0) : BASE;
		            var digit = truncate(usedRNG() * top);
		            result.push(digit);
		            if (digit < digits[i]) restricted = false;
		        }
		        return low.add(Integer.fromArray(result, BASE, false));
		    }

		    var parseBase = function (text, base, alphabet, caseSensitive) {
		        alphabet = alphabet || DEFAULT_ALPHABET;
		        text = String(text);
		        if (!caseSensitive) {
		            text = text.toLowerCase();
		            alphabet = alphabet.toLowerCase();
		        }
		        var length = text.length;
		        var i;
		        var absBase = Math.abs(base);
		        var alphabetValues = {};
		        for (i = 0; i < alphabet.length; i++) {
		            alphabetValues[alphabet[i]] = i;
		        }
		        for (i = 0; i < length; i++) {
		            var c = text[i];
		            if (c === "-") continue;
		            if (c in alphabetValues) {
		                if (alphabetValues[c] >= absBase) {
		                    if (c === "1" && absBase === 1) continue;
		                    throw new Error(c + " is not a valid digit in base " + base + ".");
		                }
		            }
		        }
		        base = parseValue(base);
		        var digits = [];
		        var isNegative = text[0] === "-";
		        for (i = isNegative ? 1 : 0; i < text.length; i++) {
		            var c = text[i];
		            if (c in alphabetValues) digits.push(parseValue(alphabetValues[c]));
		            else if (c === "<") {
		                var start = i;
		                do { i++; } while (text[i] !== ">" && i < text.length);
		                digits.push(parseValue(text.slice(start + 1, i)));
		            }
		            else throw new Error(c + " is not a valid character");
		        }
		        return parseBaseFromArray(digits, base, isNegative);
		    };

		    function parseBaseFromArray(digits, base, isNegative) {
		        var val = Integer[0], pow = Integer[1], i;
		        for (i = digits.length - 1; i >= 0; i--) {
		            val = val.add(digits[i].times(pow));
		            pow = pow.times(base);
		        }
		        return isNegative ? val.negate() : val;
		    }

		    function stringify(digit, alphabet) {
		        alphabet = alphabet || DEFAULT_ALPHABET;
		        if (digit < alphabet.length) {
		            return alphabet[digit];
		        }
		        return "<" + digit + ">";
		    }

		    function toBase(n, base) {
		        base = bigInt(base);
		        if (base.isZero()) {
		            if (n.isZero()) return { value: [0], isNegative: false };
		            throw new Error("Cannot convert nonzero numbers to base 0.");
		        }
		        if (base.equals(-1)) {
		            if (n.isZero()) return { value: [0], isNegative: false };
		            if (n.isNegative())
		                return {
		                    value: [].concat.apply([], Array.apply(null, Array(-n.toJSNumber()))
		                        .map(Array.prototype.valueOf, [1, 0])
		                    ),
		                    isNegative: false
		                };

		            var arr = Array.apply(null, Array(n.toJSNumber() - 1))
		                .map(Array.prototype.valueOf, [0, 1]);
		            arr.unshift([1]);
		            return {
		                value: [].concat.apply([], arr),
		                isNegative: false
		            };
		        }

		        var neg = false;
		        if (n.isNegative() && base.isPositive()) {
		            neg = true;
		            n = n.abs();
		        }
		        if (base.isUnit()) {
		            if (n.isZero()) return { value: [0], isNegative: false };

		            return {
		                value: Array.apply(null, Array(n.toJSNumber()))
		                    .map(Number.prototype.valueOf, 1),
		                isNegative: neg
		            };
		        }
		        var out = [];
		        var left = n, divmod;
		        while (left.isNegative() || left.compareAbs(base) >= 0) {
		            divmod = left.divmod(base);
		            left = divmod.quotient;
		            var digit = divmod.remainder;
		            if (digit.isNegative()) {
		                digit = base.minus(digit).abs();
		                left = left.next();
		            }
		            out.push(digit.toJSNumber());
		        }
		        out.push(left.toJSNumber());
		        return { value: out.reverse(), isNegative: neg };
		    }

		    function toBaseString(n, base, alphabet) {
		        var arr = toBase(n, base);
		        return (arr.isNegative ? "-" : "") + arr.value.map(function (x) {
		            return stringify(x, alphabet);
		        }).join('');
		    }

		    BigInteger.prototype.toArray = function (radix) {
		        return toBase(this, radix);
		    };

		    SmallInteger.prototype.toArray = function (radix) {
		        return toBase(this, radix);
		    };

		    NativeBigInt.prototype.toArray = function (radix) {
		        return toBase(this, radix);
		    };

		    BigInteger.prototype.toString = function (radix, alphabet) {
		        if (radix === undefined$1) radix = 10;
		        if (radix !== 10 || alphabet) return toBaseString(this, radix, alphabet);
		        var v = this.value, l = v.length, str = String(v[--l]), zeros = "0000000", digit;
		        while (--l >= 0) {
		            digit = String(v[l]);
		            str += zeros.slice(digit.length) + digit;
		        }
		        var sign = this.sign ? "-" : "";
		        return sign + str;
		    };

		    SmallInteger.prototype.toString = function (radix, alphabet) {
		        if (radix === undefined$1) radix = 10;
		        if (radix != 10 || alphabet) return toBaseString(this, radix, alphabet);
		        return String(this.value);
		    };

		    NativeBigInt.prototype.toString = SmallInteger.prototype.toString;

		    NativeBigInt.prototype.toJSON = BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () { return this.toString(); };

		    BigInteger.prototype.valueOf = function () {
		        return parseInt(this.toString(), 10);
		    };
		    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

		    SmallInteger.prototype.valueOf = function () {
		        return this.value;
		    };
		    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;
		    NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function () {
		        return parseInt(this.toString(), 10);
		    };

		    function parseStringValue(v) {
		        if (isPrecise(+v)) {
		            var x = +v;
		            if (x === truncate(x))
		                return supportsNativeBigInt ? new NativeBigInt(BigInt(x)) : new SmallInteger(x);
		            throw new Error("Invalid integer: " + v);
		        }
		        var sign = v[0] === "-";
		        if (sign) v = v.slice(1);
		        var split = v.split(/e/i);
		        if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));
		        if (split.length === 2) {
		            var exp = split[1];
		            if (exp[0] === "+") exp = exp.slice(1);
		            exp = +exp;
		            if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
		            var text = split[0];
		            var decimalPlace = text.indexOf(".");
		            if (decimalPlace >= 0) {
		                exp -= text.length - decimalPlace - 1;
		                text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
		            }
		            if (exp < 0) throw new Error("Cannot include negative exponent part for integers");
		            text += (new Array(exp + 1)).join("0");
		            v = text;
		        }
		        var isValid = /^([0-9][0-9]*)$/.test(v);
		        if (!isValid) throw new Error("Invalid integer: " + v);
		        if (supportsNativeBigInt) {
		            return new NativeBigInt(BigInt(sign ? "-" + v : v));
		        }
		        var r = [], max = v.length, l = LOG_BASE, min = max - l;
		        while (max > 0) {
		            r.push(+v.slice(min, max));
		            min -= l;
		            if (min < 0) min = 0;
		            max -= l;
		        }
		        trim(r);
		        return new BigInteger(r, sign);
		    }

		    function parseNumberValue(v) {
		        if (supportsNativeBigInt) {
		            return new NativeBigInt(BigInt(v));
		        }
		        if (isPrecise(v)) {
		            if (v !== truncate(v)) throw new Error(v + " is not an integer.");
		            return new SmallInteger(v);
		        }
		        return parseStringValue(v.toString());
		    }

		    function parseValue(v) {
		        if (typeof v === "number") {
		            return parseNumberValue(v);
		        }
		        if (typeof v === "string") {
		            return parseStringValue(v);
		        }
		        if (typeof v === "bigint") {
		            return new NativeBigInt(v);
		        }
		        return v;
		    }
		    // Pre-define numbers in range [-999,999]
		    for (var i = 0; i < 1000; i++) {
		        Integer[i] = parseValue(i);
		        if (i > 0) Integer[-i] = parseValue(-i);
		    }
		    // Backwards compatibility
		    Integer.one = Integer[1];
		    Integer.zero = Integer[0];
		    Integer.minusOne = Integer[-1];
		    Integer.max = max;
		    Integer.min = min;
		    Integer.gcd = gcd;
		    Integer.lcm = lcm;
		    Integer.isInstance = function (x) { return x instanceof BigInteger || x instanceof SmallInteger || x instanceof NativeBigInt; };
		    Integer.randBetween = randBetween;

		    Integer.fromArray = function (digits, base, isNegative) {
		        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
		    };

		    return Integer;
		})();

		// Node.js check
		if (module.hasOwnProperty("exports")) {
		    module.exports = bigInt;
		}
	} (BigInteger));
	return BigInteger.exports;
}

var BigIntegerExports = requireBigInteger();
var BigInt$1 = /*@__PURE__*/getDefaultExportFromCjs(BigIntegerExports);

function peg$subclass(child, parent) {
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
}

function peg$SyntaxError(message, expected, found, location) {
  this.message  = message;
  this.expected = expected;
  this.found    = found;
  this.location = location;
  this.name     = "SyntaxError";

  if (typeof Error.captureStackTrace === "function") {
    Error.captureStackTrace(this, peg$SyntaxError);
  }
}

peg$subclass(peg$SyntaxError, Error);

peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
        literal: function(expectation) {
          return "\"" + literalEscape(expectation.text) + "\"";
        },

        "class": function(expectation) {
          var escapedParts = "",
              i;

          for (i = 0; i < expectation.parts.length; i++) {
            escapedParts += expectation.parts[i] instanceof Array
              ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
              : classEscape(expectation.parts[i]);
          }

          return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
        },

        any: function(expectation) {
          return "any character";
        },

        end: function(expectation) {
          return "end of input";
        },

        other: function(expectation) {
          return expectation.description;
        }
      };

  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }

  function literalEscape(s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/"/g,  '\\"')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
  }

  function classEscape(s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/\]/g, '\\]')
      .replace(/\^/g, '\\^')
      .replace(/-/g,  '\\-')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = new Array(expected.length),
        i, j;

    for (i = 0; i < expected.length; i++) {
      descriptions[i] = describeExpectation(expected[i]);
    }

    descriptions.sort();

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0];

      case 2:
        return descriptions[0] + " or " + descriptions[1];

      default:
        return descriptions.slice(0, -1).join(", ")
          + ", or "
          + descriptions[descriptions.length - 1];
    }
  }

  function describeFound(found) {
    return found ? "\"" + literalEscape(found) + "\"" : "end of input";
  }

  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};

function peg$parse(input, options) {
  options = options !== void 0 ? options : {};

  var peg$FAILED = {},

      peg$startRuleFunctions = { start: peg$parsestart },
      peg$startRuleFunction  = peg$parsestart,

      peg$c0 = function(n) {
          return n
        },
      peg$c1 = function(head, tail) {
            const headAst = head && head.ast || head;
            const cur = tail && tail.length && tail[0].length >= 4 ? [headAst] : headAst;
            if (!tail) tail = [];
            for (let i = 0; i < tail.length; i++) {
              if(!tail[i][3] || tail[i][3].length === 0) continue;
              cur.push(tail[i][3] && tail[i][3].ast || tail[i][3]);
            }
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: cur
            }
          },
      peg$c2 = function(s) {
          return s ? `union ${s.toLowerCase()}` : 'union'
        },
      peg$c3 = function(head, tail, ob, l) {
            let cur = head;
            for (let i = 0; i < tail.length; i++) {
              cur._next = tail[i][3];
              cur.set_op = tail[i][1];
              cur = cur._next;
            }
            if(ob) head._orderby = ob;
            if(l) head._limit = l;
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: head
            }
          },
      peg$c4 = function(head, tail) {
          return createList(head, tail, 1)
        },
      peg$c5 = "if",
      peg$c6 = peg$literalExpectation("IF", true),
      peg$c7 = function() {
          return 'IF NOT EXISTS'
        },
      peg$c8 = peg$literalExpectation("if", true),
      peg$c9 = "exists",
      peg$c10 = peg$literalExpectation("exists", true),
      peg$c11 = function() {
          return 'if exists'
        },
      peg$c12 = "trigger",
      peg$c13 = peg$literalExpectation("TRIGGER", true),
      peg$c14 = "before",
      peg$c15 = peg$literalExpectation("BEFORE", true),
      peg$c16 = "after",
      peg$c17 = peg$literalExpectation("AFTER", true),
      peg$c18 = "instead of",
      peg$c19 = peg$literalExpectation("INSTEAD OF", true),
      peg$c20 = "on",
      peg$c21 = peg$literalExpectation("ON", true),
      peg$c22 = function(kw, tp, t, ife, c, p, te, on, tn, fe, tw, ta) {
          return {
              type: 'create',
              temporary: tp && tp[0].toLowerCase(),
              time: p && p.toLowerCase(),
              events: te,
              trigger: c,
              table: tn,
              for_each: fe,
              if_not_exists: ife,
              when: tw,
              execute: ta,
              keyword: t && t.toLowerCase(),
            }
        },
      peg$c23 = function(kw) {
          return {
            keyword: kw[0].toLowerCase(),
          }
        },
      peg$c24 = "of",
      peg$c25 = peg$literalExpectation("OF", true),
      peg$c26 = function(kw, a) {
          return {
            keyword: kw[0].toLowerCase(),
            args: a && { keyword: a[0], columns: a[2] } || null
          }
        },
      peg$c27 = function(head, tail) {
          return createList(head, tail)
        },
      peg$c28 = "begin",
      peg$c29 = peg$literalExpectation("BEGIN", true),
      peg$c30 = "end",
      peg$c31 = peg$literalExpectation("END", true),
      peg$c32 = function(b, ms, e) {
          return {
            type: 'multiple',
            prefix: b,
            expr: ms,
            suffix: e,
          }
        },
      peg$c33 = "for",
      peg$c34 = peg$literalExpectation("FOR", true),
      peg$c35 = "each",
      peg$c36 = peg$literalExpectation("EACH", true),
      peg$c37 = "row",
      peg$c38 = peg$literalExpectation("ROW", true),
      peg$c39 = "statement",
      peg$c40 = peg$literalExpectation("STATEMENT", true),
      peg$c41 = function(kw, e, ob) {
          return {
            keyword: e ? `${kw.toLowerCase()} ${e.toLowerCase()}` : kw.toLowerCase(),
            args: ob.toLowerCase()
          }
        },
      peg$c42 = function(condition) {
          return {
            type: 'when',
            cond: condition,
          }
        },
      peg$c43 = function(a, k, ife, t, c) {
            const keyword = k.toLowerCase();
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                type: a[0].toLowerCase(),
                keyword,
                if_not_exists:ife,
                [keyword]: { db: t.schema, schema: t.name },
                create_definitions: c,
              }
            }
          },
      peg$c44 = function(c, ce, o) {
          return {
            collate: ce,
            ...c,
            order_by: o && o.toLowerCase(),
          }
        },
      peg$c45 = function(c, o) {
          return {
            ...c,
            order_by: o && o.toLowerCase(),
          }
        },
      peg$c46 = function(a, kw, t, ife, n, um, on, ta, cols, where) {
          return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                type: a[0].toLowerCase(),
                index_type: kw && kw.toLowerCase(),
                keyword: t.toLowerCase(),
                if_not_exists: ife,
                index: { schema: n.db, name: n.table },
                on_kw: on[0].toLowerCase(),
                table: ta,
                index_columns: cols,
                where,
              }
          }
        },
      peg$c49 = "local",
      peg$c50 = peg$literalExpectation("LOCAL", true),
      peg$c51 = "check",
      peg$c52 = peg$literalExpectation("CHECK", true),
      peg$c57 = function(a, tp, ife, v, c, s) {
          v.view = v.table;
          delete v.table;
          return {
            tableList: Array.from(tableList),
            columnList: columnListTableAlias(columnList),
            ast: {
              type: a[0].toLowerCase(),
              keyword: 'view',
              if_not_exists: ife,
              temporary: tp && tp[0].toLowerCase(),
              columns: c && c[2],
              select: s,
              view: v,
            }
          }
        },
      peg$c58 = function(a, tp, ife, t, c, to) {
            if(t) tableList.add(`create::${t.db}::${t.table}`);
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                type: a[0].toLowerCase(),
                keyword: 'table',
                temporary: tp && tp[0].toLowerCase(),
                if_not_exists:ife,
                table: [t],
                create_definitions: c,
                table_options: to
              }
            }
          },
      peg$c59 = function(a, tp, ife, t, as, qe) {
            if(t) tableList.add(`create::${t.db}::${t.table}`);
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                type: a[0].toLowerCase(),
                keyword: 'table',
                temporary: tp && tp[0].toLowerCase(),
                if_not_exists: ife,
                table: [t],
                as: 'as',
                query_expr: qe,
              }
            }
          },
      peg$c62 = function(head, tail) {
            return createList(head, tail);
          },
      peg$c63 = function(n) {
          if (n && !n.value) n.value = 'null';
          return { nullable: n }
        },
      peg$c64 = function(d) {
          return { default_val: d }
        },
      peg$c65 = "auto_increment",
      peg$c66 = peg$literalExpectation("AUTO_INCREMENT", true),
      peg$c67 = "autoincrement",
      peg$c68 = peg$literalExpectation("AUTOINCREMENT", true),
      peg$c69 = function(a) {
          return { auto_increment: a.toLowerCase() }
        },
      peg$c70 = "unique",
      peg$c71 = peg$literalExpectation("UNIQUE", true),
      peg$c72 = "key",
      peg$c73 = peg$literalExpectation("KEY", true),
      peg$c74 = function(k) {
          const sql = ['unique'];
          if (k) sql.push(k);
          return { unique: sql.join(' ').toLowerCase('') }
        },
      peg$c75 = "primary",
      peg$c76 = peg$literalExpectation("PRIMARY", true),
      peg$c77 = function(p) {
          const sql = [];
          if (p) sql.push('primary');
          sql.push('key');
          return { primary_key: sql.join(' ').toLowerCase('') }
        },
      peg$c78 = function(co) {
          return { comment: co }
        },
      peg$c79 = function(kc, n) {
          return { constraint: { keyword: kc.toLowerCase(), constraint: n } }
        },
      peg$c80 = function(ca) {
          return { collate: ca }
        },
      peg$c81 = function(cf) {
          return { column_format: cf }
        },
      peg$c82 = function(s) {
          return { storage: s }
        },
      peg$c83 = function(re) {
          return { reference_definition: re }
        },
      peg$c84 = function(ck) {
          return { check: ck }
        },
      peg$c85 = function(t, s, v) {
          return { character_set: { type: t, value: v, symbol: s }}
        },
      peg$c86 = function(head, tail) {
          let opt = head;
          for (let i = 0; i < tail.length; i++) {
            opt = { ...opt, ...tail[i][1] };
          }
          return opt
        },
      peg$c87 = function(c, d, cdo) {
            columnList.add(`create::${c.table}::${c.value || c}`);
            return {
              column: {
                type: 'column_ref',
                table: null,
                column: c
              },
              definition: d,
              resource: 'column',
              ...(cdo || {})
            }
          },
      peg$c88 = function(s, ca) {
          return {
            type: 'collate',
            keyword: 'collate',
            collate: {
              name: ca,
              symbol: s,
            }
          }
        },
      peg$c89 = "column_format",
      peg$c90 = peg$literalExpectation("COLUMN_FORMAT", true),
      peg$c91 = "fixed",
      peg$c92 = peg$literalExpectation("FIXED", true),
      peg$c93 = "dynamic",
      peg$c94 = peg$literalExpectation("DYNAMIC", true),
      peg$c95 = "default",
      peg$c96 = peg$literalExpectation("DEFAULT", true),
      peg$c97 = function(k, f) {
          return {
            type: 'column_format',
            value: f.toLowerCase()
          }
        },
      peg$c98 = "storage",
      peg$c99 = peg$literalExpectation("STORAGE", true),
      peg$c100 = "disk",
      peg$c101 = peg$literalExpectation("DISK", true),
      peg$c102 = "memory",
      peg$c103 = peg$literalExpectation("MEMORY", true),
      peg$c104 = function(k, s) {
          return {
            type: 'storage',
            value: s.toLowerCase()
          }
        },
      peg$c105 = function(ce) {
          return {
            type: 'default',
            value: ce
          }
        },
      peg$c106 = function(a, t) {
            tableList.add(`${a}::${t.db}::${t.table}`);
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                type: a.toLowerCase(),
                table: t
              }
            };
          },
      peg$c107 = function(a, db, e, as, schema) {
            // tableList.add(`${a}::${t.db}::${t.table}`);
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                type: a.toLowerCase(),
                database: db,
                expr: e,
                as: as && as[0].toLowerCase(),
                schema,
              }
            };
          },
      peg$c108 = function(a, r, ife, t) {
            if(t) t.forEach(tt => tableList.add(`${a}::${tt.db}::${tt.table}`));
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                type: a.toLowerCase(),
                keyword: r.toLowerCase(),
                prefix: ife,
                name: t
              }
            };
          },
      peg$c109 = function(a, r, ife, t) {
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                type: a.toLowerCase(),
                keyword: r.toLowerCase(),
                prefix: ife,
                name: t,
              }
            };
          },
      peg$c110 = function(a, r, i, t, op) {
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                type: a.toLowerCase(),
                keyword: r.toLowerCase(),
                name: i,
                table: t,
                options: op
              }
            };
          },
      peg$c111 = function(a, kw, t) {
            if(t) t.forEach(tt => tableList.add(`${a}::${tt.db}::${tt.table}`));
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                type: a.toLowerCase(),
                keyword: kw && kw.toLowerCase() || 'table',
                name: t
              }
            };
          },
      peg$c112 = function(d) {
            tableList.add(`use::${d}::null`);
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                type: 'use',
                db: d
              }
            };
          },
      peg$c113 = function(t, e) {
            if (t && t.length > 0) t.forEach(table => tableList.add(`alter::${table.db}::${table.table}`));
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                type: 'alter',
                table: t,
                expr: e
              }
            };
          },
      peg$c114 = "first",
      peg$c115 = peg$literalExpectation("first", true),
      peg$c116 = function(k) {
            return { keyword: k };
          },
      peg$c117 = peg$literalExpectation("after", true),
      peg$c118 = function(k, i) {
            return { keyword: k, expr: i };
          },
      peg$c119 = function(t) {
          t.resource = t.keyword;
          t[t.keyword] = t.value;
          delete t.value;
          return {
            type: 'alter',
            ...t,
          }
        },
      peg$c120 = function(c) {
            return {
              action: 'add',
              create_definitions: c,
              resource: 'constraint',
              type: 'alter',
            }
          },
      peg$c121 = function(kc, c) {
            return {
              action: 'drop',
              constraint: c,
              keyword: kc.toLowerCase(),
              resource: 'constraint',
              type: 'alter',
            }
          },
      peg$c122 = function() {
          return {
              action: 'drop',
              key: '',
              keyword: 'primary key',
              resource: 'key',
              type: 'alter',
          }
        },
      peg$c123 = "foreign",
      peg$c124 = peg$literalExpectation("FOREIGN", true),
      peg$c125 = function(k, c) {
          const resource = Array.isArray(k) ? 'key' : 'index';
          return {
              action: 'drop',
              [resource]: c,
              keyword: Array.isArray(k) ? `${[k[0], k[2]].filter(v => v).join(' ').toLowerCase()}` : k.toLowerCase(),
              resource,
              type: 'alter',
          }
        },
      peg$c126 = function(kc, cd) {
            return {
              action: 'add',
              ...cd,
              keyword: kc,
              resource: 'column',
              type: 'alter',
            }
          },
      peg$c127 = function(kc, c) {
            return {
              action: 'drop',
              column: c,
              keyword: kc,
              resource: 'column',
              type: 'alter',
            }
          },
      peg$c128 = function(kc, cd, af) {
            return {
              action: 'modify',
              keyword: kc,
              ...cd,
              suffix: af,
              resource: 'column',
              type: 'alter',
            }
          },
      peg$c129 = function(id) {
            return {
              action: 'add',
              type: 'alter',
              ...id,
            }
          },
      peg$c130 = function(c, kw, tn) {
          return {
            action: 'rename',
            type: 'alter',
            resource: 'column',
            keyword: 'column',
            old_column: c,
            prefix: kw && kw[0].toLowerCase(),
            column: tn
          }
        },
      peg$c131 = function(kw, tn) {
          return {
            action: 'rename',
            type: 'alter',
            resource: 'table',
            keyword: kw && kw[0].toLowerCase(),
            table: tn
          }
        },
      peg$c132 = "change",
      peg$c133 = peg$literalExpectation("CHANGE", true),
      peg$c134 = function(kc, od, cd, af) {
          return {
              action: 'change',
              old_column: od,
              ...cd,
              keyword: kc,
              resource: 'column',
              type: 'alter',
              suffix: af,
            }
        },
      peg$c135 = "algorithm",
      peg$c136 = peg$literalExpectation("ALGORITHM", true),
      peg$c137 = "instant",
      peg$c138 = peg$literalExpectation("INSTANT", true),
      peg$c139 = "inplace",
      peg$c140 = peg$literalExpectation("INPLACE", true),
      peg$c141 = "copy",
      peg$c142 = peg$literalExpectation("COPY", true),
      peg$c143 = function(s, val) {
          return {
            type: 'alter',
            keyword: 'algorithm',
            resource: 'algorithm',
            symbol: s,
            algorithm: val
          }
        },
      peg$c144 = "lock",
      peg$c145 = peg$literalExpectation("LOCK", true),
      peg$c146 = "none",
      peg$c147 = peg$literalExpectation("NONE", true),
      peg$c148 = "shared",
      peg$c149 = peg$literalExpectation("SHARED", true),
      peg$c150 = "exclusive",
      peg$c151 = peg$literalExpectation("EXCLUSIVE", true),
      peg$c152 = function(s, val) {
          return {
            type: 'alter',
            keyword: 'lock',
            resource: 'lock',
            symbol: s,
            lock: val
          }
        },
      peg$c153 = function(kc, c, t, de, id) {
            return {
              index: c,
              definition: de,
              keyword: kc.toLowerCase(),
              index_type: t,
              resource: 'index',
              index_options: id,
            }
          },
      peg$c154 = function(p, kc, c, de, id) {
            return {
              index: c,
              definition: de,
              keyword: kc && `${p.toLowerCase()} ${kc.toLowerCase()}` || p.toLowerCase(),
              index_options: id,
              resource: 'index',
            }
          },
      peg$c155 = function(kc, c) {
          return {
            keyword: kc.toLowerCase(),
            constraint: c
          }
        },
      peg$c156 = function(kc, p, t, de, id) {
          return {
              constraint: kc && kc.constraint,
              definition: de,
              constraint_type: `${p[0].toLowerCase()} ${p[2].toLowerCase()}`,
              keyword: kc && kc.keyword,
              index_type: t,
              resource: 'constraint',
              index_options: id,
            }
        },
      peg$c157 = function(kc, u, p, i, t, de, id) {
          return {
              constraint: kc && kc.constraint,
              definition: de,
              constraint_type: p && `${u.toLowerCase()} ${p.toLowerCase()}` || u.toLowerCase(),
              keyword: kc && kc.keyword,
              index_type: t,
              index: i,
              resource: 'constraint',
              index_options: id
            }
        },
      peg$c158 = "not",
      peg$c159 = peg$literalExpectation("NOT", true),
      peg$c160 = "replication",
      peg$c161 = peg$literalExpectation("REPLICATION", true),
      peg$c162 = function(kc, u, nfr, c) {
          return {
              constraint_type: u.toLowerCase(),
              keyword: kc && kc.keyword,
              constraint: kc && kc.constraint,
              index_type: nfr && { keyword: 'not for replication' },
              definition: [c],
              resource: 'constraint',
            }
        },
      peg$c163 = "foreign key",
      peg$c164 = peg$literalExpectation("FOREIGN KEY", true),
      peg$c165 = function(kc, p, i, de, id) {
          return {
              constraint: kc && kc.constraint,
              definition: de,
              constraint_type: p,
              keyword: kc && kc.keyword,
              index: i,
              resource: 'constraint',
              reference_definition: id
            }
        },
      peg$c166 = "enforced",
      peg$c167 = peg$literalExpectation("ENFORCED", true),
      peg$c168 = function(kc, u, c, ne) {
          const enforced = [];
          if (ne) enforced.push(ne[0], ne[2]);
          return {
              constraint_type: u.toLowerCase(),
              keyword: kc && kc.keyword,
              constraint: kc && kc.constraint,
              definition: [c],
              enforced: enforced.filter(v => v).join(' ').toLowerCase(),
              resource: 'constraint',
            }
        },
      peg$c169 = "match full",
      peg$c170 = peg$literalExpectation("MATCH FULL", true),
      peg$c171 = "match partial",
      peg$c172 = peg$literalExpectation("MATCH PARTIAL", true),
      peg$c173 = "match simple",
      peg$c174 = peg$literalExpectation("MATCH SIMPLE", true),
      peg$c175 = function(kc, t, de, m, od, ou) {
          return {
              definition: de,
              table: [t],
              keyword: kc.toLowerCase(),
              match: m && m.toLowerCase(),
              on_action: [od, ou].filter(v => v)
            }
        },
      peg$c176 = function(oa) {
          return {
            on_action: [oa]
          }
        },
      peg$c177 = function(kw, ro) {
          // => { type: 'on delete' | 'on update'; value: reference_option; }
          return {
            type: `on ${kw[0].toLowerCase()}`,
            value: ro
          }
        },
      peg$c178 = function(kw, l) {
          return {
            type: 'function',
            name: { name: [{ type: 'origin', value: kw }] },
            args: l
          }
        },
      peg$c179 = "restrict",
      peg$c180 = peg$literalExpectation("RESTRICT", true),
      peg$c181 = "cascade",
      peg$c182 = peg$literalExpectation("CASCADE", true),
      peg$c183 = "set null",
      peg$c184 = peg$literalExpectation("SET NULL", true),
      peg$c185 = "no action",
      peg$c186 = peg$literalExpectation("NO ACTION", true),
      peg$c187 = "set default",
      peg$c188 = peg$literalExpectation("SET DEFAULT", true),
      peg$c189 = function(kc) {
          return {
            type: 'origin',
            value: kc.toLowerCase()
          }
        },
      peg$c190 = "character",
      peg$c191 = peg$literalExpectation("CHARACTER", true),
      peg$c192 = "set",
      peg$c193 = peg$literalExpectation("SET", true),
      peg$c194 = function() {
          return 'CHARACTER SET'
        },
      peg$c195 = "charset",
      peg$c196 = peg$literalExpectation("CHARSET", true),
      peg$c197 = "collate",
      peg$c198 = peg$literalExpectation("COLLATE", true),
      peg$c199 = function(kw, t, s, v) {
          return {
            keyword: kw && `${kw[0].toLowerCase()} ${t.toLowerCase()}` || t.toLowerCase(),
            symbol: s,
            value: v
          }
        },
      peg$c200 = "avg_row_length",
      peg$c201 = peg$literalExpectation("AVG_ROW_LENGTH", true),
      peg$c202 = "key_block_size",
      peg$c203 = peg$literalExpectation("KEY_BLOCK_SIZE", true),
      peg$c204 = "max_rows",
      peg$c205 = peg$literalExpectation("MAX_ROWS", true),
      peg$c206 = "min_rows",
      peg$c207 = peg$literalExpectation("MIN_ROWS", true),
      peg$c208 = "stats_sample_pages",
      peg$c209 = peg$literalExpectation("STATS_SAMPLE_PAGES", true),
      peg$c210 = function(kw, s, v) {
          return {
            keyword: kw.toLowerCase(),
            symbol: s,
            value: v.value
          }
        },
      peg$c211 = "connection",
      peg$c212 = peg$literalExpectation("CONNECTION", true),
      peg$c213 = function(kw, s, c) {
          return {
            keyword: kw.toLowerCase(),
            symbol: s,
            value: `'${c.value}'`
          }
        },
      peg$c214 = "compression",
      peg$c215 = peg$literalExpectation("COMPRESSION", true),
      peg$c216 = "'",
      peg$c217 = peg$literalExpectation("'", false),
      peg$c218 = "zlib",
      peg$c219 = peg$literalExpectation("ZLIB", true),
      peg$c220 = "lz4",
      peg$c221 = peg$literalExpectation("LZ4", true),
      peg$c222 = function(kw, s, v) {
          return {
            keyword: kw.toLowerCase(),
            symbol: s,
            value: v.join('').toUpperCase()
          }
        },
      peg$c223 = "engine",
      peg$c224 = peg$literalExpectation("ENGINE", true),
      peg$c225 = function(kw, s, c) {
          return {
            keyword: kw.toLowerCase(),
            symbol: s,
            value: c.toUpperCase()
          }
        },
      peg$c226 = "without",
      peg$c227 = peg$literalExpectation("WITHOUT", true),
      peg$c228 = "rowid",
      peg$c229 = peg$literalExpectation("ROWID", true),
      peg$c230 = function() {
          return {
            keyword: 'without rowid'
          }
        },
      peg$c231 = "strict",
      peg$c232 = peg$literalExpectation("STRICT", true),
      peg$c233 = function() {
          return {
            keyword: 'strict'
          }
        },
      peg$c234 = function(t) {
            t.forEach(tg => tg.forEach(dt => dt.table && tableList.add(`rename::${dt.db}::${dt.table}`)));
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                type: 'rename',
                table: t
              }
            };
          },
      peg$c235 = function(kw, a) {
          a.keyword = kw;
          return {
            tableList: Array.from(tableList),
            columnList: columnListTableAlias(columnList),
            ast: {
              type: 'set',
              keyword: kw,
              expr: a
            }
          }
        },
      peg$c236 = function() {
          return {
            tableList: Array.from(tableList),
            columnList: columnListTableAlias(columnList),
            ast: {
              type: 'unlock',
              keyword: 'tables'
            }
          }
        },
      peg$c237 = "read",
      peg$c238 = peg$literalExpectation("READ", true),
      peg$c239 = function(s) {
          return {
            type: 'read',
            suffix: s && 'local'
          }
        },
      peg$c240 = "low_priority",
      peg$c241 = peg$literalExpectation("LOW_PRIORITY", true),
      peg$c242 = "write",
      peg$c243 = peg$literalExpectation("WRITE", true),
      peg$c244 = function(p) {
          return {
            type: 'write',
            prefix: p && 'low_priority'
          }
        },
      peg$c245 = function(t, lt) {
          tableList.add(`lock::${t.db}::${t.table}`);
          return {
            table: t,
            lock_type: lt
          }
        },
      peg$c246 = function(head, tail) {
          return createList(head, tail);
        },
      peg$c247 = function(ltl) {
          return {
            tableList: Array.from(tableList),
            columnList: columnListTableAlias(columnList),
            ast: {
              type: 'lock',
              keyword: 'tables',
              tables: ltl
            }
          }
        },
      peg$c248 = function(e) {
          return {
            tableList: Array.from(tableList),
            columnList: columnListTableAlias(columnList),
            ast: {
              type: 'call',
              expr: e
            }
          }
        },
      peg$c249 = "binary",
      peg$c250 = peg$literalExpectation("BINARY", true),
      peg$c251 = "master",
      peg$c252 = peg$literalExpectation("MASTER", true),
      peg$c253 = "logs",
      peg$c254 = peg$literalExpectation("LOGS", true),
      peg$c255 = function(t) {
          return {
            tableList: Array.from(tableList),
            columnList: columnListTableAlias(columnList),
            ast: {
              type: 'show',
              suffix: 'logs',
              keyword: t.toLowerCase()
            }
          }
        },
      peg$c256 = "binlog",
      peg$c257 = peg$literalExpectation("BINLOG", true),
      peg$c258 = "events",
      peg$c259 = peg$literalExpectation("EVENTS", true),
      peg$c260 = function(ins, from, limit) {
          return {
            tableList: Array.from(tableList),
            columnList: columnListTableAlias(columnList),
            ast: {
              type: 'show',
              suffix: 'events',
              keyword: 'binlog',
              in: ins,
              from,
              limit,
            }
          }
        },
      peg$c261 = "collation",
      peg$c262 = peg$literalExpectation("COLLATION", true),
      peg$c263 = function(k, e) {
          let keyword = Array.isArray(k) && k || [k];
          return {
            tableList: Array.from(tableList),
            columnList: columnListTableAlias(columnList),
            ast: {
              type: 'show',
              suffix: keyword[2] && keyword[2].toLowerCase(),
              keyword: keyword[0].toLowerCase(),
              expr: e
            }
          }
        },
      peg$c264 = "grants",
      peg$c265 = peg$literalExpectation("GRANTS", true),
      peg$c266 = function(f) {
          return {
            tableList: Array.from(tableList),
            columnList: columnListTableAlias(columnList),
            ast: {
              type: 'show',
              keyword: 'grants',
              for: f,
            }
          }
        },
      peg$c267 = function(n, h, u) {
          return {
            user: n,
            host: h && h[2],
            role_list: u
          }
        },
      peg$c268 = function(l) {
          return l
        },
      peg$c269 = function(t) {
          return {
            tableList: Array.from(tableList),
            columnList: columnListTableAlias(columnList),
            ast: {
              type: 'desc',
              table: t
            }
          };
        },
      peg$c270 = "(",
      peg$c271 = peg$literalExpectation("(", false),
      peg$c272 = ")",
      peg$c273 = peg$literalExpectation(")", false),
      peg$c274 = function(s) {
            return {
              ...s[2],
              parentheses_symbol: true,
            }
          },
      peg$c275 = function(cte, tail) {
            cte.recursive = true;
            return createList(cte, tail);
          },
      peg$c276 = function(name, columns, stmt) {
          if (typeof name === 'string') name = { type: 'default', value: name };
          if (name.table) name = { type: 'default', value: name.table };
          return { name, stmt, columns };
        },
      peg$c277 = function(l) {
            return l
          },
      peg$c278 = function(cte, opts, d, c, f, w, g, h, o, l, fu) {
            if(f) f.forEach(info => info.table && tableList.add(`select::${info.db}::${info.table}`));
            return {
                with: cte,
                type: 'select',
                options: opts,
                distinct: d,
                columns: c,
                from: f,
                where: w,
                groupby: g,
                having: h,
                orderby: o,
                limit: l,
                for_update: fu && `${fu[0]} ${fu[2][0]}`,
            };
        },
      peg$c279 = function(head, tail) {
          const opts = [head];
          for (let i = 0, l = tail.length; i < l; ++i) {
            opts.push(tail[i][1]);
          }
          return opts;
        },
      peg$c280 = function(option) { return option; },
      peg$c281 = function(head, tail) {
            columnList.add('select::null::(.*)');
            const item = {
              expr: {
                type: 'column_ref',
                table: null,
                column: '*'
              },
              as: null
            };
            if (tail && tail.length > 0) return createList(item, tail)
            return [item]
          },
      peg$c282 = function(tbl) {
            const table = tbl && tbl[0] || null;
            columnList.add(`select::${table}::(.*)`);
            return {
              expr: {
                type: 'column_ref',
                table: table,
                column: '*'
              },
              as: null
            };
          },
      peg$c283 = function(e, alias) {
            if (e.type === 'double_quote_string' || e.type === 'single_quote_string') {
              columnList.add(`select::null::${e.value}`);
            }
            return { expr: e, as: alias };
          },
      peg$c284 = function(i) { return i; },
      peg$c285 = function(l) { return l; },
      peg$c286 = function(head, tail) {
            return [head, tail]
          },
      peg$c287 = "btree",
      peg$c288 = peg$literalExpectation("BTREE", true),
      peg$c289 = "hash",
      peg$c290 = peg$literalExpectation("HASH", true),
      peg$c291 = function(t) {
          return {
            keyword: 'using',
            type: t.toLowerCase(),
          }
        },
      peg$c292 = function(head, tail) {
          const result = [head];
          for (let i = 0; i < tail.length; i++) {
            result.push(tail[i][1]);
          }
          return result;
        },
      peg$c293 = function(k, e, kbs) {
          return {
            type: k.toLowerCase(),
            symbol: e,
            expr: kbs
          };
        },
      peg$c294 = "with",
      peg$c295 = peg$literalExpectation("WITH", true),
      peg$c296 = "parser",
      peg$c297 = peg$literalExpectation("PARSER", true),
      peg$c298 = function(pn) {
          return {
            type: 'with parser',
            expr: pn
          }
        },
      peg$c299 = "visible",
      peg$c300 = peg$literalExpectation("VISIBLE", true),
      peg$c301 = "invisible",
      peg$c302 = peg$literalExpectation("INVISIBLE", true),
      peg$c303 = function(k) {
          return {
            type: k.toLowerCase(),
            expr: k.toLowerCase()
          }
        },
      peg$c304 = function(head, tail) {
            tail.unshift(head);
            tail.forEach(tableInfo => {
              const { table, as } = tableInfo;
              tableAlias[table] = table;
              if (as) tableAlias[as] = table;
              refreshColumnList(columnList);
            });
            return tail;
          },
      peg$c305 = function(t) { return t; },
      peg$c306 = function(op, t, head, tail) {
            t.join = op;
            t.using = createList(head, tail);
            return t;
          },
      peg$c307 = function(op, t, expr) {
            t.join = op;
            t.on   = expr;
            return t;
          },
      peg$c308 = function(op, stmt, alias, expr) {
          stmt.parentheses = true;
          return {
            expr: stmt,
            as: alias,
            join: op,
            on: expr
          };
        },
      peg$c309 = function() {
            return {
              type: 'dual'
            };
        },
      peg$c310 = function(name, l, alias) {
            return {
              expr: {
                type: 'function',
                name: { name: [{ type: 'default', value: name }]},
                args: l,
              },
              as: alias,
            }
          },
      peg$c311 = function(t, alias) {
            if (t.type === 'var') {
              t.as = alias;
              return t;
            } else {
              return {
                db: t.db,
                table: t.table,
                as: alias
              };
            }
          },
      peg$c312 = function(stmt, alias) {
            stmt.parentheses = true;
            return {
              expr: stmt,
              as: alias
            };
          },
      peg$c313 = function() { return 'LEFT JOIN'; },
      peg$c314 = function() { return 'INNER JOIN'; },
      peg$c315 = function(dt, tail) {
            const obj = { db: null, table: dt };
            if (tail !== null) {
              obj.db = dt;
              obj.table = tail[3];
            }
            return obj;
          },
      peg$c316 = function(v) {
            v.db = null;
            v.table = v.name;
            return v;
          },
      peg$c317 = function(head, tail) {
          const len = tail.length;
          let result = head;
          for (let i = 0; i < len; ++i) {
            result = createBinaryExpr(tail[i][1], result, tail[i][3]);
          }
          return result
        },
      peg$c318 = function(e) { return e; },
      peg$c319 = function(e) {
          return {
            columns: e.value
          }
        },
      peg$c320 = function(e, d) {
          const obj = { expr: e, type: d };
          return obj;
        },
      peg$c321 = function(i1, tail) {
            const res = [i1];
            if (tail) res.push(tail[2]);
            return {
              seperator: tail && tail[0] && tail[0].toLowerCase() || '',
              value: res
            };
          },
      peg$c322 = function(t, l, w, r, or, lc) {
            const dbObj = {};
            const addTableFun = (tableInfo) => {
              const { server, db, schema, as, table, join } = tableInfo;
              const action = join ? 'select' : 'update';
              const fullName = [server, db, schema].filter(Boolean).join('.') || null;
              if (db) dbObj[table] = fullName;
              if (table) tableList.add(`${action}::${fullName}::${table}`);
            };
            if (t) t.forEach(addTableFun);
            if(l) {
              l.forEach(col => {
                if (col.table) {
                  const table = queryTableAlias(col.table);
                  tableList.add(`update::${dbObj[table] || null}::${table}`);
                }
                columnList.add(`update::${col.table}::${col.column}`);
              });
            }
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                type: 'update',
                table: t,
                set: l,
                where: w,
                returning: r,
                orderby: or,
                limit: lc,
              }
            };
          },
      peg$c323 = function(t, f, w, r, or, l) {
           if(f) f.forEach(tableInfo => {
              const { db, as, table, join } = tableInfo;
              const action = join ? 'select' : 'delete';
              if (table) tableList.add(`${action}::${db}::${table}`);
              if (!join) columnList.add(`delete::${table}::(.*)`);
            });
            if (t === null && f.length === 1) {
              const tableInfo = f[0];
              t = [{
                db: tableInfo.db,
                table: tableInfo.table,
                as: tableInfo.as,
                addition: true
              }];
            }
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                type: 'delete',
                table: t,
                from: f,
                where: w,
                returning: r,
                orderby: or,
                limit: l,
              }
            };
          },
      peg$c324 = "=",
      peg$c325 = peg$literalExpectation("=", false),
      peg$c326 = function(tbl, c, v) {
            return { column: c, value: v, table: tbl && tbl[0] };
        },
      peg$c327 = function(tbl, c, v) {
            return { column: c, value: v, table: tbl && tbl[0], keyword: 'values' };
        },
      peg$c328 = function(k, c) {
          // => { type: 'returning'; columns: column_clause | select_stmt; }
          return {
            type: k && k.toLowerCase() || 'returning',
            columns: c === '*' && [{ type: 'expr', expr: { type: 'column_ref', table: null, column: '*' }, as: null }] || c
          }
        },
      peg$c329 = function(head, tail) {
            return createList(head, tail)
          },
      peg$c330 = function(v) {
          return v
        },
      peg$c331 = function(ri, t, p, c, v, odp, r) {
            if (t) {
              tableList.add(`insert::${t.db}::${t.table}`);
              t.as = null;
            }
            if (c) {
              let table = t && t.table || null;
              if(Array.isArray(v.values)) {
                v.values.forEach((row, idx) => {
                  if(row.value.length != c.length) {
                    throw new Error(`Error: column count doesn't match value count at row ${idx+1}`)
                  }
                });
              }
              c.forEach(c => columnList.add(`insert::${table}::${c}`));
            }
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                ...ri,
                table: [t],
                columns: c,
                values: v,
                partition: p,
                on_duplicate_update: odp,
                returning: r,
              }
            };
          },
      peg$c332 = function(ri, ig, it, t, p, v, odp) {
            if (t) {
              tableList.add(`insert::${t.db}::${t.table}`);
              columnList.add(`insert::${t.table}::(.*)`);
              t.as = null;
            }
            const prefix = [ig, it].filter(v => v).map(v => v[0] && v[0].toLowerCase()).join(' ');
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                ...ri,
                table: [t],
                columns: null,
                values: v,
                partition: p,
                prefix,
                on_duplicate_update: odp,
              }
            };
          },
      peg$c333 = function(ri, t, p, l, odp) {
            if (t) {
              tableList.add(`insert::${t.db}::${t.table}`);
              columnList.add(`insert::${t.table}::(.*)`);
              t.as = null;
            }
            return {
              tableList: Array.from(tableList),
              columnList: columnListTableAlias(columnList),
              ast: {
                ...ri,
                table: [t],
                columns: null,
                partition: p,
                set: l,
                on_duplicate_update: odp,
              }
            };
          },
      peg$c334 = "duplicate",
      peg$c335 = peg$literalExpectation("DUPLICATE", true),
      peg$c336 = function(s) {
          return {
            keyword: 'on duplicate key update',
            set: s
          }
        },
      peg$c337 = "abort",
      peg$c338 = peg$literalExpectation("ABORT", true),
      peg$c339 = "fail",
      peg$c340 = peg$literalExpectation("FAIL", true),
      peg$c341 = "ignore",
      peg$c342 = peg$literalExpectation("IGNORE", true),
      peg$c343 = "replace",
      peg$c344 = peg$literalExpectation("REPLACE", true),
      peg$c345 = "rollback",
      peg$c346 = peg$literalExpectation("ROLLBACK", true),
      peg$c347 = function(tail) {
          const result = {
            type: 'insert',
          };
          if (!tail || tail.length === 0) {
            return result;
          }
          result.or = [
            {
              type: 'origin',
              value: 'or',
            },
            {
              type: 'origin',
              value: tail[3],
            }
          ];
          return result
        },
      peg$c348 = function() {
          return { type: 'replace' }
        },
      peg$c349 = function(l) { return { type: 'values', values: l } },
      peg$c350 = function(l) {
            return l;
          },
      peg$c351 = function(head, tail) {
            const el = { type: 'expr_list' };
            el.value = createList(head, tail);
            return el;
          },
      peg$c352 = function(e, u) {
            return {
              type: 'interval',
              expr: e,
              unit: u.toLowerCase(),
            }
          },
      peg$c353 = function(condition_list, otherwise) {
            if (otherwise) condition_list.push(otherwise);
            return {
              type: 'case',
              expr: null,
              args: condition_list
            };
          },
      peg$c354 = function(expr, condition_list, otherwise) {
            if (otherwise) condition_list.push(otherwise);
            return {
              type: 'case',
              expr: expr,
              args: condition_list
            };
          },
      peg$c355 = function(condition, result) {
          return {
            type: 'when',
            cond: condition,
            result: result
          };
        },
      peg$c356 = function(result) {
          return { type: 'else', result: result };
        },
      peg$c357 = function(op, tail) {
          return createUnaryExpr(op, tail[0][1]);
        },
      peg$c358 = function(head, tail) {
          const ast = head.ast;
          if (ast && ast.type === 'select') {
            if (!(head.parentheses_symbol || head.parentheses || head.ast.parentheses || head.ast.parentheses_symbol) || ast.columns.length !== 1 || ast.columns[0].expr.column === '*') throw new Error('invalid column clause with select statement')
          }
          if (!tail || tail.length === 0) return head
          const len = tail.length;
          let result = tail[len - 1][3];
          for (let i = len - 1; i >= 0; i--) {
            const left = i === 0 ? head : tail[i - 1][3];
            result = createBinaryExpr(tail[i][1], left, result);
          }
          return result
        },
      peg$c359 = function(head, tail) {
          const len = tail.length;
          let result = head;
          let seperator = '';
          for (let i = 0; i < len; ++i) {
            if (tail[i][1] === ',') {
              seperator = ',';
              if (!Array.isArray(result)) result = [result];
              result.push(tail[i][3]);
            } else {
              result = createBinaryExpr(tail[i][1], result, tail[i][3]);
            }
          }
          if (seperator === ',') {
            const el = { type: 'expr_list' };
            el.value = result;
            return el
          }
          return result
        },
      peg$c360 = function(head, tail) {
            return createBinaryExprChain(head, tail);
          },
      peg$c361 = "!",
      peg$c362 = peg$literalExpectation("!", false),
      peg$c363 = function(expr) {
            return createUnaryExpr('NOT', expr);
          },
      peg$c364 = function(left, rh) {
            if (rh === null) return left;
            else if (rh.type === 'arithmetic') return createBinaryExprChain(left, rh.tail);
            else return createBinaryExpr(rh.op, left, rh.right);
          },
      peg$c365 = function(op, stmt) {
          stmt.parentheses = true;
          return createUnaryExpr(op, stmt);
        },
      peg$c366 = function(nk) { return nk[0] + ' ' + nk[2]; },
      peg$c367 = function(l) {
            return { type: 'arithmetic', tail: l };
          },
      peg$c368 = ">=",
      peg$c369 = peg$literalExpectation(">=", false),
      peg$c370 = ">",
      peg$c371 = peg$literalExpectation(">", false),
      peg$c372 = "<=",
      peg$c373 = peg$literalExpectation("<=", false),
      peg$c374 = "<>",
      peg$c375 = peg$literalExpectation("<>", false),
      peg$c376 = "<",
      peg$c377 = peg$literalExpectation("<", false),
      peg$c378 = "==",
      peg$c379 = peg$literalExpectation("==", false),
      peg$c380 = "!=",
      peg$c381 = peg$literalExpectation("!=", false),
      peg$c382 = function(right) {
            return { op: 'IS', right: right };
          },
      peg$c383 = function(right) {
            return { op: 'IS NOT', right: right };
        },
      peg$c384 = function(op, begin, end) {
            return {
              op: op,
              right: {
                type: 'expr_list',
                value: [begin, end]
              }
            };
          },
      peg$c385 = function(n, k) {
          return n ? `${n} ${k}` : k
        },
      peg$c386 = "escape",
      peg$c387 = peg$literalExpectation("ESCAPE", true),
      peg$c388 = function(kw, c) {
          // => { type: 'ESCAPE'; value: literal_string }
          return {
            type: 'ESCAPE',
            value: c,
          }
        },
      peg$c389 = function(op, b, e) {
          return  { op: b ? `${op} ${b}` :  op, right: e };
        },
      peg$c390 = "glob",
      peg$c391 = peg$literalExpectation("glob", true),
      peg$c392 = function(e) {
          return { op: 'GLOB', right: e }
        },
      peg$c393 = function(op, right, es) {
            if (es) right.escape = es;
            return { op: op, right: right };
          },
      peg$c394 = function(op, l) {
            return { op: op, right: l };
          },
      peg$c395 = function(op, e) {
            return { op: op, right: e };
          },
      peg$c396 = function(head, tail) {
            if (tail && tail.length && head.type === 'column_ref' && head.column === '*') throw new Error(JSON.stringify({
              message: 'args could not be star column in additive expr',
              ...getLocationObject(),
            }))
            return createBinaryExprChain(head, tail);
          },
      peg$c397 = "+",
      peg$c398 = peg$literalExpectation("+", false),
      peg$c399 = "-",
      peg$c400 = peg$literalExpectation("-", false),
      peg$c401 = function(head, tail) {
            return createBinaryExprChain(head, tail)
          },
      peg$c402 = "*",
      peg$c403 = peg$literalExpectation("*", false),
      peg$c404 = "/",
      peg$c405 = peg$literalExpectation("/", false),
      peg$c406 = "%",
      peg$c407 = peg$literalExpectation("%", false),
      peg$c408 = "||",
      peg$c409 = peg$literalExpectation("||", false),
      peg$c410 = function(list) {
              list.parentheses = true;
              return list;
          },
      peg$c411 = "?",
      peg$c412 = peg$literalExpectation("?", false),
      peg$c413 = /^[0-9]/,
      peg$c414 = peg$classExpectation([["0", "9"]], false, false),
      peg$c415 = function(prepared_symbol) {
          return {
            type: 'origin',
            value: prepared_symbol.join('')
          }
        },
      peg$c416 = function(op, tail) {
          // if (op === '!') op = 'NOT'
          return createUnaryExpr(op, tail[1])
        },
      peg$c417 = "~",
      peg$c418 = peg$literalExpectation("~", false),
      peg$c419 = "?|",
      peg$c420 = peg$literalExpectation("?|", false),
      peg$c421 = "?&",
      peg$c422 = peg$literalExpectation("?&", false),
      peg$c423 = "#-",
      peg$c424 = peg$literalExpectation("#-", false),
      peg$c425 = "#>>",
      peg$c426 = peg$literalExpectation("#>>", false),
      peg$c427 = "#>",
      peg$c428 = peg$literalExpectation("#>", false),
      peg$c429 = "@>",
      peg$c430 = peg$literalExpectation("@>", false),
      peg$c431 = "<@",
      peg$c432 = peg$literalExpectation("<@", false),
      peg$c433 = function(head, tail) {
          // => primary | binary_expr
          if (!tail || tail.length === 0) return head
          return createBinaryExprChain(head, tail)
        },
      peg$c434 = function(tbl, col, ce) {
            columnList.add(`select::${tbl}::${col}`);
            return {
              type: 'column_ref',
              table: tbl,
              column: col,
              collate: ce && ce[1],
            };
          },
      peg$c435 = function(col, ce) {
            columnList.add(`select::null::${col}`);
            return {
              type: 'column_ref',
              table: null,
              column: col,
              collate: ce && ce[1],
            };
          },
      peg$c436 = function(n) {
          return { type: 'default', value: n }
        },
      peg$c437 = function(name) { return reservedMap[name.toUpperCase()] === true; },
      peg$c439 = function(name) {
            return name;
          },
      peg$c440 = function(name) {
            if (reservedMap[name.toUpperCase()] === true) throw new Error("Error: "+ JSON.stringify(name)+" is a reserved word, can not as alias clause");
            return false
          },
      peg$c441 = function(v) {
          return v.value
        },
      peg$c442 = "\"",
      peg$c443 = peg$literalExpectation("\"", false),
      peg$c444 = /^[^"]/,
      peg$c445 = peg$classExpectation(["\""], true, false),
      peg$c446 = function(chars) {
          return {
            type: 'double_quote_string',
            value: chars.join('')
          }
        },
      peg$c447 = /^[^']/,
      peg$c448 = peg$classExpectation(["'"], true, false),
      peg$c449 = function(chars) {
          return {
            type: 'single_quote_string',
            value: chars.join('')
          }
        },
      peg$c450 = "`",
      peg$c451 = peg$literalExpectation("`", false),
      peg$c452 = /^[^`]/,
      peg$c453 = peg$classExpectation(["`"], true, false),
      peg$c454 = function(chars) {
          return {
            type: 'backticks_quote_string',
            value: chars.join('')
          }
        },
      peg$c455 = function(name) {
          return name;
        },
      peg$c456 = function(name) { return name; },
      peg$c457 = function(start, parts) { return start + parts.join(''); },
      peg$c458 = /^[A-Za-z_]/,
      peg$c459 = peg$classExpectation([["A", "Z"], ["a", "z"], "_"], false, false),
      peg$c460 = /^[A-Za-z0-9_]/,
      peg$c461 = peg$classExpectation([["A", "Z"], ["a", "z"], ["0", "9"], "_"], false, false),
      peg$c462 = /^[A-Za-z0-9_:\u4E00-\u9FA5\xC0-\u017F]/,
      peg$c463 = peg$classExpectation([["A", "Z"], ["a", "z"], ["0", "9"], "_", ":", ["\u4E00", "\u9FA5"], ["\xC0", "\u017F"]], false, false),
      peg$c464 = ":",
      peg$c465 = peg$literalExpectation(":", false),
      peg$c466 = function(l) {
            return { type: 'param', value: l[1] };
          },
      peg$c467 = function(name, e, bc) {
            return {
              type: 'aggr_func',
              name: name,
              args: {
                expr: e
              },
              over: bc,
              ...getLocationObject(),
            };
          },
      peg$c468 = function(kw, l) {
          return {
            type: 'on update',
            keyword: kw,
            parentheses: true,
            expr: l
          }
        },
      peg$c469 = function(kw) {
          return {
            type: 'on update',
            keyword: kw,
          }
        },
      peg$c470 = function(bc, l) {
          return {
            partitionby: bc,
            orderby: l
          }
        },
      peg$c471 = function(name, arg, bc) {
            return {
              type: 'aggr_func',
              name: name,
              args: arg,
              over: bc
            };
          },
      peg$c472 = function(e) { return { expr: e }; },
      peg$c473 = function(d, c, tail, or) {
          const len = tail.length;
          let result = c;
          result.parentheses = true;
          for (let i = 0; i < len; ++i) {
            result = createBinaryExpr(tail[i][1], result, tail[i][3]);
          }
          return {
            distinct: d,
            expr: result,
            orderby: or,
          };
        },
      peg$c474 = function(d, c, or) { return { distinct: d, expr: c, orderby: or }; },
      peg$c475 = function() { return { type: 'star', value: '*' }; },
      peg$c476 = function(name, l, bc) {
            return {
              type: 'function',
              name: { name: [{ type: 'default', value: name }] },
              args: l ? l: { type: 'expr_list', value: [] },
              over: bc,
              ...getLocationObject(),
            };
          },
      peg$c477 = function(f, up) {
          return {
              type: 'function',
              name: { name: [{ type: 'origin', value: f }] },
              over: up,
              ...getLocationObject(),
          }
        },
      peg$c478 = function(name, l, bc) {
          if (l && l.type !== 'expr_list') l = { type: 'expr_list', value: [l] };
            return {
              type: 'function',
              name: name,
              args: l ? l: { type: 'expr_list', value: [] },
              over: bc,
              ...getLocationObject(),
            };
          },
      peg$c479 = function(c, e, t) {
          return {
            type: 'cast',
            keyword: c.toLowerCase(),
            expr: e,
            symbol: 'as',
            target: [t]
          };
        },
      peg$c480 = function(c, e, precision) {
          return {
            type: 'cast',
            keyword: c.toLowerCase(),
            expr: e,
            symbol: 'as',
            target: [{
              dataType: 'DECIMAL(' + precision + ')'
            }]
          };
        },
      peg$c481 = function(c, e, precision, scale) {
            return {
              type: 'cast',
              keyword: c.toLowerCase(),
              expr: e,
              symbol: 'as',
              target: [{
                dataType: 'DECIMAL(' + precision + ', ' + scale + ')'
              }]
            };
          },
      peg$c482 = function(c, e, s, t) { /* MySQL cast to un-/signed integer */
          return {
            type: 'cast',
            keyword: c.toLowerCase(),
            expr: e,
            symbol: 'as',
            target: [{
              dataType: s + (t ? ' ' + t: '')
            }]
          };
        },
      peg$c483 = function(b, s, ca) {
          if (b) s.prefix = b.toLowerCase();
          if (ca) s.suffix = { collate: ca[1] };
          return s
        },
      peg$c484 = function() {
            return { type: 'null', value: null };
          },
      peg$c485 = function() {
          return {
            type: 'not null',
            value: 'not null',
          }
        },
      peg$c486 = function() {
            return { type: 'bool', value: true };
          },
      peg$c487 = function() {
            return { type: 'bool', value: false };
          },
      peg$c488 = "_binary",
      peg$c489 = peg$literalExpectation("_binary", true),
      peg$c490 = "x",
      peg$c491 = peg$literalExpectation("X", true),
      peg$c492 = /^[0-9A-Fa-f]/,
      peg$c493 = peg$classExpectation([["0", "9"], ["A", "F"], ["a", "f"]], false, false),
      peg$c494 = function(b, r, ca) {
            return {
              type: 'hex_string',
              prefix: b,
              value: ca[1].join('')
            };
          },
      peg$c495 = "b",
      peg$c496 = peg$literalExpectation("b", true),
      peg$c497 = function(b, r, ca) {
            return {
              type: 'bit_string',
              prefix: b,
              value: ca[1].join('')
            };
          },
      peg$c498 = "0x",
      peg$c499 = peg$literalExpectation("0x", false),
      peg$c500 = function(b, r, ca) {
          return {
              type: 'full_hex_string',
              prefix: b,
              value: ca.join('')
            };
        },
      peg$c501 = function(ca) {
            return {
              type: 'single_quote_string',
              value: ca[1].join('')
            };
          },
      peg$c502 = function(ca) {
            return {
              type: 'double_quote_string',
              value: ca[1].join('')
            };
          },
      peg$c503 = function(type, ca) {
            return {
              type: type.toLowerCase(),
              value: ca[1].join('')
            };
          },
      peg$c504 = /^[^"\\\0-\x1F\x7F]/,
      peg$c505 = peg$classExpectation(["\"", "\\", ["\0", "\x1F"], "\x7F"], true, false),
      peg$c506 = /^[^'\\]/,
      peg$c507 = peg$classExpectation(["'", "\\"], true, false),
      peg$c508 = "\\'",
      peg$c509 = peg$literalExpectation("\\'", false),
      peg$c510 = function() { return "\\'";  },
      peg$c511 = "\\\"",
      peg$c512 = peg$literalExpectation("\\\"", false),
      peg$c513 = function() { return '\\"';  },
      peg$c514 = "\\\\",
      peg$c515 = peg$literalExpectation("\\\\", false),
      peg$c516 = function() { return "\\\\"; },
      peg$c517 = "\\/",
      peg$c518 = peg$literalExpectation("\\/", false),
      peg$c519 = function() { return "\\/";  },
      peg$c520 = "\\b",
      peg$c521 = peg$literalExpectation("\\b", false),
      peg$c522 = function() { return "\b"; },
      peg$c523 = "\\f",
      peg$c524 = peg$literalExpectation("\\f", false),
      peg$c525 = function() { return "\f"; },
      peg$c526 = "\\n",
      peg$c527 = peg$literalExpectation("\\n", false),
      peg$c528 = function() { return "\n"; },
      peg$c529 = "\\r",
      peg$c530 = peg$literalExpectation("\\r", false),
      peg$c531 = function() { return "\r"; },
      peg$c532 = "\\t",
      peg$c533 = peg$literalExpectation("\\t", false),
      peg$c534 = function() { return "\t"; },
      peg$c535 = "\\u",
      peg$c536 = peg$literalExpectation("\\u", false),
      peg$c537 = function(h1, h2, h3, h4) {
            return String.fromCharCode(parseInt("0x" + h1 + h2 + h3 + h4));
          },
      peg$c538 = "\\",
      peg$c539 = peg$literalExpectation("\\", false),
      peg$c540 = function() { return "\\"; },
      peg$c541 = "''",
      peg$c542 = peg$literalExpectation("''", false),
      peg$c543 = function() { return "''" },
      peg$c544 = "\"\"",
      peg$c545 = peg$literalExpectation("\"\"", false),
      peg$c546 = function() { return '""' },
      peg$c547 = "``",
      peg$c548 = peg$literalExpectation("``", false),
      peg$c549 = function() { return '``' },
      peg$c550 = /^[\n\r]/,
      peg$c551 = peg$classExpectation(["\n", "\r"], false, false),
      peg$c552 = function(n) {
            if (n && n.type === 'bigint') return n
            return { type: 'number', value: n };
          },
      peg$c553 = function(int_, frac, exp) {
          const numStr = int_ + frac + exp;
          return {
            type: 'bigint',
            value: numStr
          }
        },
      peg$c554 = function(int_, frac) {
          const numStr = int_ + frac;
          if (isBigInt(int_)) return {
            type: 'bigint',
            value: numStr
          }
          const fixed = frac.length >= 1 ? frac.length - 1 : 0;
          return parseFloat(numStr).toFixed(fixed);
        },
      peg$c555 = function(int_, exp) {
          const numStr = int_ + exp;
          return {
            type: 'bigint',
            value: numStr
          }
        },
      peg$c556 = function(int_) {
          if (isBigInt(int_)) return {
            type: 'bigint',
            value: int_
          }
          return parseFloat(int_);
        },
      peg$c557 = function(op, digits) { return op + digits; },
      peg$c558 = function(op, digit) { return op + digit; },
      peg$c559 = ".",
      peg$c560 = peg$literalExpectation(".", false),
      peg$c561 = function(digits) {
          if (!digits) return ''
          return "." + digits;
        },
      peg$c562 = function(e, digits) { return e + digits; },
      peg$c563 = function(digits) { return digits.join(""); },
      peg$c564 = /^[0-9a-fA-F]/,
      peg$c565 = peg$classExpectation([["0", "9"], ["a", "f"], ["A", "F"]], false, false),
      peg$c566 = /^[eE]/,
      peg$c567 = peg$classExpectation(["e", "E"], false, false),
      peg$c568 = /^[+\-]/,
      peg$c569 = peg$classExpectation(["+", "-"], false, false),
      peg$c570 = function(e, sign) { return e + (sign !== null ? sign: ''); },
      peg$c571 = "analyze",
      peg$c572 = peg$literalExpectation("ANALYZE", true),
      peg$c573 = function() { return 'ANALYZE'; },
      peg$c574 = "attach",
      peg$c575 = peg$literalExpectation("ATTACH", true),
      peg$c576 = function() { return 'ATTACH'; },
      peg$c577 = "null",
      peg$c578 = peg$literalExpectation("NULL", true),
      peg$c579 = "not null",
      peg$c580 = peg$literalExpectation("NOT NULL", true),
      peg$c581 = "true",
      peg$c582 = peg$literalExpectation("TRUE", true),
      peg$c583 = "to",
      peg$c584 = peg$literalExpectation("TO", true),
      peg$c585 = "false",
      peg$c586 = peg$literalExpectation("FALSE", true),
      peg$c587 = "show",
      peg$c588 = peg$literalExpectation("SHOW", true),
      peg$c589 = "drop",
      peg$c590 = peg$literalExpectation("DROP", true),
      peg$c591 = function() { return 'DROP'; },
      peg$c592 = "use",
      peg$c593 = peg$literalExpectation("USE", true),
      peg$c594 = "alter",
      peg$c595 = peg$literalExpectation("ALTER", true),
      peg$c596 = "select",
      peg$c597 = peg$literalExpectation("SELECT", true),
      peg$c598 = "update",
      peg$c599 = peg$literalExpectation("UPDATE", true),
      peg$c600 = "create",
      peg$c601 = peg$literalExpectation("CREATE", true),
      peg$c602 = "temporary",
      peg$c603 = peg$literalExpectation("TEMPORARY", true),
      peg$c604 = "temp",
      peg$c605 = peg$literalExpectation("TEMP", true),
      peg$c606 = "delete",
      peg$c607 = peg$literalExpectation("DELETE", true),
      peg$c608 = "insert",
      peg$c609 = peg$literalExpectation("INSERT", true),
      peg$c610 = "recursive",
      peg$c611 = peg$literalExpectation("RECURSIVE", true),
      peg$c612 = "rename",
      peg$c613 = peg$literalExpectation("RENAME", true),
      peg$c614 = "returning",
      peg$c615 = peg$literalExpectation("RETURNING", true),
      peg$c616 = function() { return 'RETURNING' },
      peg$c619 = "partition",
      peg$c620 = peg$literalExpectation("PARTITION", true),
      peg$c621 = function() { return 'PARTITION' },
      peg$c622 = "into",
      peg$c623 = peg$literalExpectation("INTO", true),
      peg$c624 = "from",
      peg$c625 = peg$literalExpectation("FROM", true),
      peg$c626 = function() { return 'SET' },
      peg$c627 = "unlock",
      peg$c628 = peg$literalExpectation("UNLOCK", true),
      peg$c629 = "as",
      peg$c630 = peg$literalExpectation("AS", true),
      peg$c631 = "table",
      peg$c632 = peg$literalExpectation("TABLE", true),
      peg$c633 = function() { return 'TABLE'; },
      peg$c634 = "tables",
      peg$c635 = peg$literalExpectation("TABLES", true),
      peg$c636 = function() { return 'TABLES'; },
      peg$c637 = "database",
      peg$c638 = peg$literalExpectation("DATABASE", true),
      peg$c639 = function() { return 'DATABASE'; },
      peg$c640 = "schema",
      peg$c641 = peg$literalExpectation("SCHEMA", true),
      peg$c642 = function() { return 'SCHEMA'; },
      peg$c643 = function() { return 'COLLATE'; },
      peg$c644 = "left",
      peg$c645 = peg$literalExpectation("LEFT", true),
      peg$c646 = "inner",
      peg$c647 = peg$literalExpectation("INNER", true),
      peg$c648 = "join",
      peg$c649 = peg$literalExpectation("JOIN", true),
      peg$c650 = "outer",
      peg$c651 = peg$literalExpectation("OUTER", true),
      peg$c652 = "over",
      peg$c653 = peg$literalExpectation("OVER", true),
      peg$c654 = "union",
      peg$c655 = peg$literalExpectation("UNION", true),
      peg$c656 = "values",
      peg$c657 = peg$literalExpectation("VALUES", true),
      peg$c658 = "using",
      peg$c659 = peg$literalExpectation("USING", true),
      peg$c660 = "where",
      peg$c661 = peg$literalExpectation("WHERE", true),
      peg$c662 = "group",
      peg$c663 = peg$literalExpectation("GROUP", true),
      peg$c664 = "by",
      peg$c665 = peg$literalExpectation("BY", true),
      peg$c666 = "order",
      peg$c667 = peg$literalExpectation("ORDER", true),
      peg$c668 = "having",
      peg$c669 = peg$literalExpectation("HAVING", true),
      peg$c670 = "limit",
      peg$c671 = peg$literalExpectation("LIMIT", true),
      peg$c672 = "offset",
      peg$c673 = peg$literalExpectation("OFFSET", true),
      peg$c674 = function() { return 'OFFSET'; },
      peg$c675 = "asc",
      peg$c676 = peg$literalExpectation("ASC", true),
      peg$c677 = function() { return 'ASC'; },
      peg$c678 = "desc",
      peg$c679 = peg$literalExpectation("DESC", true),
      peg$c680 = function() { return 'DESC'; },
      peg$c681 = "describe",
      peg$c682 = peg$literalExpectation("DESCRIBE", true),
      peg$c683 = function() { return 'DESCRIBE'; },
      peg$c684 = "all",
      peg$c685 = peg$literalExpectation("ALL", true),
      peg$c686 = function() { return 'ALL'; },
      peg$c687 = "distinct",
      peg$c688 = peg$literalExpectation("DISTINCT", true),
      peg$c689 = function() { return 'DISTINCT';},
      peg$c690 = "between",
      peg$c691 = peg$literalExpectation("BETWEEN", true),
      peg$c692 = function() { return 'BETWEEN'; },
      peg$c693 = "in",
      peg$c694 = peg$literalExpectation("IN", true),
      peg$c695 = function() { return 'IN'; },
      peg$c696 = "is",
      peg$c697 = peg$literalExpectation("IS", true),
      peg$c698 = function() { return 'IS'; },
      peg$c699 = "like",
      peg$c700 = peg$literalExpectation("LIKE", true),
      peg$c701 = function() { return 'LIKE'; },
      peg$c702 = "rlike",
      peg$c703 = peg$literalExpectation("RLIKE", true),
      peg$c704 = function() { return 'RLIKE'; },
      peg$c705 = "regexp",
      peg$c706 = peg$literalExpectation("REGEXP", true),
      peg$c707 = function() { return 'REGEXP'; },
      peg$c708 = peg$literalExpectation("EXISTS", true),
      peg$c709 = function() { return 'EXISTS'; },
      peg$c710 = function() { return 'NOT'; },
      peg$c711 = "and",
      peg$c712 = peg$literalExpectation("AND", true),
      peg$c713 = function() { return 'AND'; },
      peg$c714 = "or",
      peg$c715 = peg$literalExpectation("OR", true),
      peg$c716 = function() { return 'OR'; },
      peg$c717 = "count",
      peg$c718 = peg$literalExpectation("COUNT", true),
      peg$c719 = function() { return 'COUNT'; },
      peg$c720 = "group_concat",
      peg$c721 = peg$literalExpectation("GROUP_CONCAT", true),
      peg$c722 = function() { return 'GROUP_CONCAT'; },
      peg$c723 = "max",
      peg$c724 = peg$literalExpectation("MAX", true),
      peg$c725 = function() { return 'MAX'; },
      peg$c726 = "min",
      peg$c727 = peg$literalExpectation("MIN", true),
      peg$c728 = function() { return 'MIN'; },
      peg$c729 = "sum",
      peg$c730 = peg$literalExpectation("SUM", true),
      peg$c731 = function() { return 'SUM'; },
      peg$c732 = "avg",
      peg$c733 = peg$literalExpectation("AVG", true),
      peg$c734 = function() { return 'AVG'; },
      peg$c735 = "call",
      peg$c736 = peg$literalExpectation("CALL", true),
      peg$c737 = function() { return 'CALL'; },
      peg$c738 = "case",
      peg$c739 = peg$literalExpectation("CASE", true),
      peg$c740 = "when",
      peg$c741 = peg$literalExpectation("WHEN", true),
      peg$c742 = "then",
      peg$c743 = peg$literalExpectation("THEN", true),
      peg$c744 = "else",
      peg$c745 = peg$literalExpectation("ELSE", true),
      peg$c746 = "cast",
      peg$c747 = peg$literalExpectation("CAST", true),
      peg$c748 = function() { return 'CAST' },
      peg$c749 = "bit",
      peg$c750 = peg$literalExpectation("BIT", true),
      peg$c751 = function() { return 'BIT'; },
      peg$c752 = "char",
      peg$c753 = peg$literalExpectation("CHAR", true),
      peg$c754 = function() { return 'CHAR'; },
      peg$c755 = "varchar",
      peg$c756 = peg$literalExpectation("VARCHAR", true),
      peg$c757 = function() { return 'VARCHAR';},
      peg$c758 = "numeric",
      peg$c759 = peg$literalExpectation("NUMERIC", true),
      peg$c760 = function() { return 'NUMERIC'; },
      peg$c761 = "decimal",
      peg$c762 = peg$literalExpectation("DECIMAL", true),
      peg$c763 = function() { return 'DECIMAL'; },
      peg$c764 = "signed",
      peg$c765 = peg$literalExpectation("SIGNED", true),
      peg$c766 = function() { return 'SIGNED'; },
      peg$c767 = "unsigned",
      peg$c768 = peg$literalExpectation("UNSIGNED", true),
      peg$c769 = function() { return 'UNSIGNED'; },
      peg$c770 = "int",
      peg$c771 = peg$literalExpectation("INT", true),
      peg$c772 = function() { return 'INT'; },
      peg$c773 = "zerofill",
      peg$c774 = peg$literalExpectation("ZEROFILL", true),
      peg$c775 = function() { return 'ZEROFILL'; },
      peg$c776 = "integer",
      peg$c777 = peg$literalExpectation("INTEGER", true),
      peg$c778 = function() { return 'INTEGER'; },
      peg$c779 = "json",
      peg$c780 = peg$literalExpectation("JSON", true),
      peg$c781 = function() { return 'JSON'; },
      peg$c782 = "smallint",
      peg$c783 = peg$literalExpectation("SMALLINT", true),
      peg$c784 = function() { return 'SMALLINT'; },
      peg$c785 = "tinyint",
      peg$c786 = peg$literalExpectation("TINYINT", true),
      peg$c787 = function() { return 'TINYINT'; },
      peg$c788 = "tinytext",
      peg$c789 = peg$literalExpectation("TINYTEXT", true),
      peg$c790 = function() { return 'TINYTEXT'; },
      peg$c791 = "text",
      peg$c792 = peg$literalExpectation("TEXT", true),
      peg$c793 = function() { return 'TEXT'; },
      peg$c794 = "mediumtext",
      peg$c795 = peg$literalExpectation("MEDIUMTEXT", true),
      peg$c796 = function() { return 'MEDIUMTEXT'; },
      peg$c797 = "longtext",
      peg$c798 = peg$literalExpectation("LONGTEXT", true),
      peg$c799 = function() { return 'LONGTEXT'; },
      peg$c800 = "bigint",
      peg$c801 = peg$literalExpectation("BIGINT", true),
      peg$c802 = function() { return 'BIGINT'; },
      peg$c803 = "enum",
      peg$c804 = peg$literalExpectation("ENUM", true),
      peg$c805 = function() { return 'ENUM'; },
      peg$c806 = "float",
      peg$c807 = peg$literalExpectation("FLOAT", true),
      peg$c808 = function() { return 'FLOAT'; },
      peg$c809 = "double",
      peg$c810 = peg$literalExpectation("DOUBLE", true),
      peg$c811 = function() { return 'DOUBLE'; },
      peg$c812 = "real",
      peg$c813 = peg$literalExpectation("REAL", true),
      peg$c814 = function() { return 'REAL'; },
      peg$c815 = "date",
      peg$c816 = peg$literalExpectation("DATE", true),
      peg$c817 = function() { return 'DATE'; },
      peg$c818 = "datetime",
      peg$c819 = peg$literalExpectation("DATETIME", true),
      peg$c820 = function() { return 'DATETIME'; },
      peg$c821 = "time",
      peg$c822 = peg$literalExpectation("TIME", true),
      peg$c823 = function() { return 'TIME'; },
      peg$c824 = "timestamp",
      peg$c825 = peg$literalExpectation("TIMESTAMP", true),
      peg$c826 = function() { return 'TIMESTAMP'; },
      peg$c827 = "truncate",
      peg$c828 = peg$literalExpectation("TRUNCATE", true),
      peg$c829 = function() { return 'TRUNCATE'; },
      peg$c830 = "user",
      peg$c831 = peg$literalExpectation("USER", true),
      peg$c832 = function() { return 'USER'; },
      peg$c833 = "current_date",
      peg$c834 = peg$literalExpectation("CURRENT_DATE", true),
      peg$c835 = function() { return 'CURRENT_DATE'; },
      peg$c839 = "interval",
      peg$c840 = peg$literalExpectation("INTERVAL", true),
      peg$c841 = function() { return 'INTERVAL'; },
      peg$c842 = "year",
      peg$c843 = peg$literalExpectation("YEAR", true),
      peg$c844 = function() { return 'YEAR'; },
      peg$c845 = "month",
      peg$c846 = peg$literalExpectation("MONTH", true),
      peg$c847 = function() { return 'MONTH'; },
      peg$c848 = "day",
      peg$c849 = peg$literalExpectation("DAY", true),
      peg$c850 = function() { return 'DAY'; },
      peg$c851 = "hour",
      peg$c852 = peg$literalExpectation("HOUR", true),
      peg$c853 = function() { return 'HOUR'; },
      peg$c854 = "minute",
      peg$c855 = peg$literalExpectation("MINUTE", true),
      peg$c856 = function() { return 'MINUTE'; },
      peg$c857 = "second",
      peg$c858 = peg$literalExpectation("SECOND", true),
      peg$c859 = function() { return 'SECOND'; },
      peg$c860 = "current_time",
      peg$c861 = peg$literalExpectation("CURRENT_TIME", true),
      peg$c862 = function() { return 'CURRENT_TIME'; },
      peg$c863 = "current_timestamp",
      peg$c864 = peg$literalExpectation("CURRENT_TIMESTAMP", true),
      peg$c865 = function() { return 'CURRENT_TIMESTAMP'; },
      peg$c866 = "current_user",
      peg$c867 = peg$literalExpectation("CURRENT_USER", true),
      peg$c868 = function() { return 'CURRENT_USER'; },
      peg$c869 = "session_user",
      peg$c870 = peg$literalExpectation("SESSION_USER", true),
      peg$c871 = function() { return 'SESSION_USER'; },
      peg$c872 = "system_user",
      peg$c873 = peg$literalExpectation("SYSTEM_USER", true),
      peg$c874 = function() { return 'SYSTEM_USER'; },
      peg$c875 = "global",
      peg$c876 = peg$literalExpectation("GLOBAL", true),
      peg$c877 = function() { return 'GLOBAL'; },
      peg$c878 = "session",
      peg$c879 = peg$literalExpectation("SESSION", true),
      peg$c880 = function() { return 'SESSION'; },
      peg$c881 = function() { return 'LOCAL'; },
      peg$c882 = "persist",
      peg$c883 = peg$literalExpectation("PERSIST", true),
      peg$c884 = function() { return 'PERSIST'; },
      peg$c885 = "persist_only",
      peg$c886 = peg$literalExpectation("PERSIST_ONLY", true),
      peg$c887 = function() { return 'PERSIST_ONLY'; },
      peg$c888 = "view",
      peg$c889 = peg$literalExpectation("VIEW", true),
      peg$c890 = function() { return 'VIEW'; },
      peg$c891 = "@",
      peg$c892 = peg$literalExpectation("@", false),
      peg$c893 = "@@",
      peg$c894 = peg$literalExpectation("@@", false),
      peg$c895 = "$",
      peg$c896 = peg$literalExpectation("$", false),
      peg$c897 = "return",
      peg$c898 = peg$literalExpectation("return", true),
      peg$c899 = ":=",
      peg$c900 = peg$literalExpectation(":=", false),
      peg$c901 = "dual",
      peg$c902 = peg$literalExpectation("DUAL", true),
      peg$c903 = "add",
      peg$c904 = peg$literalExpectation("ADD", true),
      peg$c905 = function() { return 'ADD'; },
      peg$c906 = "column",
      peg$c907 = peg$literalExpectation("COLUMN", true),
      peg$c908 = function() { return 'COLUMN'; },
      peg$c909 = "index",
      peg$c910 = peg$literalExpectation("INDEX", true),
      peg$c911 = function() { return 'INDEX'; },
      peg$c912 = "modify",
      peg$c913 = peg$literalExpectation("MODIFY", true),
      peg$c914 = function() { return 'MODIFY'; },
      peg$c915 = function() { return 'KEY'; },
      peg$c916 = "fulltext",
      peg$c917 = peg$literalExpectation("FULLTEXT", true),
      peg$c918 = function() { return 'FULLTEXT'; },
      peg$c919 = "spatial",
      peg$c920 = peg$literalExpectation("SPATIAL", true),
      peg$c921 = function() { return 'SPATIAL'; },
      peg$c922 = function() { return 'UNIQUE'; },
      peg$c923 = function() { return 'KEY_BLOCK_SIZE'; },
      peg$c924 = "comment",
      peg$c925 = peg$literalExpectation("COMMENT", true),
      peg$c926 = function() { return 'COMMENT'; },
      peg$c927 = "constraint",
      peg$c928 = peg$literalExpectation("CONSTRAINT", true),
      peg$c929 = function() { return 'CONSTRAINT'; },
      peg$c930 = "references",
      peg$c931 = peg$literalExpectation("REFERENCES", true),
      peg$c932 = function() { return 'REFERENCES'; },
      peg$c933 = "sql_calc_found_rows",
      peg$c934 = peg$literalExpectation("SQL_CALC_FOUND_ROWS", true),
      peg$c935 = "sql_cache",
      peg$c936 = peg$literalExpectation("SQL_CACHE", true),
      peg$c937 = "sql_no_cache",
      peg$c938 = peg$literalExpectation("SQL_NO_CACHE", true),
      peg$c939 = "sql_small_result",
      peg$c940 = peg$literalExpectation("SQL_SMALL_RESULT", true),
      peg$c941 = "sql_big_result",
      peg$c942 = peg$literalExpectation("SQL_BIG_RESULT", true),
      peg$c943 = "sql_buffer_result",
      peg$c944 = peg$literalExpectation("SQL_BUFFER_RESULT", true),
      peg$c945 = ",",
      peg$c946 = peg$literalExpectation(",", false),
      peg$c947 = "[",
      peg$c948 = peg$literalExpectation("[", false),
      peg$c949 = "]",
      peg$c950 = peg$literalExpectation("]", false),
      peg$c951 = ";",
      peg$c952 = peg$literalExpectation(";", false),
      peg$c953 = "->",
      peg$c954 = peg$literalExpectation("->", false),
      peg$c955 = "->>",
      peg$c956 = peg$literalExpectation("->>", false),
      peg$c957 = "&&",
      peg$c958 = peg$literalExpectation("&&", false),
      peg$c959 = "/*",
      peg$c960 = peg$literalExpectation("/*", false),
      peg$c961 = "*/",
      peg$c962 = peg$literalExpectation("*/", false),
      peg$c963 = "--",
      peg$c964 = peg$literalExpectation("--", false),
      peg$c965 = "#",
      peg$c966 = peg$literalExpectation("#", false),
      peg$c967 = function(k, s, c) {
          return {
            type: k.toLowerCase(),
            keyword: k.toLowerCase(),
            symbol: s,
            value: c,
          }
        },
      peg$c968 = peg$anyExpectation(),
      peg$c969 = /^[ \t\n\r]/,
      peg$c970 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false),
      peg$c971 = function() { varList = []; return true; },
      peg$c972 = function(s) {
            return { stmt: s, vars: varList };
          },
      peg$c973 = function(va, s, e) {
          return {
            type: 'assign',
            left: va,
            symbol: s,
            right: e
          };
        },
      peg$c974 = function(e) {
            return { type: 'return', expr: e };
          },
      peg$c975 = function(lt, op, rt, expr) {
            return {
              type: 'join',
              ltable: lt,
              rtable: rt,
              op: op,
              on: expr
            };
          },
      peg$c976 = function(e) {
            e.parentheses = true;
            return e;
          },
      peg$c977 = function(dt, tail) {
            const result = { name: [dt] };
            if (tail !== null) {
              result.schema = dt;
              result.name = [tail[3]];
            }
            return result
          },
      peg$c978 = function(name, l) {
            //compatible with original func_call
            return {
              type: 'function',
              name: name,
              args: {
                type: 'expr_list',
                value: l
              },
              ...getLocationObject(),
            };
          },
      peg$c979 = function(name) {
          return {
              type: 'function',
              name: name,
              args: null,
              ...getLocationObject(),
            };
        },
      peg$c980 = function(l) {
          return { type: 'array', value: l };
        },
      peg$c981 = function(p, d) {
          //push for analysis
          return {
            type: 'var',
            ...d,
            prefix: p
          };
        },
      peg$c982 = function(name, m) {
          //push for analysis
          varList.push(name);
          return {
            type: 'var',
            name: name,
            members: m,
            prefix: null,
          };
        },
      peg$c983 = function(n) {
          return {
            type: 'var',
            name: n.value,
            members: [],
            quoted: null,
            prefix: null,
          }
        },
      peg$c984 = function(l) {
          const s = [];
          for (let i = 0; i < l.length; i++) {
            s.push(l[i][1]);
          }
          return s;
        },
      peg$c985 = "blob",
      peg$c986 = peg$literalExpectation("blob", true),
      peg$c987 = "tinyblob",
      peg$c988 = peg$literalExpectation("tinyblob", true),
      peg$c989 = "mediumblob",
      peg$c990 = peg$literalExpectation("mediumblob", true),
      peg$c991 = "longblob",
      peg$c992 = peg$literalExpectation("longblob", true),
      peg$c993 = function(b) { return { dataType: b.toUpperCase() }; },
      peg$c994 = "boolean",
      peg$c995 = peg$literalExpectation("boolean", true),
      peg$c996 = function() { return { dataType: 'BOOLEAN' }; },
      peg$c997 = function(t, l) {
          return { dataType: t, length: parseInt(l.join(''), 10), parentheses: true };
        },
      peg$c998 = function(t) { return { dataType: t }; },
      peg$c999 = function(un, ze) {
          const result = [];
          if (un) result.push(un);
          if (ze) result.push(ze);
          return result
        },
      peg$c1000 = function(t, l, r, s) { return { dataType: t, length: parseInt(l.join(''), 10), scale: r && parseInt(r[2].join(''), 10), parentheses: true, suffix: s }; },
      peg$c1001 = function(t, l, s) { return { dataType: t, length: parseInt(l.join(''), 10), suffix: s }; },
      peg$c1002 = function(t, s) { return { dataType: t, suffix: s }; },
      peg$c1003 = /^[0-6]/,
      peg$c1004 = peg$classExpectation([["0", "6"]], false, false),
      peg$c1005 = function(t, l, s) { return { dataType: t, length: parseInt(l, 10), parentheses: true }; },
      peg$c1006 = function(t, e) {
          e.parentheses = true;
          return {
            dataType: t,
            expr: e
          }
        },
      peg$c1007 = function(t) { return { dataType: t }},

      peg$currPos          = 0,
      peg$savedPos         = 0,
      peg$posDetailsCache  = [{ line: 1, column: 1 }],
      peg$maxFailPos       = 0,
      peg$maxFailExpected  = [],
      peg$silentFails      = 0,

      peg$result;

  if ("startRule" in options) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }

  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }

  function peg$literalExpectation(text, ignoreCase) {
    return { type: "literal", text: text, ignoreCase: ignoreCase };
  }

  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
  }

  function peg$anyExpectation() {
    return { type: "any" };
  }

  function peg$endExpectation() {
    return { type: "end" };
  }

  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos], p;

    if (details) {
      return details;
    } else {
      p = pos - 1;
      while (!peg$posDetailsCache[p]) {
        p--;
      }

      details = peg$posDetailsCache[p];
      details = {
        line:   details.line,
        column: details.column
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }

        p++;
      }

      peg$posDetailsCache[pos] = details;
      return details;
    }
  }

  function peg$computeLocation(startPos, endPos) {
    var startPosDetails = peg$computePosDetails(startPos),
        endPosDetails   = peg$computePosDetails(endPos);

    return {
      start: {
        offset: startPos,
        line:   startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line:   endPosDetails.line,
        column: endPosDetails.column
      }
    };
  }

  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) { return; }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }

    peg$maxFailExpected.push(expected);
  }

  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
      expected,
      found,
      location
    );
  }

  function peg$parsestart() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parse__();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsemultiple_stmt();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c0(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecmd_stmt() {
    var s0;

    s0 = peg$parseanalyze_stmt();
    if (s0 === peg$FAILED) {
      s0 = peg$parseattach_stmt();
      if (s0 === peg$FAILED) {
        s0 = peg$parsedrop_stmt();
        if (s0 === peg$FAILED) {
          s0 = peg$parsecreate_stmt();
          if (s0 === peg$FAILED) {
            s0 = peg$parsetruncate_stmt();
            if (s0 === peg$FAILED) {
              s0 = peg$parserename_stmt();
              if (s0 === peg$FAILED) {
                s0 = peg$parsecall_stmt();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseuse_stmt();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parsealter_table_stmt();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parseset_stmt();
                      if (s0 === peg$FAILED) {
                        s0 = peg$parselock_stmt();
                        if (s0 === peg$FAILED) {
                          s0 = peg$parseunlock_stmt();
                          if (s0 === peg$FAILED) {
                            s0 = peg$parseshow_stmt();
                            if (s0 === peg$FAILED) {
                              s0 = peg$parsedesc_stmt();
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parsecreate_stmt() {
    var s0;

    s0 = peg$parsecreate_table_stmt();
    if (s0 === peg$FAILED) {
      s0 = peg$parsecreate_db_stmt();
      if (s0 === peg$FAILED) {
        s0 = peg$parsecreate_index_stmt();
        if (s0 === peg$FAILED) {
          s0 = peg$parsecreate_trigger_stmt();
          if (s0 === peg$FAILED) {
            s0 = peg$parsecreate_view_stmt();
          }
        }
      }
    }

    return s0;
  }

  function peg$parsecrud_stmt() {
    var s0;

    s0 = peg$parseunion_stmt();
    if (s0 === peg$FAILED) {
      s0 = peg$parseupdate_stmt();
      if (s0 === peg$FAILED) {
        s0 = peg$parsereplace_insert_stmt();
        if (s0 === peg$FAILED) {
          s0 = peg$parseinsert_no_columns_stmt();
          if (s0 === peg$FAILED) {
            s0 = peg$parseinsert_into_set();
            if (s0 === peg$FAILED) {
              s0 = peg$parsedelete_stmt();
              if (s0 === peg$FAILED) {
                s0 = peg$parsecmd_stmt();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseproc_stmts();
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parsemultiple_stmt() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parsecrud_stmt();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseSEMICOLON();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsecrud_stmt();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSEMICOLON();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsecrud_stmt();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseset_op() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_UNION();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_ALL();
        if (s3 === peg$FAILED) {
          s3 = peg$parseKW_DISTINCT();
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c2(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseunion_stmt() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseselect_stmt();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseset_op();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseselect_stmt();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseset_op();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseselect_stmt();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse__();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseorder_by_clause();
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parse__();
            if (s5 !== peg$FAILED) {
              s6 = peg$parselimit_clause();
              if (s6 === peg$FAILED) {
                s6 = null;
              }
              if (s6 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c3(s1, s2, s4, s6);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_db_definition() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parsecreate_option_character_set();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parsecreate_option_character_set();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parsecreate_option_character_set();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c4(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseif_not_exists_stmt() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2).toLowerCase() === peg$c5) {
      s1 = input.substr(peg$currPos, 2);
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c6); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_NOT();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_EXISTS();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c7();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseif_exists() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2).toLowerCase() === peg$c5) {
      s1 = input.substr(peg$currPos, 2);
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c8); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 6).toLowerCase() === peg$c9) {
          s3 = input.substr(peg$currPos, 6);
          peg$currPos += 6;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c10); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c11();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_trigger_stmt() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22, s23;

    s0 = peg$currPos;
    s1 = peg$parseKW_CREATE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_TEMPORARY();
        if (s3 === peg$FAILED) {
          s3 = peg$parseKW_TEMP();
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            if (input.substr(peg$currPos, 7).toLowerCase() === peg$c12) {
              s5 = input.substr(peg$currPos, 7);
              peg$currPos += 7;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c13); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseif_not_exists_stmt();
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsetable_name();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        if (input.substr(peg$currPos, 6).toLowerCase() === peg$c14) {
                          s11 = input.substr(peg$currPos, 6);
                          peg$currPos += 6;
                        } else {
                          s11 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c15); }
                        }
                        if (s11 === peg$FAILED) {
                          if (input.substr(peg$currPos, 5).toLowerCase() === peg$c16) {
                            s11 = input.substr(peg$currPos, 5);
                            peg$currPos += 5;
                          } else {
                            s11 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c17); }
                          }
                          if (s11 === peg$FAILED) {
                            if (input.substr(peg$currPos, 10).toLowerCase() === peg$c18) {
                              s11 = input.substr(peg$currPos, 10);
                              peg$currPos += 10;
                            } else {
                              s11 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c19); }
                            }
                          }
                        }
                        if (s11 === peg$FAILED) {
                          s11 = null;
                        }
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parse__();
                          if (s12 !== peg$FAILED) {
                            s13 = peg$parsetrigger_event_list();
                            if (s13 !== peg$FAILED) {
                              s14 = peg$parse__();
                              if (s14 !== peg$FAILED) {
                                if (input.substr(peg$currPos, 2).toLowerCase() === peg$c20) {
                                  s15 = input.substr(peg$currPos, 2);
                                  peg$currPos += 2;
                                } else {
                                  s15 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c21); }
                                }
                                if (s15 !== peg$FAILED) {
                                  s16 = peg$parse__();
                                  if (s16 !== peg$FAILED) {
                                    s17 = peg$parsetable_name();
                                    if (s17 !== peg$FAILED) {
                                      s18 = peg$parse__();
                                      if (s18 !== peg$FAILED) {
                                        s19 = peg$parsetrigger_for_row();
                                        if (s19 === peg$FAILED) {
                                          s19 = null;
                                        }
                                        if (s19 !== peg$FAILED) {
                                          s20 = peg$parse__();
                                          if (s20 !== peg$FAILED) {
                                            s21 = peg$parsetrigger_when();
                                            if (s21 === peg$FAILED) {
                                              s21 = null;
                                            }
                                            if (s21 !== peg$FAILED) {
                                              s22 = peg$parse__();
                                              if (s22 !== peg$FAILED) {
                                                s23 = peg$parsetrigger_action();
                                                if (s23 !== peg$FAILED) {
                                                  peg$savedPos = s0;
                                                  s1 = peg$c22(s1, s3, s5, s7, s9, s11, s13, s15, s17, s19, s21, s23);
                                                  s0 = s1;
                                                } else {
                                                  peg$currPos = s0;
                                                  s0 = peg$FAILED;
                                                }
                                              } else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                              }
                                            } else {
                                              peg$currPos = s0;
                                              s0 = peg$FAILED;
                                            }
                                          } else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                          }
                                        } else {
                                          peg$currPos = s0;
                                          s0 = peg$FAILED;
                                        }
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                      }
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$FAILED;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsetrigger_event() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = peg$parseKW_INSERT();
    if (s1 === peg$FAILED) {
      s1 = peg$parseKW_DELETE();
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c23(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_UPDATE();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          if (input.substr(peg$currPos, 2).toLowerCase() === peg$c24) {
            s4 = input.substr(peg$currPos, 2);
            peg$currPos += 2;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c25); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parse__();
            if (s5 !== peg$FAILED) {
              s6 = peg$parsecolumn_ref_list();
              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c26(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parsetrigger_event_list() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parsetrigger_event();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseKW_OR();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsetrigger_event();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseKW_OR();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsetrigger_event();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c27(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsetrigger_action() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c28) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c29); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsemultiple_stmt();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            if (input.substr(peg$currPos, 3).toLowerCase() === peg$c30) {
              s5 = input.substr(peg$currPos, 3);
              peg$currPos += 3;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c31); }
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c32(s1, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsetrigger_for_row() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c33) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c34); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 4).toLowerCase() === peg$c35) {
          s3 = input.substr(peg$currPos, 4);
          peg$currPos += 4;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c36); }
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            if (input.substr(peg$currPos, 3).toLowerCase() === peg$c37) {
              s5 = input.substr(peg$currPos, 3);
              peg$currPos += 3;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c38); }
            }
            if (s5 === peg$FAILED) {
              if (input.substr(peg$currPos, 9).toLowerCase() === peg$c39) {
                s5 = input.substr(peg$currPos, 9);
                peg$currPos += 9;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c40); }
              }
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c41(s1, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsetrigger_when() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_WHEN();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseexpr();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c42(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_db_stmt() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    s1 = peg$parseKW_CREATE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_DATABASE();
        if (s3 === peg$FAILED) {
          s3 = peg$parseKW_SCHEMA();
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseif_not_exists_stmt();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseproc_func_name();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsecreate_db_definition();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c43(s1, s3, s5, s7, s9);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecolumn_order_list() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parsecolumn_order_item();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseCOMMA();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsecolumn_order_item();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsecolumn_order_item();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c27(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecolumn_order_item() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseexpr();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecollate_expr();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_ASC();
            if (s5 === peg$FAILED) {
              s5 = peg$parseKW_DESC();
            }
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c44(s1, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parsecolumn_order();
    }

    return s0;
  }

  function peg$parsecolumn_order() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parsecolumn_ref();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_ASC();
        if (s3 === peg$FAILED) {
          s3 = peg$parseKW_DESC();
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c45(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_index_stmt() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22, s23;

    s0 = peg$currPos;
    s1 = peg$parseKW_CREATE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_UNIQUE();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_INDEX();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseif_not_exists_stmt();
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsetable_name();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parseindex_type();
                        if (s11 === peg$FAILED) {
                          s11 = null;
                        }
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parse__();
                          if (s12 !== peg$FAILED) {
                            s13 = peg$parseKW_ON();
                            if (s13 !== peg$FAILED) {
                              s14 = peg$parse__();
                              if (s14 !== peg$FAILED) {
                                s15 = peg$parsetable_name();
                                if (s15 !== peg$FAILED) {
                                  s16 = peg$parse__();
                                  if (s16 !== peg$FAILED) {
                                    s17 = peg$parseLPAREN();
                                    if (s17 !== peg$FAILED) {
                                      s18 = peg$parse__();
                                      if (s18 !== peg$FAILED) {
                                        s19 = peg$parsecolumn_order_list();
                                        if (s19 !== peg$FAILED) {
                                          s20 = peg$parse__();
                                          if (s20 !== peg$FAILED) {
                                            s21 = peg$parseRPAREN();
                                            if (s21 !== peg$FAILED) {
                                              s22 = peg$parse__();
                                              if (s22 !== peg$FAILED) {
                                                s23 = peg$parsewhere_clause();
                                                if (s23 === peg$FAILED) {
                                                  s23 = null;
                                                }
                                                if (s23 !== peg$FAILED) {
                                                  peg$savedPos = s0;
                                                  s1 = peg$c46(s1, s3, s5, s7, s9, s11, s13, s15, s19, s23);
                                                  s0 = s1;
                                                } else {
                                                  peg$currPos = s0;
                                                  s0 = peg$FAILED;
                                                }
                                              } else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                              }
                                            } else {
                                              peg$currPos = s0;
                                              s0 = peg$FAILED;
                                            }
                                          } else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                          }
                                        } else {
                                          peg$currPos = s0;
                                          s0 = peg$FAILED;
                                        }
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                      }
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$FAILED;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_view_stmt() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16;

    s0 = peg$currPos;
    s1 = peg$parseKW_CREATE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_TEMP();
        if (s3 === peg$FAILED) {
          s3 = peg$parseKW_TEMPORARY();
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_VIEW();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseif_not_exists_stmt();
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsetable_name();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$currPos;
                        s12 = peg$parseLPAREN();
                        if (s12 !== peg$FAILED) {
                          s13 = peg$parse__();
                          if (s13 !== peg$FAILED) {
                            s14 = peg$parsecolumn_list();
                            if (s14 !== peg$FAILED) {
                              s15 = peg$parse__();
                              if (s15 !== peg$FAILED) {
                                s16 = peg$parseRPAREN();
                                if (s16 !== peg$FAILED) {
                                  s12 = [s12, s13, s14, s15, s16];
                                  s11 = s12;
                                } else {
                                  peg$currPos = s11;
                                  s11 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s11;
                                s11 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s11;
                              s11 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s11;
                            s11 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s11;
                          s11 = peg$FAILED;
                        }
                        if (s11 === peg$FAILED) {
                          s11 = null;
                        }
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parse__();
                          if (s12 !== peg$FAILED) {
                            s13 = peg$parseKW_AS();
                            if (s13 !== peg$FAILED) {
                              s14 = peg$parse__();
                              if (s14 !== peg$FAILED) {
                                s15 = peg$parseselect_stmt_nake();
                                if (s15 !== peg$FAILED) {
                                  peg$savedPos = s0;
                                  s1 = peg$c57(s1, s3, s7, s9, s11, s15);
                                  s0 = s1;
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_table_stmt() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

    s0 = peg$currPos;
    s1 = peg$parseKW_CREATE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_TEMPORARY();
        if (s3 === peg$FAILED) {
          s3 = peg$parseKW_TEMP();
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_TABLE();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseif_not_exists_stmt();
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsetable_name();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parsecreate_table_definition();
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parse__();
                          if (s12 !== peg$FAILED) {
                            s13 = peg$parsetable_options();
                            if (s13 === peg$FAILED) {
                              s13 = null;
                            }
                            if (s13 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$c58(s1, s3, s7, s9, s11, s13);
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_CREATE();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseKW_TEMPORARY();
          if (s3 === peg$FAILED) {
            s3 = peg$parseKW_TEMP();
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseKW_TABLE();
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseif_not_exists_stmt();
                  if (s7 === peg$FAILED) {
                    s7 = null;
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse__();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parsetable_name();
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parse__();
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parseKW_AS();
                          if (s11 !== peg$FAILED) {
                            s12 = peg$parse__();
                            if (s12 !== peg$FAILED) {
                              s13 = peg$parseselect_stmt();
                              if (s13 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$c59(s1, s3, s7, s9, s11, s13);
                                s0 = s1;
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parsecreate_table_definition() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    s1 = peg$parseLPAREN();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecreate_definition();
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$currPos;
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseCOMMA();
            if (s7 !== peg$FAILED) {
              s8 = peg$parse__();
              if (s8 !== peg$FAILED) {
                s9 = peg$parsecreate_definition();
                if (s9 !== peg$FAILED) {
                  s6 = [s6, s7, s8, s9];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$currPos;
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseCOMMA();
              if (s7 !== peg$FAILED) {
                s8 = peg$parse__();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parsecreate_definition();
                  if (s9 !== peg$FAILED) {
                    s6 = [s6, s7, s8, s9];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parse__();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseRPAREN();
              if (s6 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c62(s3, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_definition() {
    var s0;

    s0 = peg$parsecreate_constraint_definition();
    if (s0 === peg$FAILED) {
      s0 = peg$parsecreate_column_definition();
      if (s0 === peg$FAILED) {
        s0 = peg$parsecreate_index_definition();
        if (s0 === peg$FAILED) {
          s0 = peg$parsecreate_fulltext_spatial_index_definition();
        }
      }
    }

    return s0;
  }

  function peg$parsecolumn_definition_opt() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseliteral_not_null();
    if (s1 === peg$FAILED) {
      s1 = peg$parseliteral_null();
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c63(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsedefault_expr();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c64(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 14).toLowerCase() === peg$c65) {
          s1 = input.substr(peg$currPos, 14);
          peg$currPos += 14;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c66); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 13).toLowerCase() === peg$c67) {
            s1 = input.substr(peg$currPos, 13);
            peg$currPos += 13;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c68); }
          }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c69(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 6).toLowerCase() === peg$c70) {
            s1 = input.substr(peg$currPos, 6);
            peg$currPos += 6;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c71); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse__();
            if (s2 !== peg$FAILED) {
              if (input.substr(peg$currPos, 3).toLowerCase() === peg$c72) {
                s3 = input.substr(peg$currPos, 3);
                peg$currPos += 3;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c73); }
              }
              if (s3 === peg$FAILED) {
                s3 = null;
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c74(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 7).toLowerCase() === peg$c75) {
              s1 = input.substr(peg$currPos, 7);
              peg$currPos += 7;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c76); }
            }
            if (s1 === peg$FAILED) {
              s1 = null;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parse__();
              if (s2 !== peg$FAILED) {
                if (input.substr(peg$currPos, 3).toLowerCase() === peg$c72) {
                  s3 = input.substr(peg$currPos, 3);
                  peg$currPos += 3;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c73); }
                }
                if (s3 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c77(s1);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parsekeyword_comment();
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c78(s1);
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseKW_CONSTRAINT();
                if (s1 !== peg$FAILED) {
                  s2 = peg$parse__();
                  if (s2 !== peg$FAILED) {
                    s3 = peg$parseident_without_kw_type();
                    if (s3 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c79(s1, s3);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$parsecollate_expr();
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c80(s1);
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parsecolumn_format();
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c81(s1);
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      s1 = peg$parsestorage();
                      if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c82(s1);
                      }
                      s0 = s1;
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$parsereference_definition();
                        if (s1 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c83(s1);
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          s1 = peg$parsecheck_constraint_definition();
                          if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c84(s1);
                          }
                          s0 = s1;
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = peg$parsecreate_option_character_set_kw();
                            if (s1 !== peg$FAILED) {
                              s2 = peg$parse__();
                              if (s2 !== peg$FAILED) {
                                s3 = peg$parseKW_ASSIGIN_EQUAL();
                                if (s3 === peg$FAILED) {
                                  s3 = null;
                                }
                                if (s3 !== peg$FAILED) {
                                  s4 = peg$parse__();
                                  if (s4 !== peg$FAILED) {
                                    s5 = peg$parseident_without_kw_type();
                                    if (s5 !== peg$FAILED) {
                                      peg$savedPos = s0;
                                      s1 = peg$c85(s1, s3, s5);
                                      s0 = s1;
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$FAILED;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parsecolumn_definition_opt_list() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = peg$parsecolumn_definition_opt();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$currPos;
        s5 = peg$parse__();
        if (s5 !== peg$FAILED) {
          s6 = peg$parsecolumn_definition_opt();
          if (s6 !== peg$FAILED) {
            s5 = [s5, s6];
            s4 = s5;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$currPos;
          s5 = peg$parse__();
          if (s5 !== peg$FAILED) {
            s6 = peg$parsecolumn_definition_opt();
            if (s6 !== peg$FAILED) {
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c86(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_column_definition() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parsecolumn_without_kw();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsedata_type();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsecolumn_definition_opt_list();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c87(s1, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecollate_expr() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_COLLATE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_ASSIGIN_EQUAL();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseident();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c88(s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecolumn_format() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 13).toLowerCase() === peg$c89) {
      s1 = input.substr(peg$currPos, 13);
      peg$currPos += 13;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c90); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 5).toLowerCase() === peg$c91) {
          s3 = input.substr(peg$currPos, 5);
          peg$currPos += 5;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c92); }
        }
        if (s3 === peg$FAILED) {
          if (input.substr(peg$currPos, 7).toLowerCase() === peg$c93) {
            s3 = input.substr(peg$currPos, 7);
            peg$currPos += 7;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c94); }
          }
          if (s3 === peg$FAILED) {
            if (input.substr(peg$currPos, 7).toLowerCase() === peg$c95) {
              s3 = input.substr(peg$currPos, 7);
              peg$currPos += 7;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c96); }
            }
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c97(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsestorage() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c98) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c99); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 4).toLowerCase() === peg$c100) {
          s3 = input.substr(peg$currPos, 4);
          peg$currPos += 4;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c101); }
        }
        if (s3 === peg$FAILED) {
          if (input.substr(peg$currPos, 6).toLowerCase() === peg$c102) {
            s3 = input.substr(peg$currPos, 6);
            peg$currPos += 6;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c103); }
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c104(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsedefault_expr() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_DEFAULT();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseexpr();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c105(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseanalyze_stmt() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = peg$parseKW_ANALYZE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsetable_name();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c106(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseattach_stmt() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

    s0 = peg$currPos;
    s1 = peg$parseKW_ATTACH();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_DATABASE();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseexpr();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseKW_AS();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseident();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c107(s1, s3, s5, s7, s9);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsedrop_index_opt() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseALTER_ALGORITHM();
    if (s1 === peg$FAILED) {
      s1 = peg$parseALTER_LOCK();
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseALTER_ALGORITHM();
        if (s5 === peg$FAILED) {
          s5 = peg$parseALTER_LOCK();
        }
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseALTER_ALGORITHM();
          if (s5 === peg$FAILED) {
            s5 = peg$parseALTER_LOCK();
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c4(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsedrop_stmt() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;

    s0 = peg$currPos;
    s1 = peg$parseKW_DROP();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_TABLE();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseif_exists();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsetable_ref_list();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c108(s1, s3, s5, s7);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_DROP();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseKW_VIEW();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseif_exists();
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsetable_ref_list();
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c109(s1, s3, s5, s7);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseKW_DROP();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseKW_INDEX();
            if (s3 !== peg$FAILED) {
              s4 = peg$parse__();
              if (s4 !== peg$FAILED) {
                s5 = peg$parsecolumn_ref();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parseKW_ON();
                    if (s7 !== peg$FAILED) {
                      s8 = peg$parse__();
                      if (s8 !== peg$FAILED) {
                        s9 = peg$parsetable_name();
                        if (s9 !== peg$FAILED) {
                          s10 = peg$parse__();
                          if (s10 !== peg$FAILED) {
                            s11 = peg$parsedrop_index_opt();
                            if (s11 === peg$FAILED) {
                              s11 = null;
                            }
                            if (s11 !== peg$FAILED) {
                              s12 = peg$parse__();
                              if (s12 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$c110(s1, s3, s5, s9, s11);
                                s0 = s1;
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }
    }

    return s0;
  }

  function peg$parsetruncate_stmt() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_TRUNCATE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_TABLE();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsetable_ref_list();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c111(s1, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseuse_stmt() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_USE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseident();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c112(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsealter_table_stmt() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseKW_ALTER();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_TABLE();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsetable_ref_list();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsealter_action_list();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c113(s5, s7);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsealter_column_suffix() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c114) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c115); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c116(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c16) {
        s1 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c117); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsecolumn_ref();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c118(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parsealter_action_list() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parsealter_action();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseCOMMA();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsealter_action();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsealter_action();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c62(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsealter_action() {
    var s0, s1;

    s0 = peg$parseALTER_ADD_CONSTRAINT();
    if (s0 === peg$FAILED) {
      s0 = peg$parseALTER_DROP_CONSTRAINT();
      if (s0 === peg$FAILED) {
        s0 = peg$parseALTER_DROP_KEY_INDEX();
        if (s0 === peg$FAILED) {
          s0 = peg$parseALTER_ADD_COLUMN();
          if (s0 === peg$FAILED) {
            s0 = peg$parseALTER_DROP_COLUMN();
            if (s0 === peg$FAILED) {
              s0 = peg$parseALTER_MODIFY_COLUMN();
              if (s0 === peg$FAILED) {
                s0 = peg$parseALTER_ADD_INDEX_OR_KEY();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseALTER_RENAME_COLUMN();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseALTER_RENAME_TABLE();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parseALTER_ALGORITHM();
                      if (s0 === peg$FAILED) {
                        s0 = peg$parseALTER_LOCK();
                        if (s0 === peg$FAILED) {
                          s0 = peg$parseALTER_CHANGE_COLUMN();
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = peg$parsetable_option();
                            if (s1 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$c119(s1);
                            }
                            s0 = s1;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseALTER_ADD_CONSTRAINT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_ADD();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecreate_constraint_definition();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c120(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseALTER_DROP_CONSTRAINT() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_DROP();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 5).toLowerCase() === peg$c51) {
          s3 = input.substr(peg$currPos, 5);
          peg$currPos += 5;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c52); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseident_name();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c121(s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseALTER_DROP_KEY_INDEX() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = peg$parseKW_DROP();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 7).toLowerCase() === peg$c75) {
          s3 = input.substr(peg$currPos, 7);
          peg$currPos += 7;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c76); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_KEY();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c122();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_DROP();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          if (input.substr(peg$currPos, 7).toLowerCase() === peg$c123) {
            s4 = input.substr(peg$currPos, 7);
            peg$currPos += 7;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c124); }
          }
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parse__();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseKW_KEY();
              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = peg$parseKW_INDEX();
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseident();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c125(s3, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parseALTER_ADD_COLUMN() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_ADD();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_COLUMN();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsecreate_column_definition();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c126(s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseALTER_DROP_COLUMN() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_DROP();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_COLUMN();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsecolumn_ref();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c127(s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseALTER_MODIFY_COLUMN() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseKW_MODIFY();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_COLUMN();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsecreate_column_definition();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsealter_column_suffix();
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c128(s3, s5, s7);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseALTER_ADD_INDEX_OR_KEY() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_ADD();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecreate_index_definition();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c129(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseALTER_RENAME_COLUMN() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    s1 = peg$parseKW_RENAME();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_COLUMN();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsecolumn_ref();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseKW_TO();
                if (s7 === peg$FAILED) {
                  s7 = peg$parseKW_AS();
                }
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsecolumn_ref();
                    if (s9 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c130(s5, s7, s9);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseALTER_RENAME_TABLE() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_RENAME();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_TO();
        if (s3 === peg$FAILED) {
          s3 = peg$parseKW_AS();
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseident();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c131(s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseALTER_CHANGE_COLUMN() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c132) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c133); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_COLUMN();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsecolumn_ref();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsecreate_column_definition();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsealter_column_suffix();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c134(s3, s5, s7, s9);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseALTER_ALGORITHM() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 9).toLowerCase() === peg$c135) {
      s1 = input.substr(peg$currPos, 9);
      peg$currPos += 9;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c136); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_ASSIGIN_EQUAL();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            if (input.substr(peg$currPos, 7).toLowerCase() === peg$c95) {
              s5 = input.substr(peg$currPos, 7);
              peg$currPos += 7;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c96); }
            }
            if (s5 === peg$FAILED) {
              if (input.substr(peg$currPos, 7).toLowerCase() === peg$c137) {
                s5 = input.substr(peg$currPos, 7);
                peg$currPos += 7;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c138); }
              }
              if (s5 === peg$FAILED) {
                if (input.substr(peg$currPos, 7).toLowerCase() === peg$c139) {
                  s5 = input.substr(peg$currPos, 7);
                  peg$currPos += 7;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c140); }
                }
                if (s5 === peg$FAILED) {
                  if (input.substr(peg$currPos, 4).toLowerCase() === peg$c141) {
                    s5 = input.substr(peg$currPos, 4);
                    peg$currPos += 4;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c142); }
                  }
                }
              }
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c143(s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseALTER_LOCK() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c144) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c145); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_ASSIGIN_EQUAL();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            if (input.substr(peg$currPos, 7).toLowerCase() === peg$c95) {
              s5 = input.substr(peg$currPos, 7);
              peg$currPos += 7;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c96); }
            }
            if (s5 === peg$FAILED) {
              if (input.substr(peg$currPos, 4).toLowerCase() === peg$c146) {
                s5 = input.substr(peg$currPos, 4);
                peg$currPos += 4;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c147); }
              }
              if (s5 === peg$FAILED) {
                if (input.substr(peg$currPos, 6).toLowerCase() === peg$c148) {
                  s5 = input.substr(peg$currPos, 6);
                  peg$currPos += 6;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c149); }
                }
                if (s5 === peg$FAILED) {
                  if (input.substr(peg$currPos, 9).toLowerCase() === peg$c150) {
                    s5 = input.substr(peg$currPos, 9);
                    peg$currPos += 9;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c151); }
                  }
                }
              }
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c152(s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_index_definition() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

    s0 = peg$currPos;
    s1 = peg$parseKW_INDEX();
    if (s1 === peg$FAILED) {
      s1 = peg$parseKW_KEY();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecolumn();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseindex_type();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsecte_column_definition();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseindex_options();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c153(s1, s3, s5, s7, s9);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_fulltext_spatial_index_definition() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

    s0 = peg$currPos;
    s1 = peg$parseKW_FULLTEXT();
    if (s1 === peg$FAILED) {
      s1 = peg$parseKW_SPATIAL();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_INDEX();
        if (s3 === peg$FAILED) {
          s3 = peg$parseKW_KEY();
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsecolumn();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsecte_column_definition();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseindex_options();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c154(s1, s3, s5, s7, s9);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_constraint_definition() {
    var s0;

    s0 = peg$parsecreate_constraint_primary();
    if (s0 === peg$FAILED) {
      s0 = peg$parsecreate_constraint_unique();
      if (s0 === peg$FAILED) {
        s0 = peg$parsecreate_constraint_foreign();
        if (s0 === peg$FAILED) {
          s0 = peg$parsecreate_constraint_check();
        }
      }
    }

    return s0;
  }

  function peg$parseconstraint_name() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_CONSTRAINT();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseident();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c155(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_constraint_primary() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    s1 = peg$parseconstraint_name();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        if (input.substr(peg$currPos, 7).toLowerCase() === peg$c75) {
          s4 = input.substr(peg$currPos, 7);
          peg$currPos += 7;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c76); }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parse__();
          if (s5 !== peg$FAILED) {
            if (input.substr(peg$currPos, 3).toLowerCase() === peg$c72) {
              s6 = input.substr(peg$currPos, 3);
              peg$currPos += 3;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c73); }
            }
            if (s6 !== peg$FAILED) {
              s4 = [s4, s5, s6];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseindex_type();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsecte_column_definition();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseindex_options();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c156(s1, s3, s5, s7, s9);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_constraint_unique() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

    s0 = peg$currPos;
    s1 = peg$parseconstraint_name();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_UNIQUE();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_INDEX();
            if (s5 === peg$FAILED) {
              s5 = peg$parseKW_KEY();
            }
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsecolumn();
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseindex_type();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parsecte_column_definition();
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parse__();
                          if (s12 !== peg$FAILED) {
                            s13 = peg$parseindex_options();
                            if (s13 === peg$FAILED) {
                              s13 = null;
                            }
                            if (s13 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$c157(s1, s3, s5, s7, s9, s11, s13);
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_constraint_check() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

    s0 = peg$currPos;
    s1 = peg$parseconstraint_name();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 5).toLowerCase() === peg$c51) {
          s3 = input.substr(peg$currPos, 5);
          peg$currPos += 5;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c52); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$currPos;
            if (input.substr(peg$currPos, 3).toLowerCase() === peg$c158) {
              s6 = input.substr(peg$currPos, 3);
              peg$currPos += 3;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c159); }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parse__();
              if (s7 !== peg$FAILED) {
                if (input.substr(peg$currPos, 3).toLowerCase() === peg$c33) {
                  s8 = input.substr(peg$currPos, 3);
                  peg$currPos += 3;
                } else {
                  s8 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c34); }
                }
                if (s8 !== peg$FAILED) {
                  s9 = peg$parse__();
                  if (s9 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 11).toLowerCase() === peg$c160) {
                      s10 = input.substr(peg$currPos, 11);
                      peg$currPos += 11;
                    } else {
                      s10 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c161); }
                    }
                    if (s10 !== peg$FAILED) {
                      s11 = peg$parse__();
                      if (s11 !== peg$FAILED) {
                        s6 = [s6, s7, s8, s9, s10, s11];
                        s5 = s6;
                      } else {
                        peg$currPos = s5;
                        s5 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s5;
                      s5 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parseLPAREN();
              if (s6 !== peg$FAILED) {
                s7 = peg$parse__();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseor_and_expr();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parse__();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parseRPAREN();
                      if (s10 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c162(s1, s3, s5, s8);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_constraint_foreign() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    s1 = peg$parseconstraint_name();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 11).toLowerCase() === peg$c163) {
          s3 = input.substr(peg$currPos, 11);
          peg$currPos += 11;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c164); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsecolumn();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsecte_column_definition();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsereference_definition();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c165(s1, s3, s5, s7, s9);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecheck_constraint_definition() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14;

    s0 = peg$currPos;
    s1 = peg$parseconstraint_name();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 5).toLowerCase() === peg$c51) {
          s3 = input.substr(peg$currPos, 5);
          peg$currPos += 5;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c52); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseLPAREN();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseor_and_expr();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseRPAREN();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$currPos;
                        s12 = peg$parseKW_NOT();
                        if (s12 === peg$FAILED) {
                          s12 = null;
                        }
                        if (s12 !== peg$FAILED) {
                          s13 = peg$parse__();
                          if (s13 !== peg$FAILED) {
                            if (input.substr(peg$currPos, 8).toLowerCase() === peg$c166) {
                              s14 = input.substr(peg$currPos, 8);
                              peg$currPos += 8;
                            } else {
                              s14 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c167); }
                            }
                            if (s14 !== peg$FAILED) {
                              s12 = [s12, s13, s14];
                              s11 = s12;
                            } else {
                              peg$currPos = s11;
                              s11 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s11;
                            s11 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s11;
                          s11 = peg$FAILED;
                        }
                        if (s11 === peg$FAILED) {
                          s11 = null;
                        }
                        if (s11 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c168(s1, s3, s7, s11);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsereference_definition() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

    s0 = peg$currPos;
    s1 = peg$parseKW_REFERENCES();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsetable_name();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsecte_column_definition();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                if (input.substr(peg$currPos, 10).toLowerCase() === peg$c169) {
                  s7 = input.substr(peg$currPos, 10);
                  peg$currPos += 10;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c170); }
                }
                if (s7 === peg$FAILED) {
                  if (input.substr(peg$currPos, 13).toLowerCase() === peg$c171) {
                    s7 = input.substr(peg$currPos, 13);
                    peg$currPos += 13;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c172); }
                  }
                  if (s7 === peg$FAILED) {
                    if (input.substr(peg$currPos, 12).toLowerCase() === peg$c173) {
                      s7 = input.substr(peg$currPos, 12);
                      peg$currPos += 12;
                    } else {
                      s7 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c174); }
                    }
                  }
                }
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseon_reference();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parseon_reference();
                        if (s11 === peg$FAILED) {
                          s11 = null;
                        }
                        if (s11 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c175(s1, s3, s5, s7, s9, s11);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseon_reference();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c176(s1);
      }
      s0 = s1;
    }

    return s0;
  }

  function peg$parseon_reference() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_ON();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_DELETE();
        if (s3 === peg$FAILED) {
          s3 = peg$parseKW_UPDATE();
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsereference_option();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c177(s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsereference_option() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseKW_CURRENT_TIMESTAMP();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseLPAREN();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseexpr_list();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseRPAREN();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c178(s1, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 8).toLowerCase() === peg$c179) {
        s1 = input.substr(peg$currPos, 8);
        peg$currPos += 8;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c180); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 7).toLowerCase() === peg$c181) {
          s1 = input.substr(peg$currPos, 7);
          peg$currPos += 7;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c182); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 8).toLowerCase() === peg$c183) {
            s1 = input.substr(peg$currPos, 8);
            peg$currPos += 8;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c184); }
          }
          if (s1 === peg$FAILED) {
            if (input.substr(peg$currPos, 9).toLowerCase() === peg$c185) {
              s1 = input.substr(peg$currPos, 9);
              peg$currPos += 9;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c186); }
            }
            if (s1 === peg$FAILED) {
              if (input.substr(peg$currPos, 11).toLowerCase() === peg$c187) {
                s1 = input.substr(peg$currPos, 11);
                peg$currPos += 11;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c188); }
              }
              if (s1 === peg$FAILED) {
                s1 = peg$parseKW_CURRENT_TIMESTAMP();
              }
            }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c189(s1);
      }
      s0 = s1;
    }

    return s0;
  }

  function peg$parsetable_options() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parsetable_option();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseCOMMA();
        if (s5 === peg$FAILED) {
          s5 = null;
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsetable_option();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 === peg$FAILED) {
            s5 = null;
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsetable_option();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c27(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_option_character_set_kw() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 9).toLowerCase() === peg$c190) {
      s1 = input.substr(peg$currPos, 9);
      peg$currPos += 9;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c191); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c192) {
          s3 = input.substr(peg$currPos, 3);
          peg$currPos += 3;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c193); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c194();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecreate_option_character_set() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseKW_DEFAULT();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecreate_option_character_set_kw();
        if (s3 === peg$FAILED) {
          if (input.substr(peg$currPos, 7).toLowerCase() === peg$c195) {
            s3 = input.substr(peg$currPos, 7);
            peg$currPos += 7;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c196); }
          }
          if (s3 === peg$FAILED) {
            if (input.substr(peg$currPos, 7).toLowerCase() === peg$c197) {
              s3 = input.substr(peg$currPos, 7);
              peg$currPos += 7;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c198); }
            }
          }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_ASSIGIN_EQUAL();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseident_without_kw_type();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c199(s1, s3, s5, s7);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsetable_option() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 14).toLowerCase() === peg$c65) {
      s1 = input.substr(peg$currPos, 14);
      peg$currPos += 14;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c66); }
    }
    if (s1 === peg$FAILED) {
      if (input.substr(peg$currPos, 14).toLowerCase() === peg$c200) {
        s1 = input.substr(peg$currPos, 14);
        peg$currPos += 14;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c201); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 14).toLowerCase() === peg$c202) {
          s1 = input.substr(peg$currPos, 14);
          peg$currPos += 14;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c203); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 8).toLowerCase() === peg$c204) {
            s1 = input.substr(peg$currPos, 8);
            peg$currPos += 8;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c205); }
          }
          if (s1 === peg$FAILED) {
            if (input.substr(peg$currPos, 8).toLowerCase() === peg$c206) {
              s1 = input.substr(peg$currPos, 8);
              peg$currPos += 8;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c207); }
            }
            if (s1 === peg$FAILED) {
              if (input.substr(peg$currPos, 18).toLowerCase() === peg$c208) {
                s1 = input.substr(peg$currPos, 18);
                peg$currPos += 18;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c209); }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_ASSIGIN_EQUAL();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseliteral_numeric();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c210(s1, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parsecreate_option_character_set();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseKW_COMMENT();
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 10).toLowerCase() === peg$c211) {
            s1 = input.substr(peg$currPos, 10);
            peg$currPos += 10;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c212); }
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseKW_ASSIGIN_EQUAL();
            if (s3 === peg$FAILED) {
              s3 = null;
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parse__();
              if (s4 !== peg$FAILED) {
                s5 = peg$parseliteral_string();
                if (s5 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c213(s1, s3, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 11).toLowerCase() === peg$c214) {
            s1 = input.substr(peg$currPos, 11);
            peg$currPos += 11;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c215); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse__();
            if (s2 !== peg$FAILED) {
              s3 = peg$parseKW_ASSIGIN_EQUAL();
              if (s3 === peg$FAILED) {
                s3 = null;
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parse__();
                if (s4 !== peg$FAILED) {
                  s5 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 39) {
                    s6 = peg$c216;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c217); }
                  }
                  if (s6 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c218) {
                      s7 = input.substr(peg$currPos, 4);
                      peg$currPos += 4;
                    } else {
                      s7 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c219); }
                    }
                    if (s7 === peg$FAILED) {
                      if (input.substr(peg$currPos, 3).toLowerCase() === peg$c220) {
                        s7 = input.substr(peg$currPos, 3);
                        peg$currPos += 3;
                      } else {
                        s7 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c221); }
                      }
                      if (s7 === peg$FAILED) {
                        if (input.substr(peg$currPos, 4).toLowerCase() === peg$c146) {
                          s7 = input.substr(peg$currPos, 4);
                          peg$currPos += 4;
                        } else {
                          s7 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c147); }
                        }
                      }
                    }
                    if (s7 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 39) {
                        s8 = peg$c216;
                        peg$currPos++;
                      } else {
                        s8 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c217); }
                      }
                      if (s8 !== peg$FAILED) {
                        s6 = [s6, s7, s8];
                        s5 = s6;
                      } else {
                        peg$currPos = s5;
                        s5 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s5;
                      s5 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                  if (s5 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c222(s1, s3, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 6).toLowerCase() === peg$c223) {
              s1 = input.substr(peg$currPos, 6);
              peg$currPos += 6;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c224); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parse__();
              if (s2 !== peg$FAILED) {
                s3 = peg$parseKW_ASSIGIN_EQUAL();
                if (s3 === peg$FAILED) {
                  s3 = null;
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parse__();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parseident_name();
                    if (s5 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c225(s1, s3, s5);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 7).toLowerCase() === peg$c226) {
                s1 = input.substr(peg$currPos, 7);
                peg$currPos += 7;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c227); }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parse__();
                if (s2 !== peg$FAILED) {
                  if (input.substr(peg$currPos, 5).toLowerCase() === peg$c228) {
                    s3 = input.substr(peg$currPos, 5);
                    peg$currPos += 5;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c229); }
                  }
                  if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c230();
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 6).toLowerCase() === peg$c231) {
                  s1 = input.substr(peg$currPos, 6);
                  peg$currPos += 6;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c232); }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c233();
                }
                s0 = s1;
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parserename_stmt() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_RENAME();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_TABLE();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsetable_to_list();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c234(s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseset_stmt() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_SET();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_GLOBAL();
        if (s3 === peg$FAILED) {
          s3 = peg$parseKW_SESSION();
          if (s3 === peg$FAILED) {
            s3 = peg$parseKW_LOCAL();
            if (s3 === peg$FAILED) {
              s3 = peg$parseKW_PERSIST();
              if (s3 === peg$FAILED) {
                s3 = peg$parseKW_PERSIST_ONLY();
              }
            }
          }
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseassign_stmt_list();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c235(s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseunlock_stmt() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_UNLOCK();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_TABLES();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c236();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parselock_type() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c237) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c238); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 5).toLowerCase() === peg$c49) {
          s3 = input.substr(peg$currPos, 5);
          peg$currPos += 5;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c50); }
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c239(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 12).toLowerCase() === peg$c240) {
        s1 = input.substr(peg$currPos, 12);
        peg$currPos += 12;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c241); }
      }
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 5).toLowerCase() === peg$c242) {
            s3 = input.substr(peg$currPos, 5);
            peg$currPos += 5;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c243); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c244(s1);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parselock_table() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parsetable_base();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parselock_type();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c245(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parselock_table_list() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parselock_table();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseCOMMA();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parselock_table();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parselock_table();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c246(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parselock_stmt() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_LOCK();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_TABLES();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parselock_table_list();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c247(s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecall_stmt() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_CALL();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseproc_func_call();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c248(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseshow_stmt() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

    s0 = peg$currPos;
    s1 = peg$parseKW_SHOW();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 6).toLowerCase() === peg$c249) {
          s3 = input.substr(peg$currPos, 6);
          peg$currPos += 6;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c250); }
        }
        if (s3 === peg$FAILED) {
          if (input.substr(peg$currPos, 6).toLowerCase() === peg$c251) {
            s3 = input.substr(peg$currPos, 6);
            peg$currPos += 6;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c252); }
          }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            if (input.substr(peg$currPos, 4).toLowerCase() === peg$c253) {
              s5 = input.substr(peg$currPos, 4);
              peg$currPos += 4;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c254); }
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c255(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_SHOW();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 6).toLowerCase() === peg$c256) {
            s3 = input.substr(peg$currPos, 6);
            peg$currPos += 6;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c257); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              if (input.substr(peg$currPos, 6).toLowerCase() === peg$c258) {
                s5 = input.substr(peg$currPos, 6);
                peg$currPos += 6;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c259); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsein_op_right();
                  if (s7 === peg$FAILED) {
                    s7 = null;
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse__();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parsefrom_clause();
                      if (s9 === peg$FAILED) {
                        s9 = null;
                      }
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parse__();
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parselimit_clause();
                          if (s11 === peg$FAILED) {
                            s11 = null;
                          }
                          if (s11 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c260(s7, s9, s11);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseKW_SHOW();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            s3 = peg$currPos;
            if (input.substr(peg$currPos, 9).toLowerCase() === peg$c190) {
              s4 = input.substr(peg$currPos, 9);
              peg$currPos += 9;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c191); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse__();
              if (s5 !== peg$FAILED) {
                if (input.substr(peg$currPos, 3).toLowerCase() === peg$c192) {
                  s6 = input.substr(peg$currPos, 3);
                  peg$currPos += 3;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c193); }
                }
                if (s6 !== peg$FAILED) {
                  s4 = [s4, s5, s6];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
            if (s3 === peg$FAILED) {
              if (input.substr(peg$currPos, 9).toLowerCase() === peg$c261) {
                s3 = input.substr(peg$currPos, 9);
                peg$currPos += 9;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c262); }
              }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parse__();
              if (s4 !== peg$FAILED) {
                s5 = peg$parselike_op_right();
                if (s5 === peg$FAILED) {
                  s5 = peg$parsewhere_clause();
                }
                if (s5 === peg$FAILED) {
                  s5 = null;
                }
                if (s5 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c263(s3, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseshow_grant_stmt();
        }
      }
    }

    return s0;
  }

  function peg$parseshow_grant_stmt() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_SHOW();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 6).toLowerCase() === peg$c264) {
          s3 = input.substr(peg$currPos, 6);
          peg$currPos += 6;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c265); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseshow_grant_for();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c266(s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseshow_grant_for() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c33) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c34); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseident();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$currPos;
            s6 = peg$parseKW_VAR__PRE_AT();
            if (s6 !== peg$FAILED) {
              s7 = peg$parse__();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseident();
                if (s8 !== peg$FAILED) {
                  s6 = [s6, s7, s8];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseshow_grant_for_using();
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c267(s3, s5, s7);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseshow_grant_for_using() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_USING();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseshow_grant_for_using_list();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c268(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseshow_grant_for_using_list() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseident();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseCOMMA();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseident();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseident();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c246(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsedesc_stmt() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_DESC();
    if (s1 === peg$FAILED) {
      s1 = peg$parseKW_DESCRIBE();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseident();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c269(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseselect_stmt() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$parseselect_stmt_nake();
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s2 = peg$c270;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c271); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse__();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseselect_stmt();
          if (s4 !== peg$FAILED) {
            s5 = peg$parse__();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s6 = peg$c272;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c273); }
              }
              if (s6 !== peg$FAILED) {
                s2 = [s2, s3, s4, s5, s6];
                s1 = s2;
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c274(s1);
      }
      s0 = s1;
    }

    return s0;
  }

  function peg$parsewith_clause() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;

    s0 = peg$currPos;
    s1 = peg$parseKW_WITH();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecte_definition();
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$currPos;
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseCOMMA();
            if (s7 !== peg$FAILED) {
              s8 = peg$parse__();
              if (s8 !== peg$FAILED) {
                s9 = peg$parsecte_definition();
                if (s9 !== peg$FAILED) {
                  s6 = [s6, s7, s8, s9];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$currPos;
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseCOMMA();
              if (s7 !== peg$FAILED) {
                s8 = peg$parse__();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parsecte_definition();
                  if (s9 !== peg$FAILED) {
                    s6 = [s6, s7, s8, s9];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          }
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c62(s3, s4);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parse__();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseKW_WITH();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseKW_RECURSIVE();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse__();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsecte_definition();
                if (s6 !== peg$FAILED) {
                  s7 = [];
                  s8 = peg$currPos;
                  s9 = peg$parse__();
                  if (s9 !== peg$FAILED) {
                    s10 = peg$parseCOMMA();
                    if (s10 !== peg$FAILED) {
                      s11 = peg$parse__();
                      if (s11 !== peg$FAILED) {
                        s12 = peg$parsecte_definition();
                        if (s12 !== peg$FAILED) {
                          s9 = [s9, s10, s11, s12];
                          s8 = s9;
                        } else {
                          peg$currPos = s8;
                          s8 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s8;
                        s8 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s8;
                      s8 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s8;
                    s8 = peg$FAILED;
                  }
                  while (s8 !== peg$FAILED) {
                    s7.push(s8);
                    s8 = peg$currPos;
                    s9 = peg$parse__();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parseCOMMA();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parse__();
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parsecte_definition();
                          if (s12 !== peg$FAILED) {
                            s9 = [s9, s10, s11, s12];
                            s8 = s9;
                          } else {
                            peg$currPos = s8;
                            s8 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s8;
                          s8 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s8;
                        s8 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s8;
                      s8 = peg$FAILED;
                    }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c275(s6, s7);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parsecte_definition() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

    s0 = peg$currPos;
    s1 = peg$parseliteral_string();
    if (s1 === peg$FAILED) {
      s1 = peg$parseident_name();
      if (s1 === peg$FAILED) {
        s1 = peg$parsetable_name();
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecte_column_definition();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_AS();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseLPAREN();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseunion_stmt();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parseRPAREN();
                        if (s11 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c276(s1, s3, s9);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecte_column_definition() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseLPAREN();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecolumn_ref_index();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseRPAREN();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c277(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseselect_stmt_nake() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22, s23, s24, s25, s26;

    s0 = peg$currPos;
    s1 = peg$parse__();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsewith_clause();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse__();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseKW_SELECT();
          if (s4 !== peg$FAILED) {
            s5 = peg$parse___();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseoption_clause();
              if (s6 === peg$FAILED) {
                s6 = null;
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse__();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseKW_DISTINCT();
                  if (s8 === peg$FAILED) {
                    s8 = null;
                  }
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parse__();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parsecolumn_clause();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parse__();
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parsefrom_clause();
                          if (s12 === peg$FAILED) {
                            s12 = null;
                          }
                          if (s12 !== peg$FAILED) {
                            s13 = peg$parse__();
                            if (s13 !== peg$FAILED) {
                              s14 = peg$parsewhere_clause();
                              if (s14 === peg$FAILED) {
                                s14 = null;
                              }
                              if (s14 !== peg$FAILED) {
                                s15 = peg$parse__();
                                if (s15 !== peg$FAILED) {
                                  s16 = peg$parsegroup_by_clause();
                                  if (s16 === peg$FAILED) {
                                    s16 = null;
                                  }
                                  if (s16 !== peg$FAILED) {
                                    s17 = peg$parse__();
                                    if (s17 !== peg$FAILED) {
                                      s18 = peg$parsehaving_clause();
                                      if (s18 === peg$FAILED) {
                                        s18 = null;
                                      }
                                      if (s18 !== peg$FAILED) {
                                        s19 = peg$parse__();
                                        if (s19 !== peg$FAILED) {
                                          s20 = peg$parseorder_by_clause();
                                          if (s20 === peg$FAILED) {
                                            s20 = null;
                                          }
                                          if (s20 !== peg$FAILED) {
                                            s21 = peg$parse__();
                                            if (s21 !== peg$FAILED) {
                                              s22 = peg$parselimit_clause();
                                              if (s22 === peg$FAILED) {
                                                s22 = null;
                                              }
                                              if (s22 !== peg$FAILED) {
                                                s23 = peg$currPos;
                                                if (input.substr(peg$currPos, 3).toLowerCase() === peg$c33) {
                                                  s24 = input.substr(peg$currPos, 3);
                                                  peg$currPos += 3;
                                                } else {
                                                  s24 = peg$FAILED;
                                                  if (peg$silentFails === 0) { peg$fail(peg$c34); }
                                                }
                                                if (s24 !== peg$FAILED) {
                                                  s25 = peg$parse__();
                                                  if (s25 !== peg$FAILED) {
                                                    s26 = peg$parseKW_UPDATE();
                                                    if (s26 !== peg$FAILED) {
                                                      s24 = [s24, s25, s26];
                                                      s23 = s24;
                                                    } else {
                                                      peg$currPos = s23;
                                                      s23 = peg$FAILED;
                                                    }
                                                  } else {
                                                    peg$currPos = s23;
                                                    s23 = peg$FAILED;
                                                  }
                                                } else {
                                                  peg$currPos = s23;
                                                  s23 = peg$FAILED;
                                                }
                                                if (s23 === peg$FAILED) {
                                                  s23 = null;
                                                }
                                                if (s23 !== peg$FAILED) {
                                                  peg$savedPos = s0;
                                                  s1 = peg$c278(s2, s6, s8, s10, s12, s14, s16, s18, s20, s22, s23);
                                                  s0 = s1;
                                                } else {
                                                  peg$currPos = s0;
                                                  s0 = peg$FAILED;
                                                }
                                              } else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                              }
                                            } else {
                                              peg$currPos = s0;
                                              s0 = peg$FAILED;
                                            }
                                          } else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                          }
                                        } else {
                                          peg$currPos = s0;
                                          s0 = peg$FAILED;
                                        }
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                      }
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$FAILED;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseoption_clause() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parsequery_option();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parsequery_option();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parsequery_option();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c279(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsequery_option() {
    var s0, s1;

    s0 = peg$currPos;
    s1 = peg$parseOPT_SQL_CALC_FOUND_ROWS();
    if (s1 === peg$FAILED) {
      s1 = peg$parseOPT_SQL_CACHE();
      if (s1 === peg$FAILED) {
        s1 = peg$parseOPT_SQL_NO_CACHE();
      }
      if (s1 === peg$FAILED) {
        s1 = peg$parseOPT_SQL_BIG_RESULT();
        if (s1 === peg$FAILED) {
          s1 = peg$parseOPT_SQL_SMALL_RESULT();
          if (s1 === peg$FAILED) {
            s1 = peg$parseOPT_SQL_BUFFER_RESULT();
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c280(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parsecolumn_clause() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseKW_ALL();
    if (s1 === peg$FAILED) {
      s1 = peg$currPos;
      s2 = peg$parseSTAR();
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        peg$silentFails++;
        s4 = peg$parseident_start();
        peg$silentFails--;
        if (s4 === peg$FAILED) {
          s3 = void 0;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 === peg$FAILED) {
        s1 = peg$parseSTAR();
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseCOMMA();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsecolumn_list_item();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsecolumn_list_item();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c281(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsecolumn_list_item();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsecolumn_list_item();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseCOMMA();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsecolumn_list_item();
                if (s7 !== peg$FAILED) {
                  s4 = [s4, s5, s6, s7];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c62(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parsecolumn_list_item() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parseident();
    if (s2 !== peg$FAILED) {
      s3 = peg$parse__();
      if (s3 !== peg$FAILED) {
        s4 = peg$parseDOT();
        if (s4 !== peg$FAILED) {
          s2 = [s2, s3, s4];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseSTAR();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c282(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsebinary_column_expr();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsealias_clause();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c283(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parsealias_clause() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_AS();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse___();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsealias_ident();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c284(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_AS();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseident();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c284(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parsefrom_clause() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_FROM();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsetable_ref_list();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c285(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsetable_to_list() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parsetable_to_item();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseCOMMA();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsetable_to_item();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsetable_to_item();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c62(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsetable_to_item() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parsetable_name();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_TO();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsetable_name();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c286(s1, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseindex_type() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_USING();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 5).toLowerCase() === peg$c287) {
          s3 = input.substr(peg$currPos, 5);
          peg$currPos += 5;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c288); }
        }
        if (s3 === peg$FAILED) {
          if (input.substr(peg$currPos, 4).toLowerCase() === peg$c289) {
            s3 = input.substr(peg$currPos, 4);
            peg$currPos += 4;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c290); }
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c291(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseindex_options() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseindex_option();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseindex_option();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseindex_option();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c292(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseindex_option() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_KEY_BLOCK_SIZE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_ASSIGIN_EQUAL();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseliteral_numeric();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c293(s1, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseindex_type();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4).toLowerCase() === peg$c294) {
          s1 = input.substr(peg$currPos, 4);
          peg$currPos += 4;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c295); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            if (input.substr(peg$currPos, 6).toLowerCase() === peg$c296) {
              s3 = input.substr(peg$currPos, 6);
              peg$currPos += 6;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c297); }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parse__();
              if (s4 !== peg$FAILED) {
                s5 = peg$parseident_name();
                if (s5 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c298(s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 7).toLowerCase() === peg$c299) {
            s1 = input.substr(peg$currPos, 7);
            peg$currPos += 7;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c300); }
          }
          if (s1 === peg$FAILED) {
            if (input.substr(peg$currPos, 9).toLowerCase() === peg$c301) {
              s1 = input.substr(peg$currPos, 9);
              peg$currPos += 9;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c302); }
            }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c303(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$parsekeyword_comment();
          }
        }
      }
    }

    return s0;
  }

  function peg$parsetable_ref_list() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parsetable_base();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsetable_ref();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsetable_ref();
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c304(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsetable_ref() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = peg$parse__();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseCOMMA();
      if (s2 !== peg$FAILED) {
        s3 = peg$parse__();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsetable_base();
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c305(s4);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parse__();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsetable_join();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c305(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parsetable_join() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15;

    s0 = peg$currPos;
    s1 = peg$parsejoin_op();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsetable_base();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_USING();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseLPAREN();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseident_without_kw_type();
                    if (s9 !== peg$FAILED) {
                      s10 = [];
                      s11 = peg$currPos;
                      s12 = peg$parse__();
                      if (s12 !== peg$FAILED) {
                        s13 = peg$parseCOMMA();
                        if (s13 !== peg$FAILED) {
                          s14 = peg$parse__();
                          if (s14 !== peg$FAILED) {
                            s15 = peg$parseident_without_kw_type();
                            if (s15 !== peg$FAILED) {
                              s12 = [s12, s13, s14, s15];
                              s11 = s12;
                            } else {
                              peg$currPos = s11;
                              s11 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s11;
                            s11 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s11;
                          s11 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s11;
                        s11 = peg$FAILED;
                      }
                      while (s11 !== peg$FAILED) {
                        s10.push(s11);
                        s11 = peg$currPos;
                        s12 = peg$parse__();
                        if (s12 !== peg$FAILED) {
                          s13 = peg$parseCOMMA();
                          if (s13 !== peg$FAILED) {
                            s14 = peg$parse__();
                            if (s14 !== peg$FAILED) {
                              s15 = peg$parseident_without_kw_type();
                              if (s15 !== peg$FAILED) {
                                s12 = [s12, s13, s14, s15];
                                s11 = s12;
                              } else {
                                peg$currPos = s11;
                                s11 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s11;
                              s11 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s11;
                            s11 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s11;
                          s11 = peg$FAILED;
                        }
                      }
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parse__();
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parseRPAREN();
                          if (s12 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c306(s1, s3, s9, s10);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsejoin_op();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsetable_base();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseon_clause();
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c307(s1, s3, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsejoin_op();
        if (s1 === peg$FAILED) {
          s1 = peg$parseset_op();
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseLPAREN();
            if (s3 !== peg$FAILED) {
              s4 = peg$parse__();
              if (s4 !== peg$FAILED) {
                s5 = peg$parseunion_stmt();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parseRPAREN();
                    if (s7 !== peg$FAILED) {
                      s8 = peg$parse__();
                      if (s8 !== peg$FAILED) {
                        s9 = peg$parsealias_clause();
                        if (s9 === peg$FAILED) {
                          s9 = null;
                        }
                        if (s9 !== peg$FAILED) {
                          s10 = peg$parse__();
                          if (s10 !== peg$FAILED) {
                            s11 = peg$parseon_clause();
                            if (s11 === peg$FAILED) {
                              s11 = null;
                            }
                            if (s11 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$c308(s1, s5, s9, s11);
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }
    }

    return s0;
  }

  function peg$parsetable_base() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    s1 = peg$parseKW_DUAL();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c309();
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseident_name();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseLPAREN();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseexpr_list();
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseRPAREN();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse__();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parsealias_clause();
                      if (s9 === peg$FAILED) {
                        s9 = null;
                      }
                      if (s9 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c310(s1, s5, s9);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsetable_name();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            s3 = peg$parsealias_clause();
            if (s3 === peg$FAILED) {
              s3 = null;
            }
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c311(s1, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseLPAREN();
          if (s1 !== peg$FAILED) {
            s2 = peg$parse__();
            if (s2 !== peg$FAILED) {
              s3 = peg$parseunion_stmt();
              if (s3 !== peg$FAILED) {
                s4 = peg$parse__();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseRPAREN();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parsealias_clause();
                      if (s7 === peg$FAILED) {
                        s7 = null;
                      }
                      if (s7 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c312(s3, s7);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
      }
    }

    return s0;
  }

  function peg$parsejoin_op() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_LEFT();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_OUTER();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_JOIN();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c313();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parseKW_INNER();
      if (s2 !== peg$FAILED) {
        s3 = peg$parse__();
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseKW_JOIN();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c314();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parsetable_name() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = peg$parseident();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$parse__();
      if (s3 !== peg$FAILED) {
        s4 = peg$parseDOT();
        if (s4 !== peg$FAILED) {
          s5 = peg$parse__();
          if (s5 !== peg$FAILED) {
            s6 = peg$parseident();
            if (s6 !== peg$FAILED) {
              s3 = [s3, s4, s5, s6];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c315(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsevar_decl();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c316(s1);
      }
      s0 = s1;
    }

    return s0;
  }

  function peg$parseor_and_expr() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseexpr();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseKW_AND();
        if (s5 === peg$FAILED) {
          s5 = peg$parseKW_OR();
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseexpr();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseKW_AND();
          if (s5 === peg$FAILED) {
            s5 = peg$parseKW_OR();
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseexpr();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c317(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseon_clause() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_ON();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseor_and_where_expr();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c318(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsewhere_clause() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_WHERE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseor_and_where_expr();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c318(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsegroup_by_clause() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_GROUP();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_BY();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseexpr_list();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c319(s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecolumn_ref_index() {
    var s0;

    s0 = peg$parsecolumn_ref_list();
    if (s0 === peg$FAILED) {
      s0 = peg$parseliteral_list();
    }

    return s0;
  }

  function peg$parsecolumn_ref_list() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parsecolumn_ref();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseCOMMA();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsecolumn_ref();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsecolumn_ref();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c62(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsehaving_clause() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_HAVING();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseor_and_where_expr();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c318(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseorder_by_clause() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_ORDER();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_BY();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseorder_by_list();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c285(s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseorder_by_list() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseorder_by_element();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseCOMMA();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseorder_by_element();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseorder_by_element();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c62(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseorder_by_element() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseexpr();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_DESC();
        if (s3 === peg$FAILED) {
          s3 = peg$parseKW_ASC();
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c320(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parselimit_clause() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;

    s0 = peg$currPos;
    s1 = peg$parseKW_LIMIT();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseexpr();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$currPos;
            s6 = peg$parseCOMMA();
            if (s6 === peg$FAILED) {
              s6 = peg$parseKW_OFFSET();
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parse__();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseexpr();
                if (s8 !== peg$FAILED) {
                  s6 = [s6, s7, s8];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c321(s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseupdate_stmt() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15;

    s0 = peg$currPos;
    s1 = peg$parseKW_UPDATE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsetable_ref_list();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_SET();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseset_list();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsewhere_clause();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parsereturning_stmt();
                        if (s11 === peg$FAILED) {
                          s11 = null;
                        }
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parse__();
                          if (s12 !== peg$FAILED) {
                            s13 = peg$parseorder_by_clause();
                            if (s13 === peg$FAILED) {
                              s13 = null;
                            }
                            if (s13 !== peg$FAILED) {
                              s14 = peg$parse__();
                              if (s14 !== peg$FAILED) {
                                s15 = peg$parselimit_clause();
                                if (s15 === peg$FAILED) {
                                  s15 = null;
                                }
                                if (s15 !== peg$FAILED) {
                                  peg$savedPos = s0;
                                  s1 = peg$c322(s3, s7, s9, s11, s13, s15);
                                  s0 = s1;
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsedelete_stmt() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

    s0 = peg$currPos;
    s1 = peg$parseKW_DELETE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsetable_ref_list();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsefrom_clause();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsewhere_clause();
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsereturning_stmt();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parseorder_by_clause();
                        if (s11 === peg$FAILED) {
                          s11 = null;
                        }
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parse__();
                          if (s12 !== peg$FAILED) {
                            s13 = peg$parselimit_clause();
                            if (s13 === peg$FAILED) {
                              s13 = null;
                            }
                            if (s13 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$c323(s3, s5, s7, s9, s11, s13);
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseset_list() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseset_item();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseCOMMA();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseset_item();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseset_item();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c62(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseset_item() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parseident();
    if (s2 !== peg$FAILED) {
      s3 = peg$parse__();
      if (s3 !== peg$FAILED) {
        s4 = peg$parseDOT();
        if (s4 !== peg$FAILED) {
          s2 = [s2, s3, s4];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecolumn_without_kw();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s5 = peg$c324;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c325); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseexpr();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c326(s1, s3, s7);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parseident();
      if (s2 !== peg$FAILED) {
        s3 = peg$parse__();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseDOT();
          if (s4 !== peg$FAILED) {
            s2 = [s2, s3, s4];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsecolumn_without_kw();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 61) {
                s5 = peg$c324;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c325); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseKW_VALUES();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse__();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parseLPAREN();
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parse__();
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parsecolumn_ref();
                          if (s11 !== peg$FAILED) {
                            s12 = peg$parse__();
                            if (s12 !== peg$FAILED) {
                              s13 = peg$parseRPAREN();
                              if (s13 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$c327(s1, s3, s11);
                                s0 = s1;
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parsereturning_stmt() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_RETURNING();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecolumn_clause();
        if (s3 === peg$FAILED) {
          s3 = peg$parseselect_stmt();
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c328(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseinsert_value_clause() {
    var s0;

    s0 = peg$parsevalue_clause();
    if (s0 === peg$FAILED) {
      s0 = peg$parseselect_stmt_nake();
    }

    return s0;
  }

  function peg$parseinsert_partition() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

    s0 = peg$currPos;
    s1 = peg$parseKW_PARTITION();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseLPAREN();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseident_name();
            if (s5 !== peg$FAILED) {
              s6 = [];
              s7 = peg$currPos;
              s8 = peg$parse__();
              if (s8 !== peg$FAILED) {
                s9 = peg$parseCOMMA();
                if (s9 !== peg$FAILED) {
                  s10 = peg$parse__();
                  if (s10 !== peg$FAILED) {
                    s11 = peg$parseident_name();
                    if (s11 !== peg$FAILED) {
                      s8 = [s8, s9, s10, s11];
                      s7 = s8;
                    } else {
                      peg$currPos = s7;
                      s7 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s7;
                    s7 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s7;
                  s7 = peg$FAILED;
                }
              } else {
                peg$currPos = s7;
                s7 = peg$FAILED;
              }
              while (s7 !== peg$FAILED) {
                s6.push(s7);
                s7 = peg$currPos;
                s8 = peg$parse__();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parseCOMMA();
                  if (s9 !== peg$FAILED) {
                    s10 = peg$parse__();
                    if (s10 !== peg$FAILED) {
                      s11 = peg$parseident_name();
                      if (s11 !== peg$FAILED) {
                        s8 = [s8, s9, s10, s11];
                        s7 = s8;
                      } else {
                        peg$currPos = s7;
                        s7 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s7;
                      s7 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s7;
                    s7 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s7;
                  s7 = peg$FAILED;
                }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse__();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseRPAREN();
                  if (s8 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c329(s5, s6);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_PARTITION();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsevalue_item();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c330(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parsereplace_insert_stmt() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19;

    s0 = peg$currPos;
    s1 = peg$parsereplace_insert();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_INTO();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsetable_name();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseinsert_partition();
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseLPAREN();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parsecolumn_list();
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parse__();
                          if (s12 !== peg$FAILED) {
                            s13 = peg$parseRPAREN();
                            if (s13 !== peg$FAILED) {
                              s14 = peg$parse__();
                              if (s14 !== peg$FAILED) {
                                s15 = peg$parseinsert_value_clause();
                                if (s15 !== peg$FAILED) {
                                  s16 = peg$parse__();
                                  if (s16 !== peg$FAILED) {
                                    s17 = peg$parseon_duplicate_update_stmt();
                                    if (s17 === peg$FAILED) {
                                      s17 = null;
                                    }
                                    if (s17 !== peg$FAILED) {
                                      s18 = peg$parse__();
                                      if (s18 !== peg$FAILED) {
                                        s19 = peg$parsereturning_stmt();
                                        if (s19 === peg$FAILED) {
                                          s19 = null;
                                        }
                                        if (s19 !== peg$FAILED) {
                                          peg$savedPos = s0;
                                          s1 = peg$c331(s1, s5, s7, s11, s15, s17, s19);
                                          s0 = s1;
                                        } else {
                                          peg$currPos = s0;
                                          s0 = peg$FAILED;
                                        }
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                      }
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$FAILED;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseinsert_no_columns_stmt() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

    s0 = peg$currPos;
    s1 = peg$parsereplace_insert();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_IGNORE();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_INTO();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsetable_name();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseinsert_partition();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parseinsert_value_clause();
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parse__();
                          if (s12 !== peg$FAILED) {
                            s13 = peg$parseon_duplicate_update_stmt();
                            if (s13 === peg$FAILED) {
                              s13 = null;
                            }
                            if (s13 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$c332(s1, s3, s5, s7, s9, s11, s13);
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseinsert_into_set() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

    s0 = peg$currPos;
    s1 = peg$parsereplace_insert();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_INTO();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsetable_name();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseinsert_partition();
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseKW_SET();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parseset_list();
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parse__();
                          if (s12 !== peg$FAILED) {
                            s13 = peg$parseon_duplicate_update_stmt();
                            if (s13 === peg$FAILED) {
                              s13 = null;
                            }
                            if (s13 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$c333(s1, s5, s7, s11, s13);
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseon_duplicate_update_stmt() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    s1 = peg$parseKW_ON();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 9).toLowerCase() === peg$c334) {
          s3 = input.substr(peg$currPos, 9);
          peg$currPos += 9;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c335); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_KEY();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseKW_UPDATE();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseset_list();
                    if (s9 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c336(s9);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsereplace_insert() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = peg$parseKW_INSERT();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$parse__();
      if (s3 !== peg$FAILED) {
        s4 = peg$parseKW_OR();
        if (s4 !== peg$FAILED) {
          s5 = peg$parse__();
          if (s5 !== peg$FAILED) {
            if (input.substr(peg$currPos, 5).toLowerCase() === peg$c337) {
              s6 = input.substr(peg$currPos, 5);
              peg$currPos += 5;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c338); }
            }
            if (s6 === peg$FAILED) {
              if (input.substr(peg$currPos, 4).toLowerCase() === peg$c339) {
                s6 = input.substr(peg$currPos, 4);
                peg$currPos += 4;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c340); }
              }
              if (s6 === peg$FAILED) {
                if (input.substr(peg$currPos, 6).toLowerCase() === peg$c341) {
                  s6 = input.substr(peg$currPos, 6);
                  peg$currPos += 6;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c342); }
                }
                if (s6 === peg$FAILED) {
                  if (input.substr(peg$currPos, 7).toLowerCase() === peg$c343) {
                    s6 = input.substr(peg$currPos, 7);
                    peg$currPos += 7;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c344); }
                  }
                  if (s6 === peg$FAILED) {
                    if (input.substr(peg$currPos, 8).toLowerCase() === peg$c345) {
                      s6 = input.substr(peg$currPos, 8);
                      peg$currPos += 8;
                    } else {
                      s6 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c346); }
                    }
                  }
                }
              }
            }
            if (s6 !== peg$FAILED) {
              s3 = [s3, s4, s5, s6];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c347(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_REPLACE();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c348();
      }
      s0 = s1;
    }

    return s0;
  }

  function peg$parsevalue_clause() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_VALUES();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsevalue_list();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c349(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsevalue_list() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parsevalue_item();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseCOMMA();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsevalue_item();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsevalue_item();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c62(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsevalue_item() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseLPAREN();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseexpr_list();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseRPAREN();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c350(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseexpr_list() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseexpr();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseCOMMA();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseexpr();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseexpr();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c351(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseinterval_expr() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_INTERVAL();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseexpr();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseinterval_unit();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c352(s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecase_expr() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

    s0 = peg$currPos;
    s1 = peg$parseKW_CASE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecase_when_then_list();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsecase_else();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseKW_END();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseKW_CASE();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c353(s3, s5);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_CASE();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseexpr();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsecase_when_then_list();
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsecase_else();
                  if (s7 === peg$FAILED) {
                    s7 = null;
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse__();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parseKW_END();
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parse__();
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parseKW_CASE();
                          if (s11 === peg$FAILED) {
                            s11 = null;
                          }
                          if (s11 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c354(s3, s5, s7);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parsecase_when_then_list() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = peg$parsecase_when_then();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$currPos;
        s5 = peg$parse__();
        if (s5 !== peg$FAILED) {
          s6 = peg$parsecase_when_then();
          if (s6 !== peg$FAILED) {
            s5 = [s5, s6];
            s4 = s5;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$currPos;
          s5 = peg$parse__();
          if (s5 !== peg$FAILED) {
            s6 = peg$parsecase_when_then();
            if (s6 !== peg$FAILED) {
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c4(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecase_when_then() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseKW_WHEN();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseor_and_where_expr();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_THEN();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseexpr();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c355(s3, s7);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecase_else() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_ELSE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseexpr();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c356(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parse_expr() {
    var s0;

    s0 = peg$parseor_expr();
    if (s0 === peg$FAILED) {
      s0 = peg$parseunary_expr();
    }

    return s0;
  }

  function peg$parseexpr() {
    var s0;

    s0 = peg$parse_expr();
    if (s0 === peg$FAILED) {
      s0 = peg$parseunion_stmt();
    }

    return s0;
  }

  function peg$parseunary_expr() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseadditive_operator();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseprimary();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseprimary();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c357(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsebinary_column_expr() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseexpr();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseKW_AND();
        if (s5 === peg$FAILED) {
          s5 = peg$parseKW_OR();
          if (s5 === peg$FAILED) {
            s5 = peg$parseLOGIC_OPERATOR();
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseexpr();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseKW_AND();
          if (s5 === peg$FAILED) {
            s5 = peg$parseKW_OR();
            if (s5 === peg$FAILED) {
              s5 = peg$parseLOGIC_OPERATOR();
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseexpr();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c358(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseor_and_where_expr() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseexpr();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseKW_AND();
        if (s5 === peg$FAILED) {
          s5 = peg$parseKW_OR();
          if (s5 === peg$FAILED) {
            s5 = peg$parseCOMMA();
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseexpr();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseKW_AND();
          if (s5 === peg$FAILED) {
            s5 = peg$parseKW_OR();
            if (s5 === peg$FAILED) {
              s5 = peg$parseCOMMA();
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseexpr();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c359(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseor_expr() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseand_expr();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse___();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseKW_OR();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseand_expr();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse___();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseKW_OR();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseand_expr();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c360(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseand_expr() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parsenot_expr();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse___();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseKW_AND();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsenot_expr();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse___();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseKW_AND();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsenot_expr();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c360(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsenot_expr() {
    var s0, s1, s2, s3, s4;

    s0 = peg$parsecomparison_expr();
    if (s0 === peg$FAILED) {
      s0 = peg$parseexists_expr();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseKW_NOT();
        if (s1 === peg$FAILED) {
          s1 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 33) {
            s2 = peg$c361;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c362); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$currPos;
            peg$silentFails++;
            if (input.charCodeAt(peg$currPos) === 61) {
              s4 = peg$c324;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c325); }
            }
            peg$silentFails--;
            if (s4 === peg$FAILED) {
              s3 = void 0;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
            if (s3 !== peg$FAILED) {
              s2 = [s2, s3];
              s1 = s2;
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            s3 = peg$parsenot_expr();
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c363(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }
    }

    return s0;
  }

  function peg$parsecomparison_expr() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseadditive_expr();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecomparison_op_right();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c364(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseliteral_string();
      if (s0 === peg$FAILED) {
        s0 = peg$parsecolumn_ref();
      }
    }

    return s0;
  }

  function peg$parseexists_expr() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseexists_op();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseLPAREN();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseunion_stmt();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseRPAREN();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c365(s1, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseexists_op() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parseKW_NOT();
    if (s2 !== peg$FAILED) {
      s3 = peg$parse__();
      if (s3 !== peg$FAILED) {
        s4 = peg$parseKW_EXISTS();
        if (s4 !== peg$FAILED) {
          s2 = [s2, s3, s4];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c366(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$parseKW_EXISTS();
    }

    return s0;
  }

  function peg$parsecomparison_op_right() {
    var s0;

    s0 = peg$parsearithmetic_op_right();
    if (s0 === peg$FAILED) {
      s0 = peg$parsein_op_right();
      if (s0 === peg$FAILED) {
        s0 = peg$parsebetween_op_right();
        if (s0 === peg$FAILED) {
          s0 = peg$parseis_op_right();
          if (s0 === peg$FAILED) {
            s0 = peg$parselike_op_right();
            if (s0 === peg$FAILED) {
              s0 = peg$parseregexp_op_right();
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parsearithmetic_op_right() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$currPos;
    s3 = peg$parse__();
    if (s3 !== peg$FAILED) {
      s4 = peg$parsearithmetic_comparison_operator();
      if (s4 !== peg$FAILED) {
        s5 = peg$parse__();
        if (s5 !== peg$FAILED) {
          s6 = peg$parseadditive_expr();
          if (s6 !== peg$FAILED) {
            s3 = [s3, s4, s5, s6];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$currPos;
        s3 = peg$parse__();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsearithmetic_comparison_operator();
          if (s4 !== peg$FAILED) {
            s5 = peg$parse__();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseadditive_expr();
              if (s6 !== peg$FAILED) {
                s3 = [s3, s4, s5, s6];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c367(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parsearithmetic_comparison_operator() {
    var s0;

    if (input.substr(peg$currPos, 2) === peg$c368) {
      s0 = peg$c368;
      peg$currPos += 2;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c369); }
    }
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 62) {
        s0 = peg$c370;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c371); }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c372) {
          s0 = peg$c372;
          peg$currPos += 2;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c373); }
        }
        if (s0 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c374) {
            s0 = peg$c374;
            peg$currPos += 2;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c375); }
          }
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 60) {
              s0 = peg$c376;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c377); }
            }
            if (s0 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c378) {
                s0 = peg$c378;
                peg$currPos += 2;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c379); }
              }
              if (s0 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 61) {
                  s0 = peg$c324;
                  peg$currPos++;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c325); }
                }
                if (s0 === peg$FAILED) {
                  if (input.substr(peg$currPos, 2) === peg$c380) {
                    s0 = peg$c380;
                    peg$currPos += 2;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c381); }
                  }
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseis_op_right() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = peg$parseKW_IS();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseadditive_expr();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c382(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parseKW_IS();
      if (s2 !== peg$FAILED) {
        s3 = peg$parse__();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseKW_NOT();
          if (s4 !== peg$FAILED) {
            s2 = [s2, s3, s4];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseadditive_expr();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c383(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parsebetween_op_right() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parsebetween_or_not_between_op();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseadditive_expr();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_AND();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseadditive_expr();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c384(s1, s3, s7);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsebetween_or_not_between_op() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parseKW_NOT();
    if (s2 !== peg$FAILED) {
      s3 = peg$parse__();
      if (s3 !== peg$FAILED) {
        s4 = peg$parseKW_BETWEEN();
        if (s4 !== peg$FAILED) {
          s2 = [s2, s3, s4];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c366(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$parseKW_BETWEEN();
    }

    return s0;
  }

  function peg$parselike_op() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parseKW_NOT();
    if (s2 !== peg$FAILED) {
      s3 = peg$parse__();
      if (s3 !== peg$FAILED) {
        s4 = peg$parseKW_LIKE();
        if (s4 !== peg$FAILED) {
          s2 = [s2, s3, s4];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c366(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$parseKW_LIKE();
    }

    return s0;
  }

  function peg$parseregexp_op() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_NOT();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_REGEXP();
        if (s3 === peg$FAILED) {
          s3 = peg$parseKW_RLIKE();
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c385(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseescape_op() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c386) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c387); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseliteral_string();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c388(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsein_op() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parseKW_NOT();
    if (s2 !== peg$FAILED) {
      s3 = peg$parse__();
      if (s3 !== peg$FAILED) {
        s4 = peg$parseKW_IN();
        if (s4 !== peg$FAILED) {
          s2 = [s2, s3, s4];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c366(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$parseKW_IN();
    }

    return s0;
  }

  function peg$parseregexp_op_right() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseregexp_op();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 6).toLowerCase() === peg$c249) {
          s3 = input.substr(peg$currPos, 6);
          peg$currPos += 6;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c250); }
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsefunc_call();
            if (s5 === peg$FAILED) {
              s5 = peg$parseliteral_string();
              if (s5 === peg$FAILED) {
                s5 = peg$parsecolumn_ref();
              }
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c389(s1, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c390) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c391); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseliteral_string();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c392(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parselike_op_right() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parselike_op();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseliteral();
        if (s3 === peg$FAILED) {
          s3 = peg$parsecomparison_expr();
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseescape_op();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c393(s1, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsein_op_right() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parsein_op();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseLPAREN();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseexpr_list();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseRPAREN();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c394(s1, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsein_op();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsevar_decl();
          if (s3 === peg$FAILED) {
            s3 = peg$parseliteral_string();
            if (s3 === peg$FAILED) {
              s3 = peg$parsefunc_call();
            }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c395(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parseadditive_expr() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parsemultiplicative_expr();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseadditive_operator();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsemultiplicative_expr();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseadditive_operator();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsemultiplicative_expr();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c396(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseadditive_operator() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 43) {
      s0 = peg$c397;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c398); }
    }
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 45) {
        s0 = peg$c399;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c400); }
      }
    }

    return s0;
  }

  function peg$parsemultiplicative_expr() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseunary_expr_or_primary();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parsemultiplicative_operator();
        if (s5 === peg$FAILED) {
          s5 = peg$parseLOGIC_OPERATOR();
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseunary_expr_or_primary();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parsemultiplicative_operator();
          if (s5 === peg$FAILED) {
            s5 = peg$parseLOGIC_OPERATOR();
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseunary_expr_or_primary();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c401(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsemultiplicative_operator() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 42) {
      s0 = peg$c402;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c403); }
    }
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 47) {
        s0 = peg$c404;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c405); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 37) {
          s0 = peg$c406;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c407); }
        }
        if (s0 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c408) {
            s0 = peg$c408;
            peg$currPos += 2;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c409); }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseprimary() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$parsecast_expr();
    if (s0 === peg$FAILED) {
      s0 = peg$parseliteral();
      if (s0 === peg$FAILED) {
        s0 = peg$parseinterval_expr();
        if (s0 === peg$FAILED) {
          s0 = peg$parseaggr_func();
          if (s0 === peg$FAILED) {
            s0 = peg$parsefunc_call();
            if (s0 === peg$FAILED) {
              s0 = peg$parsecase_expr();
              if (s0 === peg$FAILED) {
                s0 = peg$parsecolumn_ref();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseparam();
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parseLPAREN();
                    if (s1 !== peg$FAILED) {
                      s2 = peg$parse__();
                      if (s2 !== peg$FAILED) {
                        s3 = peg$parseor_and_where_expr();
                        if (s3 !== peg$FAILED) {
                          s4 = peg$parse__();
                          if (s4 !== peg$FAILED) {
                            s5 = peg$parseRPAREN();
                            if (s5 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$c410(s3);
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$parsevar_decl();
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$parse__();
                        if (s1 !== peg$FAILED) {
                          s2 = peg$currPos;
                          if (input.charCodeAt(peg$currPos) === 63) {
                            s3 = peg$c411;
                            peg$currPos++;
                          } else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c412); }
                          }
                          if (s3 !== peg$FAILED) {
                            s4 = [];
                            if (peg$c413.test(input.charAt(peg$currPos))) {
                              s5 = input.charAt(peg$currPos);
                              peg$currPos++;
                            } else {
                              s5 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c414); }
                            }
                            while (s5 !== peg$FAILED) {
                              s4.push(s5);
                              if (peg$c413.test(input.charAt(peg$currPos))) {
                                s5 = input.charAt(peg$currPos);
                                peg$currPos++;
                              } else {
                                s5 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c414); }
                              }
                            }
                            if (s4 !== peg$FAILED) {
                              s3 = [s3, s4];
                              s2 = s3;
                            } else {
                              peg$currPos = s2;
                              s2 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s2;
                            s2 = peg$FAILED;
                          }
                          if (s2 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c415(s2);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseunary_expr_or_primary() {
    var s0, s1, s2, s3, s4;

    s0 = peg$parsejsonb_expr();
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseunary_operator();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$parse__();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseunary_expr_or_primary();
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c416(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parseunary_operator() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 33) {
      s0 = peg$c361;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c362); }
    }
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 45) {
        s0 = peg$c399;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c400); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 43) {
          s0 = peg$c397;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c398); }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 126) {
            s0 = peg$c417;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c418); }
          }
        }
      }
    }

    return s0;
  }

  function peg$parsejsonb_expr() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;

    s0 = peg$currPos;
    s1 = peg$parseprimary();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$currPos;
        s5 = peg$parse__();
        if (s5 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c419) {
            s6 = peg$c419;
            peg$currPos += 2;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c420); }
          }
          if (s6 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c421) {
              s6 = peg$c421;
              peg$currPos += 2;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c422); }
            }
            if (s6 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 63) {
                s6 = peg$c411;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c412); }
              }
              if (s6 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c423) {
                  s6 = peg$c423;
                  peg$currPos += 2;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c424); }
                }
                if (s6 === peg$FAILED) {
                  if (input.substr(peg$currPos, 3) === peg$c425) {
                    s6 = peg$c425;
                    peg$currPos += 3;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c426); }
                  }
                  if (s6 === peg$FAILED) {
                    if (input.substr(peg$currPos, 2) === peg$c427) {
                      s6 = peg$c427;
                      peg$currPos += 2;
                    } else {
                      s6 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c428); }
                    }
                    if (s6 === peg$FAILED) {
                      s6 = peg$parseDOUBLE_ARROW();
                      if (s6 === peg$FAILED) {
                        s6 = peg$parseSINGLE_ARROW();
                        if (s6 === peg$FAILED) {
                          if (input.substr(peg$currPos, 2) === peg$c429) {
                            s6 = peg$c429;
                            peg$currPos += 2;
                          } else {
                            s6 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c430); }
                          }
                          if (s6 === peg$FAILED) {
                            if (input.substr(peg$currPos, 2) === peg$c431) {
                              s6 = peg$c431;
                              peg$currPos += 2;
                            } else {
                              s6 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c432); }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          if (s6 !== peg$FAILED) {
            s7 = peg$parse__();
            if (s7 !== peg$FAILED) {
              s8 = peg$parseprimary();
              if (s8 !== peg$FAILED) {
                s5 = [s5, s6, s7, s8];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$currPos;
          s5 = peg$parse__();
          if (s5 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c419) {
              s6 = peg$c419;
              peg$currPos += 2;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c420); }
            }
            if (s6 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c421) {
                s6 = peg$c421;
                peg$currPos += 2;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c422); }
              }
              if (s6 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 63) {
                  s6 = peg$c411;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c412); }
                }
                if (s6 === peg$FAILED) {
                  if (input.substr(peg$currPos, 2) === peg$c423) {
                    s6 = peg$c423;
                    peg$currPos += 2;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c424); }
                  }
                  if (s6 === peg$FAILED) {
                    if (input.substr(peg$currPos, 3) === peg$c425) {
                      s6 = peg$c425;
                      peg$currPos += 3;
                    } else {
                      s6 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c426); }
                    }
                    if (s6 === peg$FAILED) {
                      if (input.substr(peg$currPos, 2) === peg$c427) {
                        s6 = peg$c427;
                        peg$currPos += 2;
                      } else {
                        s6 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c428); }
                      }
                      if (s6 === peg$FAILED) {
                        s6 = peg$parseDOUBLE_ARROW();
                        if (s6 === peg$FAILED) {
                          s6 = peg$parseSINGLE_ARROW();
                          if (s6 === peg$FAILED) {
                            if (input.substr(peg$currPos, 2) === peg$c429) {
                              s6 = peg$c429;
                              peg$currPos += 2;
                            } else {
                              s6 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c430); }
                            }
                            if (s6 === peg$FAILED) {
                              if (input.substr(peg$currPos, 2) === peg$c431) {
                                s6 = peg$c431;
                                peg$currPos += 2;
                              } else {
                                s6 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c432); }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parse__();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseprimary();
                if (s8 !== peg$FAILED) {
                  s5 = [s5, s6, s7, s8];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c433(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecolumn_ref() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;

    s0 = peg$currPos;
    s1 = peg$parseident();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseDOT();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsecolumn_without_kw();
            if (s5 !== peg$FAILED) {
              s6 = peg$currPos;
              s7 = peg$parse__();
              if (s7 !== peg$FAILED) {
                s8 = peg$parsecollate_expr();
                if (s8 !== peg$FAILED) {
                  s7 = [s7, s8];
                  s6 = s7;
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
              if (s6 === peg$FAILED) {
                s6 = null;
              }
              if (s6 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c434(s1, s5, s6);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsecolumn();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$parse__();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsecollate_expr();
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c435(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parsecolumn_list() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parsecolumn();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseCOMMA();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parsecolumn();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsecolumn();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c62(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseident_without_kw_type() {
    var s0, s1;

    s0 = peg$currPos;
    s1 = peg$parseident_name();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c436(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$parsequoted_ident_type();
    }

    return s0;
  }

  function peg$parseident() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parseident_name();
    if (s1 !== peg$FAILED) {
      peg$savedPos = peg$currPos;
      s2 = peg$c437(s1);
      if (s2) {
        s2 = peg$FAILED;
      } else {
        s2 = void 0;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c439(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsequoted_ident();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c439(s1);
      }
      s0 = s1;
    }

    return s0;
  }

  function peg$parsealias_ident() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parseident_name();
    if (s1 !== peg$FAILED) {
      peg$savedPos = peg$currPos;
      s2 = peg$c440(s1);
      if (s2) {
        s2 = peg$FAILED;
      } else {
        s2 = void 0;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c439(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsequoted_ident();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c439(s1);
      }
      s0 = s1;
    }

    return s0;
  }

  function peg$parsequoted_ident_type() {
    var s0;

    s0 = peg$parsedouble_quoted_ident();
    if (s0 === peg$FAILED) {
      s0 = peg$parsesingle_quoted_ident();
      if (s0 === peg$FAILED) {
        s0 = peg$parsebackticks_quoted_ident();
      }
    }

    return s0;
  }

  function peg$parsequoted_ident() {
    var s0, s1;

    s0 = peg$currPos;
    s1 = peg$parsedouble_quoted_ident();
    if (s1 === peg$FAILED) {
      s1 = peg$parsesingle_quoted_ident();
      if (s1 === peg$FAILED) {
        s1 = peg$parsebackticks_quoted_ident();
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c441(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parsedouble_quoted_ident() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 34) {
      s1 = peg$c442;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c443); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      if (peg$c444.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c445); }
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$c444.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c445); }
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 34) {
          s3 = peg$c442;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c443); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c446(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsesingle_quoted_ident() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 39) {
      s1 = peg$c216;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c217); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      if (peg$c447.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c448); }
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$c447.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c448); }
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 39) {
          s3 = peg$c216;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c217); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c449(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsebackticks_quoted_ident() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 96) {
      s1 = peg$c450;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c451); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      if (peg$c452.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c453); }
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$c452.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c453); }
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 96) {
          s3 = peg$c450;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c451); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c454(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecolumn_without_kw() {
    var s0, s1;

    s0 = peg$currPos;
    s1 = peg$parsecolumn_name();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c455(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$parsequoted_ident();
    }

    return s0;
  }

  function peg$parsecolumn() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parsecolumn_name();
    if (s1 !== peg$FAILED) {
      peg$savedPos = peg$currPos;
      s2 = peg$c437(s1);
      if (s2) {
        s2 = peg$FAILED;
      } else {
        s2 = void 0;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c456(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parsequoted_ident();
    }

    return s0;
  }

  function peg$parsecolumn_name() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseident_start();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsecolumn_part();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsecolumn_part();
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c457(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseident_name() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseident_start();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parseident_part();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parseident_part();
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c457(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseident_start() {
    var s0;

    if (peg$c458.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c459); }
    }

    return s0;
  }

  function peg$parseident_part() {
    var s0;

    if (peg$c460.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c461); }
    }

    return s0;
  }

  function peg$parsecolumn_part() {
    var s0;

    if (peg$c462.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c463); }
    }

    return s0;
  }

  function peg$parseparam() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 58) {
      s2 = peg$c464;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c465); }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parseident_name();
      if (s3 !== peg$FAILED) {
        s2 = [s2, s3];
        s1 = s2;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c466(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseaggr_func() {
    var s0;

    s0 = peg$parseaggr_fun_count();
    if (s0 === peg$FAILED) {
      s0 = peg$parseaggr_fun_smma();
    }

    return s0;
  }

  function peg$parseaggr_fun_smma() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    s1 = peg$parseKW_SUM_MAX_MIN_AVG();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseLPAREN();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseadditive_expr();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseRPAREN();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseover_partition();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c467(s1, s5, s9);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_SUM_MAX_MIN_AVG() {
    var s0;

    s0 = peg$parseKW_SUM();
    if (s0 === peg$FAILED) {
      s0 = peg$parseKW_MAX();
      if (s0 === peg$FAILED) {
        s0 = peg$parseKW_MIN();
        if (s0 === peg$FAILED) {
          s0 = peg$parseKW_AVG();
        }
      }
    }

    return s0;
  }

  function peg$parseon_update_current_timestamp() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

    s0 = peg$currPos;
    s1 = peg$parseKW_ON();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_UPDATE();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_CURRENT_TIMESTAMP();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseLPAREN();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseexpr_list();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parseRPAREN();
                        if (s11 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c468(s5, s9);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_ON();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseKW_UPDATE();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseKW_CURRENT_TIMESTAMP();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c469(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parseover_partition() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

    s0 = peg$currPos;
    s1 = peg$parseKW_OVER();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseLPAREN();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseKW_PARTITION();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseKW_BY();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsecolumn_clause();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parseorder_by_clause();
                        if (s11 === peg$FAILED) {
                          s11 = null;
                        }
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parse__();
                          if (s12 !== peg$FAILED) {
                            s13 = peg$parseRPAREN();
                            if (s13 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$c470(s9, s11);
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseon_update_current_timestamp();
    }

    return s0;
  }

  function peg$parseaggr_fun_count() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    s1 = peg$parseKW_COUNT();
    if (s1 === peg$FAILED) {
      s1 = peg$parseKW_GROUP_CONCAT();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseLPAREN();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsecount_arg();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseRPAREN();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseover_partition();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c471(s1, s5, s9);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecount_arg() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

    s0 = peg$currPos;
    s1 = peg$parsestar_expr();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c472(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_DISTINCT();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseLPAREN();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseexpr();
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseRPAREN();
                  if (s7 !== peg$FAILED) {
                    s8 = [];
                    s9 = peg$currPos;
                    s10 = peg$parse__();
                    if (s10 !== peg$FAILED) {
                      s11 = peg$parseKW_AND();
                      if (s11 === peg$FAILED) {
                        s11 = peg$parseKW_OR();
                      }
                      if (s11 !== peg$FAILED) {
                        s12 = peg$parse__();
                        if (s12 !== peg$FAILED) {
                          s13 = peg$parseexpr();
                          if (s13 !== peg$FAILED) {
                            s10 = [s10, s11, s12, s13];
                            s9 = s10;
                          } else {
                            peg$currPos = s9;
                            s9 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s9;
                          s9 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s9;
                        s9 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s9;
                      s9 = peg$FAILED;
                    }
                    while (s9 !== peg$FAILED) {
                      s8.push(s9);
                      s9 = peg$currPos;
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parseKW_AND();
                        if (s11 === peg$FAILED) {
                          s11 = peg$parseKW_OR();
                        }
                        if (s11 !== peg$FAILED) {
                          s12 = peg$parse__();
                          if (s12 !== peg$FAILED) {
                            s13 = peg$parseexpr();
                            if (s13 !== peg$FAILED) {
                              s10 = [s10, s11, s12, s13];
                              s9 = s10;
                            } else {
                              peg$currPos = s9;
                              s9 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s9;
                            s9 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s9;
                          s9 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s9;
                        s9 = peg$FAILED;
                      }
                    }
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parse__();
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parseorder_by_clause();
                        if (s10 === peg$FAILED) {
                          s10 = null;
                        }
                        if (s10 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c473(s1, s5, s8, s10);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseKW_DISTINCT();
        if (s1 === peg$FAILED) {
          s1 = null;
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseor_and_expr();
            if (s3 !== peg$FAILED) {
              s4 = peg$parse__();
              if (s4 !== peg$FAILED) {
                s5 = peg$parseorder_by_clause();
                if (s5 === peg$FAILED) {
                  s5 = null;
                }
                if (s5 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c474(s1, s3, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }
    }

    return s0;
  }

  function peg$parsestar_expr() {
    var s0, s1;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 42) {
      s1 = peg$c402;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c403); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c475();
    }
    s0 = s1;

    return s0;
  }

  function peg$parsefunc_call() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    s1 = peg$parsescalar_func();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseLPAREN();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseexpr_list();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseRPAREN();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseover_partition();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c476(s1, s5, s9);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parsescalar_time_func();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseon_update_current_timestamp();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c477(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseproc_func_name();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseLPAREN();
            if (s3 !== peg$FAILED) {
              s4 = peg$parse__();
              if (s4 !== peg$FAILED) {
                s5 = peg$parseor_and_where_expr();
                if (s5 === peg$FAILED) {
                  s5 = null;
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parseRPAREN();
                    if (s7 !== peg$FAILED) {
                      s8 = peg$parse__();
                      if (s8 !== peg$FAILED) {
                        s9 = peg$parseover_partition();
                        if (s9 === peg$FAILED) {
                          s9 = null;
                        }
                        if (s9 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c478(s1, s5, s9);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }
    }

    return s0;
  }

  function peg$parsescalar_time_func() {
    var s0;

    s0 = peg$parseKW_CURRENT_DATE();
    if (s0 === peg$FAILED) {
      s0 = peg$parseKW_CURRENT_TIME();
      if (s0 === peg$FAILED) {
        s0 = peg$parseKW_CURRENT_TIMESTAMP();
      }
    }

    return s0;
  }

  function peg$parsescalar_func() {
    var s0;

    s0 = peg$parsescalar_time_func();
    if (s0 === peg$FAILED) {
      s0 = peg$parseKW_CURRENT_USER();
      if (s0 === peg$FAILED) {
        s0 = peg$parseKW_USER();
        if (s0 === peg$FAILED) {
          s0 = peg$parseKW_SESSION_USER();
          if (s0 === peg$FAILED) {
            s0 = peg$parseKW_SYSTEM_USER();
          }
        }
      }
    }

    return s0;
  }

  function peg$parsecast_expr() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21;

    s0 = peg$currPos;
    s1 = peg$parseKW_CAST();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseLPAREN();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseexpr();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseKW_AS();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsedata_type();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parseRPAREN();
                        if (s11 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c479(s1, s5, s9);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_CAST();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseLPAREN();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseexpr();
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseKW_AS();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse__();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parseKW_DECIMAL();
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parse__();
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parseLPAREN();
                          if (s11 !== peg$FAILED) {
                            s12 = peg$parse__();
                            if (s12 !== peg$FAILED) {
                              s13 = peg$parseint();
                              if (s13 !== peg$FAILED) {
                                s14 = peg$parse__();
                                if (s14 !== peg$FAILED) {
                                  s15 = peg$parseRPAREN();
                                  if (s15 !== peg$FAILED) {
                                    s16 = peg$parse__();
                                    if (s16 !== peg$FAILED) {
                                      s17 = peg$parseRPAREN();
                                      if (s17 !== peg$FAILED) {
                                        peg$savedPos = s0;
                                        s1 = peg$c480(s1, s5, s13);
                                        s0 = s1;
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                      }
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$FAILED;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseKW_CAST();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseLPAREN();
            if (s3 !== peg$FAILED) {
              s4 = peg$parse__();
              if (s4 !== peg$FAILED) {
                s5 = peg$parseexpr();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parseKW_AS();
                    if (s7 !== peg$FAILED) {
                      s8 = peg$parse__();
                      if (s8 !== peg$FAILED) {
                        s9 = peg$parseKW_DECIMAL();
                        if (s9 !== peg$FAILED) {
                          s10 = peg$parse__();
                          if (s10 !== peg$FAILED) {
                            s11 = peg$parseLPAREN();
                            if (s11 !== peg$FAILED) {
                              s12 = peg$parse__();
                              if (s12 !== peg$FAILED) {
                                s13 = peg$parseint();
                                if (s13 !== peg$FAILED) {
                                  s14 = peg$parse__();
                                  if (s14 !== peg$FAILED) {
                                    s15 = peg$parseCOMMA();
                                    if (s15 !== peg$FAILED) {
                                      s16 = peg$parse__();
                                      if (s16 !== peg$FAILED) {
                                        s17 = peg$parseint();
                                        if (s17 !== peg$FAILED) {
                                          s18 = peg$parse__();
                                          if (s18 !== peg$FAILED) {
                                            s19 = peg$parseRPAREN();
                                            if (s19 !== peg$FAILED) {
                                              s20 = peg$parse__();
                                              if (s20 !== peg$FAILED) {
                                                s21 = peg$parseRPAREN();
                                                if (s21 !== peg$FAILED) {
                                                  peg$savedPos = s0;
                                                  s1 = peg$c481(s1, s5, s13, s17);
                                                  s0 = s1;
                                                } else {
                                                  peg$currPos = s0;
                                                  s0 = peg$FAILED;
                                                }
                                              } else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                              }
                                            } else {
                                              peg$currPos = s0;
                                              s0 = peg$FAILED;
                                            }
                                          } else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                          }
                                        } else {
                                          peg$currPos = s0;
                                          s0 = peg$FAILED;
                                        }
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                      }
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$FAILED;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseKW_CAST();
          if (s1 !== peg$FAILED) {
            s2 = peg$parse__();
            if (s2 !== peg$FAILED) {
              s3 = peg$parseLPAREN();
              if (s3 !== peg$FAILED) {
                s4 = peg$parse__();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseexpr();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parseKW_AS();
                      if (s7 !== peg$FAILED) {
                        s8 = peg$parse__();
                        if (s8 !== peg$FAILED) {
                          s9 = peg$parsesignedness();
                          if (s9 !== peg$FAILED) {
                            s10 = peg$parse__();
                            if (s10 !== peg$FAILED) {
                              s11 = peg$parseKW_INTEGER();
                              if (s11 === peg$FAILED) {
                                s11 = null;
                              }
                              if (s11 !== peg$FAILED) {
                                s12 = peg$parse__();
                                if (s12 !== peg$FAILED) {
                                  s13 = peg$parseRPAREN();
                                  if (s13 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$c482(s1, s5, s9, s11);
                                    s0 = s1;
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
      }
    }

    return s0;
  }

  function peg$parsesignedness() {
    var s0;

    s0 = peg$parseKW_SIGNED();
    if (s0 === peg$FAILED) {
      s0 = peg$parseKW_UNSIGNED();
    }

    return s0;
  }

  function peg$parseliteral() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c249) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c250); }
    }
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseliteral_string();
        if (s3 !== peg$FAILED) {
          s4 = peg$currPos;
          s5 = peg$parse__();
          if (s5 !== peg$FAILED) {
            s6 = peg$parsecollate_expr();
            if (s6 !== peg$FAILED) {
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c483(s1, s3, s4);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseliteral_numeric();
      if (s0 === peg$FAILED) {
        s0 = peg$parseliteral_bool();
        if (s0 === peg$FAILED) {
          s0 = peg$parseliteral_null();
          if (s0 === peg$FAILED) {
            s0 = peg$parseliteral_datetime();
          }
        }
      }
    }

    return s0;
  }

  function peg$parseliteral_list() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseliteral();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseCOMMA();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseliteral();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseliteral();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c62(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseliteral_null() {
    var s0, s1;

    s0 = peg$currPos;
    s1 = peg$parseKW_NULL();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c484();
    }
    s0 = s1;

    return s0;
  }

  function peg$parseliteral_not_null() {
    var s0, s1;

    s0 = peg$currPos;
    s1 = peg$parseKW_NOT_NULL();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c485();
    }
    s0 = s1;

    return s0;
  }

  function peg$parseliteral_bool() {
    var s0, s1;

    s0 = peg$currPos;
    s1 = peg$parseKW_TRUE();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c486();
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_FALSE();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c487();
      }
      s0 = s1;
    }

    return s0;
  }

  function peg$parseliteral_string() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c488) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c489); }
    }
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 1).toLowerCase() === peg$c490) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c491); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 39) {
            s5 = peg$c216;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c217); }
          }
          if (s5 !== peg$FAILED) {
            s6 = [];
            if (peg$c492.test(input.charAt(peg$currPos))) {
              s7 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c493); }
            }
            while (s7 !== peg$FAILED) {
              s6.push(s7);
              if (peg$c492.test(input.charAt(peg$currPos))) {
                s7 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c493); }
              }
            }
            if (s6 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 39) {
                s7 = peg$c216;
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c217); }
              }
              if (s7 !== peg$FAILED) {
                s5 = [s5, s6, s7];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c494(s1, s3, s4);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7).toLowerCase() === peg$c488) {
        s1 = input.substr(peg$currPos, 7);
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c489); }
      }
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 1).toLowerCase() === peg$c495) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c496); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 39) {
              s5 = peg$c216;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c217); }
            }
            if (s5 !== peg$FAILED) {
              s6 = [];
              if (peg$c492.test(input.charAt(peg$currPos))) {
                s7 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c493); }
              }
              while (s7 !== peg$FAILED) {
                s6.push(s7);
                if (peg$c492.test(input.charAt(peg$currPos))) {
                  s7 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c493); }
                }
              }
              if (s6 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 39) {
                  s7 = peg$c216;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c217); }
                }
                if (s7 !== peg$FAILED) {
                  s5 = [s5, s6, s7];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c497(s1, s3, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7).toLowerCase() === peg$c488) {
          s1 = input.substr(peg$currPos, 7);
          peg$currPos += 7;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c489); }
        }
        if (s1 === peg$FAILED) {
          s1 = null;
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c498) {
              s3 = peg$c498;
              peg$currPos += 2;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c499); }
            }
            if (s3 !== peg$FAILED) {
              s4 = [];
              if (peg$c492.test(input.charAt(peg$currPos))) {
                s5 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c493); }
              }
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                if (peg$c492.test(input.charAt(peg$currPos))) {
                  s5 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c493); }
                }
              }
              if (s4 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c500(s1, s3, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 39) {
            s2 = peg$c216;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c217); }
          }
          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parsesingle_char();
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parsesingle_char();
            }
            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 39) {
                s4 = peg$c216;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c217); }
              }
              if (s4 !== peg$FAILED) {
                s2 = [s2, s3, s4];
                s1 = s2;
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse__();
            if (s2 !== peg$FAILED) {
              s3 = peg$currPos;
              peg$silentFails++;
              s4 = peg$parseDOT();
              if (s4 === peg$FAILED) {
                s4 = peg$parseLPAREN();
              }
              peg$silentFails--;
              if (s4 === peg$FAILED) {
                s3 = void 0;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c501(s1);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 34) {
              s2 = peg$c442;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c443); }
            }
            if (s2 !== peg$FAILED) {
              s3 = [];
              s4 = peg$parsesingle_quote_char();
              while (s4 !== peg$FAILED) {
                s3.push(s4);
                s4 = peg$parsesingle_quote_char();
              }
              if (s3 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 34) {
                  s4 = peg$c442;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c443); }
                }
                if (s4 !== peg$FAILED) {
                  s2 = [s2, s3, s4];
                  s1 = s2;
                } else {
                  peg$currPos = s1;
                  s1 = peg$FAILED;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parse__();
              if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                peg$silentFails++;
                s4 = peg$parseDOT();
                if (s4 === peg$FAILED) {
                  s4 = peg$parseLPAREN();
                }
                peg$silentFails--;
                if (s4 === peg$FAILED) {
                  s3 = void 0;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c502(s1);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseliteral_datetime() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = peg$parseKW_TIME();
    if (s1 === peg$FAILED) {
      s1 = peg$parseKW_DATE();
      if (s1 === peg$FAILED) {
        s1 = peg$parseKW_TIMESTAMP();
        if (s1 === peg$FAILED) {
          s1 = peg$parseKW_DATETIME();
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 39) {
          s4 = peg$c216;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c217); }
        }
        if (s4 !== peg$FAILED) {
          s5 = [];
          s6 = peg$parsesingle_char();
          while (s6 !== peg$FAILED) {
            s5.push(s6);
            s6 = peg$parsesingle_char();
          }
          if (s5 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 39) {
              s6 = peg$c216;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c217); }
            }
            if (s6 !== peg$FAILED) {
              s4 = [s4, s5, s6];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c503(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_TIME();
      if (s1 === peg$FAILED) {
        s1 = peg$parseKW_DATE();
        if (s1 === peg$FAILED) {
          s1 = peg$parseKW_TIMESTAMP();
          if (s1 === peg$FAILED) {
            s1 = peg$parseKW_DATETIME();
          }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 34) {
            s4 = peg$c442;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c443); }
          }
          if (s4 !== peg$FAILED) {
            s5 = [];
            s6 = peg$parsesingle_quote_char();
            while (s6 !== peg$FAILED) {
              s5.push(s6);
              s6 = peg$parsesingle_quote_char();
            }
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 34) {
                s6 = peg$c442;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c443); }
              }
              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c503(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parsesingle_quote_char() {
    var s0;

    if (peg$c504.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c505); }
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseescape_char();
    }

    return s0;
  }

  function peg$parsesingle_char() {
    var s0;

    if (peg$c506.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c507); }
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseescape_char();
    }

    return s0;
  }

  function peg$parseescape_char() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c508) {
      s1 = peg$c508;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c509); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c510();
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c511) {
        s1 = peg$c511;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c512); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c513();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c514) {
          s1 = peg$c514;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c515); }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c516();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c517) {
            s1 = peg$c517;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c518); }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c519();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c520) {
              s1 = peg$c520;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c521); }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c522();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c523) {
                s1 = peg$c523;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c524); }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c525();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c526) {
                  s1 = peg$c526;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c527); }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c528();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 2) === peg$c529) {
                    s1 = peg$c529;
                    peg$currPos += 2;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c530); }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c531();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 2) === peg$c532) {
                      s1 = peg$c532;
                      peg$currPos += 2;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c533); }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c534();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.substr(peg$currPos, 2) === peg$c535) {
                        s1 = peg$c535;
                        peg$currPos += 2;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c536); }
                      }
                      if (s1 !== peg$FAILED) {
                        s2 = peg$parsehexDigit();
                        if (s2 !== peg$FAILED) {
                          s3 = peg$parsehexDigit();
                          if (s3 !== peg$FAILED) {
                            s4 = peg$parsehexDigit();
                            if (s4 !== peg$FAILED) {
                              s5 = peg$parsehexDigit();
                              if (s5 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$c537(s2, s3, s4, s5);
                                s0 = s1;
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 92) {
                          s1 = peg$c538;
                          peg$currPos++;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c539); }
                        }
                        if (s1 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c540();
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          if (input.substr(peg$currPos, 2) === peg$c541) {
                            s1 = peg$c541;
                            peg$currPos += 2;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c542); }
                          }
                          if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c543();
                          }
                          s0 = s1;
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.substr(peg$currPos, 2) === peg$c544) {
                              s1 = peg$c544;
                              peg$currPos += 2;
                            } else {
                              s1 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c545); }
                            }
                            if (s1 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$c546();
                            }
                            s0 = s1;
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              if (input.substr(peg$currPos, 2) === peg$c547) {
                                s1 = peg$c547;
                                peg$currPos += 2;
                              } else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c548); }
                              }
                              if (s1 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$c549();
                              }
                              s0 = s1;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseliteral_numeric() {
    var s0, s1;

    s0 = peg$currPos;
    s1 = peg$parsenumber();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c552(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parsenumber() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseint();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsefrac();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseexp();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c553(s1, s2, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseint();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsefrac();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c554(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseint();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseexp();
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c555(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseint();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c556(s1);
          }
          s0 = s1;
        }
      }
    }

    return s0;
  }

  function peg$parseint() {
    var s0, s1, s2;

    s0 = peg$parsedigits();
    if (s0 === peg$FAILED) {
      s0 = peg$parsedigit();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 45) {
          s1 = peg$c399;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c400); }
        }
        if (s1 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 43) {
            s1 = peg$c397;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c398); }
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parsedigits();
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c557(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 45) {
            s1 = peg$c399;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c400); }
          }
          if (s1 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 43) {
              s1 = peg$c397;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c398); }
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parsedigit();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c558(s1, s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
      }
    }

    return s0;
  }

  function peg$parsefrac() {
    var s0, s1, s2;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 46) {
      s1 = peg$c559;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c560); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsedigits();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c561(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseexp() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parsee();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsedigits();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c562(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsedigits() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parsedigit();
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsedigit();
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c563(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parsedigit() {
    var s0;

    if (peg$c413.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c414); }
    }

    return s0;
  }

  function peg$parsehexDigit() {
    var s0;

    if (peg$c564.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c565); }
    }

    return s0;
  }

  function peg$parsee() {
    var s0, s1, s2;

    s0 = peg$currPos;
    if (peg$c566.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c567); }
    }
    if (s1 !== peg$FAILED) {
      if (peg$c568.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c569); }
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c570(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_ANALYZE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c571) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c572); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c573();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_ATTACH() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c574) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c575); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c576();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_NULL() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c577) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c578); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_DEFAULT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c95) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c96); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_NOT_NULL() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8).toLowerCase() === peg$c579) {
      s1 = input.substr(peg$currPos, 8);
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c580); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_TRUE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c581) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c582); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_TO() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2).toLowerCase() === peg$c583) {
      s1 = input.substr(peg$currPos, 2);
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c584); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_FALSE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c585) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c586); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_SHOW() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c587) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c588); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_DROP() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c589) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c590); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c591();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_USE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c592) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c593); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_ALTER() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c594) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c595); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_SELECT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c596) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c597); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_UPDATE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c598) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c599); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_CREATE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c600) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c601); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_TEMPORARY() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 9).toLowerCase() === peg$c602) {
      s1 = input.substr(peg$currPos, 9);
      peg$currPos += 9;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c603); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_TEMP() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c604) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c605); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_DELETE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c606) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c607); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_INSERT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c608) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c609); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_RECURSIVE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 9).toLowerCase() === peg$c610) {
      s1 = input.substr(peg$currPos, 9);
      peg$currPos += 9;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c611); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_REPLACE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c343) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c344); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_RENAME() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c612) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c613); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_RETURNING() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 9).toLowerCase() === peg$c614) {
      s1 = input.substr(peg$currPos, 9);
      peg$currPos += 9;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c615); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c616();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_IGNORE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c341) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c342); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_PARTITION() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 9).toLowerCase() === peg$c619) {
      s1 = input.substr(peg$currPos, 9);
      peg$currPos += 9;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c620); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c621();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_INTO() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c622) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c623); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_FROM() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c624) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c625); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_SET() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c192) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c193); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c626();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_UNLOCK() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c627) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c628); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_LOCK() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c144) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c145); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_AS() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2).toLowerCase() === peg$c629) {
      s1 = input.substr(peg$currPos, 2);
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c630); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_TABLE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c631) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c632); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c633();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_TABLES() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c634) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c635); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c636();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_DATABASE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8).toLowerCase() === peg$c637) {
      s1 = input.substr(peg$currPos, 8);
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c638); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c639();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_SCHEMA() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c640) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c641); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c642();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_COLLATE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c197) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c198); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c643();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_ON() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2).toLowerCase() === peg$c20) {
      s1 = input.substr(peg$currPos, 2);
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c21); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_LEFT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c644) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c645); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_INNER() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c646) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c647); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_JOIN() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c648) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c649); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_OUTER() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c650) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c651); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_OVER() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c652) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c653); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_UNION() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c654) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c655); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_VALUES() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c656) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c657); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_USING() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c658) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c659); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_WHERE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c660) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c661); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_WITH() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c294) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c295); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_GROUP() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c662) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c663); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_BY() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2).toLowerCase() === peg$c664) {
      s1 = input.substr(peg$currPos, 2);
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c665); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_ORDER() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c666) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c667); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_HAVING() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c668) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c669); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_LIMIT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c670) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c671); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_OFFSET() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c672) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c673); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c674();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_ASC() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c675) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c676); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c677();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_DESC() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c678) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c679); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c680();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_DESCRIBE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8).toLowerCase() === peg$c681) {
      s1 = input.substr(peg$currPos, 8);
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c682); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c683();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_ALL() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c684) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c685); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c686();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_DISTINCT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8).toLowerCase() === peg$c687) {
      s1 = input.substr(peg$currPos, 8);
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c688); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c689();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_BETWEEN() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c690) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c691); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c692();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_IN() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2).toLowerCase() === peg$c693) {
      s1 = input.substr(peg$currPos, 2);
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c694); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c695();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_IS() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2).toLowerCase() === peg$c696) {
      s1 = input.substr(peg$currPos, 2);
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c697); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c698();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_LIKE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c699) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c700); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c701();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_RLIKE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c702) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c703); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c704();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_REGEXP() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c705) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c706); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c707();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_EXISTS() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c9) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c708); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c709();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_NOT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c158) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c159); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c710();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_AND() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c711) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c712); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c713();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_OR() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2).toLowerCase() === peg$c714) {
      s1 = input.substr(peg$currPos, 2);
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c715); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c716();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_COUNT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c717) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c718); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c719();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_GROUP_CONCAT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 12).toLowerCase() === peg$c720) {
      s1 = input.substr(peg$currPos, 12);
      peg$currPos += 12;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c721); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c722();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_MAX() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c723) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c724); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c725();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_MIN() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c726) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c727); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c728();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_SUM() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c729) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c730); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c731();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_AVG() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c732) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c733); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c734();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_CALL() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c735) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c736); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c737();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_CASE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c738) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c739); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_WHEN() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c740) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c741); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_THEN() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c742) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c743); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_ELSE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c744) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c745); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_END() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c30) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c31); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_CAST() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c746) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c747); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c748();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_BIT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c749) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c750); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c751();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_CHAR() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c752) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c753); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c754();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_VARCHAR() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c755) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c756); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c757();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_NUMERIC() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c758) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c759); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c760();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_DECIMAL() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c761) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c762); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c763();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_SIGNED() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c764) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c765); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c766();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_UNSIGNED() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8).toLowerCase() === peg$c767) {
      s1 = input.substr(peg$currPos, 8);
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c768); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c769();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_INT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c770) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c771); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c772();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_ZEROFILL() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8).toLowerCase() === peg$c773) {
      s1 = input.substr(peg$currPos, 8);
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c774); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c775();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_INTEGER() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c776) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c777); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c778();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_JSON() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c779) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c780); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c781();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_SMALLINT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8).toLowerCase() === peg$c782) {
      s1 = input.substr(peg$currPos, 8);
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c783); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c784();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_TINYINT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c785) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c786); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c787();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_TINYTEXT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8).toLowerCase() === peg$c788) {
      s1 = input.substr(peg$currPos, 8);
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c789); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c790();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_TEXT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c791) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c792); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c793();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_MEDIUMTEXT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 10).toLowerCase() === peg$c794) {
      s1 = input.substr(peg$currPos, 10);
      peg$currPos += 10;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c795); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c796();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_LONGTEXT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8).toLowerCase() === peg$c797) {
      s1 = input.substr(peg$currPos, 8);
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c798); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c799();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_BIGINT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c800) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c801); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c802();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_ENUM() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c803) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c804); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c805();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_FLOAT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c806) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c807); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c808();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_DOUBLE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c809) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c810); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c811();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_REAL() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c812) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c813); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c814();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_DATE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c815) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c816); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c817();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_DATETIME() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8).toLowerCase() === peg$c818) {
      s1 = input.substr(peg$currPos, 8);
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c819); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c820();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_TIME() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c821) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c822); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c823();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_TIMESTAMP() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 9).toLowerCase() === peg$c824) {
      s1 = input.substr(peg$currPos, 9);
      peg$currPos += 9;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c825); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c826();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_TRUNCATE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8).toLowerCase() === peg$c827) {
      s1 = input.substr(peg$currPos, 8);
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c828); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c829();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_USER() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c830) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c831); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c832();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_CURRENT_DATE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 12).toLowerCase() === peg$c833) {
      s1 = input.substr(peg$currPos, 12);
      peg$currPos += 12;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c834); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c835();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_INTERVAL() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8).toLowerCase() === peg$c839) {
      s1 = input.substr(peg$currPos, 8);
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c840); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c841();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_UNIT_YEAR() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c842) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c843); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c844();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_UNIT_MONTH() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c845) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c846); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c847();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_UNIT_DAY() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c848) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c849); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c850();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_UNIT_HOUR() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c851) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c852); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c853();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_UNIT_MINUTE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c854) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c855); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c856();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_UNIT_SECOND() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c857) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c858); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c859();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_CURRENT_TIME() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 12).toLowerCase() === peg$c860) {
      s1 = input.substr(peg$currPos, 12);
      peg$currPos += 12;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c861); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c862();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_CURRENT_TIMESTAMP() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 17).toLowerCase() === peg$c863) {
      s1 = input.substr(peg$currPos, 17);
      peg$currPos += 17;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c864); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c865();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_CURRENT_USER() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 12).toLowerCase() === peg$c866) {
      s1 = input.substr(peg$currPos, 12);
      peg$currPos += 12;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c867); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c868();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_SESSION_USER() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 12).toLowerCase() === peg$c869) {
      s1 = input.substr(peg$currPos, 12);
      peg$currPos += 12;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c870); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c871();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_SYSTEM_USER() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 11).toLowerCase() === peg$c872) {
      s1 = input.substr(peg$currPos, 11);
      peg$currPos += 11;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c873); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c874();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_GLOBAL() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c875) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c876); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c877();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_SESSION() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c878) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c879); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c880();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_LOCAL() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c49) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c50); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c881();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_PERSIST() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c882) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c883); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c884();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_PERSIST_ONLY() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 12).toLowerCase() === peg$c885) {
      s1 = input.substr(peg$currPos, 12);
      peg$currPos += 12;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c886); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c887();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_VIEW() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c888) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c889); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c890();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_VAR__PRE_AT() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 64) {
      s0 = peg$c891;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c892); }
    }

    return s0;
  }

  function peg$parseKW_VAR__PRE_AT_AT() {
    var s0;

    if (input.substr(peg$currPos, 2) === peg$c893) {
      s0 = peg$c893;
      peg$currPos += 2;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c894); }
    }

    return s0;
  }

  function peg$parseKW_VAR_PRE_DOLLAR() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 36) {
      s0 = peg$c895;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c896); }
    }

    return s0;
  }

  function peg$parseKW_VAR_PRE() {
    var s0;

    s0 = peg$parseKW_VAR__PRE_AT_AT();
    if (s0 === peg$FAILED) {
      s0 = peg$parseKW_VAR__PRE_AT();
      if (s0 === peg$FAILED) {
        s0 = peg$parseKW_VAR_PRE_DOLLAR();
      }
    }

    return s0;
  }

  function peg$parseKW_RETURN() {
    var s0;

    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c897) {
      s0 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c898); }
    }

    return s0;
  }

  function peg$parseKW_ASSIGN() {
    var s0;

    if (input.substr(peg$currPos, 2) === peg$c899) {
      s0 = peg$c899;
      peg$currPos += 2;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c900); }
    }

    return s0;
  }

  function peg$parseKW_ASSIGIN_EQUAL() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 61) {
      s0 = peg$c324;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c325); }
    }

    return s0;
  }

  function peg$parseKW_DUAL() {
    var s0;

    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c901) {
      s0 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c902); }
    }

    return s0;
  }

  function peg$parseKW_ADD() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c903) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c904); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c905();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_COLUMN() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c906) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c907); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c908();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_INDEX() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c909) {
      s1 = input.substr(peg$currPos, 5);
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c910); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c911();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_MODIFY() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c912) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c913); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c914();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_KEY() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c72) {
      s1 = input.substr(peg$currPos, 3);
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c73); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c915();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_FULLTEXT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8).toLowerCase() === peg$c916) {
      s1 = input.substr(peg$currPos, 8);
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c917); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c918();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_SPATIAL() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c919) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c920); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c921();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_UNIQUE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c70) {
      s1 = input.substr(peg$currPos, 6);
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c71); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c922();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_KEY_BLOCK_SIZE() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 14).toLowerCase() === peg$c202) {
      s1 = input.substr(peg$currPos, 14);
      peg$currPos += 14;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c203); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c923();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_COMMENT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c924) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c925); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c926();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_CONSTRAINT() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 10).toLowerCase() === peg$c927) {
      s1 = input.substr(peg$currPos, 10);
      peg$currPos += 10;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c928); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c929();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseKW_REFERENCES() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 10).toLowerCase() === peg$c930) {
      s1 = input.substr(peg$currPos, 10);
      peg$currPos += 10;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c931); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseident_start();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c932();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseOPT_SQL_CALC_FOUND_ROWS() {
    var s0;

    if (input.substr(peg$currPos, 19).toLowerCase() === peg$c933) {
      s0 = input.substr(peg$currPos, 19);
      peg$currPos += 19;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c934); }
    }

    return s0;
  }

  function peg$parseOPT_SQL_CACHE() {
    var s0;

    if (input.substr(peg$currPos, 9).toLowerCase() === peg$c935) {
      s0 = input.substr(peg$currPos, 9);
      peg$currPos += 9;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c936); }
    }

    return s0;
  }

  function peg$parseOPT_SQL_NO_CACHE() {
    var s0;

    if (input.substr(peg$currPos, 12).toLowerCase() === peg$c937) {
      s0 = input.substr(peg$currPos, 12);
      peg$currPos += 12;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c938); }
    }

    return s0;
  }

  function peg$parseOPT_SQL_SMALL_RESULT() {
    var s0;

    if (input.substr(peg$currPos, 16).toLowerCase() === peg$c939) {
      s0 = input.substr(peg$currPos, 16);
      peg$currPos += 16;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c940); }
    }

    return s0;
  }

  function peg$parseOPT_SQL_BIG_RESULT() {
    var s0;

    if (input.substr(peg$currPos, 14).toLowerCase() === peg$c941) {
      s0 = input.substr(peg$currPos, 14);
      peg$currPos += 14;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c942); }
    }

    return s0;
  }

  function peg$parseOPT_SQL_BUFFER_RESULT() {
    var s0;

    if (input.substr(peg$currPos, 17).toLowerCase() === peg$c943) {
      s0 = input.substr(peg$currPos, 17);
      peg$currPos += 17;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c944); }
    }

    return s0;
  }

  function peg$parseDOT() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 46) {
      s0 = peg$c559;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c560); }
    }

    return s0;
  }

  function peg$parseCOMMA() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 44) {
      s0 = peg$c945;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c946); }
    }

    return s0;
  }

  function peg$parseSTAR() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 42) {
      s0 = peg$c402;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c403); }
    }

    return s0;
  }

  function peg$parseLPAREN() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 40) {
      s0 = peg$c270;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c271); }
    }

    return s0;
  }

  function peg$parseRPAREN() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 41) {
      s0 = peg$c272;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c273); }
    }

    return s0;
  }

  function peg$parseLBRAKE() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 91) {
      s0 = peg$c947;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c948); }
    }

    return s0;
  }

  function peg$parseRBRAKE() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 93) {
      s0 = peg$c949;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c950); }
    }

    return s0;
  }

  function peg$parseSEMICOLON() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 59) {
      s0 = peg$c951;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c952); }
    }

    return s0;
  }

  function peg$parseSINGLE_ARROW() {
    var s0;

    if (input.substr(peg$currPos, 2) === peg$c953) {
      s0 = peg$c953;
      peg$currPos += 2;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c954); }
    }

    return s0;
  }

  function peg$parseDOUBLE_ARROW() {
    var s0;

    if (input.substr(peg$currPos, 3) === peg$c955) {
      s0 = peg$c955;
      peg$currPos += 3;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c956); }
    }

    return s0;
  }

  function peg$parseOPERATOR_CONCATENATION() {
    var s0;

    if (input.substr(peg$currPos, 2) === peg$c408) {
      s0 = peg$c408;
      peg$currPos += 2;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c409); }
    }

    return s0;
  }

  function peg$parseOPERATOR_AND() {
    var s0;

    if (input.substr(peg$currPos, 2) === peg$c957) {
      s0 = peg$c957;
      peg$currPos += 2;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c958); }
    }

    return s0;
  }

  function peg$parseLOGIC_OPERATOR() {
    var s0;

    s0 = peg$parseOPERATOR_CONCATENATION();
    if (s0 === peg$FAILED) {
      s0 = peg$parseOPERATOR_AND();
    }

    return s0;
  }

  function peg$parse__() {
    var s0, s1;

    s0 = [];
    s1 = peg$parsewhitespace();
    if (s1 === peg$FAILED) {
      s1 = peg$parsecomment();
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      s1 = peg$parsewhitespace();
      if (s1 === peg$FAILED) {
        s1 = peg$parsecomment();
      }
    }

    return s0;
  }

  function peg$parse___() {
    var s0, s1;

    s0 = [];
    s1 = peg$parsewhitespace();
    if (s1 === peg$FAILED) {
      s1 = peg$parsecomment();
    }
    if (s1 !== peg$FAILED) {
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parsewhitespace();
        if (s1 === peg$FAILED) {
          s1 = peg$parsecomment();
        }
      }
    } else {
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecomment() {
    var s0;

    s0 = peg$parseblock_comment();
    if (s0 === peg$FAILED) {
      s0 = peg$parseline_comment();
      if (s0 === peg$FAILED) {
        s0 = peg$parsepound_sign_comment();
      }
    }

    return s0;
  }

  function peg$parseblock_comment() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c959) {
      s1 = peg$c959;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c960); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      if (input.substr(peg$currPos, 2) === peg$c961) {
        s5 = peg$c961;
        peg$currPos += 2;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c962); }
      }
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsechar();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        if (input.substr(peg$currPos, 2) === peg$c961) {
          s5 = peg$c961;
          peg$currPos += 2;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c962); }
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsechar();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c961) {
          s3 = peg$c961;
          peg$currPos += 2;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c962); }
        }
        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseline_comment() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c963) {
      s1 = peg$c963;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c964); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = peg$parseEOL();
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsechar();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$parseEOL();
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsechar();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsepound_sign_comment() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 35) {
      s1 = peg$c965;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c966); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = peg$parseEOL();
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsechar();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$parseEOL();
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsechar();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsekeyword_comment() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseKW_COMMENT();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_ASSIGIN_EQUAL();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseliteral_string();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c967(s1, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsechar() {
    var s0;

    if (input.length > peg$currPos) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c968); }
    }

    return s0;
  }

  function peg$parseinterval_unit() {
    var s0;

    s0 = peg$parseKW_UNIT_YEAR();
    if (s0 === peg$FAILED) {
      s0 = peg$parseKW_UNIT_MONTH();
      if (s0 === peg$FAILED) {
        s0 = peg$parseKW_UNIT_DAY();
        if (s0 === peg$FAILED) {
          s0 = peg$parseKW_UNIT_HOUR();
          if (s0 === peg$FAILED) {
            s0 = peg$parseKW_UNIT_MINUTE();
            if (s0 === peg$FAILED) {
              s0 = peg$parseKW_UNIT_SECOND();
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parsewhitespace() {
    var s0;

    if (peg$c969.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c970); }
    }

    return s0;
  }

  function peg$parseEOL() {
    var s0, s1;

    s0 = peg$parseEOF();
    if (s0 === peg$FAILED) {
      s0 = [];
      if (peg$c550.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c551); }
      }
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          if (peg$c550.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c551); }
          }
        }
      } else {
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parseEOF() {
    var s0, s1;

    s0 = peg$currPos;
    peg$silentFails++;
    if (input.length > peg$currPos) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c968); }
    }
    peg$silentFails--;
    if (s1 === peg$FAILED) {
      s0 = void 0;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseproc_stmts() {
    var s0, s1;

    s0 = [];
    s1 = peg$parseproc_stmt();
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      s1 = peg$parseproc_stmt();
    }

    return s0;
  }

  function peg$parseproc_stmt() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    peg$savedPos = peg$currPos;
    s1 = peg$c971();
    if (s1) {
      s1 = void 0;
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseassign_stmt();
        if (s3 === peg$FAILED) {
          s3 = peg$parsereturn_stmt();
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c972(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseassign_stmt_list() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseassign_stmt();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseCOMMA();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseassign_stmt();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseassign_stmt();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c246(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseassign_stmt() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parsevar_decl();
    if (s1 === peg$FAILED) {
      s1 = peg$parsewithout_prefix_var_decl();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_ASSIGN();
        if (s3 === peg$FAILED) {
          s3 = peg$parseKW_ASSIGIN_EQUAL();
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseproc_expr();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c973(s1, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsereturn_stmt() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_RETURN();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseproc_expr();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c974(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseproc_expr() {
    var s0;

    s0 = peg$parseselect_stmt();
    if (s0 === peg$FAILED) {
      s0 = peg$parseproc_join();
      if (s0 === peg$FAILED) {
        s0 = peg$parseproc_additive_expr();
        if (s0 === peg$FAILED) {
          s0 = peg$parseproc_array();
        }
      }
    }

    return s0;
  }

  function peg$parseproc_additive_expr() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseproc_multiplicative_expr();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseadditive_operator();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseproc_multiplicative_expr();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseadditive_operator();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseproc_multiplicative_expr();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c360(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseproc_multiplicative_expr() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseproc_primary();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parsemultiplicative_operator();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseproc_primary();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parsemultiplicative_operator();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseproc_primary();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c360(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseproc_join() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parsevar_decl();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsejoin_op();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsevar_decl();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseon_clause();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c975(s1, s3, s5, s7);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseproc_primary() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$parseliteral();
    if (s0 === peg$FAILED) {
      s0 = peg$parsevar_decl();
      if (s0 === peg$FAILED) {
        s0 = peg$parseproc_func_call();
        if (s0 === peg$FAILED) {
          s0 = peg$parseparam();
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseLPAREN();
            if (s1 !== peg$FAILED) {
              s2 = peg$parse__();
              if (s2 !== peg$FAILED) {
                s3 = peg$parseproc_additive_expr();
                if (s3 !== peg$FAILED) {
                  s4 = peg$parse__();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parseRPAREN();
                    if (s5 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c976(s3);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseproc_func_name() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = peg$parseident_without_kw_type();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$parse__();
      if (s3 !== peg$FAILED) {
        s4 = peg$parseDOT();
        if (s4 !== peg$FAILED) {
          s5 = peg$parse__();
          if (s5 !== peg$FAILED) {
            s6 = peg$parseident_without_kw_type();
            if (s6 !== peg$FAILED) {
              s3 = [s3, s4, s5, s6];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c977(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseproc_func_call() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseproc_func_name();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseLPAREN();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseproc_primary_list();
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseRPAREN();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c978(s1, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseproc_func_name();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c979(s1);
      }
      s0 = s1;
    }

    return s0;
  }

  function peg$parseproc_primary_list() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseproc_primary();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseCOMMA();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseproc_primary();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseCOMMA();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseproc_primary();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c62(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseproc_array() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseLBRAKE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseproc_primary_list();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseRBRAKE();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c980(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsevar_decl() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parseKW_VAR_PRE();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsewithout_prefix_var_decl();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c981(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsewithout_prefix_var_decl() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parseident_name();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsemem_chain();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c982(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseliteral_numeric();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c983(s1);
      }
      s0 = s1;
    }

    return s0;
  }

  function peg$parsemem_chain() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 46) {
      s3 = peg$c559;
      peg$currPos++;
    } else {
      s3 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c560); }
    }
    if (s3 !== peg$FAILED) {
      s4 = peg$parseident_name();
      if (s4 !== peg$FAILED) {
        s3 = [s3, s4];
        s2 = s3;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s3 = peg$c559;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c560); }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parseident_name();
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c984(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parsedata_type() {
    var s0;

    s0 = peg$parsecharacter_string_type();
    if (s0 === peg$FAILED) {
      s0 = peg$parsenumeric_type();
      if (s0 === peg$FAILED) {
        s0 = peg$parsedatetime_type();
        if (s0 === peg$FAILED) {
          s0 = peg$parsejson_type();
          if (s0 === peg$FAILED) {
            s0 = peg$parsetext_type();
            if (s0 === peg$FAILED) {
              s0 = peg$parseenum_type();
              if (s0 === peg$FAILED) {
                s0 = peg$parseboolean_type();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseblob_type();
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseblob_type() {
    var s0, s1;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c985) {
      s1 = input.substr(peg$currPos, 4);
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c986); }
    }
    if (s1 === peg$FAILED) {
      if (input.substr(peg$currPos, 8).toLowerCase() === peg$c987) {
        s1 = input.substr(peg$currPos, 8);
        peg$currPos += 8;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c988); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 10).toLowerCase() === peg$c989) {
          s1 = input.substr(peg$currPos, 10);
          peg$currPos += 10;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c990); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 8).toLowerCase() === peg$c991) {
            s1 = input.substr(peg$currPos, 8);
            peg$currPos += 8;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c992); }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c993(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseboolean_type() {
    var s0, s1;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c994) {
      s1 = input.substr(peg$currPos, 7);
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c995); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c996();
    }
    s0 = s1;

    return s0;
  }

  function peg$parsecharacter_string_type() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseKW_CHAR();
    if (s1 === peg$FAILED) {
      s1 = peg$parseKW_VARCHAR();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseLPAREN();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = [];
            if (peg$c413.test(input.charAt(peg$currPos))) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c414); }
            }
            if (s6 !== peg$FAILED) {
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                if (peg$c413.test(input.charAt(peg$currPos))) {
                  s6 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c414); }
                }
              }
            } else {
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseRPAREN();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c997(s1, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_CHAR();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c998(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseKW_VARCHAR();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c998(s1);
        }
        s0 = s1;
      }
    }

    return s0;
  }

  function peg$parsenumeric_type_suffix() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_UNSIGNED();
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseKW_ZEROFILL();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c999(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsenumeric_type() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

    s0 = peg$currPos;
    s1 = peg$parseKW_NUMERIC();
    if (s1 === peg$FAILED) {
      s1 = peg$parseKW_DECIMAL();
      if (s1 === peg$FAILED) {
        s1 = peg$parseKW_INT();
        if (s1 === peg$FAILED) {
          s1 = peg$parseKW_INTEGER();
          if (s1 === peg$FAILED) {
            s1 = peg$parseKW_SMALLINT();
            if (s1 === peg$FAILED) {
              s1 = peg$parseKW_TINYINT();
              if (s1 === peg$FAILED) {
                s1 = peg$parseKW_BIGINT();
                if (s1 === peg$FAILED) {
                  s1 = peg$parseKW_FLOAT();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parseKW_DOUBLE();
                    if (s1 === peg$FAILED) {
                      s1 = peg$parseKW_BIT();
                      if (s1 === peg$FAILED) {
                        s1 = peg$parseKW_REAL();
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseLPAREN();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = [];
            if (peg$c413.test(input.charAt(peg$currPos))) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c414); }
            }
            if (s6 !== peg$FAILED) {
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                if (peg$c413.test(input.charAt(peg$currPos))) {
                  s6 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c414); }
                }
              }
            } else {
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$currPos;
                s8 = peg$parseCOMMA();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parse__();
                  if (s9 !== peg$FAILED) {
                    s10 = [];
                    if (peg$c413.test(input.charAt(peg$currPos))) {
                      s11 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s11 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c414); }
                    }
                    if (s11 !== peg$FAILED) {
                      while (s11 !== peg$FAILED) {
                        s10.push(s11);
                        if (peg$c413.test(input.charAt(peg$currPos))) {
                          s11 = input.charAt(peg$currPos);
                          peg$currPos++;
                        } else {
                          s11 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c414); }
                        }
                      }
                    } else {
                      s10 = peg$FAILED;
                    }
                    if (s10 !== peg$FAILED) {
                      s8 = [s8, s9, s10];
                      s7 = s8;
                    } else {
                      peg$currPos = s7;
                      s7 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s7;
                    s7 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s7;
                  s7 = peg$FAILED;
                }
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseRPAREN();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parse__();
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parsenumeric_type_suffix();
                        if (s11 === peg$FAILED) {
                          s11 = null;
                        }
                        if (s11 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c1000(s1, s5, s7, s11);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_NUMERIC();
      if (s1 === peg$FAILED) {
        s1 = peg$parseKW_DECIMAL();
        if (s1 === peg$FAILED) {
          s1 = peg$parseKW_INT();
          if (s1 === peg$FAILED) {
            s1 = peg$parseKW_INTEGER();
            if (s1 === peg$FAILED) {
              s1 = peg$parseKW_SMALLINT();
              if (s1 === peg$FAILED) {
                s1 = peg$parseKW_TINYINT();
                if (s1 === peg$FAILED) {
                  s1 = peg$parseKW_BIGINT();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parseKW_FLOAT();
                    if (s1 === peg$FAILED) {
                      s1 = peg$parseKW_DOUBLE();
                      if (s1 === peg$FAILED) {
                        s1 = peg$parseKW_REAL();
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c413.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c414); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c413.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c414); }
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsenumeric_type_suffix();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c1001(s1, s2, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseKW_NUMERIC();
        if (s1 === peg$FAILED) {
          s1 = peg$parseKW_DECIMAL();
          if (s1 === peg$FAILED) {
            s1 = peg$parseKW_INT();
            if (s1 === peg$FAILED) {
              s1 = peg$parseKW_INTEGER();
              if (s1 === peg$FAILED) {
                s1 = peg$parseKW_SMALLINT();
                if (s1 === peg$FAILED) {
                  s1 = peg$parseKW_TINYINT();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parseKW_BIGINT();
                    if (s1 === peg$FAILED) {
                      s1 = peg$parseKW_FLOAT();
                      if (s1 === peg$FAILED) {
                        s1 = peg$parseKW_DOUBLE();
                        if (s1 === peg$FAILED) {
                          s1 = peg$parseKW_REAL();
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            s3 = peg$parsenumeric_type_suffix();
            if (s3 === peg$FAILED) {
              s3 = null;
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parse__();
              if (s4 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c1002(s1, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }
    }

    return s0;
  }

  function peg$parsedatetime_type() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    s1 = peg$parseKW_DATE();
    if (s1 === peg$FAILED) {
      s1 = peg$parseKW_DATETIME();
      if (s1 === peg$FAILED) {
        s1 = peg$parseKW_TIME();
        if (s1 === peg$FAILED) {
          s1 = peg$parseKW_TIMESTAMP();
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseLPAREN();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            if (peg$c1003.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c1004); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseRPAREN();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsenumeric_type_suffix();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    if (s9 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c1005(s1, s5);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseKW_DATE();
      if (s1 === peg$FAILED) {
        s1 = peg$parseKW_DATETIME();
        if (s1 === peg$FAILED) {
          s1 = peg$parseKW_TIME();
          if (s1 === peg$FAILED) {
            s1 = peg$parseKW_TIMESTAMP();
          }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c998(s1);
      }
      s0 = s1;
    }

    return s0;
  }

  function peg$parseenum_type() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseKW_ENUM();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsevalue_item();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c1006(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsejson_type() {
    var s0, s1;

    s0 = peg$currPos;
    s1 = peg$parseKW_JSON();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c998(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parsetext_type() {
    var s0, s1;

    s0 = peg$currPos;
    s1 = peg$parseKW_TINYTEXT();
    if (s1 === peg$FAILED) {
      s1 = peg$parseKW_TEXT();
      if (s1 === peg$FAILED) {
        s1 = peg$parseKW_MEDIUMTEXT();
        if (s1 === peg$FAILED) {
          s1 = peg$parseKW_LONGTEXT();
        }
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c1007(s1);
    }
    s0 = s1;

    return s0;
  }


    const reservedMap = {
      'ALTER': true,
      'ALL': true,
      'ADD': true,
      'AND': true,
      'AS': true,
      'ASC': true,

      'BETWEEN': true,
      'BY': true,

      'CALL': true,
      'CASE': true,
      'CREATE': true,
      'CONTAINS': true,
      'COUNT': true,
      'CURRENT_DATE': true,
      'CURRENT_TIME': true,
      'CURRENT_TIMESTAMP': true,
      'CURRENT_USER': true,

      'DELETE': true,
      'DESC': true,
      'DISTINCT': true,
      'DROP': true,

      'ELSE': true,
      'END': true,
      'EXISTS': true,
      'EXPLAIN': true,

      'FALSE': true,
      'FROM': true,
      'FULL': true,

      'GROUP': true,

      'HAVING': true,

      'IN': true,
      'INNER': true,
      'INSERT': true,
      'INTO': true,
      'IS': true,

      'JOIN': true,
      // 'JSON': true,

      // 'KEY': true,

      'LEFT': true,
      'LIKE': true,
      'LIMIT': true,
      'LOW_PRIORITY': true, // for lock table

      'NOT': true,
      'NULL': true,

      'ON': true,
      'OR': true,
      'ORDER': true,
      'OUTER': true,

      'RECURSIVE': true,
      'RENAME': true,
      'READ': true, // for lock table
      'RIGHT': true,

      'SELECT': true,
      'SESSION_USER': true,
      'SET': true,
      'SHOW': true,
      'SYSTEM_USER': true,

      'TABLE': true,
      'THEN': true,
      'TRUE': true,
      'TRUNCATE': true,
      // 'TYPE': true,   // reserved (MySQL)

      'UNION': true,
      'UPDATE': true,
      'USING': true,

      'VALUES': true,

      'WITH': true,
      'WHEN': true,
      'WHERE': true,
      'WRITE': true, // for lock table

      'GLOBAL': true,
      'SESSION': true,
      'LOCAL': true,
      'PERSIST': true,
      'PERSIST_ONLY': true,
    };

    function getLocationObject() {
      return options.includeLocations ? {loc: location()} : {}
    }

    function createUnaryExpr(op, e) {
      return {
        type: 'unary_expr',
        operator: op,
        expr: e
      };
    }

    function createBinaryExpr(op, left, right) {
      return {
        type: 'binary_expr',
        operator: op,
        left: left,
        right: right
      };
    }

    function isBigInt(numberStr) {
      const previousMaxSafe = BigInt$1(Number.MAX_SAFE_INTEGER);
      const num = BigInt$1(numberStr);
      if (num < previousMaxSafe) return false
      return true
    }

    function createList(head, tail, po = 3) {
      const result = [head];
      for (let i = 0; i < tail.length; i++) {
        delete tail[i][po].tableList;
        delete tail[i][po].columnList;
        result.push(tail[i][po]);
      }
      return result;
    }

    function createBinaryExprChain(head, tail) {
      let result = head;
      for (let i = 0; i < tail.length; i++) {
        result = createBinaryExpr(tail[i][1], result, tail[i][3]);
      }
      return result;
    }

    function queryTableAlias(tableName) {
      const alias = tableAlias[tableName];
      if (alias) return alias
      if (tableName) return tableName
      return null
    }

    function columnListTableAlias(columnList) {
      const newColumnsList = new Set();
      const symbolChar = '::';
      for(let column of columnList.keys()) {
        const columnInfo = column.split(symbolChar);
        if (!columnInfo) {
          newColumnsList.add(column);
          break
        }
        if (columnInfo && columnInfo[1]) columnInfo[1] = queryTableAlias(columnInfo[1]);
        newColumnsList.add(columnInfo.join(symbolChar));
      }
      return Array.from(newColumnsList)
    }

    function refreshColumnList(columnList) {
      const columns = columnListTableAlias(columnList);
      columnList.clear();
      columns.forEach(col => columnList.add(col));
    }

    // used for dependency analysis
    let varList = [];

    const tableList = new Set();
    const columnList = new Set();
    const tableAlias = {};


  peg$result = peg$startRuleFunction();

  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length
        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
}

var parsers = _defineProperty({}, "sqlite", peg$parse);

var Parser = /*#__PURE__*/function () {
  function Parser() {
    _classCallCheck(this, Parser);
  }
  return _createClass(Parser, [{
    key: "astify",
    value: function astify(sql) {
      var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_OPT;
      var astInfo = this.parse(sql, opt);
      return astInfo && astInfo.ast;
    }
  }, {
    key: "sqlify",
    value: function sqlify(ast) {
      var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_OPT;
      setParserOpt(opt);
      return astToSQL(ast);
    }
  }, {
    key: "exprToSQL",
    value: function exprToSQL$1(expr) {
      var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_OPT;
      setParserOpt(opt);
      return exprToSQL(expr);
    }
  }, {
    key: "columnsToSQL",
    value: function columnsToSQL(columns, tables) {
      var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_OPT;
      setParserOpt(opt);
      if (!columns || columns === '*') return [];
      var isDual = getDual(tables);
      return columns.map(function (col) {
        return columnToSQL(col, isDual);
      });
    }
  }, {
    key: "parse",
    value: function parse(sql) {
      var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_OPT;
      var _opt$database = opt.database,
        database = _opt$database === void 0 ? "sqlite" : _opt$database;
      setParserOpt(opt);
      var typeCase = database.toLowerCase();
      if (parsers[typeCase]) return parsers[typeCase](opt.trimQuery === false ? sql : sql.trim(), opt.parseOptions || DEFAULT_OPT.parseOptions);
      throw new Error("".concat(database, " is not supported currently"));
    }
  }, {
    key: "whiteListCheck",
    value: function whiteListCheck(sql, whiteList) {
      var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_OPT;
      if (!whiteList || whiteList.length === 0) return;
      var _opt$type = opt.type,
        type = _opt$type === void 0 ? 'table' : _opt$type;
      if (!this["".concat(type, "List")] || typeof this["".concat(type, "List")] !== 'function') throw new Error("".concat(type, " is not valid check mode"));
      var checkFun = this["".concat(type, "List")].bind(this);
      var authorityList = checkFun(sql, opt);
      var hasAuthority = true;
      var denyInfo = '';
      var _iterator = _createForOfIteratorHelper(authorityList),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var authority = _step.value;
          var hasCorrespondingAuthority = false;
          var _iterator2 = _createForOfIteratorHelper(whiteList),
            _step2;
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var whiteAuthority = _step2.value;
              var regex = new RegExp("^".concat(whiteAuthority, "$"), 'i');
              if (regex.test(authority)) {
                hasCorrespondingAuthority = true;
                break;
              }
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
          if (!hasCorrespondingAuthority) {
            denyInfo = authority;
            hasAuthority = false;
            break;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      if (!hasAuthority) throw new Error("authority = '".concat(denyInfo, "' is required in ").concat(type, " whiteList to execute SQL = '").concat(sql, "'"));
    }
  }, {
    key: "tableList",
    value: function tableList(sql, opt) {
      var astInfo = this.parse(sql, opt);
      return astInfo && astInfo.tableList;
    }
  }, {
    key: "columnList",
    value: function columnList(sql, opt) {
      var astInfo = this.parse(sql, opt);
      return astInfo && astInfo.columnList;
    }
  }]);
}();

// for web worker
if ((typeof self === "undefined" ? "undefined" : _typeof(self)) === "object" && self) {
  self.NodeSQLParser = {
    Parser: Parser,
    util: util
  };
}
if (typeof global === "undefined" && (typeof window === "undefined" ? "undefined" : _typeof(window)) === "object" && window) window.global = window;
if ((typeof global === "undefined" ? "undefined" : _typeof(global)) === "object" && global && global.window) {
  global.window.NodeSQLParser = {
    Parser: Parser,
    util: util
  };
}

export { Parser, util };
