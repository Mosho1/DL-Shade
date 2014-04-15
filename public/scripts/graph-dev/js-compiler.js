//JsCompiler class
//=====
//Takes DL code as a string and compiles it into a JSON format graph.

var ScopeManager = require('./scope-manager').ScopeManager,
    VariableRegistry = require('./variable-registry.js').VariableRegistry,
    VariableEntry = require('./variable-registry.js').VariableEntry,
    NodeHandlers = require('./node-handlers');

//takes each node (expression) and adds it as an entry in the variable registry. Basically compiles our DL into JSON 

var JsCompiler = function() {
    this.variableRegistry = new VariableRegistry();
    this.currentNamespace = "";
    this.currentVariable = new VariableEntry();
    _.bindAll(this);
};

//goes over the AST (abstract syntax tree) and processes it recursively
JsCompiler.prototype.compile = function(ast) {
    //for each node in the ast (each DL line)
    _.each(ast, function(node) {
        this.compileNode(node);
		this.currentVariable = new VariableEntry();
    }, this);

    return this.variableRegistry;
};

JsCompiler.prototype.addNode = function(node) {

    };

JsCompiler.prototype.compileNode = function(node) {
    return NodeHandlers[node._type].call(this,node);
};

exports.compile = function(ast) {
    var compiler = new JsCompiler();
    return compiler.compile(ast);
};



