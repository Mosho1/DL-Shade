// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp', ['ShadeServices', 'ngGrid', 'mgcrea.ngStrap.popover', 'ui.bootstrap']).directive('vText', function() {
    return {
      restrict: 'EAC',
      replace: true,
      scope: true,
      template: function(elm) {
        return '<' + elm[0].localName + ' ng-model="vars[vText].model">';
      },
      link: {
        pre: function(scope, elm, attr) {
          return scope.vText = attr.vText;
        }
      }
    };
  }).directive('datePicker', function() {
    return {
      restrict: 'AC',
      scope: true,
      template: '<div class="well well-sm" ng-model="vars[vText].model"><datepicker></datepicker></div>',
      link: {
        pre: function(scope, elm, attr) {
          return scope.vText = attr.datePicker;
        }
      }
    };
  }).directive('timePicker', function($compile) {
    return {
      restrict: 'EA',
      replace: false,
      scope: false,
      compile: function(tElm, tAttr) {
        var timePickerElement;
        timePickerElement = angular.element('<timepicker />').attr(_.omit(tAttr, function(val, key) {
          return (key === 'vText') || (/^\$.?/.test(key));
        }));
        return tElm.append(timePickerElement);
      }
    };
  }).directive('vActiveTabIndex', function() {
    return {
      restrict: 'A',
      link: function(scope, elm, attr) {
        scope.vactive = attr.vActiveTabIndex;
        scope.$watch('vars[vactive].model', function(vactive) {
          vactive = Number(vactive);
          if (angular.isDefined(scope.tabs[vactive])) {
            return _.each(scope.tabs, function(tab, ind) {
              tab.active = false;
              if (ind === vactive) {
                return tab.active = true;
              }
            });
          }
        });
        return scope.$watch('active', function(active) {
          return scope.vars[scope.vactive].model = active;
        });
      }
    };
  });

}).call(this);

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
            Click: 'ng-click='
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
            return toAppend += (events[name] || events.Click) + '"' + (_.map(cb, function(el) {
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

// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').directive('format', function(format) {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: {
        pre: function(scope, elm, attr, ngModel) {
          var formatStr;
          formatStr = attr.format;
          if (angular.isDefined(ngModel)) {
            ngModel.$formatters.push(function(value) {
              if (angular.isNumber(value)) {
                return value = format(value, formatStr);
              }
            });
            ngModel.$parsers.unshift(function(value) {
              if (isNaN(value)) {
                value = ngModel.$modelValue;
              }
              return +value;
            });
            return elm.on('blur', function() {
              if (isNaN(elm.val())) {
                return elm.val(format(+ngModel.$modelValue, formatStr));
              } else {
                return elm.val(format(+elm.val(), formatStr));
              }
            });
          }
        }
      }
    };
  });

}).call(this);

// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').directive('numUpDown', function($timeout, format) {
    return {
      restrict: 'E',
      scope: false,
      compile: function(tElm, tAttr) {
        var downButton, input, inputAttrs, numUpDownElement, upButton, upDownControl;
        upButton = angular.element('<button class="btn btn-default" ng-mousedown="increase()" ng-mouseup="stop()" ng-mouseout="stop()" />').append('<span class="glyphicon glyphicon-chevron-up" />');
        downButton = angular.element('<button class="btn btn-default" ng-mousedown="decrease()" ng-mouseup="stop()" ng-mouseout="stop()" />').append('<span class="glyphicon glyphicon-chevron-down" />');
        upDownControl = angular.element('<div class="btn-group-vertical" />').append(upButton, downButton);
        inputAttrs = _.pick(tAttr, function(val, key) {
          return ['vText', 'dvalue', 'format'].indexOf(key) > -1;
        });
        inputAttrs = _.mapKeys(inputAttrs, function(val, key) {
          return key.toDash();
        });
        input = angular.element('<input style="width:90%" class="form-control" type="text" />').attr(inputAttrs);
        numUpDownElement = angular.element('<div class="input-group" />').append(input, upDownControl);
        tElm.append(numUpDownElement);
        return function(scope, elm, attr) {
          var cto, formatStr, maxVal, minVal, mtimeout, step, test, timeout, updateModel;
          test = null;
          step = 1;
          minVal = +attr.min;
          maxVal = +attr.max;
          formatStr = attr.format;
          timeout = 300;
          mtimeout = 30;
          cto = null;
          updateModel = function(value) {
            if (scope.vars && angular.isNumber(value)) {
              return scope.vars[scope.vText].model = (value > maxVal ? maxVal : (value < minVal ? minVal : value));
            }
          };
          $timeout(function() {
            return updateModel(+attr.dvalue);
          });
          scope.increase = function() {
            if (timeout > mtimeout) {
              timeout -= 30;
            }
            $timeout(function() {
              return updateModel(scope.vars[scope.vText].model + step);
            });
            return cto = setTimeout(scope.increase, timeout);
          };
          scope.decrease = function() {
            if (timeout > mtimeout) {
              timeout -= 30;
            }
            $timeout(function() {
              return updateModel(scope.vars[scope.vText].model - step);
            });
            return cto = setTimeout(scope.decrease, timeout);
          };
          return scope.stop = function() {
            clearTimeout(cto);
            return timeout = 300;
          };
        };
      }
    };
  });

}).call(this);

// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').directive('renderPanel', function($compile, $rootScope, shadeTemplate) {
    return {
      restrict: 'E',
      scope: {
        vars: '=',
        graph: '=',
        styles: '='
      },
      link: function(scope, elm) {
        return $rootScope.$on('Run', function() {
          if (scope.data = shadeTemplate.toHTML(scope.styles)) {
            elm.html('<style>' + scope.data.styles + '</style>' + scope.data.body);
            return $compile(elm.contents())(scope);
          }
        });
      }
    };
  }).directive('prettyPrintPanel', function($filter, shadeTemplate) {
    return {
      restrict: 'A',
      replace: true,
      template: '<div class="pp-panel"></div>',
      link: function(scope, elm, attrs) {
        return scope.$watch(attrs.prettyPrintPanel, function(shade) {
          var code, pre, raw_html;
          raw_html = $filter('indentHTML')((shadeTemplate.toHTML(shade) || {
            body: ''
          }).body);
          pre = angular.element('<pre class="prettyprint lang-html" style="font-size:0.75em"></pre>');
          code = angular.element('<code></code>');
          code.html($filter('escapeHTML')(raw_html));
          pre.append(code);
          elm.html(pre);
          return prettyPrint();
        });
      },
      controller: function($scope, $http) {
        var themes;
        $scope.themes = themes = {
          list: ['google-code-light', 'solarized-dark', 'solarized-light', 'sons-of-obsidian-dark', 'tomorrow-night-blue', 'tomorrow-night-dark', 'tomorrow-night-light', 'tomorrow-night-eighties'],
          selected: 'google-code-light'
        };
        return $scope.$watch('themes.selected', function(theme_name) {
          var url;
          url = "styles/gprettify/" + theme_name + ".css";
          return $http.get(url).then(function(response) {
            return themes.css = response.data;
          });
        });
      }
    };
  });

}).call(this);

// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').factory('ngGridFlexibleHeightPlugin', function() {
    var ngGridFlexibleHeightPlugin;
    return ngGridFlexibleHeightPlugin = function(opts) {
      var self;
      self = this;
      self.grid = null;
      self.scope = null;
      self.init = function(scope, grid, services) {
        var innerRecalcForData, recalcHeightForData;
        self.domUtilityService = services.DomUtilityService;
        self.grid = grid;
        self.scope = scope;
        recalcHeightForData = function() {
          setTimeout(innerRecalcForData, 1);
        };
        innerRecalcForData = function() {
          var extraHeight, footerPanelSel, gridId, naturalHeight, newViewportHeight;
          gridId = self.grid.gridId;
          footerPanelSel = "." + gridId + " .ngFooterPanel";
          extraHeight = self.grid.$topPanel.height() + $(footerPanelSel).height();
          naturalHeight = self.grid.$canvas.height() + 1;
          if (opts != null) {
            if ((opts.minHeight != null) && (naturalHeight + extraHeight) < opts.minHeight) {
              naturalHeight = opts.minHeight - extraHeight - 2;
            }
            if ((opts.maxHeight != null) && (naturalHeight + extraHeight) > opts.maxHeight) {
              naturalHeight = opts.maxHeight - extraHeight - 2;
            }
          }
          newViewportHeight = naturalHeight + 2;
          if (!self.scope.baseViewportHeight || self.scope.baseViewportHeight !== newViewportHeight) {
            self.grid.$viewport.css("height", newViewportHeight + "px");
            self.grid.$root.css("height", (newViewportHeight + extraHeight) + "px");
            self.scope.baseViewportHeight = newViewportHeight;
            self.domUtilityService.RebuildGrid(self.scope, self.grid);
          }
        };
        self.scope.catHashKeys = function() {
          var hash, idx;
          hash = "";
          idx = void 0;
          for (idx in self.scope.renderedRows) {
            hash += self.scope.renderedRows[idx].$$hashKey;
          }
          return hash;
        };
        self.scope.$watch("catHashKeys()", innerRecalcForData);
        self.scope.$watch(self.grid.config.data, recalcHeightForData);
      };
    };
  });

}).call(this);

// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').service('format', function() {
    var insertions;
    insertions = {
      0: '0'
    };
    return function(input, str) {
      var DelimOpt, appendIndex, appendLeft, i, j, k, output;
      if (angular.isNumber(input)) {
        output = [[], []];
        input = input.toString().split(".").map(function(elm) {
          return elm.split("");
        });
        DelimOpt = /#+,+#+.*\./.test(str);
        str = str.replace(/\s|,/g, '');
        appendIndex = Math.min(str.indexOf("#"), str.indexOf("0"));
        appendLeft = str.slice(0, appendIndex);
        str = str.slice(appendIndex).split(".").map(function(elm) {
          return elm.split("");
        });
        j = -1;
        i = 0;
        while (str[1] && input[1] && i < str[1].length) {
          output[1].push((/[#0]/.test(str[1][i]) ? input[1][++j] || insertions[str[1][i]] : str[1][i] || ""));
          i++;
        }
        j = input[0].length;
        i = str[0].length - 1;
        k = 0;
        while (Math.max(j, i) >= 0) {
          output[0].unshift((i < 0 || /[#0]/.test(str[0][i]) ? input[0][--j] || insertions[str[0][i]] : str[0][i] || ""));
          i--;
        }
        return appendLeft + output[0].join("") + (output[1].length ? "." + output[1].join("") : "");
      }
    };
  });

}).call(this);

// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').service('shadeTemplate', function($http, x2js, ShadeParser, ShadeAttrDictionary) {
    var template;
    template = function() {};
    $http.get('/scripts/ng_template_shd.js').success(function(data) {
      _.templateSettings.variable = "shd";
      return template = _.template(data);
    }).error(function() {
      return console.log("could not retrieve shade template");
    });
    this.toHTML = function(shade) {
      var parsed;
      parsed = ShadeParser.parse(x2js.xml2json(shade));
      _.extend(parsed, ShadeAttrDictionary);
      return {
        'body': template(parsed || {}),
        'styles': (parsed || {
          styles: ''
        }).styles
      };
    };
    return this;
  });

}).call(this);
