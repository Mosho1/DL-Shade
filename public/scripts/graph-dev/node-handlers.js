//parser sends here after a node has been classified
var  f = require('util').format;

var NodeHandlers = {

    // 4 + 3
    Math: function(node) {
        return f("%s %s %s", this.compileNode(node.left), node.operator, this.compileNode(node.right));
    },

    // 2
    Long: function(node) {
        return node.value;
    },

    Double: function(node) {
        return node.value;
    },

    // "yoyo"
    String: function(node) {
        return String(node.value);
    },

    // [element, element, ...]
    Array: function(node) {
        var list ="{";
            if (node.elements) {
                _.each(node.elements, function(element) {
                    list += this.compileNode(element) + ",";
                }, this);
            }
            list = list.substring(0,list.length-1) + "}";
            return list;
    },

    // print expr
    Print: function(node) {
        return f("console.log(%s);", this.compileNode(node.expr));
    },

    // (expr)
    BracketBlock: function(node) {
        return f("(%s)", this.compileNode(node.expr));
    },

    // var name = expr
    AssignVariable: function(node) {
        return f("var %s = %s;", node.name, this.compileNode(node.expr));
    },

    // val name = expr
    AssignValue: function(node) {
        this._type = "AssignValue";
        this.name = name;
        this.expr = expr;
        this.assignType = assignType;
    },

    // name = expr
    SetVariable: function(node) {
        this.currentVariable['name'] = this.currentNamespace + node.name;
        this.currentVariable['expr'] = this.compileNode(node.expr);
        this.variableRegistry.addToEntry(this.currentVariable);
    },

    // name
    CallVariable: function(node) {
        var _name = node.name.join('.');
			if (_name != this.currentVariable.name && this.currentVariable.dependsOn.indexOf(_name)==-1) {
				this.currentVariable.dependsOn.push(node.name.join('.'));
                this.variableRegistry.addToEntry({name: node.name.join('.'),dependedOnBy: [this.currentVariable['name']]});}
      

            if (!node.name.join) {
                console.log(node);
            }
            return node.name.join('.');
    },

    // left == right
    Comparison: function(node) {
        return f("%s %s %s", this.compileNode(node.left), node.comparator, this.compileNode(node.right));
    },



    // fun(paramaters):ReturnType { [expr] }
    Closure: function(node) {
        var params = [], body = [];

            if (node.parameters) {
                _.each(node.parameters, function(parameter) {
                    params.push(this.compileNode(parameter));
                }, this);
            }

            _.each(node.body, function(bodyNode) {
                body.push(this.compileNode(bodyNode));
            }, this);

            return f("_.bind(function (%s) {\n%s\n}, this)", params.join(""), body.join("\n"));
    },

    // var name: Type
    VariableParameter: function(node) {

    },

    // name([args])
    CallFunction: function(node) {
        var args = [];

            if (node.args) {
                _.each(node.args, function(arg) {
                    args.push(this.compileNode(arg));
                }, this);
            }
            return f("%s(%s)", node.name[0].join("."), args.join(", "));
    },

    // class { [body] }
    Class: function(node) {
         var body = [];

            currentClass = node.name;

            _.each(node.body, function(bodyNode) {
                body.push(this.compileNode(bodyNode));
            });

            currentClass = "";

            return f("function %s() {\n_.bindAll(this);\nthis.initialise && this.initialise.apply(this, arguments);\n}\n%s", node.name, body.join("\n"));
    },

    // visisiblity name(parameters)
    Method: function(node) {
        var params = [], body = [];

            if (node.parameters) {
                _.each(node.parameters, function(parameter) {
                    params.push(this.compileNode(parameter));
                }, this);
            }

            _.each(node.body, function(bodyNode) {
                body.push(this.compileNode(bodyNode));
            });

            return f("%s.prototype.%s = function(%s) {\n%s\n};", currentClass, node.name, params.join("\n"), body.join("\n"));
    },

    // new Name([args])
    ClassInstantiation: function(node) {
        return f("new %s()", node.name);
    },

    // true|false
    Boolean: function(node) {
        return node.value;
    },

    // (x == y) ? "eq : "neq"
    Ternary: function(node) {
        return f("%s ? %s : %s", this.compileNode(node.test), this.compileNode(node.equal), this.compileNode(node.nequal));
     },

    Namespace: function(ns) {
       this.currentNamespace = ns.name + ".";
    }
};

module.exports = NodeHandlers;