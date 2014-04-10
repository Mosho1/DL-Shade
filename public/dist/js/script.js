(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

function noop() {}

process.on = noop;
process.once = noop;
process.off = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
(function (process){
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

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("c:\\Users\\SR71042\\Documents\\GitHub\\DependencyLanguage\\node_modules\\grunt-browserify\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js"))
},{"c:\\Users\\SR71042\\Documents\\GitHub\\DependencyLanguage\\node_modules\\grunt-browserify\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js":3}],5:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],6:[function(require,module,exports){
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

}).call(this,require("c:\\Users\\SR71042\\Documents\\GitHub\\DependencyLanguage\\node_modules\\grunt-browserify\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":5,"c:\\Users\\SR71042\\Documents\\GitHub\\DependencyLanguage\\node_modules\\grunt-browserify\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js":3,"inherits":2}],7:[function(require,module,exports){
var ScopeManager = require('./scope-manager').ScopeManager,
    f = require("util").format,
    functions = require('./functions'); //Built-in functions

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

},{"./functions":11,"./scope-manager":19,"util":6}],8:[function(require,module,exports){
var f = require('./functions');

var CalcHandlers = function(that){
    return{

       getVariableValue: function(name){
            _name = name.join('.');
            return (that && that[_name]) ? (that[_name].setValue ? that[_name].setValue : that[_name].value) : null;
        },

       createArray: function(arr){
            var rv = {};
            for (var i=0; i< arr.length; i++)
                if (arr[i] !== undefined) rv[i] = arr[i];
            return rv;
        },

        callFunction: function(name,args){
          return f[name[1]].apply(null, args);
        }
    };
    
};

module.exports = CalcHandlers;
},{"./functions":11}],9:[function(require,module,exports){
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
case 1: typeof console !== 'undefined' ? console.log() : print($$[$0-1]);
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
},{}],10:[function(require,module,exports){
var parser       = require('./parser').parser,
    nodes        = require('./nodes'),
    lexer        = require('./lexer'),
    rewriter     = require('./rewriter'),
    astValidator = require('./ast-validator'),
    jsCompiler   = require('./js-compiler');

parser.yy = nodes;

parser.lexer = {

    lex: function () {
        var token = this.tokens[this.pos] ? this.tokens[this.pos++] : ['EOF'];
        this.yytext = token[1];
        this.yylineno = token[2];
        return token[0];
    },

    setInput: function (tokens) {
        this.tokens = tokens;
        this.pos = 0;
    },

    upcomingInput: function () {
        return "";
    }

};

exports.parser = parser;

exports.compile = function (code) {
    var tokens = lexer.tokenise(code),
    //tokens = rewriter.rewrite(tokens);
        ast = parser.parse(tokens),
    /*var valid = astValidator.validate(ast);
3
    if (!valid) {
        console.log("Didn't compile due to code error");
    }
          */
        js = jsCompiler.compile(ast);

    return js;
};
},{"./ast-validator":7,"./js-compiler":13,"./lexer":14,"./nodes":16,"./parser":17,"./rewriter":18}],11:[function(require,module,exports){

var f = {
    a2l: function (arr, delim) {
        return arr.join(delim);
    },

    abs: function (num) {
        return Math.abs(num);
    },

    avg: function () {
        var i, avg = 0, num = 0, len = arguments.length;
        for (i = 0; i < arguments.length; i++) {
            num = Number(arguments[i]);
            !isNaN(num) ? avg += num : len--;
        }
        return avg / len;
    }
}




module.exports = f;



},{}],12:[function(require,module,exports){
(function (global){
﻿

var compiler = require('./compiler'),
    VariableRegistry = require('./variable-registry.js').VariableRegistry;

//Graph class. Holds the variable registry, currently has no distinctive methods and merely provides an interface for the registry.

var Graph = function (data) {
    this.initialise.apply(this, arguments);
    this.variables = (typeof data === 'string') ? compiler.compile(data).sortDependencies() : {};

};
Graph.prototype = {

    initialise: function () {
        _.bindAll(this);
    },

    set: function (name, value) {
        this.variables.set(name, value);
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

//exposed API
global.DL = global.DL  || {};
global.DL.createGraph = function (data) { return new Graph(data); };
global.DL.tokens = require('./lexer').tokenise;
global.DL.builtInFunctions = Object.keys(require('./functions')).map(function (elm) { return "f." + elm; });
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./compiler":10,"./functions":11,"./lexer":14,"./variable-registry.js":21}],13:[function(require,module,exports){
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




},{"./node-handlers":15,"./scope-manager":19,"./variable-registry.js":21}],14:[function(require,module,exports){
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
    "$cx"
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
},{}],15:[function(require,module,exports){
//parser sends here after a node has been classified
var  f = require('util').format;

var NodeHandlers = {

    // 4 + 3
    Math: function (node) {
        return f("%s %s %s", this.compileNode(node.left), node.operator, this.compileNode(node.right));
    },

    // 2
    Long: function (node) {
        return node.value;
    },

    Double: function (node) {
        return node.value;
    },

    // "yoyo"
    String: function (node) {
        return String(node.value);
    },

    // [element, element, ...]
    Array: function (node) {
        var list = "{";
        if (node.elements) {
            _.each(node.elements, function (element) {
                list += this.compileNode(element) + ",";
            }, this);
        }
        list = list.substring(0, list.length - 1) + "}";
        return list;
    },

    // print expr
    Print: function (node) {
        return f("console.log(%s);", this.compileNode(node.expr));
    },

    // (expr)
    BracketBlock: function (node) {
        return f("(%s)", this.compileNode(node.expr));
    },

    // var name = expr
    AssignVariable: function (node) {
        return f("var %s = %s;", node.name, this.compileNode(node.expr));
    },

    // val name = expr
    AssignValue: function (node) {
        this._type = "AssignValue";
        this.name = name;
        this.expr = expr;
        this.assignType = assignType;
    },

    // name = expr
    SetVariable: function(node) {
        this.currentVariable.name = this.currentNamespace + node.name;
        this.currentVariable.expr = this.compileNode(node.expr);
        this.variableRegistry.addToEntry(this.currentVariable);
    },

    // name
    CallVariable: function (node) {
        var _name = node.name.join('.');
        if (_name !== this.currentVariable.name && this.currentVariable.dependsOn.indexOf(_name) === -1) {
            this.currentVariable.dependsOn.push(node.name.join('.'));
            this.variableRegistry.addToEntry({name: node.name.join('.'),dependedOnBy: [this.currentVariable.name]}); }

        if (!node.name.join) {
            console.log(node);
        }
        return node.name.join('.');
    },

    // left == right
    Comparison: function (node) {
        return f("%s %s %s", this.compileNode(node.left), node.comparator, this.compileNode(node.right));
    },



    // fun(paramaters):ReturnType { [expr] }
    Closure: function (node) {
        var params = [], body = [];

        if (node.parameters) {
            _.each(node.parameters, function (parameter) {
                params.push(this.compileNode(parameter));
            }, this);
        }

        _.each(node.body, function (bodyNode) {
            body.push(this.compileNode(bodyNode));
        }, this);

        return f("_.bind(function (%s) {\n%s\n}, this)", params.join(""), body.join("\n"));
    },

    // var name: Type
    VariableParameter: function (node) {

    },

    // name([args])
    CallFunction: function (node) {
        var args = [];

        if (node.args) {
            _.each(node.args, function(arg) {
                args.push(this.compileNode(arg));
            }, this);
        }
        return f("%s(%s)", node.name[0].join("."), args.join(", "));
    },

    // class { [body] }
    Class: function (node) {
         var body = [];

        currentClass = node.name;

        _.each(node.body, function (bodyNode) {
            body.push(this.compileNode(bodyNode));
        });

        currentClass = "";

        return f("function %s() {\n_.bindAll(this);\nthis.initialise && this.initialise.apply(this, arguments);\n}\n%s", node.name, body.join("\n"));
    },

    // visisiblity name(parameters)
    Method: function (node) {
        var params = [], body = [];

        if (node.parameters) {
            _.each(node.parameters, function (parameter) {
                params.push(this.compileNode(parameter));
            }, this);
        }

        _.each(node.body, function (bodyNode) {
            body.push(this.compileNode(bodyNode));
        });

        return f("%s.prototype.%s = function(%s) {\n%s\n};", currentClass, node.name, params.join("\n"), body.join("\n"));
    },

    // new Name([args])
    ClassInstantiation: function (node) {
        return f("new %s()", node.name);
    },

    // true|false
    Boolean: function (node) {
        return node.value;
    },

    // (x == y) ? "eq : "neq"
    Ternary: function (node) {
        return f("%s ? %s : %s", this.compileNode(node.test), this.compileNode(node.equal), this.compileNode(node.nequal));
     },

    Namespace: function (ns) {
       this.currentNamespace = ns.name + ".";
    }
};

module.exports = NodeHandlers;
},{"util":6}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
(function (process){
﻿/* parser generated by jison 0.4.13 */
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
        symbols_: {"error":2,"program":3,"EOF":4,"body":5,"line":6,"TERMINATOR":7,"PRINT":8,"expr":9,"classdef":10,"assignment":11,"ifblocks":12,"IF":13,"(":14,")":15,"block":16,"ELSE":17,"elseifs":18,"{":19,"}":20,"VAR":21,"IDENTIFIER":22,"ASSIGN":23,"VAL":24,"MATH":25,"COMPARE":26,"BOOLOP":27,"TERNARY":28,":":29,"closure":30,"instantiation":31,"variablecall":32,"type":33,"namespace":34,"$cx":35,"parameters":36,"parameter":37,",":38,"arguments":39,"FUN":40,"CLASS":41,"classbody":42,"classline":43,"method":44,"PUBLIC":45,"NEW":46,"objectref":47,".":48,"LONG":49,"DOUBLE":50,"STRING":51,"BOOLEAN":52,"csv":53,"NULL":54,"$accept":0,"$end":1},
        terminals_: {2:"error",4:"EOF",7:"TERMINATOR",8:"PRINT",13:"IF",14:"(",15:")",17:"ELSE",19:"{",20:"}",21:"VAR",22:"IDENTIFIER",23:"ASSIGN",24:"VAL",25:"MATH",26:"COMPARE",27:"BOOLOP",28:"TERNARY",29:":",35:"$cx",38:",",40:"FUN",41:"CLASS",45:"PUBLIC",46:"NEW",48:".",49:"LONG",50:"DOUBLE",51:"STRING",52:"BOOLEAN",54:"NULL"},
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


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.parser = parser;
    exports.Parser = parser.Parser;
    exports.parse = function () { return parser.parse.apply(parser, arguments); };
    exports.main = function commonjsMain(args){if(!args[1]){console.log("Usage: "+args[0]+" FILE");process.exit(1)}var source=require("fs").readFileSync(require("path").normalize(args[1]),"utf8");return exports.parser.parse(source)};
    if (typeof module !== 'undefined' && require.main === module) {
        exports.main(process.argv.slice(1));
    }
}
}).call(this,require("c:\\Users\\SR71042\\Documents\\GitHub\\DependencyLanguage\\node_modules\\grunt-browserify\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js"))
},{"c:\\Users\\SR71042\\Documents\\GitHub\\DependencyLanguage\\node_modules\\grunt-browserify\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js":3,"fs":1,"path":4}],18:[function(require,module,exports){

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
},{}],19:[function(require,module,exports){
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
}).call(this,require("c:\\Users\\SR71042\\Documents\\GitHub\\DependencyLanguage\\node_modules\\grunt-browserify\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js"))
},{"c:\\Users\\SR71042\\Documents\\GitHub\\DependencyLanguage\\node_modules\\grunt-browserify\\node_modules\\browserify\\node_modules\\insert-module-globals\\node_modules\\process\\browser.js":3}],20:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  module.exports = {
    observe: function(object, property, value, handler) {
      var get, getter, set, setter, _ref;
      _ref = handler || {}, get = _ref.get, set = _ref.set;
      getter = function() {
        return typeof get === "function" ? get() : void 0;
      };
      setter = function(newValue) {
        if (typeof set === "function") {
          set(newValue);
        }
        return value = newValue;
      };
      if (_.isFunction(Object.defineProperty)) {
        return Object.defineProperty(object, property, {
          get: getter,
          set: setter
        });
      } else {
        object.__defineGetter__(property, getter);
        return object.__defineSetter__(property, setter);
      }
    }
  };

}).call(this);



},{}],21:[function(require,module,exports){
var parser = require('./calculator').parser,
    CalcHandlers = require('./calc-handlers');

_ = _ || {};
_.observe = require('./tools').observe;

//variable registry which holds each variable in an entry

var VariableRegistry = function () {

    this.initialise.apply(this, arguments);
    this.variables = {};
};
VariableRegistry.prototype = {

    initialise: function () {
        _.bindAll(this);
    },

    //TODO: refactor (and tests)
    addToEntry: function (entry) {
        var _entry = this.createEntry(entry);
        this.variables[entry.name] = _entry.concat(this.variables[entry.name] || {});
    },

    createEntry: function (entry) {
        var _entry = new VariableEntry(entry), _this = this;
        _.observe(_entry, 'model', 42, {
            set: function (value) {
                _this.set(_entry.name, value);
            },
            get: function () {
                return _this.getValue(_entry.name);
            }
        });
        return _entry;
    },

    set: function (name, value) {
        if (this.variables[name]) {
            this.variables[name].set(value);
            this.evaluate(name);
        }
    },

    getValue: function (name) {
        if (this.variables[name]) {
            return this.variables[name].get();
        }

    },

    get: function (name) {
        return this.variables[name];

    },

    unset: function (name, value) {
        if (this.variables[name]) {
            this.variables[name].unset();
        }
    },

    //resolve each variable's value according to its expression
    //TODO: refactor (and tests), refactor CalcHandlers to not be outside the object
    evaluate: function (changed) {
        parser.yy = new CalcHandlers(this.variables);
        var val, i, entry, start = changed ? this.sorted.indexOf(changed) + 1 : 0;
        for (i = 0; i < this.sorted.length - start; i++) {
            entry = this.get(this.sorted[start + i]);
            if (entry) {
                val = entry.expr ? parser.parse(entry.expr) : entry.expr;
                entry.evaluate(val);
            }
        }

        return this;
    },

    sortDependencies: function () {

        //resolve dependencies
        this.edges = this.getEdges();
        //topological sort
        this.sorted = tsort(this.edges);
        var v;
        for (v in this.variables) {
            if (this.variables.hasOwnProperty(v)) {
                if (this.sorted.indexOf(v) === -1) {
                    this.sorted.unshift(v);
                }
            }
        }

        return this;
    },

    //get graph edges (source->target) from dependencies 
    getEdges: function () {
        var entry, i, v, edges = [];
        for (v in this.variables) {
            entry = this.variables[v];
            if (entry.hasOwnProperty('dependedOnBy')) {
                for (i = 0; i < entry.dependedOnBy.length; i++) {
                    edges.push([v, entry.dependedOnBy[i]]);
                }
            }
        }
        return edges;
    }

};

var VariableEntry = function () {

    var args = arguments, entry = args[0];

    this.initialise.apply(this, arguments);

    //no arguments, blank entry
    if (!arguments.length) {
        this.name = "";
        this.expr = "";
        this.value = null;
        this.setValue = null;
        this.dependsOn = [];
        this.dependedOnBy = [];
    } else if (_.isObject(entry)) { //1 object argument, create entry from object
        this.name = entry.name || "";
        this.expr = entry.expr || "";
        this.value = entry.value === 0 ? 0 : (entry.value || null);
        this.setValue = entry.setValue === 0 ? 0 : (entry.setValue || null);
        this.dependsOn = entry.dependsOn || [];
        this.dependedOnBy = entry.dependedOnBy || [];
    } else { //otherwise create new entry from first 6 arguments
        this.name = args[0] || "";
        this.expr = args[1] || "";
        this.value = args[2] === 0 ? 0 : (args[2] || null);
        this.setValue = args[3] === 0 ? 0 : (args[3] || null);
        this.dependsOn = args[4] || [];
        this.dependedOnBy = args[5] || [];
    }
};
VariableEntry.prototype = {

    initialise: function () {
        _.bindAll(this);
    },

    //maybe have this not change `this`?
    concat: function (entry) {
        if (entry) {
            this.name = entry.name || this.name;
            this.expr = entry.expr || this.expr;
            this.value = entry.value === 0 ? 0 : (entry.value || this.value);
            this.setValue = entry.setValue === 0 ? 0 : (entry.setValue || this.setValue);
            this.dependsOn = this.dependsOn.concat(entry.dependsOn || []);
            this.dependedOnBy = this.dependedOnBy.concat(entry.dependedOnBy || []);
        }
        return this;
    },

    evaluate: function (value) {
        this.value = value;
        return this;
    },

    set: function (value) {
        this.setValue = value;
        return this;
    },

    get: function () {
        return (_.isNull(this.setValue) || _.isUndefined(this.setValue)) ? this.value : this.setValue;
    },

    unset: function () {
        this.setValue = null;
        return this;
    }
};

function tsort(edges) {
    var nodes   = {}, // hash: stringified id of the node => { id: id, afters: lisf of ids }
        sorted  = [], // sorted list of IDs ( returned value )
        visited = {}, // hash: id of already visited node => true

        Node = function (id) {
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
},{"./calc-handlers":8,"./calculator":9,"./tools":20}]},{},[12]);(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var handleCol = function (col) {
        this[col.Name] = _.transform(_.omit(col, 'Name'), function (str, val, opt) {
            str.push(opt.charAt(0) + '=' + val);
        }, []);
    },

    getOptions = function (c) {
        var opts = {};
        if (c.Col.length) {
            _.each(c.Col, handleCol, opts);
        } else {
            handleCol.call(opts, c.Col);
        }
        return opts;
    },

    getHeaderAndItems = function (node) {
        var items = node.Items.replace(/\s/g, '').split(/;+/);
        return {
            header: items[0],
            items: items.slice(1).join(',')
        };
    },

    makeOptionString = function (items, opts) {
        return items.map(function (item) {
            return (opts[item] || []).join('&');
        }).join('|');
    },

    makeOptions = function (c, items) {
        if (c && c.Col) {
            var options = getOptions(c);
            return makeOptionString(items.split('|'), options);
        }
    },

    createPropertyString = function (options) {
        return _.map(options, function (option, key) {
            return key + '=' + option;
        }).join(' ');
    };

module.exports = function (node, wat, multiSelect) { //TODO: wat

    var parts = getHeaderAndItems(node),
        options = makeOptions(node.Cols, parts.items);

    var propertyString = createPropertyString({
        'multi-select': !!multiSelect,
        'header': parts.header,
        'items': parts.items,
        'options': options
    });

    this.openElement('drop-down', '', node, '', propertyString);
    this.closeElement();
};

module.exports.test = {
    handleCol: handleCol,
    getOptions: getOptions,
    getHeaderAndItems: getHeaderAndItems,
    makeOptionString: makeOptionString,
    makeOptions: makeOptions,
    createPropertyString: createPropertyString
};
},{}],2:[function(require,module,exports){
var that = {},

    modeHandlers =  {
        'Span': function (grid) {
            span = grid.Span.split(',');
            span = span.map(Math.floor);

            return {'span': span};
        },
        'Rows': function (grid) {
            span = [grid.Rows, grid.Sub.Node.length / Number(grid.Rows)];
            flow = 'TToB';

            return {'span': span};
        },
        'Cols': function (grid) {
            span = [grid.Sub.Node.length / grid.Cols, Number(grid.Cols)];

            return {'span': span};
        },
        'ColWidth': function (grid, span) {
            widths = grid.ColWidth.match(/[^ ,]+/g);
            span[1] = Math.max(span[1], widths.length);

            return {'span': span, 'widths': widths};
        },
        'RowHeight': function (grid, span) {
            heights = grid.RowHeight.match(/[^ ,]+/g);
            span[0] = Math.max(span[0], heights.length);

            return {'span': span, 'heights': heights};
        },
        'Xy' : function (grid, span) {
            var nodes = _.filter(grid.Sub.Node, 'Xy');
            //create a map for the nodes according to Xy elements
            var gridMap = _.map(nodes, function (node, index) {
                return [node.Xy.match(/[^ ,]+/g).reduce(function (prev, cur) {
                    return +prev * span[1] + +cur;
                })].concat(index);
            }).sort(function (a, b) { return a[0] - b[0]; });

            grid.Sub.Node = (function () {
                var arr = [], i;
                for (i = 0; i < span[0] * span[1]; i++) {
                    arr.push((gridMap[0] || [-1])[0] === i ? nodes[gridMap.shift()[1]] : {'UI': 'Label'});
                }
                return arr;
            }());

            return {'grid': grid};
        },
        'CSpan' : function (grid) {
            var nodes = grid.Sub.Node;
            //create a map for the nodes according to CSpan elements
            var cspan, i = 0;
            while (i < nodes.length) {
                cspan = +nodes[i].CSpan || 1;
                [].splice.apply(nodes, [i, 0].concat(new Array(cspan).join('0').split('')));
                i += cspan;
            }

            return {'grid': grid};
        }
    },

    makeCol = function (node) {
        if (angular.isObject(node)) {
            var colCount = this.colCount,
                widths = this.widths,
                lastWidth = widths[colCount++] || widths[widths.length - 1],
                width = widths.length ? ('width:' + lastWidth + 'px; ') : '';

            that.openElement('td', '', {}, width, node.CSpan ? 'colspan="' + node.CSpan +'"' : ''); //TODO: add functionality to separate node attributes from the node object when they don't belong in the element
            that.nodeHandlers.Node(_.omit(node, 'CSpan'));
            that.closeElement();
        }
    },

    makeRow = function (nodes, heights, widths, rowCount) {
        var lastHeight = heights[rowCount++] || heights[heights.length - 1],
            height = heights.length ? 'height:' + lastHeight + 'px; ' : '',
            colCount = 0;

        that.openElement('tr', '', {}, height);
        _.each(nodes, makeCol, {widths: widths, colCount: colCount});
        that.closeElement();
    },

// span[1] is number of cols. For each type of flow we have a loop to create appropriate rows.
    makeGrid =  {
        'TToB' : function (grid, heights, widths, span) {
            var i, filterFunction = function (elm, ind) {return ind % span[1] === i; },
                nodes = grid.Sub.Node;

            for (i = 0; i < span[1]; i++) {
                makeRow(nodes.filter(filterFunction), heights, widths);
            }
        },
        'LToR' : function (grid, heights, widths, span) {
            var rowCount = 0, i,
                nodes = grid.Sub.Node;
            for (i = 0; i < nodes.length; i += span[1]) {
                makeRow(nodes.slice(i, i + span[1]), heights, widths, rowCount);
            }
        },
        'single': function (grid, heights, widths) {
            makeRow([grid.Sub.Node], heights, widths, 0);
        }
    },

    handleMode = function (mode, data) {
        nodes = this.Sub.Node;
        //check if parameters for each mode exist in grid (or nodes for 'Xy')
        if ((this[mode] && mode !== 'Xy' && mode !== 'CSpan') //TODO:refactor
                || (mode === 'Xy' && _.some(nodes, 'Xy'))
                || (mode === 'CSpan' && _.some(nodes, 'CSpan'))) {
            return modeHandlers[mode](this, data.span);
        }
    },

    modes = ['ColWidth', 'RowHeight', 'Span', 'Rows', 'Cols', 'Xy', 'CSpan'];

module.exports = function (grid) {

    that = this;

    if (_.isObject(grid)) {

        var flow = grid.Sub.Node.length ? grid.Flow || "LToR" : 'single';

        data = {grid: grid, heights: '', widths: '', span: []};

        _.each(modes, function (mode) {
            _.extend(data, handleMode.call(grid, mode, data));
        });

        if (data.span[1] > 0) {
            that.openElement('table', '', grid, '');
            makeGrid[flow](data.grid, data.heights, data.widths, data.span);
            that.closeElement();
        }
    }

};

module.exports.test = {
    modeHandlers: modeHandlers,
    makeCol: makeCol,
    makeRow: makeRow,
    makeGrid: makeGrid,
    handleMode: handleMode
};
},{}],3:[function(require,module,exports){
module.exports = function (styles) {

    var that = this;
    //parses styles. A bit messy, but gets the job done concisely and shouldn't be too hard to follow with the comments.
    var parsedStyles = styles.replace(/[^!-~]/g, "") //remove unneeded characters
        .split('}') //split lines into array
        .map(function (elm) {
            return elm.split('{');
        }) //split each line into an array: [name,styles]
        .map(function (elm) {
            if (elm[1]) { //if element has styles
                return [elm[0], (elm[1].split(';')//split styles into an array: ["styleName:styleValue" x <number of styles>]
                    .map(function (elm) {
                        return elm.split(':');
                    }) //split each "styleName:styleValue" pair into an array [styleName,styleValue]
                    .reduce(function (obj, val, ind) { //reduce the style array into an object where each style is a field.
                        obj[val[0]] = val[1]; // obj = {styleName: styleValue}
                        return obj;
                    }, {})
                    )];
            }
        })
        .filter(function (elm) {return elm; }) //remove garbage (undefined or otherwise falsey elements)
        .forEach(function (elm) { //for each of the parsed and organized classes
            var styles = _.reduce(elm[1], that.handleStyles, ''); //parse the styles using our handlers
            that.addStyles(elm[0], styles); //add styles to string to be added to the HTML output
        });
}
},{}],4:[function(require,module,exports){
angular.module('ShadeServices', [])

    .service('ShadeHandlers', function (ShadeElements, ShadeStyles) {

        this.openElement = ShadeElements.openElement;
        this.closeElement = ShadeElements.closeElement;
        this.getCurrent = ShadeElements.getCurrent;
        this.addStyles = ShadeStyles.addStyles;
        this.handleStyles = ShadeStyles.handleStyles;

        var that = this,
            handleSub = function (node) {
                _.each(((angular.isArray(node.Sub) ? node.Sub : {Node: node.Sub}) || {Node: {}}).Node, that.handleNodes);
            }

        //control-block handlers
        this.CbHandlers = {
            SETDLVARIABLE: function (cb) {
                return cb.Event + ',setDL,' + cb.Stat;
            },
            SHOWPOPUP: function (cb) {
                return cb.Event + ',popup,' + cb.Stat;

            },
            MESSAGE: function () {}

        };
        //TODO: change arguments to handlers below from array to an object
        this.UIHandlers = {

            //openElement = function (elmName, className, node, customStyles, customAttr, content, close) {

            Button: function (node, cb) {
                that.openElement('shd-button', 'btn btn-default', node, '', cb, '');
                that.closeElement();
            },

            CheckBox: function (node) {
                var attrs = node.Value ? '' : 'type="checkbox" label="' + node.Text + '"';
                that.openElement('div', 'inputs', node, '', attrs);
                that.closeElement();
            },

            DatePicker: function (node) {
                that.openElement('shd-date-picker', '', node, '');
                that.closeElement();

            },

            DropDown: require('./DropDown'),

            Grid: require('./Grid'),

            Image: function (node) {
                that.openElement('shd-image', '', node, '', '', '');
                that.closeElement();
            },

            Item: function (node) {
                that.openElement('li');
                that.openElement('a', '', {}, '', 'href="#"',node.Text)
                if (node.Sub) {
                    that.openElement('ul');
                    handleSub(node);
                    that.closeElement();
                }
                that.closeElement();
                that.closeElement();
            },

            Label: function (node) {
                that.openElement('div', '', node);
                that.closeElement();
            },

            ListBox: function (node) {
                that.openElement('list-box', '', node);
                handleSub(node);
                that.closeElement();
            },

            ListItem : function (node) {
                that.openElement('option', '', node);
                that.closeElement();
            },

            Menu : function (node) {
                that.openElement('ul', 'menu');
                handleSub(node);
                that.closeElement();
            },

            MultiSelComboBox: _.partialRight(require('./DropDown'), true),

            NumEdit: function (node) {
                that.openElement('div', 'inputs', node, '', 'type="text"');
                that.closeElement();
            },

            NumericUpDown: function (node) {
                that.openElement('num-up-down', '', node);
                that.closeElement();
            },

            Popup: function (node) {
                that.openElement('popup', '', node, 'display:none;');
                handleSub(node);
                that.closeElement();
            },

            RadioButton: function (node) {
                var attrs = node.Value ? '' : 'type="radio" value="' + node.Text +'" label="' + node.Text + '"';
                that.openElement('div', 'inputs', node, '', attrs);
                that.closeElement();
            },

            TabSet: function (node) {
                that.openElement('tabset', '', node);
                handleSub(node);
                that.closeElement();
            },

            Tab: function (node) {
                that.openElement('tab', '', node, '', 'heading="' + node.Text + '"', '');
                handleSub(node);
                that.closeElement();
            },

            TestDL: function (node) {
                that.openElement('test-dl', '', node);
                that.closeElement();
            },

            TextBox: function (node) {
                var attrs = 'type="text" placeholder="' + node.Text + '"'
                that.openElement('div', 'inputs', node, '', attrs, '');
                that.closeElement();
            },

            TimePicker: function (node) {
                that.openElement('time-picker', '', node, 'display:inline-block;');
                that.closeElement();
            },

            Unknown: function (node) {
                console.log("can't find control - " + node.UI)
            }

        };

        this.nodeHandlers = {
            Styles: require('./Styles').bind(that),

            Node: function (node) {

                var handleCb = function (result, Cb) {
                    return result += (result ? ';' : '') + that.CbHandlers[Cb.Fn](Cb);
                }

                var controlBlock = node.Cb ? 'control-block="' + _.reduce(node.Cb.length ? node.Cb : [node.Cb], handleCb, '') + '" ' : '';
                (that.UIHandlers[node.UI] || that.UIHandlers.Unknown).call(that, node, controlBlock);
            },
            Unknown: function (node, index) {
                console.log("can't recognize tag <" + index + ">.");
            }
        };


        this.handleNodes = function (node, index) {
            if (angular.isArray(node)) {
                _.each(node, that.handleNodes.bind({index: index}));
            } else {
                var handlers = that.nodeHandlers;
                (handlers[index] || handlers[this.index] || handlers.Unknown)(node, index);
            }
        };

        return this;

    })

    .service('ShadeParser', function (ShadeHandlers, ShadeStyles, ShadeElements) {

        this.parse = function (shd) {
            if (shd) {
                ShadeStyles.init();
                ShadeElements.init();

                _.each(shd.Shade, ShadeHandlers.handleNodes);
                return {
                    shade: shd.Shade,
                    styles: ShadeStyles.getStyles(),
                    elements: ShadeElements.getElements(),
                    elementsById: ShadeElements.getElementsById()
                };
            }
        }
        return this;
    })

    //translations from shade attributes and styles to HTML
    .service('ShadeStaticHandlers', function() {

        this.attrNameHandlers = {
            vDL: '',
            vText: '',
            Name: 'id',
            vActiveTabIndex: '',
            CSpan: 'colspan',
            DefaultValue: 'dvalue',
            Maximum: 'max',
            Minimum: 'min',
            FormatString: 'format',
            Source: 'src',
            Text: 'text',
            vSub: ''
        };

        this.attrValueHandlers = {

        };

        this.styleNameHandlers = {
            Width: '',
            Height: '',
            Fg: 'color',
            Bg: 'background-color'

        };

        this.styleValueHandlers = {
            Width: function (width) { return width + "px"; },
            Height: function (height) { return height + "px"; }
        };

        return this;

    })

    //responsible for creating a global string of styles for elements to be appended to a <style> tag
    .service('ShadeStyles', function (ShadeStaticHandlers) {

        var styleNames = ShadeStaticHandlers.styleNameHandlers,
            styleValues = ShadeStaticHandlers.styleValueHandlers,
            gstyles = "";

        this.addStyles = function (className, styles) {
            if (className && styles) {
                gstyles += "." + className + " { " + styles + "}\n";
            }
        };

        this.handleStyles = function (styles, value, style) {
            var stval, type;
            if (value && styleNames.hasOwnProperty(style)) {
                styles += (styleNames[style] || style) + ': ';
                type = typeof (stval = (styleValues[value] || styleValues[style]));
                if (type === 'undefined') {
                    styles += value.toLowerCase();
                } else if (type === 'function') {
                    styles += stval(value);
                } else {
                    styles += stval;
                }
                styles += " !important;";
            }

            return styles;

        };

        this.getStyles = function () {
            return gstyles;
        };

        this.init = function () {
            gstyles = "";
        };

        return this;
    })

    //creates an object describing an HTML page's element hierarchy.
    // This is later fed to the template that generates the HTML
    .service('ShadeElements', function (ShadeStyles) {


        var classCount = 0,
            elmId = 0,
            elements = [],
            elementsById = [],
            currentElement = {nodes: elements};

        //wrappers for creating HTML elements. Creates enumerated CSS classes for each element with style(s).
        this.openElement = function (elmName, className, node, customStyles, customAttr, content, close) {

            if (!_.isEmpty(node)) {
                node.id = elmId;
                elementsById[elmId++] = node;
            }

            var nativeStyles = _.reduce(node, ShadeStyles.handleStyles, ''),
                nativeClass = ((nativeStyles || customStyles) ? "class" + ++classCount : ''),
                node = node || {};
            cur = currentElement.nodes.push({
                elmName: elmName,
                nativeClass: nativeClass + (node.Style ? (' ' + node.Style) : ''),
                'className' : className,
                node: node,
                customStyles: customStyles,
                customAttr: customAttr,
                content: angular.isDefined(content) ? content : node.Text,
                nodes: [],
                parent: currentElement,
                id: node.id,
                close: _.isUndefined(close)

            });
            if (customStyles || nativeStyles) {
                ShadeStyles.addStyles(nativeClass, (customStyles || '') + (nativeStyles || ''));
            }
            currentElement = currentElement.nodes[cur - 1];



        };

        this.closeElement = function () {
            currentElement = currentElement.parent;
        };

        this.getCurrent = function () {
            return currentElement;
        }

        this.getElements = function () {
            return elements;
        };

        this.getElementsById = function () {
            return elementsById;
        };

        this.init = function () {
            classCount = 0;
            elmId = 0;
            elements = [];
            currentElement = {nodes: elements};
            elementsById = [];
        };

        return this;

    })

},{"./DropDown":1,"./Grid":2,"./Styles":3}]},{},[4]);// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp', ['ShadeServices', 'ngGrid', 'mgcrea.ngStrap.popover', 'ui.bootstrap']).directive('vActiveTabIndex', function() {
    return {
      restrict: 'A',
      link: function(scope, elm, attr) {
        scope.vactive = attr.vActiveTabIndex;
        scope.$watch('vars[vactive].model', function(vactive) {
          vactive = Number(vactive);
          if (angular.isDefined(scope.tabs[vactive])) {
            return _.each(scope.tabs, function(tab, ind) {
              tab.active = false;
              if (ind === vactive) {
                return tab.active = true;
              }
            });
          }
        });
        return scope.$watch('active', function(active) {
          return scope.vars[scope.vactive].model = active;
        });
      }
    };
  }).directive('shdImage', function($http) {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      require: '?ngModel',
      template: '<img ng-model="vars[vText].model" />',
      link: function(scope, elm, attr, ngModel) {
        scope.src = attr.src;
        scope.vText = attr.vText;
        if (angular.isDefined(ngModel)) {
          return ngModel.$render = function() {
            return $http.head(ngModel.$modelValue || 'default').success(function() {
              return elm.attr('src', ngModel.$modelValue);
            }).error(function() {
              return elm.attr('src', scope.src);
            });
          };
        }
      }
    };
  }).directive('listBox', function(vTextProvider) {
    return new vTextProvider('<select multiple ng-transclude />');
  }).directive('inputs', function(vTextProvider) {
    return new vTextProvider('<input />');
  }).directive('shdDatePicker', function(vTextProvider) {
    return new vTextProvider('<input type="text" datepicker-popup close-on-date-selection="false" />');
  }).directive('timePicker', function(vTextProvider) {
    return new vTextProvider('<div><timepicker /></div>');
  }).factory('vTextProvider', function() {
    return function(template) {
      this.restrict = 'ACE';
      this.transclude = !!template.match('ng-transclude');
      this.replace = true;
      this.scope = true;
      this.template = template.replace(/\/?>/, function(match) {
        return ' ng-model="vars[vText].model" ' + match;
      });
      this.link = function(scope, elm, attr) {
        scope.vText = attr.vText;
        if (attr.label) {
          return elm.after('<span>' + attr.label + '</span>');
        }
      };
    };
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').directive('shdButton', function($compile, $timeout, $templateCache) {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      transclude: true,
      template: function(elm, attr) {
        var cbs, events, handlers, toAppend;
        toAppend = '';
        if (attr.controlBlock) {
          cbs = (function() {
            var cb_arr, obj;
            obj = {};
            cb_arr = attr.controlBlock.split(';');
            cb_arr = _.map(cb_arr, function(str) {
              return str.split(/\s?,\s?/);
            });
            _.each(cb_arr, function(arr) {
              obj[arr[0]] = obj[arr[0]] || [];
              return obj[arr[0]].push(arr.slice(1));
            });
            return obj;
          })();
          events = {
            Click: 'ng-click=',
            "default": 'ng-click='
          };
          handlers = {
            setDL: function(name, val) {
              return 'vars[&quot;' + name + '&quot;].model=' + val + ';';
            },
            popup: function(popup, location) {
              return "popup('" + popup + "','" + location + "')";
            }
          };
          _.each(cbs, function(cb, name) {
            return toAppend += (events[name] || events["default"]) + '"' + (_.map(cb, function(el) {
              return handlers[el[0]](el[1], el[2]);
            })).join('') + '" ';
          });
        }
        return '<button ' + toAppend + '>{{vars[vText].model||text}}</button>';
      },
      link: function(scope, elm, attr) {
        scope.vText = attr.vText;
        scope.text = attr.text;
        return scope.popup = function(id, elm) {
          var clone, popup;
          popup = angular.element('#' + id);
          if (popup.attr('container') !== '#' + elm) {
            popup.triggerHandler('leave');
            clone = popup.clone();
            popup.after(clone).remove();
            clone.children().removeAttr('ng-transclude');
            clone.attr({
              'container': '#' + elm,
              'bs-popover': '',
              'trigger': 'manual',
              'template': angular.element('<div />').append(angular.element('<div />').append(angular.element('<div class="popupt"/>').append(clone.children()))).html()
            });
            popup = $compile(clone)(scope);
          }
          $timeout((function() {
            return popup.triggerHandler('popup');
          }), 50);
        };
      }
    };
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').directive('dropDown', function($filter, $timeout, $rootScope, ngGridFlexibleHeightPlugin) {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      template: '<table class="dropdown" ng-click="dropdown($event,ghide)"><tr class="selected"><td class="selectedItems">{{selected|selectedArray}}</td><td class="glyphicon glyphicon-chevron-down"></td></tr> <tr class="gridStyle" ng-grid="gridOptions" ng-class="{hide:ghide}" ng-click="select($event)" ng-animate></tr></table>',
      link: {
        pre: function(scope, elm, attr) {
          var header, items;
          header = attr.header.split('|');
          items = attr.items.split(',').map(function(elm) {
            return elm.split('|');
          });
          scope.myData = items.map(function(elm) {
            return elm.reduce((function(obj, el, ind) {
              obj[header[ind]] = el;
              return obj;
            }), {});
          });
          scope.selected = ["Click me"];
          scope.gridOptions = {
            data: 'myData',
            selectedItems: scope.selected,
            multiSelect: attr.multiSelect === 'true',
            plugins: [
              new ngGridFlexibleHeightPlugin({
                maxHeight: 300
              })
            ],
            enableSorting: false,
            rowHeight: 27
          };
          scope.ghide = true;
          scope.dropdown = function($event, state) {
            if (state) {
              $rootScope.$broadcast('fade');
            }
            _.kill_event($event);
            return scope.ghide = !state;
          };
          scope.select = function($event) {
            return _.kill_event($event);
          };
          scope.$on('bg_click', function() {
            return scope.dropdown();
          });
          scope.$on('fade', function() {
            return scope.dropdown();
          });
          return scope.$watchCollection('selected', function() {
            if (attr.multiSelect === 'false') {
              return scope.ghide = true;
            }
          });
        }
      }
    };
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').directive('format', function(format) {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: {
        pre: function(scope, elm, attr, ngModel) {
          var formatStr;
          formatStr = attr.format;
          if (angular.isDefined(ngModel)) {
            ngModel.$formatters.push(function(value) {
              if (angular.isNumber(value)) {
                return value = format(value, formatStr);
              }
            });
            ngModel.$parsers.unshift(function(value) {
              if (isNaN(value)) {
                value = ngModel.$modelValue;
              }
              return +value;
            });
            return elm.on('blur', function() {
              if (isNaN(elm.val())) {
                return elm.val(format(+ngModel.$modelValue, formatStr));
              } else {
                return elm.val(format(+elm.val(), formatStr));
              }
            });
          }
        }
      }
    };
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').directive('numUpDown', function($timeout, format) {
    return {
      restrict: 'E',
      scope: false,
      template: function(elm, attr) {
        var getAttrs;
        getAttrs = function() {
          var args;
          args = arguments;
          return _.reduce(args, function(str, val) {
            return str + val + '="' + attr[val] + '" ';
          }, '');
        };
        return '<div class="input-group">' + '<input style="width:90%" class="form-control" type="text" ng-model="vars[vText].model" dvalue="' + getAttrs('dvalue', 'min', 'max', 'format') + '"/>' + '<div class="btn-group-vertical">' + '<button class="btn btn-default" ng-mousedown="increase()" ng-mouseup="stop()" ng-mouseout="stop()">' + '<span class="glyphicon glyphicon-chevron-up" />' + '</button>' + '<button class="btn btn-default" ng-mousedown="decrease()" ng-mouseup="stop()" ng-mouseout="stop()">' + '<span class="glyphicon glyphicon-chevron-down" />' + '</button>' + '</div>' + '</div>';
      },
      link: function(scope, elm, attr) {
        var change, cto, formatStr, maxVal, minVal, mtimeout, step, test, timeout, updateModel;
        scope.vText = attr.vText;
        test = null;
        step = 1;
        minVal = +attr.min;
        maxVal = +attr.max;
        formatStr = attr.format;
        timeout = 300;
        mtimeout = 30;
        cto = null;
        updateModel = function(value) {
          value = +value;
          if (scope.vars && _.isFinite(value)) {
            return scope.vars[scope.vText].model = (value > maxVal ? maxVal : (value < minVal ? minVal : value));
          }
        };
        $timeout(function() {
          return updateModel(+attr.dvalue);
        });
        change = function(d) {
          if (timeout > mtimeout) {
            timeout -= 30;
          }
          $timeout(function() {
            return updateModel(scope.vars[scope.vText].model + d);
          });
          return cto = setTimeout(change, timeout, d);
        };
        scope.increase = _.partial(change, 1);
        scope.decrease = _.partial(change, -1);
        return scope.stop = function() {
          clearTimeout(cto);
          return timeout = 300;
        };
      }
    };
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').directive('renderPanel', function($compile, $rootScope, shadeTemplate, shadeData) {
    return {
      restrict: 'E',
      scope: {
        vars: '=',
        graph: '=',
        styles: '='
      },
      controller: function($element, $scope) {
        this.render = function() {
          if (shadeData.set(shadeTemplate.toHTML($scope.styles))) {
            $element.html('<style>' + shadeData.getStyles() + '</style>' + shadeData.getBody());
            return $compile($element.contents())($scope);
          }
        };
        $rootScope.$on('Run', this.render);
      }
    };
  }).directive('vSub', function($compile, shadeData, shadeTemplate, x2js) {
    return {
      restrict: 'A',
      link: function(scope, elm, attr) {
        scope.vSub = attr.vSub;
        return scope.$watch('vSub', function() {
          var body, content, shadeNode;
          shadeNode = shadeData.getElementById(attr.shdId);
          shadeNode.Sub.Node.push((x2js.xml2json(scope.vars[scope.vSub].model)).Node);
          content = shadeTemplate.toHTML({
            Shade: {
              Node: shadeNode
            }
          });
          body = angular.element(content.body);
          elm.html(body.html());
          return $compile(elm.contents())(scope);
        });
      }
    };
  }).directive('prettyPrintPanel', function($filter, shadeTemplate) {
    return {
      restrict: 'A',
      replace: true,
      template: '<div class="pp-panel"></div>',
      link: function(scope, elm, attrs) {
        return scope.$watch(attrs.prettyPrintPanel, function(shade) {
          var code, pre, raw_html;
          raw_html = $filter('indentHTML')((shadeTemplate.toHTML(shade) || {
            body: ''
          }).body);
          pre = angular.element('<pre class="prettyprint lang-html" style="font-size:0.75em"></pre>');
          code = angular.element('<code></code>');
          code.html($filter('escapeHTML')(raw_html));
          pre.append(code);
          elm.html(pre);
          return prettyPrint();
        });
      },
      controller: function($scope, $http) {
        var themes;
        $scope.themes = themes = {
          list: ['google-code-light', 'solarized-dark', 'solarized-light', 'sons-of-obsidian-dark', 'tomorrow-night-blue', 'tomorrow-night-dark', 'tomorrow-night-light', 'tomorrow-night-eighties'],
          selected: 'google-code-light'
        };
        return $scope.$watch('themes.selected', function(theme_name) {
          var url;
          url = "styles/gprettify/" + theme_name + ".css";
          return $http.get(url).then(function(response) {
            return themes.css = response.data;
          });
        });
      }
    };
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').factory('ngGridFlexibleHeightPlugin', function() {
    var ngGridFlexibleHeightPlugin;
    return ngGridFlexibleHeightPlugin = function(opts) {
      var self;
      self = this;
      self.grid = null;
      self.scope = null;
      self.init = function(scope, grid, services) {
        var innerRecalcForData, recalcHeightForData;
        self.domUtilityService = services.DomUtilityService;
        self.grid = grid;
        self.scope = scope;
        recalcHeightForData = function() {
          setTimeout(innerRecalcForData, 1);
        };
        innerRecalcForData = function() {
          var extraHeight, footerPanelSel, gridId, naturalHeight, newViewportHeight;
          gridId = self.grid.gridId;
          footerPanelSel = "." + gridId + " .ngFooterPanel";
          extraHeight = self.grid.$topPanel.height() + $(footerPanelSel).height();
          naturalHeight = self.grid.$canvas.height() + 1;
          if (opts != null) {
            if ((opts.minHeight != null) && (naturalHeight + extraHeight) < opts.minHeight) {
              naturalHeight = opts.minHeight - extraHeight - 2;
            }
            if ((opts.maxHeight != null) && (naturalHeight + extraHeight) > opts.maxHeight) {
              naturalHeight = opts.maxHeight - extraHeight - 2;
            }
          }
          newViewportHeight = naturalHeight + 2;
          if (!self.scope.baseViewportHeight || self.scope.baseViewportHeight !== newViewportHeight) {
            self.grid.$viewport.css("height", newViewportHeight + "px");
            self.grid.$root.css("height", (newViewportHeight + extraHeight) + "px");
            self.scope.baseViewportHeight = newViewportHeight;
            self.domUtilityService.RebuildGrid(self.scope, self.grid);
          }
        };
        self.scope.catHashKeys = function() {
          var hash, idx;
          hash = "";
          idx = void 0;
          for (idx in self.scope.renderedRows) {
            hash += self.scope.renderedRows[idx].$$hashKey;
          }
          return hash;
        };
        self.scope.$watch("catHashKeys()", innerRecalcForData);
        self.scope.$watch(self.grid.config.data, recalcHeightForData);
      };
    };
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  angular.module("ShadeApp").filter("selectedArray", function() {
    return function(arr) {
      if (_.isString(arr[0]) && arr.length === 1) {
        return arr[0];
      }
      return _.reduce(arr, (function(str, item, ind) {
        if (_.isPlainObject(item)) {
          return str + _.values(item) + (ind !== arr.length - 1 ? ";" : '');
        } else {
          return str;
        }
      }), "");
    };
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').service('format', function() {
    return function(input, str) {
      var i, length, matches, output, replacer;
      if (angular.isNumber(input)) {
        input = input.toString();
        replacer = function(match) {
          if (input[i] === ".") {
            i++;
          }
          return input[i++] || (match === "#" ? "" : "0");
        };
        length = parseInt(input, 10).toString().length;
        matches = str.match(/[0#](?=.*\.)/g).length;
        i = length - matches;
        return output = str.replace(/[\s,]/g, '').replace(/[0#]/g, replacer);
      }
    };
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').service('shadeData', function() {
    var data;
    data = {};
    this.set = function(_data) {
      return data = _data;
    };
    this.get = function() {
      return data;
    };
    this.getElementById = function(id) {
      return data.elementsById[id];
    };
    this.getStyles = function() {
      return data.styles;
    };
    this.getBody = function() {
      return data.body;
    };
    return this;
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  angular.module("ShadeApp").service("ShadeIdentifiers", function(ShadeStaticHandlers, ShadeHandlers) {
    var sh, sw;
    sh = ShadeStaticHandlers;
    sw = ShadeHandlers;
    return (function(key, an, av, sn, sv, c, cb, mn) {
      return {
        attrNames: {
          type: "Attribute Name",
          keys: key(an || {})
        },
        attrValues: {
          type: "Attribute Value",
          keys: key(av || {})
        },
        styleNames: {
          type: "Style Name",
          keys: key(sn || {})
        },
        styleValues: {
          type: "Style Value",
          keys: key(sv || {})
        },
        controls: {
          type: "Control",
          keys: key(c || {})
        },
        controlBlocks: {
          type: "Control Block",
          keys: key(cb || {})
        },
        mainNodes: {
          type: "",
          keys: key(mn || {})
        }
      };
    })(Object.keys, sh.attrNameHandlers, sh.attrValueHandlers, sh.styleNameHandlers, sh.styleValueHandlers, sw.UIHandlers, sw.CbHandlers, sw.nodeHandlers);
  }).service("ShadeAttrDictionary", function(ShadeStaticHandlers) {
    return {
      attrNameHandlers: ShadeStaticHandlers.attrNameHandlers,
      attrValueHandlers: ShadeStaticHandlers.attrValueHandlers
    };
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').service('shadeTemplate', function($http, x2js, ShadeParser, ShadeAttrDictionary) {
    var template;
    template = function() {};
    $http.get('/scripts/Shade/ng_template_shd.ejs').success(function(data) {
      _.templateSettings.variable = "shd";
      return template = _.template(data);
    }).error(function() {
      return console.log("could not retrieve shade template");
    });
    this.toHTML = function(shade) {
      var parsed;
      if (!angular.isObject(shade)) {
        shade = x2js.xml2json(shade);
      }
      parsed = ShadeParser.parse(shade) || {};
      _.extend(parsed, ShadeAttrDictionary);
      return {
        body: template(parsed),
        styles: parsed.styles,
        elementsById: parsed.elementsById
      };
    };
    return this;
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  'use strict';
  angular.module('DLApp', ['ShadeApp']).config([
    '$httpProvider', function($httpProvider) {
      $httpProvider.defaults.useXDomain = true;
      return delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
  ]);

  _.kill_event = function(e) {
    if (_.isObject(e)) {
      e.cancelBubble = true;
      e.stopPropagation();
      return e.preventDefault();
    }
  };

  _.corsproxy = function(css_url) {
    var m;
    m = css_url.match(/https?:\/\/(.+)/);
    if (!m) {
      return false;
    }
    return "http://www.corsproxy.com/" + m[1];
  };

  _.position = function(elm) {
    var p;
    p = {
      x: elm.offsetLeft || 0,
      y: elm.offsetTop || 0
    };
    while (elm = elm.offsetParent) {
      p.x += elm.offsetLeft;
      p.y += elm.offsetTop;
    }
    return p;
  };

  String.prototype.toDash = function() {
    return this.replace(/([A-Z])/g, function($1) {
      return "-" + $1.toLowerCase();
    });
  };

  _.toDash = function(str) {
    return str.replace(/([A-Z])/g, function($1) {
      return "-" + $1.toLowerCase();
    });
  };

  _.mapKeys = function(object, callback, thisArg) {
    var result;
    result = {};
    callback = _.createCallback(callback, thisArg, 3);
    _.forOwn(object, function(value, key, object) {
      result[callback(value, key, object)] = value;
    });
    return result;
  };

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  'use strict';
  var default_lc;

  default_lc = "/* Welcome to Dependency Language in JavaScript!\n Features:\n -Supported Formats:\n Numbers, Strings, arrays\n -Namespaces (format: '$ns') -Built-in Functions:\n f.abs, f.avg\n -Themes for the editor\n -Graph or table presentation of the graph\n -Click 'Run' above or alt+R */\n \n x=1;\n y=2;\n z=f.avg(x,y,6);";

  angular.module('DLApp').controller('DLCtrl', function($scope, $rootScope, $http, $filter, $element, $document, $timeout, Graph) {
    var DLpath;
    $scope.DLcode = {
      code: default_lc
    };
    DLpath = 'DLcode/test.txt';
    $http.get(DLpath).then(function(response) {
      return $scope.DLcode = {
        code: response.data
      };
    });
    $document.keyup(function(e) {
      var col;
      if (e.altKey) {
        if (e.keyCode === 82) {
          $scope.DLrun(e);
        }
        if (col = $scope.cols[e.keyCode - 49]) {
          return $scope.$apply(col.show = !col.show);
        }
      }
    });
    $scope.styles = {
      active: 'control',
      sheets: {
        basics: {
          source: 'XML/shade.xml',
          "native": true
        },
        control: {
          source: 'XML/control.xml',
          "native": true
        },
        menu: {
          source: 'XML/menu.xml',
          "native": true
        }
      },
      external: '',
      editor: ''
    };
    $scope.copy_style = function(e, style_name) {
      var copy, i, name;
      _.kill_event(e);
      copy = _.clone($scope.styles.sheets[style_name]);
      style_name = style_name.match(/(.*?)(:? copy(:? \d+)?)?$/)[1];
      name = "" + style_name + " copy";
      i = 0;
      while (name in $scope.styles.sheets) {
        name = "" + style_name + " copy " + (++i);
      }
      copy["native"] = false;
      $scope.styles.sheets[name] = copy;
      return $scope.styles.active = name;
    };
    $scope.delete_style = function(e, style_name) {
      _.kill_event(e);
      delete $scope.styles.sheets[style_name];
      if ($scope.styles.active === style_name) {
        return $scope.styles.active = Object.keys($scope.styles.sheets)[0];
      }
    };
    $scope.DLrun = function(e) {
      if (e) {
        _.kill_event(e);
      }
      return Graph.getGraph($scope.DLcode.code, $scope.styles, function(graph) {
        $scope.graph = graph.evaluate();
        return $rootScope.$broadcast("Run");
      });
    };
    $document.ready(function() {
      return $timeout($scope.DLrun, 100);
    });
    $scope.$watch('styles.active', function() {
      var styles;
      if ($scope.styles.active in $scope.styles.sheets) {
        styles = $scope.styles.sheets[$scope.styles.active];
        if (styles.css) {
          return $scope.styles.editor = $filter('prettifyCSS')($filter('deSassify')(styles.css));
        } else {
          return $http.get(styles.source).then(function(response) {
            styles.css = response.data;
            return $scope.styles.editor = $filter('prettifyCSS')($filter('deSassify')(styles.css));
          });
        }
      }
    });
    $scope.$watch('styles.editor', function() {
      if ($scope.styles.sheets[$scope.styles.active]) {
        return $scope.styles.sheets[$scope.styles.active].css = $scope.styles.editor;
      }
    });
    return $scope.$watch('styles.external', function() {
      if (!($scope.styles.external && /^(https?:\/\/)?(\w+\.)+[\w\/]+/.test($scope.styles.external))) {
        return;
      }
      return $http.get(_.corsproxy($scope.styles.external)).then(function(response) {
        var file_name, i, name;
        i = 0;
        file_name = $scope.styles.external.match(/.+?\/(\w+)\.css/);
        name = file_name && file_name[1] || "external";
        while (name in $scope.styles.sheets) {
          name = "external " + (++i);
        }
        $scope.styles.sheets[name] = {
          source: $scope.styles.external,
          css: response.data,
          external: true,
          edited: false
        };
        $scope.styles.active = name;
        return $scope.styles.external = '';
      });
    });
  }).directive('menu', function($compile, $rootScope) {
    return {
      scope: {
        col: '=',
        themes: '=',
        setTheme: '&'
      },
      restrict: 'C',
      controller: function($scope) {
        $scope.menuitems || ($scope.menuitems = {
          show: false
        });
        return $scope.$on('bg_click', function() {
          return $scope.$apply(function() {
            return $scope.menuitems.show = false;
          });
        });
      },
      link: function(scope, elm, attrs) {
        var menu_items;
        elm.children('.menu-title').bind('click', function(e) {
          var show;
          _.kill_event(e);
          show = !scope.menuitems.show;
          $rootScope.$broadcast('bg_click');
          return scope.$apply(function() {
            return scope.menuitems.show = show;
          });
        });
        menu_items = elm.children('.menu-items');
        menu_items.attr('ng-class', "{in:menuitems.show}");
        menu_items.bind('click', _.kill_event);
        return $compile(menu_items)(scope);
      }
    };
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('DLApp').directive('aceEditor', function() {
    return {
      restrict: 'A',
      require: '?ngModel',
      scope: false,
      link: function(scope, elm, attrs, ngModel) {
        var acee, session;
        scope.acee = acee = window.ace.edit(elm[0]);
        scope.session = session = acee.getSession();
        scope.mode = attrs.mode;
        scope.makeCompletions = function(prefix, collection, meta) {
          return collection.filter(function(elm) {
            return elm.substring(0, prefix.length).toUpperCase() === prefix.toUpperCase();
          }).map(function(elm) {
            return {
              name: elm,
              value: elm,
              meta: meta
            };
          });
        };
        acee.setTheme("ace/theme/solarized_light");
        acee.getSession().setMode("ace/mode/" + scope.mode);
        acee.setOptions({
          showGutter: true,
          enableCustomAutocompletion: true
        });
        acee.setReadOnly(false);
        acee.setHighlightActiveLine(false);
        acee.setShowPrintMargin(false);
        acee.commands.on("afterExec", function(e) {
          if (e.command.name === "insertstring" && /^[\w.]$/.test(e.args)) {
            acee.execCommand("startCustomAutocomplete");
          }
        });
        scope.themes = ['merbivore', 'merbivore_soft', 'mono_industrial', 'monokai', 'pastel_on_dark', 'solarized_dark', 'solarized_light', 'terminal', 'textmate', 'tomorrow', 'tomorrow_night', 'tomorrow_night_blue', 'tomorrow_night_eighties', 'twilight', 'vibrant_ink', 'xcode'];
        scope.setTheme = function(name) {
          return scope.acee.setTheme("ace/theme/" + name);
        };
        if (angular.isDefined(ngModel)) {
          ngModel.$formatters.push(function(value) {
            if (angular.isUndefined(value) || value === null) {
              return '';
            } else if (angular.isObject(value) || angular.isArray(value)) {
              throw new Error('ace-editor cannot use an object or an array as a model');
            }
            return value;
          });
          ngModel.$render = function() {
            return session.setValue(ngModel.$viewValue);
          };
        }
        return session.on('change', function(e) {
          var newValue;
          newValue = session.getValue();
          if (newValue !== scope.$eval(attrs.value) && !scope.$$phase && angular.isDefined(ngModel)) {
            return scope.$apply(function() {
              return ngModel.$setViewValue(newValue);
            });
          }
        });
      },
      controller: function($scope, $rootScope) {
        return $rootScope.$on('panel_resized', function() {
          return $scope.acee.resize();
        });
      }
    };
  }).directive('dlEditor', function(Graph) {
    return {
      restrict: 'A',
      scope: false,
      link: function(scope, elm, attrs) {
        var DLcompleter;
        scope.langTools = window.ace.require("ace/ext/language_tools");
        DLcompleter = {
          getCompletions: function(editor, session, pos, prefix, callback) {
            var functions, identifiers, nameList;
            if (session.$modeId !== "ace/mode/" + attrs.mode) {
              return callback(null, []);
            }
            identifiers = scope.makeCompletions(prefix, Object.keys(scope.graph.variables.variables), "variable");
            functions = scope.makeCompletions(prefix, Graph.getFunctions(), "function");
            nameList = identifiers.concat(functions);
            return callback(null, nameList);
          }
        };
        return scope.langTools.addCompleter(DLcompleter);
      }
    };
  }).directive('shadeEditor', function(Graph, ShadeIdentifiers) {
    return {
      restrict: 'A',
      scope: false,
      link: function(scope, elm, attrs) {
        var DLcompleter;
        scope.langTools = window.ace.require("ace/ext/language_tools");
        DLcompleter = {
          getCompletions: function(editor, session, pos, prefix, callback) {
            var nameList;
            if (session.$modeId !== "ace/mode/" + attrs.mode) {
              return callback(null, []);
            }
            nameList = [];
            _.each(ShadeIdentifiers, function(dict) {
              return nameList = nameList.concat(scope.makeCompletions(prefix, dict.keys, dict.type));
            });
            return callback(null, nameList);
          }
        };
        return scope.langTools.addCompleter(DLcompleter);
      }
    };
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('DLApp').directive('renderGraph', function() {
    return {
      restrict: 'E',
      require: '?ngModel',
      scope: false,
      controller: function($scope, $rootScope, $element, $compile, graphService, $document) {
        $scope.gshow = false;
        $scope.themes = ['Graph', 'Table'];
        $scope.elems = {};
        $scope.elems['Table'] = $compile('<div ng-hide="gshow"></div>')($scope);
        $scope.elems['Graph'] = $compile('<div ng-show="gshow"></div>')($scope);
        _.each($scope.elems, function(value) {
          return $element.append(value);
        });
        $rootScope.$on('Run', function() {
          return _.each($scope.themes, function(value) {
            graphService.deleteGraph(value);
            return graphService.drawGraph[value]($scope.graph, $scope.elems[value][0]);
          });
        });
        return $scope.setTheme = function(name) {
          var _ref, _ref1;
          graphService.deleteGraph((_ref = name === 'Graph') != null ? _ref : {
            'Table': 'Graph'
          });
          graphService.drawGraph[name]($scope.graph, $scope.elems[name][0]);
          return $scope.gshow = (_ref1 = name === 'Graph') != null ? _ref1 : {
            "true": false
          };
        };
      }
    };
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('DLApp').directive('splitRow', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        styles: '=',
        graph: '=',
        cols: '=',
        col: '=',
        DLcode: '='
      },
      replace: true,
      template: '<div class="split-row" ng-transclude></div>',
      controller: function($scope, $element, $compile, $rootScope, $window) {
        var body, cols, dragged;
        $scope.row = $element[0];
        cols = $scope.cols = [];
        $scope.col = function(name) {
          var c;
          return ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = cols.length; _i < _len; _i++) {
              c = cols[_i];
              if (c.name === name) {
                _results.push(c);
              }
            }
            return _results;
          })())[0];
        };
        body = document.getElementsByTagName("body")[0];
        body.addEventListener('click', function(e) {
          return $rootScope.$broadcast('bg_click');
        });
        $(document).keyup(function(e) {
          if (e.keyCode === 27) {
            return $rootScope.$broadcast('bg_click');
          }
        });
        this.equalCols = function(ncols) {
          var c, new_ratio, _i, _len, _results;
          ncols || (ncols = ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = cols.length; _i < _len; _i++) {
              c = cols[_i];
              if (c.show) {
                _results.push(c);
              }
            }
            return _results;
          })()).length);
          new_ratio = 1 / ncols;
          _results = [];
          for (_i = 0, _len = cols.length; _i < _len; _i++) {
            c = cols[_i];
            if (c.show) {
              _results.push(c.ratio = new_ratio);
            } else {
              _results.push(c.ratio = 0);
            }
          }
          return _results;
        };
        this.findLastCol = function() {
          var c, last_shown, _i, _len;
          if (!cols.length) {
            return;
          }
          last_shown = null;
          for (_i = 0, _len = cols.length; _i < _len; _i++) {
            c = cols[_i];
            c.last_shown = false;
            if (c.show) {
              last_shown = c;
            }
          }
          if (last_shown) {
            return last_shown.last_shown = true;
          }
        };
        this.addCol = function(col) {
          return $scope.$apply((function(_this) {
            return function() {
              col.index = cols.length;
              cols.push(col);
              _this.equalCols();
              return col.div.append($compile('<drag-area ng-show="!last_shown"></drag-area>')(col));
            };
          })(this));
        };
        $window.r = $scope.row;
        dragged = (function(_this) {
          return function(x) {
            return $scope.$apply(function() {
              var after, before, c, cumRatio, i;
              before = $scope.dragging;
              after = cols[i = before.index + 1];
              while (!after.show) {
                after = cols[++i];
              }
              cumRatio = ((function() {
                var _i, _len, _results;
                _results = [];
                for (_i = 0, _len = cols.length; _i < _len; _i++) {
                  c = cols[_i];
                  if (c.index < before.index) {
                    _results.push(c.ratio);
                  }
                }
                return _results;
              })()).reduce((function(t, s) {
                return t + s;
              }), 0);
              before.ratio = (x - $scope.row.offsetLeft) / _this.row_width - cumRatio;
              if (before.ratio < 0.1) {
                before.ratio = 0.1;
              }
              after.ratio = 1 - ((function() {
                var _results;
                _results = [];
                for (i in cols) {
                  if (parseInt(i) !== after.index) {
                    _results.push(cols[i].ratio);
                  }
                }
                return _results;
              })()).reduce((function(t, s) {
                return t + s;
              }), 0);
              if (after.ratio < 0.1) {
                after.ratio = 0.1;
                before.ratio = 1 - ((function() {
                  var _results;
                  _results = [];
                  for (i in cols) {
                    if (parseInt(i) !== before.index) {
                      _results.push(cols[i].ratio);
                    }
                  }
                  return _results;
                })()).reduce((function(t, s) {
                  return t + s;
                }), 0);
              }
              if (before.div[0].onresize) {
                before.div[0].onresize();
              }
              if (after.div[0].onresize) {
                after.div[0].onresize();
              }
              return $rootScope.$broadcast('panel_resized');
            });
          };
        })(this);
        ($scope.row.onresize = (function(_this) {
          return function() {
            return _this.row_width = $scope.row.offsetWidth;
          };
        })(this))();
        this.start_drag = function(col, e) {
          _.kill_event(e);
          return $scope.dragging = col;
        };
        document.onmousemove = function(e) {
          e.preventDefault();
          if ($scope.dragging) {
            dragged(e.clientX);
          }
          if (!e.caughtBy) {
            return $rootScope.$broadcast('mousemoved');
          }
        };
        document.onmouseup = function() {
          return $scope.dragging = null;
        };
      }
    };
  }).directive('resizablePanel', function($rootScope, $timeout) {
    return {
      require: '^splitRow',
      restrict: 'E',
      transclude: true,
      scope: {
        name: '@',
        show: '@'
      },
      replace: true,
      template: '<div class="resizable-panel" ng-transclude ng-style="{width: \'\'+(ratio*100)+\'%\'}" ng-show="show"></div>',
      controller: function($scope, $rootScope) {
        return $scope.$watch('show', function() {
          $scope.show = !!$scope.show;
          $scope.ctrl.equalCols();
          $scope.ctrl.findLastCol();
          return setTimeout(function() {
            return $rootScope.$broadcast('panel_resized');
          });
        });
      },
      link: function(scope, elm, attrs, splitRowCtrl) {
        scope.themes = [];
        scope.div = elm;
        scope.ctrl = splitRowCtrl;
        scope.mouseover = false;
        setTimeout((function() {
          scope.show = !!scope.show;
          return splitRowCtrl.addCol(scope);
        }), 0);
        elm.bind('mousemove', function(e) {
          e.originalEvent.caughtBy = scope.name;
          if (!scope.mouseover) {
            return $rootScope.$broadcast('mousemoved', scope.name);
          }
        });
        return scope.$on('mousemoved', function(e, name) {
          return $timeout(function() {
            return scope.mouseover = name === scope.name;
          });
        });
      }
    };
  }).directive('dragArea', function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<div class="drag-area"></div>',
      scope: false,
      link: function(scope, elm, attrs) {
        return elm.bind('mousedown', function(e) {
          return scope.ctrl.start_drag(scope, e);
        });
      }
    };
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  'use strict';
  angular.module('DLApp').filter('indentHTML', function() {
    return function(html) {
      var indent;
      if (!html) {
        return;
      }
      indent = function(html) {
        var cl, i, ind, insert, k, n, op, open, str, _i;
        str = html;
        i = 1;
        k = 0;
        open = -1;
        insert = function() {
          return str = [str.slice(0, open), '(', Array(i).join(')'), str.slice(open)].join('');
        };
        ind = function(c) {
          return str.indexOf(c, open + i + k + 1);
        };
        for (n = _i = 1; _i <= 1000; n = ++_i) {
          open = ind('<');
          if (open === -1) {
            return str;
          }
          if (str.charAt(open + 1) === '/') {
            insert();
            i--;
            k = 1;
          } else {
            i++;
            insert();
            k = 0;
          }
          op = ind('<');
          cl = ind('/>');
          if (cl > -1 && op > cl) {
            k = 1;
            i--;
          }
        }
      };
      return indent(html, 1).replace(/\(/g, '\n').replace(/\)/g, '  ');
    };
  }).filter('md2html', function($interpolate, $rootScope) {
    return function(md) {
      if (md && md.replace(/\s*/, '')) {
        return markdown.toHTML(md);
      } else {
        return '';
      }
    };
  }).filter('shade2html', function(x2js) {
    return function(Shade) {
      var template, templateData;
      templateData = x2js.xml2json(Shade);
      _.extend(templateData, {
        'NodeHandlers': NodeHandlers
      });
      template = _.template($rootScope.shadeTemplate);
      return template(templateData);
    };
  }).filter('escapeHTML', function($interpolate, $rootScope) {
    return function(html) {
      if (html && html.replace(/\s*/, '')) {
        return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      } else {
        return '';
      }
    };
  }).filter('scopeCSS', function($filter) {
    return function(css, prefix, prettify) {
      var blacklist, doc, response, scope_selectors, styles;
      doc = document.implementation.createHTMLDocument("");
      styles = document.createElement("style");
      styles.innerText = css;
      doc.body.appendChild(styles);
      blacklist = /(^| )(head|title|link|style|script)($| )/;
      response = '';
      scope_selectors = function(rules) {
        var contained_styles, cssText, i, line, mtch, n, prop_decl, prop_url_pairs, r, s, selector, selectors, splitter, url_content, url_selector, _i, _j, _k, _len, _len1, _ref, _ref1, _ref2, _results;
        if (!rules.length) {
          return;
        }
        _results = [];
        for (i = _i = 0, _ref = rules.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          if (rules[i].selectorText) {
            selectors = rules[i].selectorText.split(', ');
            selector = ((function() {
              var _j, _len, _results1;
              _results1 = [];
              for (_j = 0, _len = selectors.length; _j < _len; _j++) {
                s = selectors[_j];
                if (!blacklist.test(s)) {
                  _results1.push(/(^| )(body|html)($| )/.test(s) ? s.replace(/(body|html)/, prefix) : "" + prefix + " " + s);
                }
              }
              return _results1;
            })()).join(', ');
            if (selector) {
              cssText = "";
              if (/url\(\)/.test(rules[i].cssText)) {
                n = 0;
                for (r in rules) {
                  if (rules[r].selectorText === rules[i].selectorText && parseInt(r) < i) {
                    n += 1;
                  }
                }
                splitter = RegExp(rules[i].selectorText + "\\s*\{");
                contained_styles = css.split(splitter)[n + 1].split('}')[0];
                prop_url_pairs = {};
                _ref1 = contained_styles.match(/\s*(.+?)\s*:.+?url\((.+?)\).*?;/g);
                for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
                  line = _ref1[_j];
                  mtch = line.match(/\s*([\-\w]+)\s*:.+?url\((.+?)\).*?;/);
                  url_selector = mtch[1].replace(/\s+/g, '');
                  url_content = mtch[2].replace(/\s+/g, '');
                  prop_url_pairs[url_selector] = url_content;
                }
                cssText += selector + ' { ';
                _ref2 = rules[i].cssText.match(/\{(.+)\}/)[1].split(';');
                for (_k = 0, _len1 = _ref2.length; _k < _len1; _k++) {
                  prop_decl = _ref2[_k];
                  if (!!~prop_decl.indexOf('url()')) {
                    url_selector = prop_decl.match(/\s*(.+?)\s*:.+/)[1].replace(/\s+/g, '');
                    url_content = prop_url_pairs[url_selector];
                    if (!url_content) {
                      if (url_selector === 'background-image') {
                        url_content = prop_url_pairs['background'];
                      }
                    }
                    prop_decl = prop_decl.replace('url()', 'url(' + url_content + ')');
                    cssText += prop_decl + '; ';
                  } else {
                    cssText += prop_decl + '; ';
                  }
                }
                cssText += ' } ';
              } else {
                rules[i].selectorText = selector;
                cssText = rules[i].cssText;
              }
              _results.push(response += cssText + '   ');
            } else {
              _results.push(void 0);
            }
          } else if (rules[i].media[0] === 'screen') {
            _results.push(scope_selectors(rules[i].cssRules));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      scope_selectors(styles.sheet.cssRules);
      return response;
    };
  }).filter('deSassify', function() {
    return function(css) {
      return css.replace( /@media -sass-debug-info.*?\{(?:.*?\{.*?\})+.*?\}/g, '');
    };
  }).filter('prettifyCSS', function() {
    return function(css) {
      return css
    .replace( /^\s+/g,    ''         )
    .replace( /\s*,\s*/g, ', '       )
    .replace( /\s*{\s*/g, ' {\n    ' )
    .replace( /\s*;\s*/g, ';\n    '  )
    .replace( /\*\//g,    '*/\n'     )
    .replace( /\n\n+/g,   '\n'       )
    .replace( /\s*}\s*/g, '\n}\n\n'  );
    };
  }).filter('prettifyHTML', function() {
    var closing, count_inline, indent, inline, tag_re;
    indent = function(n, inline_count) {
      if (n <= 0) {
        return "";
      } else {
        return Array(n - inline_count + 1).join('  ');
      }
    };
    inline = function(tag) {
      return tag === 'span' || tag === 'a' || tag === 'code' || tag === 'i' || tag === 'b' || tag === 'em' || tag === 'strong' || tag === 'abbr' || tag === 'img' || tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6' || tag === 'bdi' || tag === 'bdo' || tag === 'wbr' || tag === 'kbd' || tag === 'del' || tag === 'ins' || tag === 's' || tag === 'rt' || tag === 'rp' || tag === 'var' || tag === 'time' || tag === 'sub' || tag === 'sup' || tag === 'link' || tag === 'title' || tag === 'label' || tag === 'input';
    };
    closing = function(tag) {
      return tag === 'area' || tag === 'br' || tag === 'col' || tag === 'embed' || tag === 'hr' || tag === 'img' || tag === 'input' || tag === 'keygen' || tag === 'link' || tag === 'meta' || tag === 'base' || tag === 'param' || tag === 'source' || tag === 'track' || tag === 'wbr';
    };
    count_inline = function(stack) {
      var t;
      return ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = stack.length; _i < _len; _i++) {
          t = stack[_i];
          if (inline(t)) {
            _results.push(t);
          }
        }
        return _results;
      })()).length;
    };
    tag_re = '<(?:(?:(\\w+)[^><]*?)|(?:\\/(\\w+)))>';
    tag_re = new RegExp(tag_re);
    tag_re.compile(tag_re);
    return function(html) {
      var i, inline_count, last_t, m, pretty_html, saved, stack, tag_name;
      saved = html;
      inline_count = 0;
      stack = [];
      pretty_html = "";
      while (html) {
        i = html.search(tag_re);
        if (!(i + 1)) {
          pretty_html += html;
          html = "";
        }
        m = html.match(tag_re);
        if (tag_name = m[1]) {
          if (inline(tag_name)) {
            if (pretty_html.charAt(pretty_html.length - 1) === '\n') {
              pretty_html += indent(stack.length, inline_count);
            }
            pretty_html += html.substr(0, i + m[0].length);
            stack.push(tag_name);
            inline_count += 1;
            html = html.substr(i + m[0].length);
          } else if (closing(tag_name)) {
            if (pretty_html.charAt(pretty_html.length - 1) === '\n') {
              pretty_html += indent(stack.length, inline_count);
            }
            pretty_html += html.substr(0, i + m[0].length);
            html = html.substr(i + m[0].length);
          } else {
            if (i && pretty_html.charAt(pretty_html.length - 1) === '\n') {
              pretty_html += indent(stack.length, inline_count);
            }
            pretty_html += "" + (html.substr(0, i));
            if (pretty_html.charAt(pretty_html.length - 1) !== '\n') {
              pretty_html += '\n';
            }
            pretty_html += indent(stack.length, inline_count) + m[0];
            stack.push(tag_name);
            pretty_html += '\n';
            html = html.substr(i + m[0].length);
          }
        } else if (tag_name = m[2]) {
          last_t = stack.lastIndexOf(tag_name);
          if (last_t + 1) {
            if (inline(tag_name)) {
              inline_count -= 1;
              stack.splice(last_t);
              pretty_html += "" + (html.substr(0, i)) + m[0];
              html = html.substr(i + m[0].length);
            } else {
              if (i && pretty_html.charAt(pretty_html.length - 1) === '\n') {
                pretty_html += indent(stack.length, inline_count);
              }
              stack.splice(last_t);
              inline_count = count_inline(stack);
              pretty_html += "" + (html.substr(0, i)) + (pretty_html.charAt(pretty_html.length - 1) === '\n' ? '' : '\n') + (indent(stack.length, inline_count)) + m[0];
              html = html.substr(i + m[0].length);
              if (html[0] !== '\n') {
                pretty_html += '\n';
              }
            }
          } else {
            pretty_html += "" + (html.substr(0, i + m[0].length));
            html = html.substr(i + m[0].length);
          }
        } else {
          console.warn("UH OH: found a tag that's not an opening tag or a closing tag!?!?");
        }
      }
      return pretty_html;
    };
  });

}).call(this);
;angular.module('DLApp').service('graphService', function() {
    
    var div_name = { 'Table': '#DLtable_wrapper', 'Graph': 'svg' };

    var graphState = function(theme,state) {$(div_name[theme]).css('display',state);};

    this.deleteGraph = function(theme) {$(div_name[theme]).remove();};

    this.hideGraph = function (theme) {graphState(theme,'none');};
    this.showGraph = function (theme) {graphState(theme,'');};

    var formatArrayObject = function (obj) {
        var cases = {'number':function(value){return value.toFixed(2)},
                     'object':function(value){return formatArrayObject(value)}};
        return "{"+ $.map(obj, function (value, index) {
            return (cases[typeof value] || function(v){return v})(value)
        }) + "}";
    }

    this.drawGraph = {
        'Table': function (_graph, div) {
            if ($('#DLtable_wrapper').length != 0) return;
            if (!_graph) return;
            var data = JSON.parse(JSON.stringify(_graph.variables.variables));
            var _v;
            for (var key in data) {
                var v = data[key];
                if (v.hasOwnProperty('expr')) {
                    for (var _key in v) {
                        var attr = v[_key];
                        if (attr && typeof attr == 'object' && _key == 'value')
                            v[_key] = formatArrayObject(attr);
                        else if (typeof attr == 'number')
                            v[_key] = attr.toFixed(2);
                        else if (typeof attr == 'function')
                            delete v[_key];
                    }
                }
                else delete data[key];
            }

            var tableData = [];
            $.each(data, function (index, value) {
                if (data.hasOwnProperty(index))
                    tableData.push([index].concat(_.toArray(value)));
            });
            for (var key in data)
                {_v = data[key]; break;}
            var tableColumns = [];
            tableColumns.push({ "sTitle": "name", "sClass": "center"});
            for (var attr in _v){
                if (_v.hasOwnProperty(attr))
                    tableColumns.push({ "sTitle": attr, "sClass": "center" });}
            $(div).append( '<table cellpadding ="0" cellspacing ="0" border="0" class = "display" id="DLtable"></table>');
            $('#DLtable').dataTable( {
            "aaData": tableData,
            "aoColumns": tableColumns
            });

            
        },
            

        'Graph': function(_graph,div) {

            if (!_graph) return;

            d3.select("svg")
                    .remove();

            var data = _.cloneDeep(_graph.variables);

            function ArrayObjectLookup(array, attr) {
                for (var i = 0; i< array.length; i++)
                    if(array[i].name == attr) return i;
                }
   
            var graph = {"nodes":[],"links":[]};
        
            for (var v in data.variables) {var _v = data.variables[v];
                if (_v.hasOwnProperty("expr")) {_v.name = v;graph.nodes.push(_v);}}
 
            $.each(data.edges, function (index, value){
                graph.links[index] = {"source":ArrayObjectLookup(graph.nodes,this[0]),"target":ArrayObjectLookup(graph.nodes,this[1])};});

            d3.selection.prototype.moveToFront = function() {
                return this.each(function(){
                this.parentNode.appendChild(this);
                });
            };

            var g_state = "";



            var canvas=$(div);

            while (!canvas.width() || !canvas.height())
                canvas = canvas.parent();
            
            var width = canvas.width(),
                height = canvas.height();

            var svg = d3.select(div).append("svg")
                .attr("width", width)
                .attr("height", height)
                .call(d3.behavior.zoom().scaleExtent([0.25, 2]).on("zoom", zoom)).on("dblclick.zoom",null)
                .append("g");

            var width_padding = 20;
            var height_padding = 20;

            var	div_area = (width-width_padding)*(height-height_padding),
	            num_nodes = graph.nodes.length,
	            node_area = div_area/(num_nodes+num_nodes%2),
                node_to_padding_ratio = 0.50,
	            node_dia_inc_pad = Math.sqrt(node_area),
	            node_radius_wo_pad = node_dia_inc_pad/2*node_to_padding_ratio,
	            node_padding = node_dia_inc_pad/2*(1-node_to_padding_ratio),
	            nodes_in_width = parseInt(width/(node_dia_inc_pad)) || 1,
                nodes_in_height = parseInt(height/(node_dia_inc_pad)) || 1;  

            var xScale = d3.scale.linear()
	            .domain([0,nodes_in_width])
	            .range([width_padding + node_radius_wo_pad,width - width_padding -node_radius_wo_pad]);

            var yScale = d3.scale.linear()
	            .domain([0,nodes_in_height])
	            .range([height_padding + node_radius_wo_pad,height - height_padding- node_radius_wo_pad]);

            var getX = function(index){return xScale(index%nodes_in_width)};
            var getY = function(index){return yScale(parseInt(index/nodes_in_width))};

            var lines = svg.append("g").attr("class", "line")
                .selectAll("line").data(graph.links)
                .enter().append("line")
                .attr("x1", function(d) {return getX(d.source); })
                .attr("y1", function(d) { return getY(parseInt(d.source)); })
                .attr("x2", function(d) { return getX(d.target); })
                .attr("y2", function(d) {  return getY(d.target); })
                .attr("src", function(d) {  return d.source; })
                .attr("trgt", function(d) {  return d.target; })
                .attr("viewed", function() {  return 0; })
                .attr("focused", function() {  return 0; })
                .style("stroke", "grey");
 
            var circles = svg.append("g")
                .attr("class","nodes")
                .selectAll("circle")
                .data(graph.nodes)
                .enter()
                .append("g")
                .attr("transform",function(d,i){d.x = getX(i);d.y=getY(i);return "translate(" + d.x + "," + d.y + ")";})
                .attr("name", function(d){return d.name;})
                .attr("viewed",  0)
	            .attr("focused", 0)
                .attr("index", function(d, i) {return i;});

            circles.append("circle")
                .style("stroke", "gray")
                .style("fill", "white")
                .attr("r", node_radius_wo_pad)
                .on("mouseover", function(){
                    g_elem = this.parentNode;
		            if (d3.select(g_elem).attr("focused")!=1 && g_state == "focus") return;
		            if (g_state == "focus") {d3.select(this).style("fill", "aliceblue"); return;}
		            d3.select(g_elem).attr("viewed",1);
		            var that = this;

		            renderViewed("red","src","trgt");
                    renderViewed("green","trgt","src");
                          
		            lines.filter(function() {
			            return d3.select(this).attr("viewed")==0;
		                }).transition().style("opacity", 0);

		            var toChange = circles.filter(function(){
			            return d3.select(this).attr("viewed")==0;
			            });
                    toChange .selectAll("circle").transition().style("opacity", 0.2);
                    toChange.selectAll("text").transition().style("opacity", 0.2);

		            d3.select(this).style("fill", "aliceblue");
	            })
                .on("mouseout", function(){
	                    if (g_state == "focus"){
		                    lines.filter(function(){return d3.select(this).attr("focused")==1;})
				                .style("stroke", "grey")
				                .attr("viewed",0)
			                    .transition().style("opacity", 1);

		                var toChange = circles.filter(function(){return d3.select(this).attr("focused")==1;})
                                                .attr("viewed",0);
                            toChange.selectAll("circle")
		    	                    .transition().style("opacity", 1);
                            toChange.selectAll("text")
		    	                    .transition().style("opacity", 1);
		  
		                    d3.select(this).style("fill", "white");
	                    }
	                    else {
		                    lines.style("stroke", "grey")
				                .attr("viewed",0)
			                    .transition().style("opacity", 1);
		                    circles.attr("viewed",0)
                                .selectAll("circle")
                                .style("stroke", "grey")
	       	                    .transition().style("opacity", 1);
                            circles.selectAll("text")
	       	                    .transition().style("opacity", 1);
		                    d3.select(this).style("fill", "white");
	                    }
                })

	            .on("dblclick", function(){
		            if (g_state == "focus") {
			
			            circles.attr("transform",function(d,i){return "translate(" + d.x + "," + d.y + ")";})
		                        .attr("viewed", function() {  return 0; })
				                .attr("focused", function() {  return 0; })
                                .selectAll("circle").attr("r", node_radius_wo_pad);      

			            lines.attr("x1", function(d) { return getX(d.source); })
			                    .attr("y1", function(d) { return getY(d.source); })
			                    .attr("x2", function(d) { return getX(d.target); })
			                    .attr("y2", function(d) {  return getY(d.target); });
			            lines.attr("viewed", function() {  return 0; })
			                    .attr("focused", function() {  return 0; })
			                    .style("stroke", "grey");
                        g_state = "";
			            return; 
		            }
		            g_state = "focus";
		            var node = d3.select(this.parentNode);
		            node.moveToFront();
		
		            node.attr("focused",1).attr("transform","translate("+width/2+","+height/2+")").selectAll("circle").attr("r",height/8);
        
		            var that = this.parentNode;

		            renderFocused("src","trgt",that);
                    renderFocused("trgt","src",that);

		                lines.filter(function() {
			                return d3.select(this).attr("focused") != 1;
	                    }).transition().style("opacity", 0);

		                var toChange =circles.filter(function(){
			                return d3.select(this).attr("focused") != 1;
			            });

                    toChange.selectAll("circle").transition().style("opacity", 0);
                    toChange.selectAll("text").transition().style("opacity", 0);
	            });

                circles.append("text")
                    .attr("text-anchor","middle")
                    .text(function(d){return d.name})
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "50px")
                    .attr("y",10);

            function zoom() {
	                svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	            }

            function renderViewed(color,src,trgt) {
      
                    lines.filter(function() {	
			            return d3.select(this).attr(src) == d3.select(g_elem).attr("index");
		                }).style("stroke", color).attr("viewed",1)
			            .each(function(){
				            var that = this;
				            circles.filter(function() {
					            return d3.select(this).attr("index") == d3.select(that).attr(trgt);
					            }).attr("viewed",1)
                                    .selectAll("circle").style("stroke", color)
                            });
            }

            function renderFocused(src,trgt,_that) {
                var x = src == "src" ? 1 : 3;
                var dep_radius = height/16;
                var nodes_in_wid = parseInt(width/dep_radius*2/node_to_padding_ratio);
                var matches=0;
		            lines.filter(function(d, i) {	
		                if (d3.select(this).attr(src) == d3.select(_that).attr("index")) matches++;
			            return d3.select(this).attr(src) == d3.select(_that).attr("index");
		                }).attr("focused",1).attr("x1",function(d, i){ return width/2;})
		                .attr("y1",function(d, i){ return height/2;})
			            .attr("x2",function(d, i){                       
				                return  (width/2-((matches>nodes_in_wid)?width/2-dep_radius*4/2:dep_radius*4/2*(matches-1))) + (i%nodes_in_wid)*dep_radius*4;
			                })
			            .attr("y2",function(d, i){return x*height/4 - parseInt(i/nodes_in_wid)*dep_radius*4;})
			            .each(function(d, i){
				            var that = this;
				            circles.filter(function() {
					            return d3.select(this).attr("index") == d3.select(that).attr(trgt);
					            }).attr("focused",1)
                                    .attr("transform",function(){
                                        d.xf = (width/2-((matches>nodes_in_wid)?width/2-dep_radius*4/2:dep_radius*4/2*(matches-1))) + (i%nodes_in_wid)*dep_radius*4;
                                        d.yf = x*height/4 - parseInt(i/nodes_in_wid)*dep_radius*4;
						                return "translate(" + d.xf + "," + d.yf + ")";
						            })
                                    .selectAll("circle")
					                .attr("r",dep_radius);
				            });
      
            }
       }
    }});
;// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('DLApp').service('Graph', function($http, $window) {
    return {
      getGraph: function(DLcode, style, callback) {
        if ($window.DL.createGraph) {
          return callback($window.DL.createGraph(DLcode));
        } else {
          return $http.post("/sendDL", {
            'DLcode': DLcode,
            'Shade': style
          }).success(function(data, status, headers, config) {
            return callback($window.DL.Graph(data));
          });
        }
      },
      getTokens: function(DLcode) {
        return $window.DL.tokens(DLcode);
      },
      getFunctions: function() {
        return $window.DL.builtInFunctions;
      }
    };
  });

}).call(this);
;// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('DLApp').service('x2js', function($rootScope) {
    var x2js;
    x2js = new X2JS;
    this.xml2json = function(XML) {
      return x2js.xml_str2json(XML);
    };
    return this;
  });

}).call(this);
