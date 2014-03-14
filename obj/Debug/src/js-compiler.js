var _    = require('underscore'),
    util = require('util'),
    ScopeManager = require('./scope-manager').ScopeManager;
    VariableRegistry = require('./VariableRegistry.js').VariableRegistry;
    VariableEntry = require('./VariableRegistry.js').VariableEntry;

var srtingReduce = function(list, iterator, context) {
    var string = "";

    _.each(list, function(i) {
        string += iterator(i);
    }, context);

    return string;
};

var f = util.format, currentClass;

var JsCompiler = function() {
    this.scopeManager = new ScopeManager();
    this.variableRegistry = new VariableRegistry();
    this.currentVariable = new VariableEntry();
    this.DLvariables = {};
    _.bindAll(this);
    this.code = ["var _ = require('underscore');"];
};

JsCompiler.prototype.compile = function(ast) {
    _.each(ast, function(node) {
        this.code.push(this.compileNode(node));
        this.currentVariable = new VariableEntry();
    }, this);

    return this.DLvariables;
};

JsCompiler.prototype.addNode = function(node) {

    };

JsCompiler.prototype.compileNode = function(node) {
    var code;
    var c = this.compileNode;

        switch (node._type) {
        case "Print":
            code = f("console.log(%s);", c(node.expr));
        break;

        case "String":
            code = String(node.value);
        break;

        case "Array":
        var params = [];

            if (node.elements) {
                _.each(node.elements, function(element) {
                    params.push(c(element));
                }, this);
            }

            code = f("new raDL(%s)",params);
        break;

        case "Math":
            code = f("%s %s %s", c(node.left), node.operator, c(node.right));
        break;

        case "Long":
        case "Double":
            code = node.value;
        break;

        case "BracketBlock":
            code = f("(%s)", c(node.expr));
        break;

        case "AssignValue":
        case "AssignVariable":
            code = f("var %s = %s;", node.name, c(node.expr));
        break;

        case "SetVariable":
            this.CurrentVariable['id'] = node.name;
            this.DLvariables[node.name] = {id: node.name, expr: "", dependsOn: [], dependedOnBy: []};
            this.DLvariables[node.name].expr = c(node.expr);  
            
            
                 
        break;

        case "VariableParameter":
        case "ValueParameter":
            code = node.name;
        break;

        case "CallVariable":

            if (!this.DLvariables[node.name.join('.')])
                  this.DLvariables[node.name.join('.')] = new VariableEntry();
       
 

            this.DLvariables[node.name.join('.')].dependedOnBy.push(this.currentVariable.id);
            this.DLvariables[this.currentVariable.id].dependsOn.push(node.name.join('.'));


            if (!node.name.join) {
                console.log(node);
            }
            code = node.name.join('.');

        break;

        case "Comparison":
            code = f("%s %s %s", c(node.left), node.comparator, c(node.right));
        break;

        case "IfBlock":
            var trueBlock = stringReduce(node.trueBlock, c);

            code = f("if (%s) {\n%s\n}", c(node.evaluation), trueBlock);

            if (node.elseIfs) {
                code += stringReduce(node.elseIfs, c);
            }

            if (node.falseBlock) {
                var falseBlock = stringReduce(node.falseBlock, c);

                code += f(" else {\n%s\n}", falseBlock);
            }
        break;

        case "ElseIfBlock":
            code = f(" else if (%s) {\n%s\n}", c(node.evaluation), stringReduce(node.trueBlock, c));
        break;

        case "Closure":
            var params = [], body = [];

            if (node.parameters) {
                _.each(node.parameters, function(parameter) {
                    params.push(c(parameter));
                }, this);
            }

            _.each(node.body, function(bodyNode) {
                body.push(c(bodyNode));
            }, this);

            code = f("_.bind(function (%s) {\n%s\n}, this)", params.join(""), body.join("\n"));
        break;

        case "CallFunction":
            var args = [];

            if (node.args) {
                _.each(node.args, function(arg) {
                    args.push(c(arg));
                }, this);
            }
            code = f("%s(%s);", node.name.join("."), args.join(", "));
        break;

        case "Class":
            var body = [];

            currentClass = node.name;

            _.each(node.body, function(bodyNode) {
                body.push(c(bodyNode));
            });

            currentClass = "";

            code = f("function %s() {\n_.bindAll(this);\nthis.initialise && this.initialise.apply(this, arguments);\n}\n%s", node.name, body.join("\n"));
        break;

        case "Method":
            var params = [], body = [];

            if (node.parameters) {
                _.each(node.parameters, function(parameter) {
                    params.push(c(parameter));
                }, this);
            }

            _.each(node.body, function(bodyNode) {
                body.push(c(bodyNode));
            });

            code = f("%s.prototype.%s = function(%s) {\n%s\n};", currentClass, node.name, params.join("\n"), body.join("\n"));
        break;

        case "ClassInstantiation":
            code = f("new %s()", node.name);
        break;

        case "Boolean":
            code = node.value;
        break;

        case "NULL":
            code = node.value;
        break;

        case "Ternary":
            code = f("%s ? %s : %s", c(node.test), c(node.equal), c(node.nequal));
    }

    return code;
};

exports.compile = function(ast) {
    var compiler = new JsCompiler();
    return compiler.compile(ast);
};



