
describe("functionTest-a2l", function () {
    _ = require('underscore');
    var a2l = require('../../../public/scripts/graph-dev/functions.js').a2l;
    it("should creat a list from one array", function () {
        var arr = ['payson', 'is', 'awesome'];
        expect(a2l(arr, " ")).toEqual('payson is awesome');
    });
});
