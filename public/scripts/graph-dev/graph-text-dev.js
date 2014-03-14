(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],3:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("I:\\stavrosbackup\\DependencyLanguage\\node_modules\\grunt-browserify\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":3,"I:\\stavrosbackup\\DependencyLanguage\\node_modules\\grunt-browserify\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js":2,"inherits":1}],5:[function(require,module,exports){
var ScopeManager = require('./scope-manager').ScopeManager,
    util = require("util"),
    functions = require('./functions'); //Built-in functions

var f = util.format;

var AstValidator = function() {
    this.scopeManager = new ScopeManager();
    _.bindAll(this, "validate", "validateNode", "inferExpressionType");
    this.error = false;
    this.closures = 1;
    this.scopeManager.pushNamespace(functions,'f'); 
};

AstValidator.prototype.validate = function(ast) {
    _.find(ast, this.validateNode);

    if (this.error) {
        console.log("Compile error: " + this.error);
        return false;
    }

    return true;
};

/** Search down an Expr AST to find what type of node is at the bottom left */
AstValidator.prototype.inferExpressionType = function(node) {
    var i = this.inferExpressionType;
    var type = {};

    switch (node._type) {
        case "BracketBlock":
            type = i(node.expr);
        break;

        case "Math":
        case "Comparison":
            type = i(node.left);
        break;

        case "Closure":
            type = node.returnType;
        break;

        case "CallValue":
        case "CallVariable":
            var identifier = this.scopeManager.getIdentifier(node.name);
            type = identifier._inferredType;
        break;

        case "Long":
        case "Double":
        case "String":
            type = node._type;
        break;

        case "ClassInstantiation":
            type = node.name;
        break;

        case "Array":
            type = "raDL";
        break;
    }

    return type;
};

AstValidator.prototype.validateObjectReference = function(name) {
    if (_.isArray(name)) {
        name = name[0];
    }
    var node = this.scopeManager.getIdentifier(name.join('.'));
    return node;
};

AstValidator.prototype.validateNode = function(node) {
    var identifier;
    switch (node._type) {
        case "AssignVariable":
            identifier = this.scopeManager.getIdentifier(node.name);

            if (identifier) {
                if (identifier._type == "AssignValue" || identifier._type == "ValueParameter") {
                    this.error = f("Cannot redeclare value %s as a variable on line %d", node.name, node.lineNo);
                } else if (identifier.type == "Variable" || identifier._type == "VariableParameter") {
                    this.error = f("Cannot redeclare variable %s on line %d", node.name, node.lineNo);
                }
            } else {
                this.scopeManager.pushIdentifier(node.name, node);
                this.validateNode(node.expr);
            }
        break;

        case "AssignValue":
            if (this.scopeManager.hasIdentifier(node.name)) {
                this.error = f("Cannot redeclare %s as a value on line %d", node.name, node.lineNo);
            } else {
                this.scopeManager.pushIdentifier(node.name, node);
                this.validateNode(node.expr);
                node._inferredType = this.inferExpressionType(node.expr);
            }
        break;

        case "SetVariable":
            identifier = this.scopeManager.getIdentifier(node.name);


       /*     if (identifier && (identifier._type == "AssignValue" || identifier._type == "ValueParameter")) {
                this.error = f("Cannot change value %s on line %d", node.name, node.lineNo);
            } else {*/
            if (!identifier)
                this.scopeManager.pushIdentifier(node.name, node);
            this.validateNode(node.expr);
            node._inferredType = this.inferExpressionType(node.expr);
           // }
        break;

        case "CallVariable":
            if (!this.scopeManager.hasIdentifier(node.name[0])) {
                this.scopeManager.pushIdentifier(node.name[0], node);
                node._inferredType = "null";
                //this.error = f("Call to undefined variable %s on line %d", node.name, node.lineNo);
            }
        break;

        case "Closure":
            this.closures += 1;
            this.scopeManager.createScope("closure" + this.closures);

            _.find(node.parameters, this.validateNode);
            _.find(node.body, this.validateNode);

            if (!this.error) {
                this.scopeManager.exitScope();
            }
        break;

        case "ValueParameter":
        case "VariableParameter":
            if (this.scopeManager.hasIdentifier(node.name)) {
                this.error = f("Cannot redefined a parameter with the same name %s on line %d", node.name, node.lineNo);
            } else {
                this.scopeManager.pushIdentifier(node.name, node);
            }
        break;

        case "CallFunction":
            if (this.validateObjectReference(node.name)) {

            } else {
                identifier = this.scopeManager.getIdentifier(node.name[0]);

                if (!identifier) {
                    this.error = f("Call to undefined function %s on line %d", node.name, node.lineNo);
                } else if (identifier.expr._type !== /Closure|Function/) {
                    this.error = f("Cannot call %s as a function or closure on line %d", node.name, node.lineNo);
                }
            }
        break;

        case "BracketBlock":
        case "Print":
            this.validateNode(node.expr);
        break;

        case "Class":
            identifier = this.scopeManager.getIdentifier(node.name);

            if (identifier && identifier._type == "Class") {
                this.error = f("Cannot redefine class %s on line %d", node.name, node.lineNo);
            } else if (this.scopeManager.currentScope.name != "__GLOBAL__") {
                this.error = f("Y U define class %s out of global scope on line %d?", node.name, node.lineNo);
            } else {
                this.scopeManager.pushIdentifier(node.name, node);
                this.scopeManager.createScope(node.name);
                _.find(node.body, this.validateNode);
                this.scopeManager.exitScope();
            }
        break;

        case "ClassInstantiation":

        break;

        case "Comparison":
            if (!this.validateNode(node.left) && !this.validateNode(node.right)) {
                var left = this.inferExpressionType(node.left);
                var right = this.inferExpressionType(node.right);

                if (left._type !== right._type) {
                    this.error = f("Cannot compare type %s to type %s on line %d", left._type, right._type, node.lineNo);
                }
            }
        break;

        case "Math":
            if (!this.validateNode(node.left) && !this.validateNode(node.right)) {
                var left = this.inferExpressionType(node.left);
                var right = this.inferExpressionType(node.right);

                if (node.operator == "+" && left._type == "String" && right._type != "String") {
                    this.error = f("Cannot concatenate %s to String %s... on line %d", right._type, left.value.substring(0, 5), node.lineNo);
                } else if (left._type !== right._type) {
                    this.error = f("Cannot perform mathematical operation '%s' with types %s and %s on line %d (Expected)", node.operator, left._type, right._type, node.lineNo);
                }
            }
        break;

        case "Namespace":
        break;

    }

    if (this.error) {
        return true;
    }

    return false;
};

exports.AstValidator = AstValidator;
exports.validate = function(ast) {
    var validator = new AstValidator();
    return validator.validate(ast);
};

},{"./functions":9,"./scope-manager":17,"util":4}],6:[function(require,module,exports){
var f = require('./functions');

var CalcHandlers = function(that){
    return{
        vars : that,

       getVariableValue: function(name){
            return this.vars[name].setValue ? this.vars[name].setValue : this.vars[name].value
        },

       createArray: function(arr){
            var rv = {};
            for (var i=0; i< arr.length; i++)
                if (arr[i] !== undefined) rv[i] = arr[i];
            return rv;
        },

        callFunction: function(name,args){
          return f[name[1]](args);
        }
    };
    
};

module.exports = CalcHandlers;
},{"./functions":9}],7:[function(require,module,exports){
/* parser generated by jison 0.4.13 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var parser = {trace: function trace(){},
yy: {},
symbols_: {"error":2,"expressions":3,"e":4,"EOF":5,"+":6,"-":7,"*":8,"/":9,"^":10,"!":11,"%":12,"(":13,")":14,"NUMBER":15,"BOOLEAN":16,"E":17,"PI":18,"variablecall":19,"STRING":20,"{":21,"csv":22,"}":23,",":24,"objectref":25,"arguments":26,"IDENTIFIER":27,".":28,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:"+",7:"-",8:"*",9:"/",10:"^",11:"!",12:"%",13:"(",14:")",15:"NUMBER",16:"BOOLEAN",17:"E",18:"PI",20:"STRING",21:"{",23:"}",24:",",27:"IDENTIFIER",28:"."},
productions_: [0,[3,2],[4,3],[4,3],[4,3],[4,3],[4,3],[4,2],[4,2],[4,2],[4,3],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,3],[22,1],[22,3],[19,3],[19,4],[19,1],[25,1],[25,3],[26,1],[26,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */
/**/) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1: typeof console !== 'undefined' ? console.log($$[$0-1]) : print($$[$0-1]);
          return $$[$0-1]; 
break;
case 2:this.$ = $$[$0-2]+$$[$0];
break;
case 3:this.$ = $$[$0-2]-$$[$0];
break;
case 4:this.$ = $$[$0-2]*$$[$0];
break;
case 5:this.$ = $$[$0-2]/$$[$0];
break;
case 6:this.$ = Math.pow($$[$0-2], $$[$0]);
break;
case 7:
          this.$ = (function fact (n) { return n==0 ? 1 : fact(n-1) * n })($$[$0-1]);
        
break;
case 8:this.$ = $$[$0-1]/100;
break;
case 9:this.$ = -$$[$0];
break;
case 10:this.$ = $$[$0-1];
break;
case 11:this.$ = Number(yytext);
break;
case 12:this.$ = (yytext === 'true');
break;
case 13:this.$ = Math.E;
break;
case 14:this.$ = Math.PI;
break;
case 16:this.$ = yytext.substring(1,yytext.length-1);
break;
case 17:this.$ = yy.createArray($$[$0-1]);
break;
case 18:this.$ = [$$[$0]];
break;
case 19: $$[$0-2].push($$[$0]); this.$ = $$[$0-2]; 
break;
case 20:this.$ = yy.callFunction($$[$0-2]);
break;
case 21:this.$ = yy.callFunction($$[$0-3],$$[$0-1]);
break;
case 22:this.$ = yy.getVariableValue($$[$0]);
break;
case 23: this.$ = [$$[$0]]; 
break;
case 24: this.$ = $$[$0-2]; this.$.push($$[$0]); 
break;
case 25: this.$ = [$$[$0]]; 
break;
case 26: this.$ = $$[$0-2]; $$[$0-2].push($$[$0]); 
break;
}
},
table: [{3:1,4:2,7:[1,3],13:[1,4],15:[1,5],16:[1,6],17:[1,7],18:[1,8],19:9,20:[1,10],21:[1,11],25:12,27:[1,13]},{1:[3]},{5:[1,14],6:[1,15],7:[1,16],8:[1,17],9:[1,18],10:[1,19],11:[1,20],12:[1,21]},{4:22,7:[1,3],13:[1,4],15:[1,5],16:[1,6],17:[1,7],18:[1,8],19:9,20:[1,10],21:[1,11],25:12,27:[1,13]},{4:23,7:[1,3],13:[1,4],15:[1,5],16:[1,6],17:[1,7],18:[1,8],19:9,20:[1,10],21:[1,11],25:12,27:[1,13]},{5:[2,11],6:[2,11],7:[2,11],8:[2,11],9:[2,11],10:[2,11],11:[2,11],12:[2,11],14:[2,11],23:[2,11],24:[2,11]},{5:[2,12],6:[2,12],7:[2,12],8:[2,12],9:[2,12],10:[2,12],11:[2,12],12:[2,12],14:[2,12],23:[2,12],24:[2,12]},{5:[2,13],6:[2,13],7:[2,13],8:[2,13],9:[2,13],10:[2,13],11:[2,13],12:[2,13],14:[2,13],23:[2,13],24:[2,13]},{5:[2,14],6:[2,14],7:[2,14],8:[2,14],9:[2,14],10:[2,14],11:[2,14],12:[2,14],14:[2,14],23:[2,14],24:[2,14]},{5:[2,15],6:[2,15],7:[2,15],8:[2,15],9:[2,15],10:[2,15],11:[2,15],12:[2,15],14:[2,15],23:[2,15],24:[2,15]},{5:[2,16],6:[2,16],7:[2,16],8:[2,16],9:[2,16],10:[2,16],11:[2,16],12:[2,16],14:[2,16],23:[2,16],24:[2,16]},{4:25,7:[1,3],13:[1,4],15:[1,5],16:[1,6],17:[1,7],18:[1,8],19:9,20:[1,10],21:[1,11],22:24,25:12,27:[1,13]},{5:[2,22],6:[2,22],7:[2,22],8:[2,22],9:[2,22],10:[2,22],11:[2,22],12:[2,22],13:[1,26],14:[2,22],23:[2,22],24:[2,22],28:[1,27]},{5:[2,23],6:[2,23],7:[2,23],8:[2,23],9:[2,23],10:[2,23],11:[2,23],12:[2,23],13:[2,23],14:[2,23],23:[2,23],24:[2,23],28:[2,23]},{1:[2,1]},{4:28,7:[1,3],13:[1,4],15:[1,5],16:[1,6],17:[1,7],18:[1,8],19:9,20:[1,10],21:[1,11],25:12,27:[1,13]},{4:29,7:[1,3],13:[1,4],15:[1,5],16:[1,6],17:[1,7],18:[1,8],19:9,20:[1,10],21:[1,11],25:12,27:[1,13]},{4:30,7:[1,3],13:[1,4],15:[1,5],16:[1,6],17:[1,7],18:[1,8],19:9,20:[1,10],21:[1,11],25:12,27:[1,13]},{4:31,7:[1,3],13:[1,4],15:[1,5],16:[1,6],17:[1,7],18:[1,8],19:9,20:[1,10],21:[1,11],25:12,27:[1,13]},{4:32,7:[1,3],13:[1,4],15:[1,5],16:[1,6],17:[1,7],18:[1,8],19:9,20:[1,10],21:[1,11],25:12,27:[1,13]},{5:[2,7],6:[2,7],7:[2,7],8:[2,7],9:[2,7],10:[2,7],11:[2,7],12:[2,7],14:[2,7],23:[2,7],24:[2,7]},{5:[2,8],6:[2,8],7:[2,8],8:[2,8],9:[2,8],10:[2,8],11:[2,8],12:[2,8],14:[2,8],23:[2,8],24:[2,8]},{5:[2,9],6:[2,9],7:[2,9],8:[2,9],9:[2,9],10:[2,9],11:[2,9],12:[2,9],14:[2,9],23:[2,9],24:[2,9]},{6:[1,15],7:[1,16],8:[1,17],9:[1,18],10:[1,19],11:[1,20],12:[1,21],14:[1,33]},{23:[1,34],24:[1,35]},{6:[1,15],7:[1,16],8:[1,17],9:[1,18],10:[1,19],11:[1,20],12:[1,21],23:[2,18],24:[2,18]},{4:38,7:[1,3],13:[1,4],14:[1,36],15:[1,5],16:[1,6],17:[1,7],18:[1,8],19:9,20:[1,10],21:[1,11],25:12,26:37,27:[1,13]},{27:[1,39]},{5:[2,2],6:[2,2],7:[2,2],8:[1,17],9:[1,18],10:[1,19],11:[1,20],12:[1,21],14:[2,2],23:[2,2],24:[2,2]},{5:[2,3],6:[2,3],7:[2,3],8:[1,17],9:[1,18],10:[1,19],11:[1,20],12:[1,21],14:[2,3],23:[2,3],24:[2,3]},{5:[2,4],6:[2,4],7:[2,4],8:[2,4],9:[2,4],10:[1,19],11:[1,20],12:[1,21],14:[2,4],23:[2,4],24:[2,4]},{5:[2,5],6:[2,5],7:[2,5],8:[2,5],9:[2,5],10:[1,19],11:[1,20],12:[1,21],14:[2,5],23:[2,5],24:[2,5]},{5:[2,6],6:[2,6],7:[2,6],8:[2,6],9:[2,6],10:[2,6],11:[1,20],12:[1,21],14:[2,6],23:[2,6],24:[2,6]},{5:[2,10],6:[2,10],7:[2,10],8:[2,10],9:[2,10],10:[2,10],11:[2,10],12:[2,10],14:[2,10],23:[2,10],24:[2,10]},{5:[2,17],6:[2,17],7:[2,17],8:[2,17],9:[2,17],10:[2,17],11:[2,17],12:[2,17],14:[2,17],23:[2,17],24:[2,17]},{4:40,7:[1,3],13:[1,4],15:[1,5],16:[1,6],17:[1,7],18:[1,8],19:9,20:[1,10],21:[1,11],25:12,27:[1,13]},{5:[2,20],6:[2,20],7:[2,20],8:[2,20],9:[2,20],10:[2,20],11:[2,20],12:[2,20],14:[2,20],23:[2,20],24:[2,20]},{14:[1,41],24:[1,42]},{6:[1,15],7:[1,16],8:[1,17],9:[1,18],10:[1,19],11:[1,20],12:[1,21],14:[2,25],24:[2,25]},{5:[2,24],6:[2,24],7:[2,24],8:[2,24],9:[2,24],10:[2,24],11:[2,24],12:[2,24],13:[2,24],14:[2,24],23:[2,24],24:[2,24],28:[2,24]},{6:[1,15],7:[1,16],8:[1,17],9:[1,18],10:[1,19],11:[1,20],12:[1,21],23:[2,19],24:[2,19]},{5:[2,21],6:[2,21],7:[2,21],8:[2,21],9:[2,21],10:[2,21],11:[2,21],12:[2,21],14:[2,21],23:[2,21],24:[2,21]},{4:43,7:[1,3],13:[1,4],15:[1,5],16:[1,6],17:[1,7],18:[1,8],19:9,20:[1,10],21:[1,11],25:12,27:[1,13]},{6:[1,15],7:[1,16],8:[1,17],9:[1,18],10:[1,19],11:[1,20],12:[1,21],14:[2,26],24:[2,26]}],
defaultActions: {14:[2,1]},
parseError: function parseError(str,hash){if(hash.recoverable){this.trace(str)}else{throw new Error(str)}},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                this.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str,hash){if(this.yy.parser){this.yy.parser.parseError(str,hash)}else{throw new Error(str)}},

