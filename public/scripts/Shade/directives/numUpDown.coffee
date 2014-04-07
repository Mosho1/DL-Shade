angular.module('ShadeApp')

.directive 'numUpDown', ($timeout, format) ->
  restrict: 'E'
  scope: false
  template:
    '<div class="input-group">' +
      '<input style="width:90%" class="form-control" type="text" ng-model="vars[vText].model"/>' +
      '<div class="btn-group-vertical">' +
        '<button class="btn btn-default" ng-mousedown="increase()" ng-mouseup="stop()" ng-mouseout="stop()">' +
          '<span class="glyphicon glyphicon-chevron-up" />' +
        '</button>' +
        '<button class="btn btn-default" ng-mousedown="decrease()" ng-mouseup="stop()" ng-mouseout="stop()">' +
          '<span class="glyphicon glyphicon-chevron-down" />' +
        '</button>' +
      '</div>' +
    '</div>'
  link: (scope, elm, attr) ->
    scope.vText = attr.vText

    test = null
    step = 1
    minVal = +attr.min
    maxVal = +attr.max
    formatStr = attr.format
    timeout = 300
    mtimeout = 30
    cto = null

    updateModel = (value) ->
      value = +value
      if scope.vars and angular.isNumber value
        scope.vars[scope.vText].model = (if value > maxVal then maxVal else (if value < minVal then minVal else value))

    $timeout () ->
      updateModel +attr.dvalue

    change = (d) ->
      timeout -= 30  if timeout > mtimeout
      $timeout () -> updateModel scope.vars[scope.vText].model + d
      cto = setTimeout(change, timeout, d)

    scope.increase = _.partial(change, 1)
    scope.decrease = _.partial(change, -1)

    scope.stop = () ->
      clearTimeout cto
      timeout = 300