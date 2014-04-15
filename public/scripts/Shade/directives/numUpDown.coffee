#numUpDown directive
#=====
angular.module('ShadeApp')

.directive 'numUpDown', ($timeout, format) ->
  restrict: 'E'
  scope: false
  template: (elm, attr) ->

    #Accepts argument names an extracts them in their HTML form from the element.
    getAttrs = () ->
      args = arguments
      _.reduce args, (str, val) ->
        str + val + '="' + attr[val] + '" '
      , ''

     #Returns the template, consists of the input element and buttons.
    '<div class="input-group">' +
      '<input style="width:90%" class="form-control" type="text" ng-model="vars[vText].model" dvalue="' + getAttrs('dvalue','min','max','format') + '"/>' +
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

    #Function that checks the validity of the value entered in the input.
    updateModel = (value) ->
      value = +value
      if scope.vars and _.isFinite value
        scope.vars[scope.vText].model = (if value > maxVal then maxVal else (if value < minVal then minVal else value))

    #Wrapping functions with `$timeout` ensures that the view is updated with a `$digest`.
    $timeout () ->
      updateModel +attr.dvalue

    #Function to be called when the value is changed via the buttons.
    change = (d) ->
      #Continues to get called with `setTimeout`, faster the longer the mouse button is held.
      timeout -= 30  if timeout > mtimeout
      $timeout () -> updateModel scope.vars[scope.vText].model + d
      cto = setTimeout(change, timeout, d)

    scope.increase = _.partial(change, 1)
    scope.decrease = _.partial(change, -1)

    #Function to be called when the mouse button is up or the mouse cursor leaves the button.
    scope.stop = () ->
      clearTimeout cto
      timeout = 300