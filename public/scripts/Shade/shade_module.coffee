angular.module('ShadeApp',['ShadeServices', 'ngGrid', 'mgcrea.ngStrap.popover', 'ui.bootstrap'])

.directive 'vText', () ->
    restrict: 'EAC'
    replace: true
    scope: true
    template: (elm) -> '<' + elm[0].localName + ' ng-model="vars[vText].model">'
    link:
      pre: (scope, elm, attr) ->
        scope.vText = attr.vText

  .directive 'datePicker', () ->
    restrict: 'AC'
    scope: true
    template: '<div class="well well-sm" ng-model="vars[vText].model"><datepicker></datepicker></div>'
    link:
      pre: (scope, elm, attr) ->
        scope.vText = attr.datePicker

  .directive 'timePicker', ($compile) ->
    restrict: 'EA'
    replace: false
    scope: false
    compile: (tElm, tAttr) ->
      timePickerElement = angular.element('<timepicker />').attr(_.omit(tAttr, (val, key) ->
        (key is 'vText') or (/^\$.?/.test(key))
      ))
      tElm.append(timePickerElement)

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











