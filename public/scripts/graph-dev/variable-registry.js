//Variable Registry class
//=====
//Holds DL variables and exposes an API
//-----

var parser = require('./calculator').parser,
    CalcHandlers = require('./calc-handlers');

_ = _ || {};
_.observe = require('./tools').observe;


//Constructor function.
var VariableRegistry = function () {

    this.initialise.apply(this, arguments);
    this.variables = {};
};


VariableRegistry.prototype = {

    //Binds the functions in the prototype to the calling `VariableRegistry` object.
    initialise: function () {
        _.bindAll(this);
    },

    //Adds to a variable entry (or creates a new one if it doesn't exist)
    addToEntry: function (entry) {
        var _entry = this.createEntry(entry);
        this.variables[entry.name] = _entry.concat(this.variables[entry.name] || {});
    },

    //Creates a new entry. Can accept an existing `VariableEntry` object for data, otherwise initializes an empty entry.
    createEntry: function (entry) {
        var _entry = new VariableEntry(entry), _this = this;
        //The `observe` method adds an attribute with a `getter` and a `setter` to an object.
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

    //Sets variable `name` to `value` if it exists in the registry.
    set: function (name, value) {
        if (this.variables[name]) {
            this.variables[name].set(value);
            this.evaluate(name);
        }
    },

    //Gets the `value` (or `setValue` if it exists) of the variable `name`, if it exists
    getValue: function (name) {
        if (this.variables[name]) {
            return this.variables[name].get();
        }

    },
    //Gets the `VariableEntry` object `name`
    get: function (name) {
        return this.variables[name];

    },
    //Unsets the value of the variable `name`, resetting its value to what was defined in the DL declaration.
    unset: function (name) {
        if (this.variables[name]) {
            this.variables[name].unset();
        }
    },

    //Resolve each variable's value according to its expression. TODO: create an array for each variable so we don't waste time iterating over variables we don't need.
    evaluate: function (changed) {
        //Attaching `CalcHandlers` to the parser. This is used by the parser for specific rules like this: `yy.callFunction($1)`
        parser.yy = new CalcHandlers(this.variables);
        //Go over the topologically sorted array of variables, starting from the location of the changed variable.
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

    //Creates an array that we use to update variables on changes.
    sortDependencies: function () {

        //Gets edges between dependent variables
        this.edges = this.getEdges();
        //Create a topologically sorted array representation of the graph
        this.sorted = tsort(this.edges);
        var v;
        //Add variables that have no dependencies (and therefore no edges, so they will not be included in the sort).
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

//Variable Entry class
//=====
//Holds a DL variable and exposes an API
//-----

//Constructor function.
var VariableEntry = function () {

    //arguments passed to the function. We use these to construct the entry based on the number/type of arguments.
    var args = arguments, entry = args[0];

    this.initialise.apply(this, arguments);

    //No arguments, blank entry
    if (!arguments.length) {
        this.name = "";
        this.expr = "";
        this.value = null;
        this.setValue = null;
        this.dependsOn = [];
        this.dependedOnBy = [];
    //1 object argument, create entry from object
    } else if (_.isObject(entry)) {
        this.name = entry.name || "";
        this.expr = entry.expr || "";
        this.value = entry.value === 0 ? 0 : (entry.value || null);
        this.setValue = entry.setValue === 0 ? 0 : (entry.setValue || null);
        this.dependsOn = entry.dependsOn || [];
        this.dependedOnBy = entry.dependedOnBy || [];
    //otherwise create new entry from first 6 arguments
    } else {
        this.name = args[0] || "";
        this.expr = args[1] || "";
        this.value = args[2] === 0 ? 0 : (args[2] || null);
        this.setValue = args[3] === 0 ? 0 : (args[3] || null);
        this.dependsOn = args[4] || [];
        this.dependedOnBy = args[5] || [];
    }
};
VariableEntry.prototype = {
    //Binds the functions in the prototype to the calling `VariableEntry` object.
    initialise: function () {
        _.bindAll(this);
    },

    //Concatenates an argument entry to the `VariableEntry` that the function is called from.
    concat: function (entry) {
        if (entry) {
            this.name = entry.name || this.name;
            this.expr = entry.expr || this.expr;
            this.value = entry.value === 0 ? 0 : (entry.value || this.value);
            this.setValue = entry.setValue === 0 ? 0 : (entry.setValue || this.setValue);
            this.dependsOn = _.union(this.dependsOn, entry.dependsOn);
            this.dependedOnBy = _.union(this.dependedOnBy, entry.dependedOnBy);
        }
        return this;
    },

    //Set the `VariableEntry`'s `value` attribute from the expression assigned to it in the DL declaration.
    evaluate: function (value) {
        this.value = value;
        return this;
    },

    //Set the `VariableEntry`'s `setValue` attribute from anywhere but the DL declaration.
    set: function (value) {
        this.setValue = value;
        return this;
    },

    //Get the `VariableEntry`'s value. Returns `value` or `setValue` if it is set.
    get: function () {
        return (_.isNull(this.setValue) || _.isUndefined(this.setValue)) ? this.value : this.setValue;
    },

    //Sets `setValue` to `null`, resetting its value to what was defined in the DL declaration.
    unset: function () {
        this.setValue = null;
        return this;
    }
};

//Topological sort function.
function tsort(edges) {
    var nodes   = {}, // hash: stringified id of the node => { id: id, afters: lisf of ids }
        sorted  = [], // sorted list of IDs ( returned value )
        visited = {}, // hash: id of already visited node => true

        Node = function (id) {
            this.id = id;
            this.afters = [];
        }

  //- build data structures
  edges.forEach(function(v) {
    var from = v[0], to = v[1];
    if (!nodes[from]) nodes[from] = new Node(from);
    if (!nodes[to]) nodes[to]     = new Node(to);
    nodes[from].afters.push(to);
  });
 
  //- topological sort
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