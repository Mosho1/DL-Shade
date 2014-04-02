_ = require('underscore');

var parser =  require('../../../public/scripts/graph-dev/calculator.js').parser;

describe('calculatorTest', function() {



    it("should parse expressions without variables", function() {
        parser.yy = require('../../../public/scripts/graph-dev/calc-handlers.js')();
        expect(parser.parse("1 + 3")).toEqual(4);
        expect(parser.parse("'1 + 3'")).toEqual("1 + 3");
        expect(parser.parse('"1" + "3"')).toEqual("13");
        expect(parser.parse("'1'+3")).toEqual("13"); //TODO: doesn't work when both are single-quote strings
        expect(parser.parse("1/0")).toEqual(Infinity);
        expect(parser.parse("0/0")).toBeNaN();
        expect(parser.parse("a")).toBeNull();
        expect(parser.parse("a + b")).toEqual(0);
        expect(parser.parse("'a + b'")).toEqual("a + b");
        expect(parser.parse("a / b")).toBeNaN();
        expect(parser.parse("f.avg(1,2,3)")).toEqual(2);
    });
});

describe('calculatorTest2', function () {

    var variables = {
        a: {value: 1},
        b: {value: 2}
    }

    it("should parse expressions with variables", function () {
        parser.yy = require('../../../public/scripts/graph-dev/calc-handlers.js')(variables);
        expect(parser.parse("a")).toEqual(1);
        expect(parser.parse("a + b")).toEqual(3);
        expect(parser.parse("'a + b'")).toEqual("a + b");
        expect(parser.parse("a / b")).toEqual(0.5);
        expect(parser.parse("f.avg(a,b,3)")).toEqual(2);
    });
});