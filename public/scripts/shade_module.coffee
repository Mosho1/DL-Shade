

angular.module('ShadeApp',['ShadeServices', 'ngGrid'])

  .directive 'btn', () ->
    restrict: 'C'
    replace: true
    scope: true
    transclude: true
    template: (elm, attr) ->
      toAppend = ''
      if (attr.controlBlock)
        cbs = do ->
          obj = {}
          cb_arr = attr.controlBlock.split(';')
          cb_arr = _.map cb_arr, (str) ->  str.split(',')
          _.each cb_arr, (arr) ->
            obj[arr[0]] = obj[arr[0]] || []
            obj[arr[0]].push arr.slice(1)
          obj

        events =
          Click:
            'ng-click='
          
        handlers =
          setDL: (name ,val) ->
              'vars[&quot;' + name + '&quot;].model=' + val + ';'

        _.each cbs, (cb, name) ->
          toAppend += events[name] + '"' + (_.map cb, (elm) ->
            handlers[elm[0]] elm[1], elm[2]).join('') + '" '

      '<button ' + toAppend + ' ng-transclude></button>'

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
    template: '<div><input type="text" ng-model="vars[vtext].model"></div>'
    link:
      pre: (scope, elm, attr) ->
        scope.vtext = attr.vtext

  .directive 'dropDown', ($rootScope, ngGridFlexibleHeightPlugin) ->
    restrict: 'E'
    scope: true
    template: '<ul class="dropdown" ng-click="dropdown($event,ghide)" style="overflow: hidden;">{{selected}}</div>
               <div class="gridStyle" ng-grid="gridOptions" ng-class="{hide:ghide}" ng-click="select($event)" ></div>
               <style>.gridStyle.ng-scope {float:left}</style>'
    link:
      pre: (scope, elm, attr) ->


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
          plugins: [new ngGridFlexibleHeightPlugin({maxHeight:300})]
          enableSorting: false
          rowHeight: 27



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

  .directive 'renderPanel', ($compile, $rootScope, shadeTemplate) ->
    restrict: 'E'
    scope:
      vars: '='
      graph: '='
      styles: '='
    link: (scope, elm) ->
      $rootScope.$on 'Run', () ->
        if scope.data = shadeTemplate.toHTML(scope.styles)
          elm.html('<style>' + scope.data.styles + '</style>' + scope.data.body)
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



  .service 'shadeTemplate', ($http, x2js, ShadeParser, ShadeAttrDictionary) ->

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
        _.extend(parsed, ShadeAttrDictionary)
        {'body': template(parsed || {}), 'styles': (parsed || {styles: ''}).styles}


      return this

  .factory 'ngGridFlexibleHeightPlugin', () ->
    ngGridFlexibleHeightPlugin = (opts) ->
      self = this
      self.grid = null
      self.scope = null
      self.init = (scope, grid, services) ->
        self.domUtilityService = services.DomUtilityService
        self.grid = grid
        self.scope = scope
        recalcHeightForData = ->
          setTimeout innerRecalcForData, 1
          return

        innerRecalcForData = ->
          gridId = self.grid.gridId
          footerPanelSel = "." + gridId + " .ngFooterPanel"
          extraHeight = self.grid.$topPanel.height() + $(footerPanelSel).height()
          naturalHeight = self.grid.$canvas.height() + 1
          if opts?
            naturalHeight = opts.minHeight - extraHeight - 2  if opts.minHeight? and (naturalHeight + extraHeight) < opts.minHeight
            naturalHeight = opts.maxHeight - extraHeight - 2  if opts.maxHeight? and (naturalHeight + extraHeight) > opts.maxHeight
          newViewportHeight = naturalHeight + 2
          if not self.scope.baseViewportHeight or self.scope.baseViewportHeight isnt newViewportHeight
            self.grid.$viewport.css "height", newViewportHeight + "px"
            self.grid.$root.css "height", (newViewportHeight + extraHeight) + "px"
            self.scope.baseViewportHeight = newViewportHeight
            self.domUtilityService.RebuildGrid self.scope, self.grid
          return

        self.scope.catHashKeys = ->
          hash = ""
          idx = undefined
          for idx of self.scope.renderedRows
            hash += self.scope.renderedRows[idx].$$hashKey
          hash

        self.scope.$watch "catHashKeys()", innerRecalcForData
        self.scope.$watch self.grid.config.data, recalcHeightForData
        return

      return