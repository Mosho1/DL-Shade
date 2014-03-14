var _ = require('underscore');

var VariableRegistry = function() {
    this.initialise.apply(this, arguments);
};
VariableRegistry.prototype = {

    initialise: function()
    {
        _.bindAll(this);
    },

    addEntry: function(name,expr,dependsOn,dependedOnBy)
    {
        this[name] = new VariableEntry(expr,dependsOn,dependedOnBy);
    }

    addEntry: function(name,expr,dependsOn,dependedOnBy)
    {
        this[name] = new VariableEntry(expr,dependsOn,dependedOnBy);
    }
    


};

var VariableEntry = function(expr,dependsOn,dependedOnBy) {
    //this.initialise.apply(this, arguments);
    this.expr = expr || "";
    this.dependsOn = dependsOn || [];
    this.dependedOnBy = dependedOnBy || [];
};
VariableEntry.prototype = {


};


exports.VariableEntry = VariableEntry;
exports.VariableRegistry = VariableRegistry;