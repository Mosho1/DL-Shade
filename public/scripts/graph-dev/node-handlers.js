//Parser calls these after a node has been classified
var  f = require('util').format;

var NodeHandlers = {

    // 4 + 3
    Math: function (node) {console.log(this);
        return f("%s %s %s", this.compileNode(node.left), node.operator, this.compileNode(node.right));
    },

    // 2
    Long: function (node) {
        return node.value;
    },

    Double: function (node) {
        return node.value;
    },

    // "yoyo"
    String: function (node) {
        return String(node.value);
    },

    // [element, element, ...]
    Array: function (node) {
        var list = "{";
        if (node.elements) {
            _.each(node.elements, function (element) {
                list += this.compileNode(element) + ",";
            }, this);
        }
        list = list.substring(0, list.length - 1) + "}";
        return list;
    },

    // var name = expr
    AssignVariable: function (node) {
        return f("var %s = %s;", node.name, this.compileNode(node.expr));
    },

    // name = expr
    SetVariable: function(node) {
        this.currentVariable.name = this.currentNamespace + node.name;
        this.currentVariable.expr = this.compileNode(node.expr);
        this.variableRegistry.addToEntry(this.currentVariable);
    },

    // name
    CallVariable: function (node) {
        var _name = node.name.join('.');
        if (_name !== this.currentVariable.name && this.currentVariable.dependsOn.indexOf(_name) === -1) {
            this.currentVariable.dependsOn.push(node.name.join('.'));
            this.variableRegistry.addToEntry({name: node.name.join('.'),dependedOnBy: [this.currentVariable.name]}); }

        if (!node.name.join) {
            console.log(node);
        }
        return node.name.join('.');
    },

    // left == right
    Comparison: function (node) {
        return f("%s %s %s", this.compileNode(node.left), node.comparator, this.compileNode(node.right));
    },

    // name([args])
    CallFunction: function (node) {
        var args = [];

        if (node.args) {
            _.each(node.args, function(arg) {
                args.push(this.compileNode(arg));
            }, this);
        }
        return f("%s(%s)", node.name.join("."), args.join(", "));
    },

    // true|false
    Boolean: function (node) {
        return node.value;
    },

    // (x == y) ? "eq : "neq"
    Ternary: function (node) {
        return f("%s ? %s : %s", this.compileNode(node.test), this.compileNode(node.equal), this.compileNode(node.nequal));
     },

    Namespace: function (ns) {
       this.currentNamespace = ns.name + ".";
    }
};

module.exports = NodeHandlers;