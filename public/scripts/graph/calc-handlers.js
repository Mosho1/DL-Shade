var f = require('./functions');

var CalcHandlers = function(that){
    return{
        vars : that,

       getVariableValue: function(name){
           _name = name.join('.');
            return this.vars[_name].setValue ? this.vars[_name].setValue : this.vars[_name].value
        },

       createArray: function(arr){
            var rv = {};
            for (var i=0; i< arr.length; i++)
                if (arr[i] !== undefined) rv[i] = arr[i];
            return rv;
        },

        callFunction: function(name,args){
          return f[name[1]].apply(this.vars,args);
        }
    };
    
};

module.exports = CalcHandlers;