// resets the lexer, sets new input
setInput:function (input){this._input=input;this._more=this._backtrack=this.done=false;this.yylineno=this.yyleng=0;this.yytext=this.matched=this.match="";this.conditionStack=["INITIAL"];this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0};if(this.options.ranges){this.yylloc.range=[0,0]}this.offset=0;return this},

// consumes and returns one char from the input
input:function (){var ch=this._input[0];this.yytext+=ch;this.yyleng++;this.offset++;this.match+=ch;this.matched+=ch;var lines=ch.match(/(?:\r\n?|\n).*/g);if(lines){this.yylineno++;this.yylloc.last_line++}else{this.yylloc.last_column++}if(this.options.ranges){this.yylloc.range[1]++}this._input=this._input.slice(1);return ch},

// unshifts one char (or a string) into the input
unput:function (ch){var len=ch.length;var lines=ch.split(/(?:\r\n?|\n)/g);this._input=ch+this._input;this.yytext=this.yytext.substr(0,this.yytext.length-len-1);this.offset-=len;var oldLines=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1);this.matched=this.matched.substr(0,this.matched.length-1);if(lines.length-1){this.yylineno-=lines.length-1}var r=this.yylloc.range;this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:lines?(lines.length===oldLines.length?this.yylloc.first_column:0)+oldLines[oldLines.length-lines.length].length-lines[0].length:this.yylloc.first_column-len};if(this.options.ranges){this.yylloc.range=[r[0],r[0]+this.yyleng-len]}this.yyleng=this.yytext.length;return this},

