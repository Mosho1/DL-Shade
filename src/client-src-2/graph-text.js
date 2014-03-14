var _ = compiler = require('./compiler'),
        VariableRegistry = require('./variable-registry.js').VariableRegistry;

//Graph class. Holds the variable registry, currently has no distinctive methods and merely provides an interface for the registry.

var Graph = function(data) {
    this.initialise.apply(this, arguments);
    this.variables = (typeof data == 'string') ? compiler.compile(data) : {};
	this.variables.sortDependencies();
  

};
Graph.prototype = {

    initialise: function()
    {
        _.bindAll(this);
    },

    set: function(name,value)
    {
        this.variables.set(name,value);
    },

    unset: function(name)
    {
        this.variables.unset(name);
    },

    evaluate: function()
    {
        this.variables.evaluate();
    },

    get: function()
    {

    }



};

exports.createGraph = function(data){return new Graph(data)};