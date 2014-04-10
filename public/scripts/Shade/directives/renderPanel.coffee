angular.module('ShadeApp')

.directive 'renderPanel', ($compile, $rootScope, shadeTemplate) ->
    restrict: 'E'
    scope:
      vars: '='
      graph: '='
      styles: '='
    controller: ($element, $scope) ->
      this.render = ->
        if $scope.data = shadeTemplate.toHTML($scope.styles)
          $element.html('<style>' + $scope.data.styles + '</style>' + $scope.data.body)
          $compile($element.contents())($scope)

      $rootScope.$on 'Run', this.render

      return


.directive 'prettyPrintPanel', ($filter, shadeTemplate) ->
    restrict: 'A'
    replace: true
    template: '<div class="pp-panel"></div>'
    link: (scope, elm, attrs) ->
      scope.$watch attrs.prettyPrintPanel, (shade) ->
        raw_html = $filter('indentHTML')((shadeTemplate.toHTML(shade) || {body:''}).body)
        pre = angular.element('<pre class="prettyprint lang-html" style="font-size:0.75em"></pre>')
        code = angular.element('<code></code>')
        code.html $filter('escapeHTML')(raw_html)
        pre.append code
        elm.html pre
        prettyPrint()

    controller: ($scope, $http) ->
      $scope.themes = themes =
        list: ['google-code-light','solarized-dark','solarized-light','sons-of-obsidian-dark',
               'tomorrow-night-blue','tomorrow-night-dark','tomorrow-night-light','tomorrow-night-eighties']
        selected: 'google-code-light'

      $scope.$watch 'themes.selected', (theme_name) ->
        url = "styles/gprettify/#{theme_name}.css"
        $http.get(url).then (response) ->
          themes.css = response.data