
angular.module('ShadeApp',[])

  .directive 'testDl', () ->
    restrict: 'E'
    replace: true
    scope: true
    templateUrl: 'directive-templates/testdl.html'
    link: (scope, elm, attrs) ->
      scope.toSet
      scope.variable = attrs.vdl

      scope.setDLVar = () ->
        scope.graph.set(scope.variable,Number(scope.toSet))

  .directive 'numEdit', () ->
    restrict: 'E'
    replace: true
    scope: true
    template: (elm,attr) -> '<input type="text" value={{graph.variables.variables[&quot;' + attr.vtext+ '&quot;].value}}>'
    link: (scope, elm, attrs) ->

  .directive 'renderPanel', ($compile, $filter, shadeTemplate) ->
    restrict: 'E'
    replace: false
    scope:
      graph: '='
      styles: '='
    template: '<style ng-bind = "data.styles">{{data.body}}'
    link: (scope, elm, attrs) ->
      scope.vars=[]

      scope.$watch 'styles', (shade) ->
        scope.data = shadeTemplate.toHTML(shade)

      scope.$on "Run", () ->
        #scope.graph = scope.$parent.$parent.$parent.graph


      scope.setDLVar = (variable) ->
        scope.graph.set(variable,parseInt(scope.vars[variable]))


  .directive 'prettyPrintPanel', ($filter, shadeTemplate) ->
    restrict: 'A'
    replace: true
    template: '<div class="pp-panel"></div>'
    link: (scope, elm, attrs) ->
      scope.$watch attrs.prettyPrintPanel, (shade) ->
        raw_html = $filter('indentHTML')(shadeTemplate.toHTML(shade).body)
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



  .service 'shadeTemplate', ($http, x2js, ShadeParser, ShadeDictionary) ->

      template = ->

      $http.get('/scripts/ng_template_shd.js')
        .success((data)->
          _.templateSettings.variable = "shd";
          template = _.template(data)
        )
        .error(()->
          console.log("could not retrieve shade template"))

      this.toHTML = (shade) ->
        parsed = ShadeParser.parse(x2js.xml2json(shade))
        _.extend(parsed, ShadeDictionary)
        {'body': template(parsed), 'styles': (parsed || {}).styles}


      return this