// When called from action, caches matched text and appends it on next action
more:function (){this._more=true;return this},

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function (){if(this.options.backtrack_lexer){this._backtrack=true}else{return this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})}return this},

// retain first n characters of the match
less:function (n){this.unput(this.match.slice(n))},

// displays already matched input, i.e. for error messages
pastInput:function (){var past=this.matched.substr(0,this.matched.length-this.match.length);return(past.length>20?"...":"")+past.substr(-20).replace(/\n/g,"")},

// displays upcoming input, i.e. for error messages
upcomingInput:function (){var next=this.match;if(next.length<20){next+=this._input.substr(0,20-next.length)}return(next.substr(0,20)+(next.length>20?"...":"")).replace(/\n/g,"")},

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function (){var pre=this.pastInput();var c=new Array(pre.length+1).join("-");return pre+this.upcomingInput()+"\n"+c+"^"},

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match,indexed_rule){var token,lines,backup;if(this.options.backtrack_lexer){backup={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done};if(this.options.ranges){backup.yylloc.range=this.yylloc.range.slice(0)}}lines=match[0].match(/(?:\r\n?|\n).*/g);if(lines){this.yylineno+=lines.length}this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:lines?lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+match[0].length};this.yytext+=match[0];this.match+=match[0];this.matches=match;this.yyleng=this.yytext.length;if(this.options.ranges){this.yylloc.range=[this.offset,this.offset+=this.yyleng]}this._more=false;this._backtrack=false;this._input=this._input.slice(match[0].length);this.matched+=match[0];token=this.performAction.call(this,this.yy,this,indexed_rule,this.conditionStack[this.conditionStack.length-1]);if(this.done&&this._input){this.done=false}if(token){return token}else if(this._backtrack){for(var k in backup){this[k]=backup[k]}return false}return false},

// return next match in input
next:function (){if(this.done){return this.EOF}if(!this._input){this.done=true}var token,match,tempMatch,index;if(!this._more){this.yytext="";this.match=""}var rules=this._currentRules();for(var i=0;i<rules.length;i++){tempMatch=this._input.match(this.rules[rules[i]]);if(tempMatch&&(!match||tempMatch[0].length>match[0].length)){match=tempMatch;index=i;if(this.options.backtrack_lexer){token=this.test_match(tempMatch,rules[i]);if(token!==false){return token}else if(this._backtrack){match=false;continue}else{return false}}else if(!this.options.flex){break}}}if(match){token=this.test_match(match,rules[index]);if(token!==false){return token}return false}if(this._input===""){return this.EOF}else{return this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})}},

// return next match that has a token
lex:function lex(){var r=this.next();if(r){return r}else{return this.lex()}},

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition){this.conditionStack.push(condition)},

// pop the previously active lexer condition state off the condition stack
popState:function popState(){var n=this.conditionStack.length-1;if(n>0){return this.conditionStack.pop()}else{return this.conditionStack[0]}},

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules(){if(this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules}else{return this.conditions["INITIAL"].rules}},

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n){n=this.conditionStack.length-1-Math.abs(n||0);if(n>=0){return this.conditionStack[n]}else{return"INITIAL"}},

// alias for begin(condition)
pushState:function pushState(condition){this.begin(condition)},

