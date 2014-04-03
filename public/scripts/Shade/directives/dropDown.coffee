angular.module('ShadeApp')

.directive 'dropDown', ($rootScope, ngGridFlexibleHeightPlugin) ->
  restrict: 'E'
  scope: true
  template: '<ul class="dropdown" ng-click="dropdown($event,ghide)"><div class="selectedItems">{{selected}}</div>
                 <div class="gridStyle" ng-grid="gridOptions" ng-class="{hide:ghide}" ng-click="select($event)" ></div></ul>'
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
        $rootScope.$broadcast 'bg_click' if state
        _.kill_event($event)
        scope.ghide = !state

      scope.select = ($event) ->
        _.kill_event($event)

      $rootScope.$on 'bg_click', ->
        scope.dropdown()

      if attr.multiSelect is 'false'
        scope.$watchCollection 'selected', ->
          scope.ghide = true