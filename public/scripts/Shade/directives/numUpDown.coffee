angular.module('ShadeApp')

.directive 'numUpDown', ($timeout, format) ->
  restrict: 'E'
  scope: false
  compile: (tElm, tAttr) ->
    upButton = angular.element('<button class="btn btn-default" ng-mousedown="increase()" ng-mouseup="stop()" ng-mouseout="stop()" />').append '<span class="glyphicon glyphicon-chevron-up" />'
    downButton = angular.element('<button class="btn btn-default" ng-mousedown="decrease()" ng-mouseup="stop()" ng-mouseout="stop()" />').append '<span class="glyphicon glyphicon-chevron-down" />'
    upDownControl = angular.element('<div class="btn-group-vertical" />').append upButton, downButton
    inputAttrs = _.pick tAttr, (val, key) ->
      ['vText', 'dvalue', 'format'].indexOf(key) > -1
    inputAttrs = _.mapKeys inputAttrs, (val, key) ->
      key.toDash()
    input = angular.element('<input style="width:90%" class="form-control" type="text" />').attr inputAttrs
    numUpDownElement = angular.element('<div class="input-group" />').append input, upDownControl
    tElm.append(numUpDownElement)
    (scope, elm, attr) ->
      test = null
      step = 1
      minVal = +attr.min
      maxVal = +attr.max
      formatStr = attr.format
      timeout = 300
      mtimeout = 30
      cto = null

      updateModel = (value) ->
        if scope.vars and angular.isNumber value
          scope.vars[scope.vText].model = (if value > maxVal then maxVal else (if value < minVal then minVal else value))

      $timeout () ->
        updateModel +attr.dvalue

      scope.increase = () ->
        timeout -= 30  if timeout > mtimeout
        $timeout () -> updateModel scope.vars[scope.vText].model + step
        cto = setTimeout(scope.increase, timeout)

      scope.decrease = () ->
        timeout -= 30  if timeout > mtimeout
        $timeout () -> updateModel scope.vars[scope.vText].model - step
        cto = setTimeout(scope.decrease, timeout)

      scope.stop = () ->
        clearTimeout cto
        timeout = 300