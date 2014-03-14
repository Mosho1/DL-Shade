angular.module('DLApp')

.directive 'renderPanel', ($compile, shadeTemplate) ->
  restrict: 'A'
  replace: true
  template: '<div class="render-panel"></div>'
  scope: true
  link: (scope, elm, attrs) ->
    scope.vars=[]

    scope.$watch attrs.renderPanel, (shade) ->
      raw_html = shadeTemplate.toHTML(shade)
      elm.html $compile(raw_html)(scope)
      prettyPrint()

    scope.$on "Run", () ->
      scope.graph = scope.$parent.$parent.$parent.graph

    scope.setDLVar = (variable) ->
      scope.graph.set(variable,parseInt(scope.vars[variable]))


.directive 'prettyPrintPanel', ($filter, shadeTemplate) ->
  restrict: 'A'
  replace: true
  template: '<div class="pp-panel"></div>'
  scope: true
  link: (scope, elm, attrs) ->
    scope.$watch attrs.prettyPrintPanel, (shade) ->
      raw_html = shadeTemplate.toHTML(shade)
      pre = angular.element('<pre class="prettyprint lang-html" style="font-size:0.75em"></pre>')
      code = angular.element('<code></code>')
      code.html $filter('escapeHTML')(raw_html)
      pre.append code
      elm.html pre
      prettyPrint()

  controller: ($scope, $http) ->
    $scope.$parent.theme = theme =
      list: ['google-code-light','solarized-dark','solarized-light','sons-of-obsidian-dark',
      'tomorrow-night-blue','tomorrow-night-dark','tomorrow-night-light','tomorrow-night-eighties']
      selected: 'google-code-light'

    $scope.$watch 'theme.selected', (theme_name) ->
      url = "styles/gprettify/#{theme_name}.css"
      $http.get(url).then (response) ->
        theme.css = response.data

