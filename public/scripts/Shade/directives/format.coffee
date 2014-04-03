angular.module('ShadeApp')

.directive 'format', (format) ->
  restrict: 'A'
  require: '?ngModel'
  link:
    pre: (scope, elm, attr, ngModel) ->
      formatStr = attr.format
      if angular.isDefined ngModel
        ngModel.$formatters.push (value) ->
          if angular.isNumber value
            value = format value, formatStr
        ngModel.$parsers.unshift (value) ->
          if isNaN value
            value = ngModel.$modelValue
          +value
        elm.on 'blur', () ->
          if isNaN elm.val()
            elm.val format +ngModel.$modelValue, formatStr
          else
            elm.val format +elm.val(), formatStr