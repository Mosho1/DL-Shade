
angular.module('ShadeApp',['ngGrid'])

  .directive 'testDl', () ->
    restrict: 'E'
    replace: true
    scope: true
    templateUrl: 'directive-templates/testdl.html'
    link: (scope, elm, attrs) ->

      scope.variable = attrs.vdl

      scope.setDLVar = () ->
        scope.graph.set(scope.variable,Number(scope.toSet))

  .directive 'numEdit', () ->
    restrict: 'E'
    replace: true
    scope: true
    template: (elm,attr) -> '<div><input type="text" ng-model="vars[&quot;'+attr.vtext+'&quot;].model"></div>'

  .directive 'dropDown', ($rootScope) ->
    restrict: 'E'
    scope: true
    template: '<div ng-click="dropdown($event,true)" style="overflow: hidden;">{{selected}}</div>
               <div class="gridStyle" ng-grid="gridOptions" ng-class="{hide:ghide}" ng-click="select($event)"></div>
               <style>.gridStyle.ng-scope {height:100%;}</style>'
    link:
      pre: (scope, elm, attr) ->
        window.sc = scope
        header = attr.header.split('|')
        items = attr.items.split(',')
          .map (elm) ->
            elm.split('|')
        scope.myData = items.map (elm) ->
          elm.reduce ((obj, el, ind) ->
             obj[header[ind]] = el
             return obj)
             ,{}
        scope.selected = ["click me"]
        scope.gridOptions =
          data: 'myData'
          selectedItems: scope.selected,
          multiSelect: false


        scope.ghide = true
        scope.dropdown = ($event,state) ->
          _.kill_event($event)
          scope.ghide = !state

        scope.select = ($event) ->
          _.kill_event($event)

        $rootScope.$on 'bg_click', ->
          scope.dropdown()

        scope.$watchCollection 'selected', ->
          scope.ghide = true

  .directive 'renderPanel', ($compile, shadeTemplate) ->
    restrict: 'E'
    scope:
      vars: '='
      graph: '='
      styles: '='
    link: (scope, elm) ->
      scope.$watch 'styles', (shade) ->
        scope.data = shadeTemplate.toHTML(shade)
        elm.html('<style>' + scope.data.styles + '</style>' + scope.data.body)
        $compile(elm.contents())(scope)


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