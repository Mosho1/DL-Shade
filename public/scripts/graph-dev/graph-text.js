

var compiler = require('./compiler'),
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
global.DL.builtInFunctions = Object.keys(require('./functions')).map(function (elm) { return "f." + elm; });