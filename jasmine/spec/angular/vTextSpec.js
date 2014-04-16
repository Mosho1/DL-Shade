describe('inputs tests', function () {
    var element, scope;
    beforeEAch(module('shadeApp'));

    beforeEach(inject(function ($rootScope, $compile) {
        scope = $rootScope;
        element = angular.element("<div />");
        $compile(element)($rootScope);

    }));





})