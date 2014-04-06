// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').directive('btn', function($compile, $timeout, $templateCache) {
    return {
      restrict: 'C',
      replace: true,
      scope: false,
      transclude: true,
      template: function(elm, attr) {
        var cbs, events, handlers, toAppend;
        toAppend = '';
        if (attr.controlBlock) {
          cbs = (function() {
            var cb_arr, obj;
            obj = {};
            cb_arr = attr.controlBlock.split(';');
            cb_arr = _.map(cb_arr, function(str) {
              return str.split(/\s?,\s?/);
            });
            _.each(cb_arr, function(arr) {
              obj[arr[0]] = obj[arr[0]] || [];
              return obj[arr[0]].push(arr.slice(1));
            });
            return obj;
          })();
          events = {
            Click: 'ng-click=',
            "default": 'ng-click='
          };
          handlers = {
            setDL: function(name, val) {
              return 'vars[&quot;' + name + '&quot;].model=' + val + ';';
            },
            popup: function(popup, location) {
              return "popup('" + popup + "','" + location + "')";
            }
          };
          _.each(cbs, function(cb, name) {
            return toAppend += (events[name] || events["default"]) + '"' + (_.map(cb, function(el) {
              return handlers[el[0]](el[1], el[2]);
            })).join('') + '" ';
          });
        }
        return '<button ' + toAppend + 'ng-transclude></button>';
      },
      link: function(scope) {
        return scope.popup = function(id, elm) {
          var clone, popup;
          popup = angular.element('#' + id);
          if (popup.attr('container') !== '#' + elm) {
            popup.triggerHandler('leave');
            clone = popup.clone();
            popup.after(clone).remove();
            clone.children().removeAttr('ng-transclude');
            clone.attr({
              'container': '#' + elm,
              'bs-popover': '',
              'trigger': 'manual',
              'template': angular.element('<div />').append(angular.element('<div />').append(angular.element('<div class="popupt"/>').append(clone.children()))).html()
            });
            popup = $compile(clone)(scope);
          }
          $timeout((function() {
            return popup.triggerHandler('popup');
          }), 50);
        };
      }
    };
  });

}).call(this);
