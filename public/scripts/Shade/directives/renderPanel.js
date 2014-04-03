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
