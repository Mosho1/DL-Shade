angular.module('ShadeApp')

.directive 'dropDown', ($filter, $timeout, $rootScope, ngGridFlexibleHeightPlugin) ->
  restrict: 'E'
  replace: true
  scope: true
  template: '<table class="dropdown" ng-click="dropdown($event,ghide)"><tr class="selected"><td class="selectedItems">{{selected|selectedArray}}</td><td class="glyphicon glyphicon-chevron-down"></td></tr>
                 <tr class="gridStyle" ng-grid="gridOptions" ng-class="{hide:ghide}" ng-click="select($event)" ng-animate></tr></table>'
  link:
    pre: (scope, elm, attr) ->
      header = attr.header.split('|')
      items = attr.items.split(',')
      .map (elm) ->
          elm.split('|')
      scope.myData = items.map (elm) ->
        elm.reduce ((obj, el, ind) ->
          obj[header[ind]] = el
          return obj)
        ,{}
      scope.selected = ["Click me"]
      scope.gridOptions =
        data: 'myData'
        selectedItems: scope.selected,
        multiSelect: attr.multiSelect is 'true'
        plugins: [new ngGridFlexibleHeightPlugin({maxHeight:300})]
        enableSorting: false
        rowHeight: 27



      scope.ghide = true
      scope.dropdown = ($event,state) ->
        $rootScope.$broadcast 'fade' if state
        _.kill_event($event)
        scope.ghide = !state

      scope.select = ($event) ->
        _.kill_event($event)

      scope.$on 'bg_click', ()->
        scope.dropdown()

      scope.$on 'fade', ()->
        scope.dropdown()


      scope.$watchCollection 'selected', ->
        if attr.multiSelect is 'false'
          scope.ghide = true