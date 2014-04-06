angular.module('ShadeApp',['ShadeServices', 'ngGrid', 'mgcrea.ngStrap.popover', 'ui.bootstrap'])

  .directive 'vActiveTabIndex', () ->
    restrict: 'A'
    link: (scope, elm, attr) ->
        scope.vactive = attr.vActiveTabIndex
        scope.$watch 'vars[vactive].model', (vactive) ->
          vactive = Number(vactive)
          if angular.isDefined scope.tabs[vactive]
            _.each scope.tabs, (tab, ind) ->
              tab.active = false
              if ind is vactive
                tab.active = true
        scope.$watch 'active', (active) ->
          scope.vars[scope.vactive].model = active

  .directive 'listBox', (vTextProvider) ->
    new vTextProvider '<select multiple ng-transclude />'

  .directive 'numEdit', (vTextProvider) ->
    new vTextProvider '<input type="text" />'

  .directive 'radioButton', (vTextProvider) ->
    new vTextProvider '<input type="radio" />'

  .directive 'checkBox', (vTextProvider) ->
    new vTextProvider '<input type="checkbox" />'

  .directive 'textBox', (vTextProvider) ->
    new vTextProvider '<input type="text" />'

  .directive 'shdDatePicker', (vTextProvider) ->
    new vTextProvider '<input type="text" datepicker-popup close-on-date-selection="false" />'

  .directive 'timePicker', (vTextProvider) ->
    new vTextProvider '<div><timepicker /></div>'

  .factory 'vTextProvider', () ->
    (template) ->
      @restrict = 'E'
      @transclude = !!template.match('ng-transclude')
      @replace = true
      @scope = true
      @template = template.replace /\/?>/, (match) -> ' ng-model="vars[vText].model" ' + match
      @link = (scope, elm, attr) ->
        scope.vText = attr.vText
        elm.after('<span>' + attr.label + '</span>') if attr.label
      return
###
  .directive 'ratatat', ($compile) ->
      restrict: 'EA'
      replace: false
      scope: false
      compile: (tElm, tAttr) ->
        timePickerElement = angular.element('<timepicker />').attr(_.omit(tAttr, (val, key) ->
          (key is 'vText') or (/^\$.?/.test(key))
        ))
        tElm.append(timePickerElement)



  .directive 'listBox', (vTextProvider) ->
      new vTextProvider '<select multiple ng-model="vars[vText].model" ng-transclude />'

  .directive 'numEdit', (vTextProvider) ->
      new vTextProvider '<input type="text" ng-model="vars[vText].model" />'

  .directive 'radioButton', (vTextProvider) ->
      new vTextProvider '<input type="radio" ng-model="vars[vText].model" />'

  .directive 'textBox', (vTextProvider) ->
      new vTextProvider '<input type="text" ng-model="vars[vText].model" />'

  .factory 'vTextProvider', () ->
      (template) ->
        @restrict = 'E'
        @transclude = !!template.match('ng-transclude')
        @replace = true
        @scope = true
        @template = template
        @link = (scope, elm, attr) ->
          scope.vText = attr.vText

        return


  .directive 'listBox', () ->
    restrict: 'E'
    replace: true
    scope: true
    transclude: true
    template: '<select multiple ng-model="vars[vText].model" ng-transclude />'
    link: (scope, elm, attr) ->
        scope.vText = attr.vText

  .directive 'numEdit', () ->
    restrict: 'E'
    replace: true
    scope: true
    template: '<input type="text" ng-model="vars[vText].model" />'
    link: (scope, elm, attr) ->
      scope.vText = attr.vText

  .directive 'radioButton', () ->
    restrict: 'E'
    replace: true
    scope: true
    template: '<input type="radio" ng-model="vars[vText].model" />'
    link: (scope, elm, attr) ->
      scope.vText = attr.vText

  .directive 'textBox', () ->
    restrict: 'E'
    replace: true
    scope: true
    template: '<input type="text" ng-model="vars[vText].model" />'
    link: (scope, elm, attr) ->
      scope.vText = attr.vText


  .directive 'datePicker', () ->
  restrict: 'AC'
  scope: true
  template: '<div class="well well-sm" ng-model="vars[vText].model"><datepicker></datepicker></div>'
  link:
    pre: (scope, elm, attr) ->
      scope.vText = attr.datePicker
###


