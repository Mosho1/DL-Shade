// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').directive('format', function(format) {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: {
        pre: function(scope, elm, attr, ngModel) {
          var formatStr;
          formatStr = attr.format;
          if (angular.isDefined(ngModel)) {
            ngModel.$formatters.push(function(value) {
              if (angular.isNumber(value)) {
                return value = format(value, formatStr);
              }
            });
            ngModel.$parsers.unshift(function(value) {
              if (isNaN(value)) {
                value = ngModel.$modelValue;
              }
              return +value;
            });
            return elm.on('blur', function() {
              if (isNaN(elm.val())) {
                return elm.val(format(+ngModel.$modelValue, formatStr));
              } else {
                return elm.val(format(+elm.val(), formatStr));
              }
            });
          }
        }
      }
    };
  });

}).call(this);