// return the number of states currently on the stack
stateStackSize:function stateStackSize(){return this.conditionStack.length},
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START
/**/) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 15
break;
case 2:return 16
break;
case 3:return 27
break;
case 4:return 20
break;
case 5:return 8
break;
case 6:return 9
break;
case 7:return 7
break;
case 8:return 6
break;
case 9:return 10
break;
case 10:return 11
break;
case 11:return 12
break;
case 12:return 13
break;
case 13:return 14
break;
case 14:return 21
break;
case 15:return 23
break;
case 16:return 24
break;
case 17:return 28
break;
case 18:return 18
break;
case 19:return 17
break;
case 20:return 5
break;
case 21:return 'INVALID'
break;
}
},
rules: [/^(?:\s+)/,/^(?:[0-9]+(\.[0-9]+)?\b)/,/^(?:true|false\b)/,/^(?:(\$|[a-z])([a-z0-9_$])*)/,/^(?:('|")(\\.|[^\"])*('|"))/,/^(?:\*)/,/^(?:\/)/,/^(?:-)/,/^(?:\+)/,/^(?:\^)/,/^(?:!)/,/^(?:%)/,/^(?:\()/,/^(?:\))/,/^(?:\{)/,/^(?:\})/,/^(?:,)/,/^(?:\.)/,/^(?:PI\b)/,/^(?:E\b)/,/^(?:$)/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();

exports.parser = parser;
},{}],8:[function(require,module,exports){
var parser       = require('./parser').parser,
    nodes        = require('./nodes'),
    lexer        = require('./lexer'),
    rewriter     = require('./rewriter'),
    astValidator = require('./ast-validator'),
    jsCompiler   = require('./js-compiler');

parser.yy = nodes;

parser.lexer = {

    lex: function()
    {
        var token = this.tokens[this.pos] ? this.tokens[this.pos++] : ['EOF'];
        this.yytext = token[1];
        this.yylineno = token[2];
        return token[0];
    },

    setInput: function(tokens)
    {
        this.tokens = tokens;
        this.pos = 0;
    },

    upcomingInput: function()
    {
        return "";
    }

};

exports.parser = parser;

exports.compile = function(code) {
    var tokens = lexer.tokenise(code);
    //tokens = rewriter.rewrite(tokens);
    var ast = parser.parse(tokens);
    /*var valid = astValidator.validate(ast);
3
    if (!valid) {
        console.log("Didn't compile due to code error");
    }
          */
    var js = jsCompiler.compile(ast);

    return js;
};
},{"./ast-validator":5,"./js-compiler":11,"./lexer":12,"./nodes":14,"./parser":15,"./rewriter":16}],9:[function(require,module,exports){

var f = {
    a2l: function(arr, delim) {
        return arr.join(delim);
    },

    abs: function(num) {
        return Math.abs(num);
    },

    avg: function() {
        var avg=0, num=0, len=arguments[0].length;
        for (var i = 0; i < arguments[0].length; i++) {
            num = Number(arguments[0][i]);
            if (num) //if argument is valid add to avg calculation
                    avg+=num;
            else len--; //if argument is invalid, ignore it
        }
        return avg/len;            
    }
}




module.exports = f;



},{}],10:[function(require,module,exports){
(function (global){
﻿var compiler = require('./compiler'),
    VariableRegistry = require('./variable-registry.js').VariableRegistry;

//Graph class. Holds the variable registry, currently has no distinctive methods and merely provides an interface for the registry.

var Graph = function(data) {
    this.initialise.apply(this, arguments);
    this.variables = (typeof data === 'string') ? compiler.compile(data) : {};
	this.variables.sortDependencies();


};
Graph.prototype = {

    initialise: function () {
        _.bindAll(this);
    },

    set: function(name,value) {
        this.variables.set(name,value);
    },

    unset: function (name) {
        this.variables.unset(name);
    },

    evaluate: function () {
        this.variables.evaluate();
        return this;
    },

    get: function () {

    }



};

global.DL = {};
global.DL.createGraph = function (data) { return new Graph(data); };
global.DL.tokens = require('./lexer').tokenise;
global.DL.builtInFunctions = Object.keys(require('./functions'));
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./compiler":8,"./functions":9,"./lexer":12,"./variable-registry.js":18}],11:[function(require,module,exports){
var ScopeManager = require('./scope-manager').ScopeManager,
    VariableRegistry = require('./variable-registry.js').VariableRegistry,
    VariableEntry = require('./variable-registry.js').VariableEntry,
    NodeHandlers = require('./node-handlers');

//takes each node (expression) and adds it as an entry in the variable registry. Basically compiles our DL into JSON 

var JsCompiler = function() {
    this.variableRegistry = new VariableRegistry();
    this.currentNamespace = "";
    this.currentVariable = new VariableEntry();
    _.bindAll(this);
};

//goes over the AST (abstract syntax tree) and processes it recursively
JsCompiler.prototype.compile = function(ast) {
    //for each node in the ast (each DL line)
    _.each(ast, function(node) {
        this.compileNode(node);
		this.currentVariable = new VariableEntry();
    }, this);

    return this.variableRegistry;
};

JsCompiler.prototype.addNode = function(node) {

    };

JsCompiler.prototype.compileNode = function(node) {
    return NodeHandlers[node._type].call(this,node);
};

exports.compile = function(ast) {
    var compiler = new JsCompiler();
    return compiler.compile(ast);
};




},{"./node-handlers":13,"./scope-manager":17,"./variable-registry.js":18}],12:[function(require,module,exports){
/*!
 DLengine lexer

 TODO: So much similar code in this file, there must be a way to refactor this
*/


var LONG       = /^[0-9]+/,
    DOUBLE     = /^[0-9]+\.[0-9]+/,
    STRING     = /^(\'|\")(\\.|[^\"])*(\'|\")/,
    WHITESPACE = /^[^\n\S]+/,
    KEYWORD    = /^([a-z]+)/ig,
    IDENTIFIER = /^(([a-z])([a-z0-9_$])*)/ig,
    TERMINATOR = /^(\n|;)/,
    MULTILINE_COMMENT = /^\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\//gm,
    SINGLELINE_COMMENT = /^((\/\/|#)).*$/;

var KEYWORDS = [
    // values
    "print",
    "var",
    "val",

    // control
    "if",
    "else",

    // language
    "fun",
    "class",
    "public",
    "new"
];

var SYNTAX = [
    '{', '}',
    '(', ')',
    '[', ']',
    '!',
    '.',
    ',',
    ':',
    '?',
    "@",
    "$"
];

var LITERALS = {

    COMPARE: [
        "===",
        "!==",
        "==",
        "!=",
        "<=",
        ">=",
        "<",
        ">"
    ],

    BOOLOP: [
        '||',
        '&&'
    ],

    BOOLEAN: [
        "true",
        "false"
    ],

     ASSIGN: [
    //     "+=",
    //     "-=",
    //     "*=",
    //     "/=",
         "="
     ],

    MATH: [
        "*",
        "/",
        "^",
        "%",
        "+",
        "-"
    ]




    // INDENT: [ '{' ],
    // DEDENT: [ '}' ]

};

var Lexer = function(){};

Lexer.prototype = {

    tokenise: function(code) {
        this.lineNo = 0;
        var chunk, tokens = [], i = 0, token;

        chunk = code.substring(i);
        


        while (i < code.length) {
            chunk = code.substring(i);

            // Discard whitespace
            token = this.whitespace(chunk);
            if (token.length === 2) {
                i += token[1].length;

                continue;
            }

            token = this.comments(chunk);
            if (token.length == 2) {
                i += token[1].length;
                this.lineNo = token[1].split("\n").length - 1;
                continue;
            }

            // Test for literal
            token = this.literals(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                tokens.push(token);
                continue;
            }

            // Test for keyword
            token = this.keyword(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                tokens.push(token);
                continue;
            }

            // Test for identifier (variable name, method name, etc)
            token = this.identifier(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                tokens.push(token);
                continue;
            }

            // Test for statement terminators
            token = this.terminator(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                if (tokens.length!=0) //discard newlines at beginning of document
                    tokens.push(token);

                if (token[1] == "\n") {
                    this.lineNo += 1;
                }

                continue;
            }

            // Test for syntax
            token = this.syntax(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                tokens.push(token);
                continue;
            }

            // Test for string
            token = this.string(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                tokens.push(token);
                continue;
            }

            // Test for long
            token = this.long(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                tokens.push(token);
                continue;
            }

            // Test for double
            token = this.double(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                tokens.push(token);
                continue;
            }

            // Test for boolean
            token = this.boolean(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                tokens.push(token);
                continue;
            }

            console.log("Could not match chunk starting with " + chunk[0] + "...skipping");
            i += 1;
        }

        tokens.push(['EOF', '', this.lineNo]);

        return tokens;
    },

    syntax: function(chunk)
    {
        var token = [];

        _.find(SYNTAX, function(syntax) {
            if (chunk.indexOf(syntax) === 0) {
                token = [syntax, syntax];
                return true;
            }
        }, this);

        return token;
    },

    comments: function(chunk)
    {
        var token = [];

        _.find([SINGLELINE_COMMENT, MULTILINE_COMMENT], function(regex) {
            if (chunk.search(regex) === 0) {
                var result = chunk.match(regex)[0];

                token = ["COMMENT", result];
                return true;
            }
        });

        return token;
    },

    keyword: function(chunk) {
        if (chunk.search(KEYWORD) === 0) {
            var result = chunk.match(KEYWORD)[0];
            var index = KEYWORDS.indexOf(result);

            if (index !== -1) {
                return [result.toUpperCase(), result];
            }
        }

        return [];
    },

    identifier: function(chunk) {
        if (chunk.search(IDENTIFIER) === 0) {
            var result = chunk.match(IDENTIFIER)[0];

            return ["IDENTIFIER", result];
        }

        return [];
    },

    whitespace: function(chunk) {
        if (chunk.search(WHITESPACE) === 0) {
            var result = chunk.match(WHITESPACE)[0];

            return ["WHITESPACE", result];
        }

        return [];
    },

    long: function(chunk) {
        if (chunk.search(LONG) === 0) {
            var result = chunk.match(LONG)[0];

            return ["LONG", result];
        }

        return [];
    },

    double: function(chunk) {
        if (chunk.search(DOUBLE) === 0) {
            var result = chunk.match(DOUBLE)[0];

            return ["DOUBLE", result];
        }

        return [];
    },

    boolean: function(chunk) {
        if (chunk.search(BOOLEAN) === 0) {
            var result = chunk.match(BOOLEAN)[0];

            return ["BOOLEAN", result];
        }

        return [];
    },

    literals: function(chunk) {
        var token = [];

        _(LITERALS).find(function(lits, name) {
            return _(lits).find(function(lit) {
                if (chunk.indexOf(lit) === 0) {
                    token = [name, lit];
                    return true;
                }
            });
        });

        return token;
    },

    string: function(chunk) {
        if (chunk.search(STRING) === 0) {
            var result = chunk.match(STRING)[0];

            return ["STRING", result];
        }

        return [];
    },

    terminator: function(chunk) {
        if (chunk.search(TERMINATOR) === 0) {
            return ['TERMINATOR', chunk[0]];
        }

        return [];
    }

};

exports.Lexer = Lexer;

exports.tokenise = function(code) {
    var lexer = new Lexer();
    return lexer.tokenise(code);
};
},{}],13:[function(require,module,exports){
//parser sends here after a node has been classified
var  f = require('util').format;

var NodeHandlers = {

    // 4 + 3
    Math: function(node) {
        return f("%s %s %s", this.compileNode(node.left), node.operator, this.compileNode(node.right));
    },

    // 2
    Long: function(node) {
        return node.value;
    },

    Double: function(node) {
        return node.value;
    },

    // "yoyo"
    String: function(node) {
        return String(node.value);
    },

    // [element, element, ...]
    Array: function(node) {
        var list ="{";
            if (node.elements) {
                _.each(node.elements, function(element) {
                    list += this.compileNode(element) + ",";
                }, this);
            }
            list = list.substring(0,list.length-1) + "}";
            return list;
    },

    // print expr
    Print: function(node) {
        return f("console.log(%s);", this.compileNode(node.expr));
    },

    // (expr)
    BracketBlock: function(node) {
        return f("(%s)", this.compileNode(node.expr));
    },

    // var name = expr
    AssignVariable: function(node) {
        return f("var %s = %s;", node.name, this.compileNode(node.expr));
    },

    // val name = expr
    AssignValue: function(node) {
        this._type = "AssignValue";
        this.name = name;
        this.expr = expr;
        this.assignType = assignType;
    },

    // name = expr
    SetVariable: function(node) {
        this.currentVariable['name'] = this.currentNamespace + node.name;
        this.currentVariable['expr'] = this.compileNode(node.expr);
        this.variableRegistry.addToEntry(this.currentVariable);
    },

    // name
    CallVariable: function(node) {
        var _name = node.name.join('.');
			if (_name != this.currentVariable.name && this.currentVariable.dependsOn.indexOf(_name)==-1) {
				this.currentVariable.dependsOn.push(node.name.join('.'));
                this.variableRegistry.addToEntry({name: node.name.join('.'),dependedOnBy: [this.currentVariable['name']]});}
      

            if (!node.name.join) {
                console.log(node);
            }
            return node.name.join('.');
    },

    // left == right
    Comparison: function(node) {
        return f("%s %s %s", this.compileNode(node.left), node.comparator, this.compileNode(node.right));
    },



    // fun(paramaters):ReturnType { [expr] }
    Closure: function(node) {
        var params = [], body = [];

            if (node.parameters) {
                _.each(node.parameters, function(parameter) {
                    params.push(this.compileNode(parameter));
                }, this);
            }

            _.each(node.body, function(bodyNode) {
                body.push(this.compileNode(bodyNode));
            }, this);

            return f("_.bind(function (%s) {\n%s\n}, this)", params.join(""), body.join("\n"));
    },

    // var name: Type
    VariableParameter: function(node) {

    },

    // name([args])
    CallFunction: function(node) {
        var args = [];

            if (node.args) {
                _.each(node.args, function(arg) {
                    args.push(this.compileNode(arg));
                }, this);
            }
            return f("%s(%s)", node.name[0].join("."), args.join(", "));
    },

    // class { [body] }
    Class: function(node) {
         var body = [];

            currentClass = node.name;

            _.each(node.body, function(bodyNode) {
                body.push(this.compileNode(bodyNode));
            });

            currentClass = "";

            return f("function %s() {\n_.bindAll(this);\nthis.initialise && this.initialise.apply(this, arguments);\n}\n%s", node.name, body.join("\n"));
    },

    // visisiblity name(parameters)
    Method: function(node) {
        var params = [], body = [];

            if (node.parameters) {
                _.each(node.parameters, function(parameter) {
                    params.push(this.compileNode(parameter));
                }, this);
            }

            _.each(node.body, function(bodyNode) {
                body.push(this.compileNode(bodyNode));
            });

            return f("%s.prototype.%s = function(%s) {\n%s\n};", currentClass, node.name, params.join("\n"), body.join("\n"));
    },

    // new Name([args])
    ClassInstantiation: function(node) {
        return f("new %s()", node.name);
    },

    // true|false
    Boolean: function(node) {
        return node.value;
    },

    // (x == y) ? "eq : "neq"
    Ternary: function(node) {
        return f("%s ? %s : %s", this.compileNode(node.test), this.compileNode(node.equal), this.compileNode(node.nequal));
     },

    Namespace: function(ns) {
       this.currentNamespace = ns.name + ".";
    }
};

module.exports = NodeHandlers;
},{"util":4}],14:[function(require,module,exports){
//parser sends here after a node has been classified
var Nodes = {

    // 4 + 3
    Math: function(left, right, operator) {
        this._type    = "Math";
        this.left     = left;
        this.right    = right;
        this.operator = operator;
    },

    // 2
    Long: function(value) {
        this._type = "Long";
        this.value = value;
    },

    Double: function(value) {
        this._type = "Double";
        this.value = value;
    },

    // "yoyo"
    String: function(value) {
        this._type = "String";
        this.value = value;
    },

    // [element, element, ...]
    Array: function(elements) {
        this._type = "Array";
        this.elements = elements;
    },

    // print expr
    Print: function(expr) {
        this._type = "Print";
        this.expr = expr;
    },

    // (expr)
    BracketBlock: function(expr) {
        this._type = "BracketBlock";
        this.expr = expr;
    },

    // var name = expr
    AssignVariable: function(name, expr, assignType) {
        this._type = "AssignVariable";
        this.name = name;
        this.expr = expr;
        this.assignType = assignType;
    },

    // val name = expr
    AssignValue: function(name, expr, assignType) {
        this._type = "AssignValue";
        this.name = name;
        this.expr = expr;
        this.assignType = assignType;
    },

    // name = expr
    SetVariable: function(name, expr, assignType) {
        this._type = "SetVariable";
        this.name = name;
        this.expr = expr;
        this.assignType = assignType;
    },

    // name
    CallVariable: function(name) {
        this._type = "CallVariable";
        this.name = name;
    },

    // left == right
    Comparison: function(left, right, comparator) {
        this._type = "Comparison";
        this.left = left;
        this.right = right;
        this.comparator = comparator;
    },

    // if (true) { [expr] } else { [expr] }
    IfBlock: function(evaluation, trueBlock, falseBlock, elseIfs) {
        this._type = "IfBlock";
        this.evaluation = evaluation;
        this.trueBlock = trueBlock;
        this.falseBlock = falseBlock;
        this.elseIfs = elseIfs;
    },

    // else if (true) { [expr] }
    ElseIfBlock: function(evaluation, trueBlock) {
        this._type = "ElseIfBlock";
        this.evaluation = evaluation;
        this.trueBlock = trueBlock;
    },

    // fun(paramaters):ReturnType { [expr] }
    Closure: function(body, parameters, returnType) {
        this._type = "Closure";
        this.body = body;
        this.parameters = parameters;
        this.returnType = returnType;
    },

    // var name: Type
    VariableParameter: function(name, type) {
        this._type = "VariableParameter";
        this.name = name;
        this.type = type;
    },

    // val name: Type
    ValueParameter: function(name, type) {
        this._type = "ValueParameter";
        this.name = name;
        this.type = type;
    },

    // name([args])
    CallFunction: function(name, args) {
        this._type = "CallFunction";
        this.name = [name];
        this.args = args || [];
    },

    // class { [body] }
    Class: function(name, body) {
        this._type = "Class";
        this.name = name;
        this.body = body;
    },

    // visisiblity name(parameters)
    Method: function(visibility, name, body, parameters) {
        this._type = "Method";
        this.visibility = visibility;
        this.name = name;
        this.body = body;
        this.parameters = parameters;
    },

    // new Name([args])
    ClassInstantiation: function(name, args) {
        this._type = "ClassInstantiation";
        this.name = name;
        this.args = args || [];
    },

    // true|false
    Boolean: function(value) {
        this._type = "Boolean";
        this.value = value;
    },

    // (x == y) ? "eq : "neq"
    Ternary: function(test, equal, nequal) {
        this._type = "Ternary";
        this.test = test;
        this.equal = equal;
        this.nequal = nequal;
    },

    Namespace: function(ns) {
        this._type = "Namespace";
        this.name = ns;
    }
};

module.exports = Nodes;
},{}],15:[function(require,module,exports){
/* parser generated by jison 0.4.13 */
/*
 Returns a Parser object of the following structure:

 Parser: {
 yy: {}
 }

 Parser.prototype: {
 yy: {},
 trace: function(),
 symbols_: {associative list: name ==> number},
 terminals_: {associative list: number ==> name},
 productions_: [...],
 performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
 table: [...],
 defaultActions: {...},
 parseError: function(str, hash),
 parse: function(input),

 lexer: {
 EOF: 1,
 parseError: function(str, hash),
 setInput: function(input),
 input: function(),
 unput: function(str),
 more: function(),
 less: function(n),
 pastInput: function(),
 upcomingInput: function(),
 showPosition: function(),
 test_match: function(regex_match_array, rule_index),
 next: function(),
 lex: function(),
 begin: function(condition),
 popState: function(),
 _currentRules: function(),
 topState: function(),
 pushState: function(condition),

 options: {
 ranges: boolean           (optional: true ==> token location info will include a .range[] member)
 flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
 backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
 },

 performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
 rules: [...],
 conditions: {associative list: name ==> set},
 }
 }


 token location info (@$, _$, etc.): {
 first_line: n,
 last_line: n,
 first_column: n,
 last_column: n,
 range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
 }


 the parseError function receives a 'hash' object with these members for lexer and parser errors: {
 text:        (matched text)
 token:       (the produced terminal token, if any)
 line:        (yylineno)
 }
 while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
 loc:         (yylloc)
 expected:    (string describing the set of expected tokens)
 recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
 }
 */
var parser = (function(){
    var parser = {trace: function trace(){},
        yy: {},
        symbols_: {"error":2,"program":3,"EOF":4,"body":5,"line":6,"TERMINATOR":7,"PRINT":8,"expr":9,"classdef":10,"assignment":11,"ifblocks":12,"IF":13,"(":14,")":15,"block":16,"ELSE":17,"elseifs":18,"{":19,"}":20,"VAR":21,"IDENTIFIER":22,"ASSIGN":23,"VAL":24,"MATH":25,"COMPARE":26,"BOOLOP":27,"TERNARY":28,":":29,"closure":30,"instantiation":31,"variablecall":32,"type":33,"namespace":34,"$":35,"parameters":36,"parameter":37,",":38,"arguments":39,"FUN":40,"CLASS":41,"classbody":42,"classline":43,"method":44,"PUBLIC":45,"NEW":46,"objectref":47,".":48,"LONG":49,"DOUBLE":50,"STRING":51,"BOOLEAN":52,"csv":53,"NULL":54,"$accept":0,"$end":1},
        terminals_: {2:"error",4:"EOF",7:"TERMINATOR",8:"PRINT",13:"IF",14:"(",15:")",17:"ELSE",19:"{",20:"}",21:"VAR",22:"IDENTIFIER",23:"ASSIGN",24:"VAL",25:"MATH",26:"COMPARE",27:"BOOLOP",28:"TERNARY",29:":",35:"$",38:",",40:"FUN",41:"CLASS",45:"PUBLIC",46:"NEW",48:".",49:"LONG",50:"DOUBLE",51:"STRING",52:"BOOLEAN",54:"NULL"},
        productions_: [0,[3,1],[3,2],[5,1],[5,3],[5,2],[5,1],[6,2],[6,1],[6,1],[6,1],[6,1],[12,5],[12,7],[12,6],[12,8],[18,6],[18,7],[16,2],[16,3],[11,4],[11,4],[11,3],[9,3],[9,3],[9,3],[9,3],[9,5],[9,1],[9,1],[9,1],[9,1],[9,1],[34,2],[36,1],[36,3],[37,3],[37,4],[37,4],[39,1],[39,3],[30,6],[30,7],[10,5],[42,1],[42,3],[42,2],[43,1],[44,8],[44,9],[31,4],[32,3],[32,4],[32,1],[47,1],[47,3],[33,1],[33,1],[33,1],[33,1],[33,3],[33,1],[53,1],[53,3]],
        performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */
                                          /**/) {
            /* this == yyval */

            var $0 = $$.length - 1;
            switch (yystate) {
                case 1:
                    break;
                case 2: return $$[$0-1];
                    break;
                case 3:this.$ = [$$[$0]];
                    break;
                case 4: this.$ = $$[$0-2]; $$[$0-2].push($$[$0]);
                    break;
                case 7:this.$ = new yy.Print($$[$0]);
                    break;
                case 12:this.$ = new yy.IfBlock($$[$0-2], $$[$0]);
                    break;
                case 13:this.$ = new yy.IfBlock($$[$0-4], $$[$0-2], $$[$0]);
                    break;
                case 14: this.$ = new yy.IfBlock($$[$0-3], $$[$0-1], false, $$[$0]);
                    break;
                case 15: this.$ = new yy.IfBlock($$[$0-5], $$[$0-3], $$[$0], $$[$0-2]);
                    break;
                case 16: this.$ = [new yy.ElseIfBlock($$[$0-2], $$[$0])];
                    break;
                case 17: this.$ = $$[$0-6]; $$[$0-6].push(new yy.ElseIfBlock($$[$0-2], $$[$0]));
                    break;
                case 18: this.$ = [];
                    break;
                case 19: this.$ = $$[$0-1];
                    break;
                case 20: this.$ = new yy.AssignVariable($$[$0-2], $$[$0], $$[$0-1]);
                    break;
                case 21: this.$ = new yy.AssignValue($$[$0-2], $$[$0], $$[$0-1]);
                    break;
                case 22: this.$ = new yy.SetVariable($$[$0-2], $$[$0], $$[$0-1]);
                    break;
                case 23:this.$ = new yy.BracketBlock($$[$0-1]);
                    break;
                case 24:this.$ = new yy.Math($$[$0-2], $$[$0], $$[$0-1]);
                    break;
                case 25:this.$ = new yy.Comparison($$[$0-2], $$[$0], $$[$0-1]);
                    break;
                case 26:this.$ = new yy.Comparison($$[$0-2], $$[$0], $$[$0-1]);
                    break;
                case 27:this.$ = new yy.Ternary($$[$0-4], $$[$0-2], $$[$0]);
                    break;
                case 33:this.$ = new yy.Namespace($$[$0]);
                    break;
                case 34: this.$ = [$$[$0]]
                    break;
                case 35: this.$ = $$[$0-2]; $$[$0-2].push($$[$0])
                    break;
                case 36:this.$ = new yy.ValueParameter($$[$0-2], $$[$0]);
                    break;
                case 37:this.$ = new yy.ValueParameter($$[$0-2], $$[$0]);
                    break;
                case 38:this.$ = new yy.VariableParameter($$[$0-2], $$[$0]);
                    break;
                case 39: this.$ = [$$[$0]];
                    break;
                case 40: this.$ = $$[$0-2]; $$[$0-2].push($$[$0]);
                    break;
                case 41:this.$ = new yy.Closure($$[$0], $$[$0-1]);
                    break;
                case 42:this.$ = new yy.Closure($$[$0], $$[$0-4], $$[$0-1]);
                    break;
                case 43:this.$ = new yy.Class($$[$0-3], $$[$0-1]);
                    break;
                case 44: this.$ = [$$[$0]];
                    break;
                case 45: this.$ = $$[$0-2]; $$[$0-2].push($$[$0]);
                    break;
                case 48:this.$ = new yy.Method($$[$0-7], $$[$0-5], $$[$0]);
                    break;
                case 49:this.$ = new yy.Method($$[$0-8], $$[$0-6], $$[$0], $$[$0-4]);
                    break;
                case 50:this.$ = new yy.ClassInstantiation($$[$0-2]);
                    break;
                case 51:this.$ = new yy.CallFunction($$[$0-2]);
                    break;
                case 52:this.$ = new yy.CallFunction($$[$0-3], $$[$0-1]);
                    break;
                case 53:this.$ = new yy.CallVariable($$[$0]);
                    break;
                case 54: this.$ = [$$[$0]];
                    break;
                case 55: this.$ = $$[$0-2]; this.$.push($$[$0]);
                    break;
                case 56:this.$ = new yy.Long($$[$0]);
                    break;
                case 57:this.$ = new yy.Double($$[$0]);
                    break;
                case 58:this.$ = new yy.String($$[$0]);
                    break;
                case 59:this.$ = new yy.Boolean($$[$0]);
                    break;
                case 60:this.$ = new yy.Array($$[$0-1]);
                    break;
                case 61:this.$ = new yy.Null($$[$0]);
                    break;
                case 62:this.$ = [$$[$0]];
                    break;
                case 63: $$[$0-2].push($$[$0]); this.$ = $$[$0-2];
                    break;
            }
        },
        table: [{3:1,4:[1,2],5:3,6:4,7:[1,5],8:[1,6],9:10,10:7,11:8,12:9,13:[1,15],14:[1,16],19:[1,29],21:[1,12],22:[1,14],24:[1,13],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],41:[1,11],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{1:[3]},{1:[2,1]},{4:[1,32],7:[1,33]},{4:[2,3],7:[2,3],20:[2,3]},{4:[2,6],7:[2,6],20:[2,6]},{9:34,14:[1,16],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{4:[2,8],7:[2,8],20:[2,8]},{4:[2,9],7:[2,9],20:[2,9]},{4:[2,10],7:[2,10],20:[2,10]},{4:[2,11],7:[2,11],20:[2,11],25:[1,36],26:[1,37],27:[1,38],28:[1,39]},{22:[1,40]},{22:[1,41]},{22:[1,42]},{4:[2,54],7:[2,54],14:[2,54],20:[2,54],23:[1,43],25:[2,54],26:[2,54],27:[2,54],28:[2,54],48:[2,54]},{14:[1,44]},{9:45,14:[1,16],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{4:[2,28],7:[2,28],15:[2,28],20:[2,28],25:[2,28],26:[2,28],27:[2,28],28:[2,28],29:[2,28],38:[2,28]},{4:[2,29],7:[2,29],15:[2,29],20:[2,29],25:[2,29],26:[2,29],27:[2,29],28:[2,29],29:[2,29],38:[2,29]},{4:[2,30],7:[2,30],15:[2,30],20:[2,30],25:[2,30],26:[2,30],27:[2,30],28:[2,30],29:[2,30],38:[2,30]},{4:[2,31],7:[2,31],15:[2,31],20:[2,31],25:[2,31],26:[2,31],27:[2,31],28:[2,31],29:[2,31],38:[2,31]},{4:[2,32],7:[2,32],15:[2,32],20:[2,32],25:[2,32],26:[2,32],27:[2,32],28:[2,32],29:[2,32],38:[2,32]},{14:[1,46]},{22:[1,47]},{4:[2,53],7:[2,53],14:[1,48],15:[2,53],20:[2,53],25:[2,53],26:[2,53],27:[2,53],28:[2,53],29:[2,53],38:[2,53],48:[1,49]},{4:[2,56],7:[2,56],15:[2,56],20:[2,56],25:[2,56],26:[2,56],27:[2,56],28:[2,56],29:[2,56],38:[2,56]},{4:[2,57],7:[2,57],15:[2,57],20:[2,57],25:[2,57],26:[2,57],27:[2,57],28:[2,57],29:[2,57],38:[2,57]},{4:[2,58],7:[2,58],15:[2,58],20:[2,58],25:[2,58],26:[2,58],27:[2,58],28:[2,58],29:[2,58],38:[2,58]},{4:[2,59],7:[2,59],15:[2,59],20:[2,59],25:[2,59],26:[2,59],27:[2,59],28:[2,59],29:[2,59],38:[2,59]},{9:51,14:[1,16],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],53:50,54:[1,30]},{4:[2,61],7:[2,61],15:[2,61],20:[2,61],25:[2,61],26:[2,61],27:[2,61],28:[2,61],29:[2,61],38:[2,61]},{22:[1,52]},{1:[2,2]},{4:[2,5],6:53,7:[2,5],8:[1,6],9:10,10:7,11:8,12:9,13:[1,15],14:[1,16],19:[1,29],20:[2,5],21:[1,12],22:[1,14],24:[1,13],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],41:[1,11],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{4:[2,7],7:[2,7],20:[2,7],25:[1,36],26:[1,37],27:[1,38],28:[1,39]},{4:[2,54],7:[2,54],14:[2,54],15:[2,54],20:[2,54],25:[2,54],26:[2,54],27:[2,54],28:[2,54],29:[2,54],38:[2,54],48:[2,54]},{9:54,14:[1,16],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{9:55,14:[1,16],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{9:56,14:[1,16],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{9:57,14:[1,16],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{19:[1,58]},{23:[1,59]},{23:[1,60]},{9:61,14:[1,16],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{9:62,14:[1,16],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{15:[1,63],25:[1,36],26:[1,37],27:[1,38],28:[1,39]},{15:[1,64],21:[1,69],22:[1,67],24:[1,68],36:65,37:66},{14:[1,70]},{9:73,14:[1,16],15:[1,71],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],39:72,40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{22:[1,74]},{20:[1,75],38:[1,76]},{20:[2,62],25:[1,36],26:[1,37],27:[1,38],28:[1,39],38:[2,62]},{4:[2,33],7:[2,33],15:[2,33],20:[2,33],25:[2,33],26:[2,33],27:[2,33],28:[2,33],29:[2,33],38:[2,33]},{4:[2,4],7:[2,4],20:[2,4]},{4:[2,24],7:[2,24],15:[2,24],20:[2,24],25:[2,24],26:[2,24],27:[2,24],28:[2,24],29:[2,24],38:[2,24]},{4:[2,25],7:[2,25],15:[2,25],20:[2,25],25:[2,25],26:[2,25],27:[2,25],28:[2,25],29:[2,25],38:[2,25]},{4:[2,26],7:[2,26],15:[2,26],20:[2,26],25:[2,26],26:[2,26],27:[2,26],28:[2,26],29:[2,26],38:[2,26]},{25:[1,36],26:[1,37],27:[1,38],28:[1,39],29:[1,77]},{42:78,43:79,44:80,45:[1,81]},{9:82,14:[1,16],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{9:83,14:[1,16],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{4:[2,22],7:[2,22],20:[2,22],25:[1,36],26:[1,37],27:[1,38],28:[1,39]},{15:[1,84],25:[1,36],26:[1,37],27:[1,38],28:[1,39]},{4:[2,23],7:[2,23],15:[2,23],20:[2,23],25:[2,23],26:[2,23],27:[2,23],28:[2,23],29:[2,23],38:[2,23]},{29:[1,85]},{15:[1,86],38:[1,87]},{15:[2,34],38:[2,34]},{29:[1,88]},{22:[1,89]},{22:[1,90]},{15:[1,91]},{4:[2,51],7:[2,51],15:[2,51],20:[2,51],25:[2,51],26:[2,51],27:[2,51],28:[2,51],29:[2,51],38:[2,51]},{15:[1,92],38:[1,93]},{15:[2,39],25:[1,36],26:[1,37],27:[1,38],28:[1,39],38:[2,39]},{4:[2,55],7:[2,55],14:[2,55],15:[2,55],20:[2,55],25:[2,55],26:[2,55],27:[2,55],28:[2,55],29:[2,55],38:[2,55],48:[2,55]},{4:[2,60],7:[2,60],15:[2,60],20:[2,60],25:[2,60],26:[2,60],27:[2,60],28:[2,60],29:[2,60],38:[2,60]},{9:94,14:[1,16],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{9:95,14:[1,16],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{7:[1,97],20:[1,96]},{7:[2,44],20:[2,44]},{7:[2,47],20:[2,47]},{40:[1,98]},{4:[2,20],7:[2,20],20:[2,20],25:[1,36],26:[1,37],27:[1,38],28:[1,39]},{4:[2,21],7:[2,21],20:[2,21],25:[1,36],26:[1,37],27:[1,38],28:[1,39]},{16:99,19:[1,100]},{22:[1,101]},{29:[1,102]},{21:[1,69],22:[1,67],24:[1,68],37:103},{22:[1,104]},{29:[1,105]},{29:[1,106]},{4:[2,50],7:[2,50],15:[2,50],20:[2,50],25:[2,50],26:[2,50],27:[2,50],28:[2,50],29:[2,50],38:[2,50]},{4:[2,52],7:[2,52],15:[2,52],20:[2,52],25:[2,52],26:[2,52],27:[2,52],28:[2,52],29:[2,52],38:[2,52]},{9:107,14:[1,16],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{20:[2,63],25:[1,36],26:[1,37],27:[1,38],28:[1,39],38:[2,63]},{4:[2,27],7:[2,27],15:[2,27],20:[2,27],25:[2,27],26:[2,27],27:[2,27],28:[2,27],29:[2,27],38:[2,27]},{4:[2,43],7:[2,43],20:[2,43]},{7:[2,46],20:[2,46],43:108,44:80,45:[1,81]},{22:[1,109]},{4:[2,12],7:[2,12],17:[1,110],18:111,20:[2,12]},{5:113,6:4,7:[1,5],8:[1,6],9:10,10:7,11:8,12:9,13:[1,15],14:[1,16],19:[1,29],20:[1,112],21:[1,12],22:[1,14],24:[1,13],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],41:[1,11],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{16:114,19:[1,100]},{22:[1,115]},{15:[2,35],38:[2,35]},{15:[2,36],38:[2,36]},{22:[1,116]},{22:[1,117]},{15:[2,40],25:[1,36],26:[1,37],27:[1,38],28:[1,39],38:[2,40]},{7:[2,45],20:[2,45]},{14:[1,118]},{13:[1,120],16:119,19:[1,100]},{4:[2,14],7:[2,14],17:[1,121],20:[2,14]},{4:[2,18],7:[2,18],15:[2,18],17:[2,18],20:[2,18],25:[2,18],26:[2,18],27:[2,18],28:[2,18],29:[2,18],38:[2,18]},{7:[1,33],20:[1,122]},{4:[2,41],7:[2,41],15:[2,41],20:[2,41],25:[2,41],26:[2,41],27:[2,41],28:[2,41],29:[2,41],38:[2,41]},{16:123,19:[1,100]},{15:[2,37],38:[2,37]},{15:[2,38],38:[2,38]},{15:[1,124],21:[1,69],22:[1,67],24:[1,68],36:125,37:66},{4:[2,13],7:[2,13],20:[2,13]},{14:[1,126]},{13:[1,128],16:127,19:[1,100]},{4:[2,19],7:[2,19],15:[2,19],17:[2,19],20:[2,19],25:[2,19],26:[2,19],27:[2,19],28:[2,19],29:[2,19],38:[2,19]},{4:[2,42],7:[2,42],15:[2,42],20:[2,42],25:[2,42],26:[2,42],27:[2,42],28:[2,42],29:[2,42],38:[2,42]},{29:[1,129]},{15:[1,130],38:[1,87]},{9:131,14:[1,16],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{4:[2,15],7:[2,15],20:[2,15]},{14:[1,132]},{22:[1,133]},{29:[1,134]},{15:[1,135],25:[1,36],26:[1,37],27:[1,38],28:[1,39]},{9:136,14:[1,16],19:[1,29],22:[1,35],30:17,31:18,32:19,33:20,34:21,35:[1,31],40:[1,22],46:[1,23],47:24,49:[1,25],50:[1,26],51:[1,27],52:[1,28],54:[1,30]},{16:137,19:[1,100]},{22:[1,138]},{16:139,19:[1,100]},{15:[1,140],25:[1,36],26:[1,37],27:[1,38],28:[1,39]},{7:[2,48],20:[2,48]},{16:141,19:[1,100]},{4:[2,16],7:[2,16],17:[2,16],20:[2,16]},{16:142,19:[1,100]},{7:[2,49],20:[2,49]},{4:[2,17],7:[2,17],17:[2,17],20:[2,17]}],
        defaultActions: {2:[2,1],32:[2,2]},
        parseError: function parseError(str,hash){if(hash.recoverable){this.trace(str)}else{throw new Error(str)}},
        parse: function parse(input) {
            var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
            var args = lstack.slice.call(arguments, 1);
            this.lexer.setInput(input);
            this.lexer.yy = this.yy;
            this.yy.lexer = this.lexer;
            this.yy.parser = this;
            if (typeof this.lexer.yylloc == 'undefined') {
                this.lexer.yylloc = {};
            }
            var yyloc = this.lexer.yylloc;
            lstack.push(yyloc);
            var ranges = this.lexer.options && this.lexer.options.ranges;
            if (typeof this.yy.parseError === 'function') {
                this.parseError = this.yy.parseError;
            } else {
                this.parseError = Object.getPrototypeOf(this).parseError;
            }
            function popStack(n) {
                stack.length = stack.length - 2 * n;
                vstack.length = vstack.length - n;
                lstack.length = lstack.length - n;
            }
            function lex() {
                var token;
                token = self.lexer.lex() || EOF;
                if (typeof token !== 'number') {
                    token = self.symbols_[token] || token;
                }
                return token;
            }
            var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
            while (true) {
                state = stack[stack.length - 1];
                if (this.defaultActions[state]) {
                    action = this.defaultActions[state];
                } else {
                    if (symbol === null || typeof symbol == 'undefined') {
                        symbol = lex();
                    }
                    action = table[state] && table[state][symbol];
                }
                if (typeof action === 'undefined' || !action.length || !action[0]) {
                    var errStr = '';
                    expected = [];
                    for (p in table[state]) {
                        if (this.terminals_[p] && p > TERROR) {
                            expected.push('\'' + this.terminals_[p] + '\'');
                        }
                    }
                    if (this.lexer.showPosition) {
                        errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                    } else {
                        errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                    }
                    this.parseError(errStr, {
                        text: this.lexer.match,
                        token: this.terminals_[symbol] || symbol,
                        line: this.lexer.yylineno,
                        loc: yyloc,
                        expected: expected
                    });
                }
                if (action[0] instanceof Array && action.length > 1) {
                    throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
                }
                switch (action[0]) {
                    case 1:
                        stack.push(symbol);
                        vstack.push(this.lexer.yytext);
                        lstack.push(this.lexer.yylloc);
                        stack.push(action[1]);
                        symbol = null;
                        if (!preErrorSymbol) {
                            yyleng = this.lexer.yyleng;
                            yytext = this.lexer.yytext;
                            yylineno = this.lexer.yylineno;
                            yyloc = this.lexer.yylloc;
                            if (recovering > 0) {
                                recovering--;
                            }
                        } else {
                            symbol = preErrorSymbol;
                            preErrorSymbol = null;
                        }
                        break;
                    case 2:
                        len = this.productions_[action[1]][1];
                        yyval.$ = vstack[vstack.length - len];
                        yyval._$ = {
                            first_line: lstack[lstack.length - (len || 1)].first_line,
                            last_line: lstack[lstack.length - 1].last_line,
                            first_column: lstack[lstack.length - (len || 1)].first_column,
                            last_column: lstack[lstack.length - 1].last_column
                        };
                        if (ranges) {
                            yyval._$.range = [
                                lstack[lstack.length - (len || 1)].range[0],
                                lstack[lstack.length - 1].range[1]
                            ];
                        }
                        r = this.performAction.apply(yyval, [
                            yytext,
                            yyleng,
                            yylineno,
                            this.yy,
                            action[1],
                            vstack,
                            lstack
                        ].concat(args));
                        if (typeof r !== 'undefined') {
                            return r;
                        }
                        if (len) {
                            stack = stack.slice(0, -1 * len * 2);
                            vstack = vstack.slice(0, -1 * len);
                            lstack = lstack.slice(0, -1 * len);
                        }
                        stack.push(this.productions_[action[1]][0]);
                        vstack.push(yyval.$);
                        lstack.push(yyval._$);
                        newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                        stack.push(newState);
                        break;
                    case 3:
                        return true;
                }
            }
            return true;
        }};


    parser._performAction = parser.performAction;
    parser.performAction = function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {
        var ret = parser._performAction.call(this, yytext, yyleng, yylineno, yy, yystate, $$, _$);
        if (this.$._type) {
            this.$.lineNo = yylineno;
        }
        return ret;
    };

    function Parser () {
        this.yy = {};
    }
    Parser.prototype = parser;parser.Parser = Parser;
    return new Parser;
})();


exports.parser = parser;
},{}],16:[function(require,module,exports){

var Rewriter = function() {
    this.initialise.apply(this, arguments);
};
Rewriter.prototype = {

    initialise: function(tokens)
    {
        _.bindAll(this);
        this.tokens = tokens;
    },

    rewrite: function()
    {
        this.newTokens = _.filter(this.tokens, this.rewriteToken);

        return this.newTokens;
    },

    rewriteToken: function(token, index)
    {
        if (token[0] == "{") {
            this.markForRemoval("TERMINATOR", token[2]);
        }

        if (token.length === 4 && token[3] === false) {
            return false;
        }

        return true;
    },

    markForRemoval: function(name, lineNo)
    {
        _.each(this.tokens, function(token, i) {
            if (token[0] == name && token[2] == lineNo) {
                this.tokens[i][3] = false;
            }
        }, this);
    }

};

exports.rewrite = function(tokens)
{
    var rewriter = new Rewriter(tokens);
    return rewriter.rewrite();
}
},{}],17:[function(require,module,exports){
(function (process){


/**
  *Keeps track of variables and their scope
  *@class ScopeManager
  *@constructor
*/
var ScopeManager = function() {
    this.initialise.apply(this, arguments);
};
ScopeManager.prototype = {

 /**
   *@method initialise

 */
    initialise: function()
    {
        _.bindAll(this);
        this.global = new Scope('__GLOBAL__');
        this.currentScope = this.global;
    },
    /**
     *Creates a new scope.
     *@method createScope
     *@param name The name of the scope
     */
    createScope: function(name)
    {
        var scope = this.currentScope.pushScope(name, this.currentScope);

        if (!scope) {
            console.log("Scope conlict: Cannot define identifier %s in scope %s", name, this.currentScope.name);
            process.exit();
        }

        this.currentScope = scope;
    },

     /**
     *Changes scope.
     *@method changeScope
     *@param scope the name of the scope
     */
     changeScope: function(name)
     {
        var scope = this.currentScope.pushScope(name, this.currentScope);

        if (!scope) {
            console.log("Scope conlict: Cannot define identifier %s in scope %s", name, this.currentScope.name);
            process.exit();
        }

        this.currentScope = scope;
     },
 /**
   *Exits current scope.
   *@method exitScope

 */
    exitScope: function()
    {
        if (!this.currentScope.parent) {
            //Cannot exit global scope
            return;
        }

        this.currentScope = this.currentScope.parent;
    },
 /**
   *Pushes a new identifier into the current scope.
   *@method pushIdentifier
   *@param name The name of the identifier
   *@param node The expression for the identifier
 */
    pushIdentifier: function(name, node)
    {
        this.currentScope.pushIdentifier(name, node);
    },
 /**
   *Pushes new identifiers from a namespace.
   *@method pushNamespace
   *@param ns The namespace
 */
    pushNamespace: function(ns,name)
    {
        for (var v in ns) 
            this.currentScope.pushIdentifier(name+"."+v, {expr:{_type:"Function"}});
    },
 /**
   *Checks if current scope has an Identifier.
   *@method hasIdentifier
   *@param name The name of the identifier
 */
    hasIdentifier: function(name)
    {
        return this.currentScope.hasIdentifier(name);
    },
 /**
   *Gets an Identifier.
   *@method getIdentifier
   *@param name The name of the identifier
 */
    getIdentifier: function(name)
    {
        return this.currentScope.getIdentifier(name);
    }

};
/**
  *Scope class
  *@class Scope
  *@constructor
*/
var Scope = function() {
    this.initialise.apply(this, arguments);
};


Scope.prototype = {

/**
 *@method initialise
 
*/
    initialise: function(name, parent)
    {
        _.bindAll(this);
        this.name = name;
        this.parent = parent;
        this.identifiers = {};
        this.children = {};
    },
/**
 *@method pushIdentifier
 
*/
    pushIdentifier: function(name, node)
    {
        this.identifiers[name] = node;
    },
/**
 *@method hasIdentifier
 
*/
    hasIdentifier: function(name)
    {
        return name in this.identifiers;
    },
/**
 *@method getIdentifier
 
*/
    getIdentifier: function(name)
    {
        return this.identifiers[name];
    },
/**
 *@method pushScope
 
*/
    pushScope: function(name)
    {
        if (this.hasScope(name)) {
            return false;
        }

        this.children[name] = new Scope(name, this);
        return this.children[name];
    },
/**
 *@method hasScope
 
*/
    hasScope: function(name)
    {
        return name in this.children;
    }

};

exports.ScopeManager = ScopeManager;
}).call(this,require("I:\\stavrosbackup\\DependencyLanguage\\node_modules\\grunt-browserify\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js"))
},{"I:\\stavrosbackup\\DependencyLanguage\\node_modules\\grunt-browserify\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js":2}],18:[function(require,module,exports){
var parser = require('./calculator').parser,
    CalcHandlers = require('./calc-handlers');
    
//variable registry which holds each variable in an entry

var VariableRegistry = function() {
    this.initialise.apply(this, arguments);
};
VariableRegistry.prototype = {

    initialise: function()
    {
        _.bindAll(this);
    },

    addToEntry: function(entry)
    {
        var _entry = new VariableEntry(entry);
        this[entry.name] = _entry.concat(this[entry.name] || {});
    },

    set: function(name,value)
    {
        this[name].set(value);
		this.evaluate(name);
    },

    unset: function(name,value)
    {
        this[name].unset();
    },

    //resolve each variable's value according to its expression
    evaluate: function(changed)
    {
   
		parser.yy = CalcHandlers(this);
		var start = changed ? this.sorted.indexOf(changed)+1 : 0;
		for (var i = 0; i< this.sorted.length-start; i++){
			var entry = this[this.sorted[start+i]];
			if (entry.hasOwnProperty('dependsOn')) {
				var value = parser.parse(entry.expr);
				this[this.sorted[start+i]].value = value		
			}
		}

        return this;
	},

	sortDependencies: function()
	{
        //resolve dependencies
        this.edges = this.getEdges();
        //topological sort
		this.sorted = tsort(this.edges);
	},


	
    //get graph edges (source->target) from dependencies 
	getEdges: function()
	{
		var edges = [];
		for (var v in this) {
			var entry = this[v];
			if (entry.hasOwnProperty('dependedOnBy'))
				for (var i=0; i<entry.dependedOnBy.length;i++)
					edges.push([v,entry.dependedOnBy[i]]);
		}
		return edges;
	}

};

var VariableEntry = function(entry) {
    
    this.initialise.apply(this, arguments);
    
    if (!entry) {
        this.name = "";
        this.expr = "";
        this.value = null;
		this.setValue = null;
        this.dependsOn = [];
        this.dependedOnBy = [];
    }
    else
    {    
        this.expr = entry.expr || "";
        this.value = entry.value ||null;
		this.setValue = entry.setValue || null;
        this.dependsOn = entry.dependsOn || [];
        this.dependedOnBy = entry.dependedOnBy || [];
    }

   
        
};
VariableEntry.prototype = {

    initialise: function()
    {
        _.bindAll(this);
    },

    concat: function(entry) 
    {
        if(entry) {
                this.expr = entry.expr ? entry.expr : this.expr;
                this.value = entry.value ? entry.value : this.value;
				this.setValue = entry.setValue ? entry.setValue : this.setValue;
                this.dependsOn = this.dependsOn.concat(entry.dependsOn || []);
                this.dependedOnBy = this.dependedOnBy.concat(entry.dependedOnBy || []);
        }
        return this;
    },

    set: function(value)
    {
        this.setValue = value;
    },

    unset: function()
    {
        this.setValue = null;
    },
    
    
};

function tsort(edges) {
  var nodes   = {}, // hash: stringified id of the node => { id: id, afters: lisf of ids }
      sorted  = [], // sorted list of IDs ( returned value )
      visited = {}; // hash: id of already visited node => true
 
  var Node = function(id) {
    this.id = id;
    this.afters = [];
  }
 
  // 1. build data structures
  edges.forEach(function(v) {
    var from = v[0], to = v[1];
    if (!nodes[from]) nodes[from] = new Node(from);
    if (!nodes[to]) nodes[to]     = new Node(to);
    nodes[from].afters.push(to);
  });
 
  // 2. topological sort
  Object.keys(nodes).forEach(function visit(idstr, ancestors) {
    var node = nodes[idstr],
        id   = node.id;
 
    // if already exists, do nothing
    if (visited[idstr]) return;
 
    if (!Array.isArray(ancestors)) ancestors = [];
 
    ancestors.push(id);
 
    visited[idstr] = true;
 
    node.afters.forEach(function(afterID) {
      if (ancestors.indexOf(afterID) >= 0)  // if already in ancestors, a closed chain exists.
        throw new Error('closed chain : ' +  afterID + ' is in ' + id);
 
      visit(afterID.toString(), ancestors.map(function(v) { return v })); // recursive call
    });
 
    sorted.unshift(id);
  });
 
  return sorted;
}
exports.VariableEntry = VariableEntry;
exports.VariableRegistry = VariableRegistry;
},{"./calc-handlers":6,"./calculator":7}]},{},[10])