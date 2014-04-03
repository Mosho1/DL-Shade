angular.module('ShadeApp')

.directive 'btn', ($compile, $timeout, $templateCache) ->
  restrict: 'C'
  replace: true
  scope: false
  transclude: true
  template: (elm, attr) ->
    toAppend = ''
    if (attr.controlBlock)
      cbs = do ->
        obj = {}
        cb_arr = attr.controlBlock.split(';')
        cb_arr = _.map cb_arr, (str) ->  str.split(/\s?,\s?/)
        _.each cb_arr, (arr) ->
          obj[arr[0]] = obj[arr[0]] || []
          obj[arr[0]].push arr.slice(1)
        obj
      events =
        Click: 'ng-click='
      handlers =
        setDL: (name ,val) ->
          'vars[&quot;' + name + '&quot;].model=' + val + ';'
        popup: (popup, location) ->
          "popup('" + popup + "','" + location + "')"

      _.each cbs, (cb, name) ->
        toAppend += (events[name] || events.Click) + '"' + (_.map cb, (el) ->
          handlers[el[0]] el[1], el[2]).join('') + '" '

    '<button ' + toAppend + 'ng-transclude></button>'
  link: (scope) ->
    scope.popup = (id, elm) ->
      popup = angular.element('#' + id)
      unless popup.attr('container') is '#' + elm
        popup.triggerHandler('leave')
        clone = popup.clone()
        popup.after(clone).remove()
        clone.children().removeAttr('ng-transclude')
        clone.attr({
          'container': '#' + elm,
          'bs-popover': ''
          'trigger': 'manual'
          'template': angular.element('<div />').append(angular.element('<div />').append(angular.element('<div class="popupt"/>').append(clone.children()))).html()
        })
        popup = $compile(clone)(scope)
      $timeout((() -> popup.triggerHandler('popup')),50)

      return