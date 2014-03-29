// Generated by CoffeeScript 1.7.1
(function() {
  'use strict';
  var default_lc;

  default_lc = "/* Welcome to Dependency Language in JavaScript!\n Features:\n -Supported Formats:\n Numbers, Strings, arrays\n -Namespaces (format: '$ns') -Built-in Functions:\n f.abs, f.avg\n -Themes for the editor\n -Graph or table presentation of the graph\n -Click 'Run' above or alt+R */\n \n x=0;\n y=2;\n z=f.avg(x,y,6);";

  angular.module('DLApp').service('dndFile', function($rootScope) {
    var allowed_file_exts, default_drop, load_first_file_matching;
    allowed_file_exts = /\.(md|litcoffee|css)$/;
    load_first_file_matching = (function(_this) {
      return function(files, regexp) {
        var mdfile, reader;
        if (mdfile = (function() {
          var f, _i, _len;
          for (_i = 0, _len = files.length; _i < _len; _i++) {
            f = files[_i];
            if (regexp.test(f.name)) {
              return f;
            }
          }
        })()) {
          reader = new FileReader();
          reader.onload = function(e) {
            e.fileName = mdfile.name.replace(regexp, '');
            e.fileExt = mdfile.name.match(regexp)[1];
            return _this.callbacks.fileload(e);
          };
          return reader.readAsText(mdfile);
        }
      };
    })(this);
    default_drop = (function(_this) {
      return function(e) {
        var files;
        files = e.dataTransfer.files;
        if (files.length) {
          load_first_file_matching(files, /\.(md|litcoffee)$/);
          return load_first_file_matching(files, /\.(css)$/);
        }
      };
    })(this);
    this.callbacks = {
      active: function(e) {},
      inactive: function(e) {},
      fileload: function(e) {},
      drop: function(e) {},
      default_drop: default_drop
    };
    return {
      init: (function(_this) {
        return function(elm) {
          elm.addEventListener("dragenter", function(e) {
            _.kill_event(e);
            return _this.callbacks.active(e);
          });
          elm.addEventListener("dragover", function(e) {
            _.kill_event(e);
            return _this.callbacks.active(e);
          });
          elm.addEventListener("dragexit", function(e) {
            _.kill_event(e);
            return _this.callbacks.inactive(e);
          });
          return elm.addEventListener("drop", function(e) {
            _.kill_event(e);
            _this.callbacks.drop(e);
            return _this.callbacks.default_drop(e);
          });
        };
      })(this),
      onactive: (function(_this) {
        return function(cb) {
          return _this.callbacks.active = cb;
        };
      })(this),
      oninactive: (function(_this) {
        return function(cb) {
          return _this.callbacks.inactive = cb;
        };
      })(this),
      onfileload: (function(_this) {
        return function(cb) {
          return _this.callbacks.fileload = cb;
        };
      })(this),
      ondrop: (function(_this) {
        return function(cb, replace_default) {
          _this.callbacks.drop = cb;
          return _this.callbacks.default_drop = replace_default ? (function() {}) : default_drop;
        };
      })(this)
    };
  }).controller('DLCtrl', function($scope, $rootScope, $http, $filter, $element, $document, dndFile, Graph, graphService) {
    $scope.litcoffee = {
      code: default_lc
    };
    $scope.test = {
      test: default_lc
    };
    dndFile.init($element[0], dndFile.onactive(function() {
      return $scope.$apply(function() {
        return $scope.dragover = true;
      });
    }));
    dndFile.oninactive(function() {
      return $scope.$apply(function() {
        return $scope.dragover = false;
      });
    });
    $element[0].addEventListener('mousemove', function() {
      return $scope.$apply(function() {
        return $scope.dragover = false;
      });
    });
    dndFile.ondrop((function(e) {
      return $scope.$apply(function() {
        return $scope.dragover = false;
      });
    }), false);
    dndFile.onfileload(function(e) {
      return $scope.$apply(function() {
        var i, name, _ref;
        if ((_ref = e.fileExt) === 'md' || _ref === 'litcoffee') {
          return $scope.litcoffee = e.target.result;
        } else if (e.fileExt === 'css') {
          name = e.fileName;
          i = 0;
          while (name in $scope.styles.sheets) {
            name = "" + e.fileName + " " + (++i);
          }
          $scope.styles.sheets[name] = {
            source: 'dragged file',
            "native": false,
            css: e.target.result
          };
          return $scope.styles.active = name;
        }
      });
    });
    $document.keyup(function(e) {
      var col;
      if (e.altKey) {
        if (e.keyCode === 82) {
          $scope.DLrun(e);
        }
        if (col = $scope.cols[e.keyCode - 49]) {
          return $scope.$apply(col.show = !col.show);
        }
      }
    });
    $scope.styles = {
      active: 'control',
      sheets: {
        basics: {
          source: 'XML/shade.xml',
          "native": true
        },
        control: {
          source: 'XML/control.xml',
          "native": true
        }
      },
      external: '',
      editor: ''
    };
    $scope.copy_style = function(e, style_name) {
      var copy, i, name;
      _.kill_event(e);
      copy = _.clone($scope.styles.sheets[style_name]);
      style_name = style_name.match(/(.*?)(:? copy(:? \d+)?)?$/)[1];
      name = "" + style_name + " copy";
      i = 0;
      while (name in $scope.styles.sheets) {
        name = "" + style_name + " copy " + (++i);
      }
      copy["native"] = false;
      $scope.styles.sheets[name] = copy;
      return $scope.styles.active = name;
    };
    $scope.delete_style = function(e, style_name) {
      _.kill_event(e);
      delete $scope.styles.sheets[style_name];
      if ($scope.styles.active === style_name) {
        return $scope.styles.active = Object.keys($scope.styles.sheets)[0];
      }
    };
    $scope.DLrun = function(e) {
      if (e) {
        _.kill_event(e);
      }
      return Graph.getGraph($scope.litcoffee.code, $scope.styles, function(graph) {
        $scope.graph = graph.evaluate();
        return $rootScope.$broadcast('Run');
      });
    };
    $document.ready(function() {
      return setTimeout($scope.DLrun, 100);
    });
    $scope.$watch('styles.active', function() {
      var styles;
      if ($scope.styles.active in $scope.styles.sheets) {
        styles = $scope.styles.sheets[$scope.styles.active];
        if (styles.css) {
          return $scope.styles.editor = $filter('prettifyCSS')($filter('deSassify')(styles.css));
        } else {
          return $http.get(styles.source).then(function(response) {
            styles.css = response.data;
            return $scope.styles.editor = $filter('prettifyCSS')($filter('deSassify')(styles.css));
          });
        }
      }
    });
    $scope.$watch('styles.editor', function() {
      if ($scope.styles.sheets[$scope.styles.active]) {
        return $scope.styles.sheets[$scope.styles.active].css = $scope.styles.editor;
      }
    });
    return $scope.$watch('styles.external', function() {
      if (!($scope.styles.external && /^(https?:\/\/)?(\w+\.)+[\w\/]+/.test($scope.styles.external))) {
        return;
      }
      return $http.get(_.corsproxy($scope.styles.external)).then(function(response) {
        var file_name, i, name;
        i = 0;
        file_name = $scope.styles.external.match(/.+?\/(\w+)\.css/);
        name = file_name && file_name[1] || "external";
        while (name in $scope.styles.sheets) {
          name = "external " + (++i);
        }
        $scope.styles.sheets[name] = {
          source: $scope.styles.external,
          css: response.data,
          external: true,
          edited: false
        };
        $scope.styles.active = name;
        return $scope.styles.external = '';
      });
    });
  }).directive('menu', function($compile, $rootScope) {
    return {
      scope: {
        col: '=',
        themes: '=',
        setTheme: '&'
      },
      restrict: 'C',
      controller: function($scope) {
        $scope.menuitems || ($scope.menuitems = {
          show: false
        });
        return $scope.$on('bg_click', function() {
          return $scope.$apply(function() {
            return $scope.menuitems.show = false;
          });
        });
      },
      link: function(scope, elm, attrs) {
        var menu_items;
        elm.children('.menu-title').bind('click', function(e) {
          var show;
          _.kill_event(e);
          show = !scope.menuitems.show;
          $rootScope.$broadcast('bg_click');
          return scope.$apply(function() {
            return scope.menuitems.show = show;
          });
        });
        menu_items = elm.children('.menu-items');
        menu_items.attr('ng-class', "{in:menuitems.show}");
        menu_items.bind('click', _.kill_event);
        return $compile(menu_items)(scope);
      }
    };
  });

}).call(this);
