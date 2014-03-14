var VariableRegistry = require('./variable-registry.js').VariableRegistry;


var Graph = function(data) {
    this.initialise.apply(this, arguments);
    this.variables = new VariableRegistry(data);
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
        return this;
    },

    get: function()
    {

    }



};

global.Graph = function (data) {return new Graph(data); };