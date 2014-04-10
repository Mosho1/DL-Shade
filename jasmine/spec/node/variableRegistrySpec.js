/**
 * Created by Mosho on 4/2/14.
 */

VariableEntry = require('../../../public/scripts/graph-dev/variable-registry.js').VariableEntry;
VariableRegistry = require('../../../public/scripts/graph-dev/variable-registry.js').VariableRegistry;
CalcHandlers = require('../../../public/scripts/graph-dev/calc-handlers.js');
parser = require('../../../public/scripts/graph-dev/calculator.js').parser;
_ = require('underscore');


describe("VariableEntry", function () {
    it("should create an empty entry", function () {
        var entry = new VariableEntry();
        expect(entry.name).toEqual('');
        expect(entry.expr).toEqual('');
        expect(entry.value).toEqual(null);
        expect(entry.setValue).toEqual(null);
        expect(entry.dependsOn).toEqual([]);
        expect(entry.dependedOnBy).toEqual([]);

        entry = new VariableEntry(new VariableEntry());
        expect(entry.name).toEqual('');
        expect(entry.expr).toEqual('');
        expect(entry.value).toEqual(null);
        expect(entry.setValue).toEqual(null);
        expect(entry.dependsOn).toEqual([]);
        expect(entry.dependedOnBy).toEqual([]);
    });

    it("should create an entry", function () {
        var entry = new VariableEntry('a', 'b + c', 0, null, ['b', 'c'], null);
        expect(entry.name).toEqual('a');
        expect(entry.expr).toEqual('b + c');
        expect(entry.value).toEqual(0);
        expect(entry.setValue).toEqual(null);
        expect(entry.dependsOn).toEqual(['b', 'c']);
        expect(entry.dependedOnBy).toEqual([]);

        entry = new VariableEntry({
            name: 'a',
            expr: 'b + c',
            value: 0,
            setValue: null,
            dependsOn: ['b', 'c'],
            dependedOnBy: null
        });
        expect(entry.name).toEqual('a');
        expect(entry.expr).toEqual('b + c');
        expect(entry.value).toEqual(0);
        expect(entry.setValue).toEqual(null);
        expect(entry.dependsOn).toEqual(['b', 'c']);
        expect(entry.dependedOnBy).toEqual([]);

    });

    it("should set, get, and unset entry value", function () {
        var entry = new VariableEntry('', '', 1);
        expect(entry.get()).toEqual(1);
        expect(entry.set(5).get()).toEqual(5);
        expect(entry.unset().get()).toEqual(1);

    });

    it("should concatenate two entries", function () {
        var entry1 = new VariableEntry('', '', 1, '', ['k', 'p']);
        var entry2 = new VariableEntry('a', 'c - b', 0, 0, null, ['c', 'b']);
        entry1.concat(entry2);
        expect(entry1.name).toEqual('a');
        expect(entry1.expr).toEqual('c - b');
        expect(entry1.value).toEqual(0);
        expect(entry1.setValue).toEqual(0);
        expect(entry1.dependsOn).toEqual(['k', 'p']);
        expect(entry1.dependedOnBy).toEqual(['c', 'b']);

    });

    it("should set, get, and unset entry value", function () {
        var entry = new VariableEntry('', '', 1);
        expect(entry.get()).toEqual(1);
        expect(entry.set(5).get()).toEqual(5);
        expect(entry.unset().get()).toEqual(1);

    });

    it("should concatenate two entries", function () {
        var entry1 = new VariableEntry('', '', 1, '', ['k', 'p']);
        var entry2 = new VariableEntry('a', 'c - b', 0, 0, null, ['c', 'b']);
        entry1.concat(entry2);
        expect(entry1.name).toEqual('a');
        expect(entry1.expr).toEqual('c - b');
        expect(entry1.value).toEqual(0);
        expect(entry1.setValue).toEqual(0);
        expect(entry1.dependsOn).toEqual(['k', 'p']);
        expect(entry1.dependedOnBy).toEqual(['c', 'b']);

    });

    it("should leave entry unchanged by concatenating a blank entry", function () {
        var entry = new VariableEntry('a', 'b + c', 0, null, ['b', 'c'], ['k']);
        entry.concat(new VariableEntry());
        expect(entry.name).toEqual('a');
        expect(entry.expr).toEqual('b + c');
        expect(entry.value).toEqual(0);
        expect(entry.setValue).toEqual(null);
        expect(entry.dependsOn).toEqual(['b', 'c']);
        expect(entry.dependedOnBy).toEqual(['k']);

        entry = new VariableEntry('a', 'b + c', 0, null, ['b', 'c'], ['k']);
        entry = (new VariableEntry()).concat(entry);
        expect(entry.name).toEqual('a');
        expect(entry.expr).toEqual('b + c');
        expect(entry.value).toEqual(0);
        expect(entry.setValue).toEqual(null);
        expect(entry.dependsOn).toEqual(['b', 'c']);
        expect(entry.dependedOnBy).toEqual(['k']);

    });

});

describe("VariableRegistry", function () {
    var entry, _entry, registry = null;

    beforeEach(function () {
        entry = {
            name: 'x',
            value: 1,
            set: function () {},
            unset: function () {},
            get: function () {}
        };

        registry = new VariableRegistry();
        registry.variables[entry.name] = entry;
        // registry.sorted = ['x', 'y', 'z'];



        spyOn(entry, 'set');
        spyOn(entry, 'get');
        spyOn(entry, 'unset');
        spyOn(registry, 'evaluate');
        spyOn(global, 'CalcHandlers');


        registry.set('x', 2);
        registry.set('y', 2);
        registry.getValue('x');
        registry.getValue('y');
        _entry = registry.get('x');
        registry.unset('x');
        registry.unset('y');
        registry.evaluate();



    });

    it("tracks that the spy was called", function () {
        expect(entry.set.calls.length).toBe(1);
        expect(registry.evaluate.calls.length).toBe(2);
        expect(entry.get.calls.length).toBe(1);
        expect(entry.unset.calls.length).toBe(1);
        expect(_entry).toBe(entry);
    });

    it("tracks all the arguments of its calls", function () {
        expect(entry.set).toHaveBeenCalledWith(2);
        expect(registry.evaluate).toHaveBeenCalledWith('x');
    });

});
