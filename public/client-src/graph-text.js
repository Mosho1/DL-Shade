var _ = require('./underscore'),
        VariableRegistry = require('./variable-registry.js').VariableRegistry;


   window.Graph = function(data) {
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
    },

    get: function()
    {

    }



};
