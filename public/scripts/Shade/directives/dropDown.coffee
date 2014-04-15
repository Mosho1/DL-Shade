#Drop-down directive.
#=====
angular.module('ShadeApp')

.directive 'dropDown', ($filter, $timeout, $rootScope, ngGridFlexibleHeightPlugin) ->
  restrict: 'E'
  replace: true
  scope: true
  #The directive makes use of `ng-grid`, a module in the **angular-UI** collection, to make a pseudo select element using a table.
  template: '<table class="dropdown" ng-click="dropdown($event,ghide)"><tr class="selected"><td class="selectedItems">{{selected|selectedArray}}</td><td class="glyphicon glyphicon-chevron-down"></td></tr>
                 <tr class="gridStyle" ng-grid="gridOptions" ng-class="{hide:ghide}" ng-click="select($event)" ng-animate></tr></table>'
  link:
    pre: (scope, elm, attr) ->
      #get the header and items from the element's attributes.
      header = attr.header.split('|')
      items = attr.items.split(',')
      .map (elm) ->
          elm.split('|')
      scope.myData = items.map (elm) ->
        elm.reduce ((obj, el, ind) ->
          obj[header[ind]] = el
          return obj)
        ,{}
      #Initial state is the string "Click me"
      scope.selected = ["Click me"]
      #Options supplied to `ng-grid`
      scope.gridOptions =
        data: 'myData'
        selectedItems: scope.selected,
        multiSelect: attr.multiSelect is 'true'
        plugins: [new ngGridFlexibleHeightPlugin({maxHeight:300})]
        enableSorting: false
        rowHeight: 27


      #`ghide` controls whether the drop-down is shown or not.
      scope.ghide = true

      #This functions is called when the drop-down is to be opened or closed, and emits a signal to indicate to other elements they are no longer focused on.
      scope.dropdown = ($event,state) ->
        $rootScope.$broadcast 'fade' if state
        _.kill_event($event)
        scope.ghide = !state

      #This function simply prevents other events from firing when an option is selected.
      scope.select = ($event) ->
        _.kill_event($event)

      #The following functions close the drop-down if it loses focus. `bg_click` is signaled when the body is clicked or the `Esc` button is pressed. Fade should be emitted to let the drop-down know it is no longer focused on.
      scope.$on 'bg_click', ()->
        scope.dropdown()

      scope.$on 'fade', ()->
        scope.dropdown()

      #hide the drop-down when a selection is made, unless it is a multi-select drop-down.
      scope.$watchCollection 'selected', ->
        if attr.multiSelect is 'false'
          scope.ghide = true