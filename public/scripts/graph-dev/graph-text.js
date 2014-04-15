//Graph class
//=====

var compiler = require('./compiler'),
    VariableRegistry = require('./variable-registry.js').VariableRegistry;

//Holds `VariableRegistry` objects, currently has no distinctive methods and merely provides an interface for the registry.

//Constructor function. Takes DL code as a string and compiles it.
var Graph = function (data) {
    this.initialise.apply(this, arguments);
    this.variables = (typeof data === 'string') ? compiler.compile(data).sortDependencies() : {};

};
Graph.prototype = {

    //Binds the functions in the prototype to the calling `Graph` object.
    initialise: function () {
        _.bindAll(this);
    },

    //Sets value of variable `name` to `value`
    set: function (name, value) {
        this.variables.set(name, value);
    },

    //Unsets value of variable `name`.
    unset: function (name) {
        this.variables.unset(name);
    },

    //Evaluates the `VariableRegistry`. Goes over all the variables and resolves their correct values based on the expressions assigned to them in the DL declaration.
    evaluate: function () {
        this.variables.evaluate();
        return this;
    },

    get: function () {

    }



};

//Globally exposed API.
global.DL = global.DL  || {};
global.DL.createGraph = function (data) { return new Graph(data); };
global.DL.tokens = require('./lexer').tokenise;
global.DL.builtInFunctions = Object.keys(require('./functions')).map(function (elm) { return "f." + elm; });