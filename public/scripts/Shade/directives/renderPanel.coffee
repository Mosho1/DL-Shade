#Panel directives
#=====
#These parse the HTML compiled from Shade and output:
#- renderPanel - The application
#- prettyPrintPanel - Formatted HTML
angular.module('ShadeApp')

#renderPanel directive
#--------
.directive 'renderPanel', ($compile, $rootScope, shadeTemplate, shadeData) ->
    restrict: 'E'
    #This creates an isolated scope. `vars`, `graph`, and `styles` are passed from the parent scope.
    scope:
      vars: '='
      graph: '='
      styles: '='
    controller: ($element, $scope) ->
      #Function to be called when the view (the GUI generated from Shade) needs to be rendered.
      this.render = ->
        #The shadeData service holds all the data about the application.
        if shadeData.set shadeTemplate.toHTML $scope.styles
          #Set the panel's content to the HTML compiled from Shade, then compile and attach it to the scope.
          $element.html '<style>' + shadeData.getStyles() + '</style>' + shadeData.getBody()
          $compile($element.contents())($scope)

      $rootScope.$on 'Run', this.render

      return

#prettyPrintPanel directive
#--------
.directive 'prettyPrintPanel', ($filter, shadeTemplate) ->
    restrict: 'A'
    replace: true
    template: '<div class="pp-panel"></div>'
    link: (scope, elm, attrs) ->
      #Watch for changes in the attributes. The scope variable containing the HTML should be passed as the prettyPrintPanel attribute.
      scope.$watch attrs.prettyPrintPanel, (shade) ->
        #Pass the HTML through indentation and escaping filters, and structure the element to be compiled by **prettyPrint**.
        raw_html = $filter('indentHTML')((shadeTemplate.toHTML(shade) || {body:''}).body)
        pre = angular.element('<pre class="prettyprint lang-html" style="font-size:0.75em"></pre>')
        code = angular.element('<code></code>')
        code.html $filter('escapeHTML')(raw_html)
        pre.append code
        elm.html pre
        prettyPrint()

    controller: ($scope, $http) ->
      #Themes available through **prettyPrint**
      $scope.themes = themes =
        list: ['google-code-light','solarized-dark','solarized-light','sons-of-obsidian-dark',
               'tomorrow-night-blue','tomorrow-night-dark','tomorrow-night-light','tomorrow-night-eighties']
        selected: 'google-code-light'

      #Watch for changes in the theme set as `selected` (through the menu).
      $scope.$watch 'themes.selected', (theme_name) ->
        url = "styles/gprettify/#{theme_name}.css"
        $http.get(url).then (response) ->
          themes.css = response.data