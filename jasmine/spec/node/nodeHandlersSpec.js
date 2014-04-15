_ = require('underscore');

var handlers =  require('../../../public/scripts/graph-dev/node-handlers.js');
VariableEntry = require('../../../public/scripts/graph-dev/variable-registry.js').VariableEntry;
VariableRegistry = require('../../../public/scripts/graph-dev/variable-registry.js').VariableRegistry;

//In these tests, we assume that incorrect input is caught by the parser, so there's no error testing.
describe('Tests for node-handlers', function () {

    var _this, node;

    beforeEach(function () {
        _this = {
            compileNode: function (node) { return node; },
            currentVariable: new VariableEntry(),
            variableRegistry: new VariableRegistry(),
            currentNamespace: "ns."

        };

        node = {
            left: 1,
            operator: '+',
            right: 1,
            value: 0,
            elements: [1, 2, 3],
            name: ['x'],
            expr: 'y + z',
            args: ['y', 'z']

        };

        spyOn(_this, 'compileNode').andCallThrough();
        spyOn(_this.variableRegistry, 'addToEntry');


    });

    it("should handle math operations and long, double, string and array data types", function () {


        expect(handlers.Math.call(_this, node)).toEqual("1 + 1");
        expect(_this.compileNode.calls.length).toEqual(2);
        expect(_this.compileNode).toHaveBeenCalledWith(1);
        expect(handlers.Long(node)).toEqual(0);
        expect(handlers.Double(node)).toEqual(0);
        expect(handlers.String(node)).toEqual("0");
        expect(handlers.Array.call(_this, node)).toEqual("{1,2,3}");
        expect(_this.compileNode.calls.length).toEqual(5);
        expect(_this.compileNode).toHaveBeenCalledWith(2);
        expect(_this.compileNode).toHaveBeenCalledWith(3);
    });
    it("should set a variable", function () {
        expect(handlers.SetVariable.call(_this, node)).toBeUndefined();
        expect(_this.currentVariable.name).toEqual(_this.currentNamespace + node.name);
        expect(_this.currentVariable.expr).toEqual(node.expr);
        expect(_this.variableRegistry.addToEntry.calls.length).toEqual(1);
        expect(_this.variableRegistry.addToEntry).toHaveBeenCalledWith(_this.currentVariable);
    });
    it("should call a variable", function () {
        expect(handlers.CallVariable.call(_this, node)).toEqual(node.name.join('.'));
        expect(_this.currentVariable.dependsOn).toEqual([node.name.join('.')]);
        expect(_this.variableRegistry.addToEntry).toHaveBeenCalledWith({name: node.name.join('.'), dependedOnBy: [_this.currentVariable.name]});
        expect(handlers.CallVariable.call(_this, node)).toEqual(node.name.join('.'));
        expect(_this.currentVariable.dependsOn).toEqual([node.name.join('.')]);
        expect(_this.variableRegistry.addToEntry.calls.length).toEqual(1);

    });

    it("should call a function", function () {
        expect(handlers.CallFunction.call(_this, node)).toEqual("x(y, z)");
        expect(_this.compileNode.calls.length).toEqual(2);

    });

});