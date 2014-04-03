var f = require('./functions');

var CalcHandlers = function(that){
    return{

       getVariableValue: function(name){
            _name = name.join('.');
            return (that && that[_name]) ? (that[_name].setValue ? that[_name].setValue : that[_name].value) : null;
        },

       createArray: function(arr){
            var rv = {};
            for (var i=0; i< arr.length; i++)
                if (arr[i] !== undefined) rv[i] = arr[i];
            return rv;
        },

        callFunction: function(name,args){
          return f[name[1]].apply(null, args);
        }
    };
    
};

module.exports = CalcHandlers;