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