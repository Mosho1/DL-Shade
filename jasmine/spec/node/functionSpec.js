_ = require('underscore');

describe("functionTest-a2l", function () {

    var a2l = require('../../../public/scripts/graph-dev/functions.js').a2l;
    it("should create a list from one array", function () {
        var arr = ['payson', 'is', 'awesome'];
        expect(a2l(arr, " ")).toEqual('payson is awesome');
    });
});

describe("functionTest-avg", function () {
    var avg = require('../../../public/scripts/graph-dev/functions.js').avg;
    it("should compute the average of values", function () {
        var arr = [1, 2, 3, 4, 5];
        expect(avg.apply('', arr)).toEqual(3);

        arr = arr.concat(['a', 'b', 6, 7, '8', '9']);
        expect(avg.apply('', arr)).toEqual(5);
        expect(avg()).toBeFalsy();
        expect(avg(0)).toEqual(0);
        expect(avg('a')).toBeNaN();
        expect(avg(1)).toEqual(1);
    });
});

