var parser = require('./calculator').parser,
    CalcHandlers = require('./calc-handlers');
    

var VariableRegistry = function(data) {
    this = data;
    this.initialise.apply(this);
};
VariableRegistry.prototype = {

    initialise: function()
    {
        _.bindAll(this);
    },

    addToEntry: function(entry)
    {
        var _entry = new VariableEntry(entry);
        this[entry.name] = _entry.concat(this[entry.name] || {});
    },

    set: function(name,value)
    {
        this[name].set(value);
		this.evaluate(name);
    },

    unset: function(name,value)
    {
        this[name].unset();
    },

    evaluate: function(changed)
    {
   
		parser.yy = CalcHandlers(this);
		var start = changed ? this.sorted.indexOf(changed)+1 : 0;
		for (var i = 0; i< this.sorted.length-start; i++){
			var entry = this[this.sorted[start+i]];
			if (entry.hasOwnProperty('dependsOn')) {
				var value = parser.parse(entry.expr);
				this[this.sorted[start+i]].value = value		
			}
		}	
	}

};

var VariableEntry = function(entry) {
    
    this.initialise.apply(this, arguments);
    
    if (!entry) {
		this.setValue = null;
	    this.value = null;
        this.name = "";
        this.expr = "";
        this.dependsOn = [];
        this.dependedOnBy = [];
    }
    else
    {    
		this.setValue = entry.setValue || null;
	    this.value = entry.value ||null;
        this.expr = entry.expr || "";
        this.dependsOn = entry.dependsOn || [];
        this.dependedOnBy = entry.dependedOnBy || [];
    }

   
        
};
VariableEntry.prototype = {

    initialise: function()
    {
        _.bindAll(this);
    },

    concat: function(entry) 
    {
        if(entry) {
				this.setValue = entry.setValue ? entry.setValue : this.setValue;
				this.value = entry.value ? entry.value : this.value;
				this.expr = entry.expr ? entry.expr : this.expr;
                this.dependsOn = this.dependsOn.concat(entry.dependsOn || []);
                this.dependedOnBy = this.dependedOnBy.concat(entry.dependedOnBy || []);
        }
        return this;
    },

    set: function(value)
    {
        this.setValue = value;
    },

    unset: function()
    {
        this.setValue = null;
    },
    
    
};

exports.VariableEntry = VariableEntry;
exports.VariableRegistry = VariableRegistry;