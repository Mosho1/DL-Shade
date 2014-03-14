
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
    template: '<input type="text" />'
    link: (scope, elm, attrs) ->



  .directive 'renderPanel', ($compile, shadeTemplate) ->
    restrict: 'A'
    replace: true
    template: '<div class="render-panel"></div>'
    scope: true
    link: (scope, elm, attrs) ->
      scope.vars=[]

      scope.$watch attrs.renderPanel, (shade) ->
        data = shadeTemplate.toHTML(shade)
        if data
          elm.empty()
          elm.append '<style>' + data.styles + '</style>', $compile(data.body)(scope)
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
        raw_html = shadeTemplate.toHTML(shade).body
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