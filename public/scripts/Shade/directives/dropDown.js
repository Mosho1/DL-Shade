// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').directive('dropDown', function($rootScope, ngGridFlexibleHeightPlugin) {
    return {
      restrict: 'E',
      scope: true,
      template: '<ul class="dropdown" ng-click="dropdown($event,ghide)"><div class="selectedItems">{{selected}}</div> <div class="gridStyle" ng-grid="gridOptions" ng-class="{hide:ghide}" ng-click="select($event)" ></div></ul>',
      link: {
        pre: function(scope, elm, attr) {
          var header, items;
          header = attr.header.split('|');
          items = attr.items.split(',').map(function(elm) {
            return elm.split('|');
          });
          scope.myData = items.map(function(elm) {
            return elm.reduce((function(obj, el, ind) {
              obj[header[ind]] = el;
              return obj;
            }), {});
          });
          scope.selected = ["Click me"];
          scope.gridOptions = {
            data: 'myData',
            selectedItems: scope.selected,
            multiSelect: attr.multiSelect === 'true',
            plugins: [
              new ngGridFlexibleHeightPlugin({
                maxHeight: 300
              })
            ],
            enableSorting: false,
            rowHeight: 27
          };
          scope.ghide = true;
          scope.dropdown = function($event, state) {
            if (state) {
              $rootScope.$broadcast('bg_click');
            }
            _.kill_event($event);
            return scope.ghide = !state;
          };
          scope.select = function($event) {
            return _.kill_event($event);
          };
          $rootScope.$on('bg_click', function() {
            return scope.dropdown();
          });
          if (attr.multiSelect === 'false') {
            return scope.$watchCollection('selected', function() {
              return scope.ghide = true;
            });
          }
        }
      }
    };
  });

}).call(this);
