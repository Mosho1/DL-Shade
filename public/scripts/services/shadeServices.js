format = function(){return '12.34'};

angular.module('app', [])

    .directive('vText', function() {
        return {
            restrict: 'EAC',
            replace: true,
            scope: true,
            template: function(elm) {
                return '<div />';
            },
            link: {
                pre: function(scope, elm, attr) {
                    return scope.vText = attr.vText;
                }
            }
        };
    })

    .directive('numUpDown', function($timeout) {
        return {
            restrict: 'E',
            scope: false,
            require: '?ngModel',
            compile: function(tElm, tAttr) {
                var downButton, input, inputAttrs, numUpDownElement, upButton, upDownControl;
                upButton = angular.element('<button class="btn btn-default" ng-mousedown="increase()" ng-mouseup="stop()" />').append('<span class="glyphicon glyphicon-chevron-up" />');
                downButton = angular.element('<button class="btn btn-default" ng-mousedown="decrease()" ng-mouseup="stop()"  />').append('<span class="glyphicon glyphicon-chevron-down" />');
                upDownControl = angular.element('<div class="btn-group-vertical" />').append(upButton, downButton);
                inputAttrs = _.pick(tAttr, function(val, key) {
                    return ['vText', 'dvalue'].indexOf(key) > -1;
                });
                inputAttrs = _.mapKeys(inputAttrs, function(val, key) {
                    return key.toDash();
                });
                input = angular.element('<input style="width:90%" class="form-control" type="text" />').attr(inputAttrs);
                numUpDownElement = angular.element('<div class="input-group" />').append(input, upDownControl);
                tElm.append(numUpDownElement);
                return function(scope, elm, attr, ngModel) {
                    var cto, formatStr, maxVal, minVal, mtimeout, step, test, timeout, updateModel;
                    test = null;
                    step = 1;
                    minVal = +attr.min;
                    maxVal = +attr.max;
                    formatStr = attr.format;
                    timeout = 300;
                    mtimeout = 30;
                    cto = null;
                    if (angular.isDefined(ngModel)) {
                        ngModel;
                        ngModel.$formatters.push(function(value) {
                            if (isNaN(value)) {
                                return '';
                            } else {
                                test = value = format(value, formatStr);
                                return ngModel.$render();
                            }
                        });
                        ngModel.$render = function() {
                            console.log(test);
                            return elm.children().find('input').addClass(test);
                        };
                    }
                    updateModel = function(value) {
                        if (scope.vars && angular.isNumber(value)) {
                            return scope.vars[scope.vText].model = (value > maxVal ? maxVal : (value < minVal ? minVal : value));
                        }
                    };
                    $timeout(function() {
                        return updateModel(+attr.dvalue);
                    });
                    scope.increase = function() {
                        if (timeout > mtimeout) {
                            timeout -= 30;
                        }
                        $timeout(function() {
                            return updateModel(scope.vars[scope.vText].model + step);
                        });
                        return cto = setTimeout(scope.increase, timeout);
                    };
                    scope.decrease = function() {
                        if (timeout > mtimeout) {
                            timeout -= 30;
                        }
                        $timeout(function() {
                            return updateModel(scope.vars[scope.vText].model - step);
                        });
                        return cto = setTimeout(scope.decrease, timeout);
                    };
                    return scope.stop = function() {
                        clearTimeout(cto);
                        return timeout = 300;
                    };
                };
            }
        };
    });


String.prototype.toDash = function() {
    return this.replace(/([A-Z])/g, function($1) {
        return "-" + $1.toLowerCase();
    });
};

_ = _ || {};
_.mapKeys = function(object, callback, thisArg) {
    var result;
    result = {};
    callback = _.createCallback(callback, thisArg, 3);
    _.forOwn(object, function(value, key, object) {
        result[callback(value, key, object)] = value;
    });
    return result;
};

