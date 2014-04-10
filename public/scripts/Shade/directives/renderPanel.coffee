angular.module('ShadeApp')

.directive 'renderPanel', ($compile, $rootScope, shadeTemplate, shadeData) ->
    restrict: 'E'
    scope:
      vars: '='
      graph: '='
      styles: '='
    controller: ($element, $scope) ->
      this.render = ->
        if shadeData.set shadeTemplate.toHTML $scope.styles
          $element.html '<style>' + shadeData.getStyles() + '</style>' + shadeData.getBody()
          $compile($element.contents())($scope)

      $rootScope.$on 'Run', this.render

      return

.directive 'vSub', ($compile, shadeData, shadeTemplate, x2js) ->
  restrict: 'A'
  link: (scope, elm, attr) ->
    scope.vSub = attr.vSub
    scope.$watch 'vSub', () ->
      shadeNode = shadeData.getElementById(attr.shdId)
      shadeNode.Sub.Node.push (x2js.xml2json scope.vars[scope.vSub].model).Node
      content = shadeTemplate.toHTML {Shade:{Node:shadeNode}}
      body = angular.element content.body
      elm.html body.html()
      $compile(elm.contents())(scope)

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