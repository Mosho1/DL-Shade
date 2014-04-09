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

  .directive 'shdImage', ($http) ->
    restrict: 'E'
    replace: true
    scope: true
    require: '?ngModel'
    template: '<img ng-model="vars[vText].model" />'
    link: (scope, elm, attr, ngModel) ->
      scope.src = attr.src
      scope.vText = attr.vText
      if angular.isDefined(ngModel)
        ngModel.$render = () ->
          $http.head(ngModel.$modelValue or 'default')
            .success(->elm.attr('src',ngModel.$modelValue))
            .error(->elm.attr('src',scope.src))





  .directive 'listBox', (vTextProvider) ->
    new vTextProvider '<select multiple ng-transclude />'

  .directive 'inputs', (vTextProvider) ->
    new vTextProvider '<input />'

  .directive 'shdDatePicker', (vTextProvider) ->
    new vTextProvider '<input type="text" datepicker-popup close-on-date-selection="false" />'

  .directive 'timePicker', (vTextProvider) ->
    new vTextProvider '<div><timepicker /></div>'

  .factory 'vTextProvider', () ->
    (template) ->
      @restrict = 'ACE'
      @transclude = !!template.match('ng-transclude')
      @replace = true
      @scope = true
      @template = template.replace /\/?>/, (match) -> ' ng-model="vars[vText].model" ' + match
      @link = (scope, elm, attr) ->
        scope.vText = attr.vText
        elm.after('<span>' + attr.label + '</span>') if attr.label #TODO: put this and the element in a parent element?
      return

