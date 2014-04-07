// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').directive('numUpDown', function($timeout, format) {
    return {
      restrict: 'E',
      scope: false,
      template: '<div class="input-group">' + '<input style="width:90%" class="form-control" type="text" ng-model="vars[vText].model"/>' + '<div class="btn-group-vertical">' + '<button class="btn btn-default" ng-mousedown="increase()" ng-mouseup="stop()" ng-mouseout="stop()">' + '<span class="glyphicon glyphicon-chevron-up" />' + '</button>' + '<button class="btn btn-default" ng-mousedown="decrease()" ng-mouseup="stop()" ng-mouseout="stop()">' + '<span class="glyphicon glyphicon-chevron-down" />' + '</button>' + '</div>' + '</div>',
      link: function(scope, elm, attr) {
        var change, cto, formatStr, maxVal, minVal, mtimeout, step, test, timeout, updateModel;
        scope.vText = attr.vText;
        test = null;
        step = 1;
        minVal = +attr.min;
        maxVal = +attr.max;
        formatStr = attr.format;
        timeout = 300;
        mtimeout = 30;
        cto = null;
        updateModel = function(value) {
          value = +value;
          if (scope.vars && angular.isNumber(value)) {
            return scope.vars[scope.vText].model = (value > maxVal ? maxVal : (value < minVal ? minVal : value));
          }
        };
        $timeout(function() {
          return updateModel(+attr.dvalue);
        });
        change = function(d) {
          if (timeout > mtimeout) {
            timeout -= 30;
          }
          $timeout(function() {
            return updateModel(scope.vars[scope.vText].model + d);
          });
          return cto = setTimeout(change, timeout, d);
        };
        scope.increase = _.partial(change, 1);
        scope.decrease = _.partial(change, -1);
        return scope.stop = function() {
          clearTimeout(cto);
          return timeout = 300;
        };
      }
    };
  });

}).call(this);
