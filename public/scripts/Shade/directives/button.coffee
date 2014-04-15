#Button directive.
#=====

angular.module('ShadeApp')

.directive 'shdButton', ($compile, $timeout, $templateCache) ->
  restrict: 'E'
  replace: true
  scope: true
  transclude: true
  template: (elm, attr) ->
    toAppend = ''
    #callback attributes are of the form: `"Event,callback,option1,option2"`. If there is more than one they are delimited by `;`.
    if (attr.controlBlock)
      #First, the callback strings are parsed into an object.
      cbs = do ->
        obj = {}
        cb_arr = attr.controlBlock.split(';')
        cb_arr = _.map cb_arr, (str) ->  str.split(/\s?,\s?/)
        _.each cb_arr, (arr) ->
          obj[arr[0]] = obj[arr[0]] || []
          obj[arr[0]].push arr.slice(1)
        obj

      #Each event is translated to the appropriate angular attribute.
      events =
        Click: 'ng-click='
        default: 'ng-click='

      #With the appropriate function, parsed according to the callback type.
      handlers =
        setDL: (name ,val) ->
          'vars[&quot;' + name + '&quot;].model=' + val + ';'
        popup: (popup, location) ->
          "popup('" + popup + "','" + location + "')"

      #Then, the callbacks are iterated over and the required attribute to append to the element is created.
      _.each cbs, (cb, name) ->
        toAppend += (events[name] || events.default) + '"' + (_.map cb, (el) ->
          handlers[el[0]] el[1], el[2]).join('') + '" '

    '<button ' + toAppend + '>{{vars[vText].model||text}}</button>'
  link: (scope, elm, attr) ->
    scope.vText = attr.vText
    scope.text = attr.text

    #This is the popup callback. `id` is the popup's id, and `elm` is the target (element to append to popup to).
    scope.popup = (id, elm) ->
      popup = angular.element('#' + id)
      #append the popup to the target element, unless it's already appended.
      unless popup.attr('container') is '#' + elm
        #make sure the popup isn't open
        popup.triggerHandler('leave')
        #And append the popup
        clone = popup.clone()
        popup.after(clone).remove()
        clone.children().removeAttr('ng-transclude')
        #With these attributes, used by the popup provider (from the `mgcrea.ngStrap.popover` module)
        clone.attr({
          'container': '#' + elm,
          'bs-popover': ''
          'trigger': 'manual'
          'template': angular.element('<div />').append(angular.element('<div />').append(angular.element('<div class="popupt"/>').append(clone.children()))).html()
        })
        #Compile the popup and add it to the scope
        popup = $compile(clone)(scope)
      #Open the popup
      $timeout((() -> popup.triggerHandler('popup')),50)

      return