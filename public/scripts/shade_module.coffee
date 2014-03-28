
###
.directive 'popup', ($templateCache) ->
    restrict: 'E'
    scope: false
    link:
      pre: (scope, elm, attr) ->
        $templateCache.put attr.id, elm.html()

  .directive 'popup', () ->
    restrict: 'E'
    transclude: true
    scope: false
    template: '<div class="popupt" ng-transclude/>'

###




angular.module('ShadeApp',['ShadeServices', 'ngGrid', 'mgcrea.ngStrap.popover', 'ui.bootstrap'])

.directive 'btn', ($compile, $timeout, $templateCache) ->
    restrict: 'C'
    replace: true
    scope: false
    transclude: true
    template: (elm, attr) ->
      toAppend = ''
      if (attr.controlBlock)
        cbs = do ->
          obj = {}
          cb_arr = attr.controlBlock.split(';')
          cb_arr = _.map cb_arr, (str) ->  str.split(/\s?,\s?/)
          _.each cb_arr, (arr) ->
            obj[arr[0]] = obj[arr[0]] || []
            obj[arr[0]].push arr.slice(1)
          obj
        events =
          Click: 'ng-click='
        handlers =
          setDL: (name ,val) ->
            'vars[&quot;' + name + '&quot;].model=' + val + ';'
          popup: (popup, location) ->
            "popup('" + popup + "','" + location + "')"

        _.each cbs, (cb, name) ->
          toAppend += (events[name] || events.Click) + '"' + (_.map cb, (el) ->
            handlers[el[0]] el[1], el[2]).join('') + '" '

      '<button ' + toAppend + 'ng-transclude></button>'
    link: (scope) ->
      scope.popup = (id, elm) ->
        popup = angular.element('#' + id)
        unless popup.attr('container') is '#' + elm
          popup.triggerHandler('leave')
          clone = popup.clone()
          popup.after(clone).remove()
          clone.children().removeAttr('ng-transclude')
          clone.attr({
            'container': '#' + elm,
            'bs-popover': ''
            'trigger': 'manual'
            'template': angular.element('<div />').append(angular.element('<div />').append(angular.element('<div class="popupt"/>').append(clone.children()))).html()
          })
          popup = $compile(clone)(scope)
        $timeout((() -> popup.triggerHandler('popup')),50)

        return

.directive 'testDl', () ->
    restrict: 'E'
    replace: true
    scope: true
    templateUrl: 'directive-templates/testdl.html'
    link: (scope, elm, attrs) ->

      scope.variable = attrs.vDL

      scope.setDLVar = () ->
        scope.graph.set(scope.variable,Number(scope.toSet))
      scope.unsetDLVar = () ->
        scope.graph.unset(scope.variable,Number(scope.toSet))

  .directive 'vText', () ->
    restrict: 'EAC'
    replace: true
    scope: true
    template: '<div><input type="text" ng-model="vars[vText].model"></div>'
    link:
      pre: (scope, elm, attr) ->
        scope.vText = attr.vText


  .directive 'vActiveTabIndex', () ->
    restrict: 'A'
    link: (scope, elm, attr) ->
        tabs = do () ->
          it = scope.$$childTail
          while (!it.tabs || !it.tabs.length)
            it = it.$$prevSibling
          return it.tabs

        scope.$watch 'vars["' + attr.vActiveTabIndex + '"].model', (vactive) ->
          console.log(actives)
          vactive = Number(vactive)
          if angular.isDefined tabs[vactive]
            _.each tabs, (tab, ind) ->
              tab.active = false
              if ind is vactive
                tab.active = true





  .directive 'dropDown', ($rootScope, ngGridFlexibleHeightPlugin) ->
    restrict: 'E'
    scope: true
    template: '<ul class="dropdown" ng-click="dropdown($event,ghide)"><div class="selectedItems">{{selected}}</div>
               <div class="gridStyle" ng-grid="gridOptions" ng-class="{hide:ghide}" ng-click="select($event)" ></div></ul>'
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
        scope.selected = ["Click me"]
        scope.gridOptions =
          data: 'myData'
          selectedItems: scope.selected,
          multiSelect: !!attr.multiSelect
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

        unless !!attr.multiSelect
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