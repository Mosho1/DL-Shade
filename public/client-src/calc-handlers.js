var f = require('./functions');

var CalcHandlers = function(that){
    return{
        vars : that.variables,

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