'use strict'

default_lc = "/* Welcome to Dependency Language in JavaScript!\n
Features:\n
-Supported Formats:\n
    Numbers, Strings, arrays\n
-Namespaces (format: '$ns')
-Built-in Functions:\n
    f.abs, f.avg\n
-Themes for the editor\n
-Graph or table presentation of the graph\n
-Click 'Run' above or alt+R */\n
\n
x=0;\n
y=2;\n
z=f.avg(x,y,6);";

angular.module('DLApp')



.controller 'DLCtrl', ($scope, $rootScope, $http, $filter, $element, $document, $timeout, Graph, graphService) ->
  $scope.litcoffee = {code:default_lc}

  $scope.test = {test:default_lc}

  $document.keyup (e) ->
    if e.altKey
      if e.keyCode == 82
        $scope.DLrun(e)
      if col = $scope.cols[e.keyCode - 49]
        $scope.$apply col.show = !col.show

  $scope.styles =
  active: 'control'
  sheets:
    basics:
      source: 'XML/shade.xml'
      native: true
    control:
      source: 'XML/control.xml'
      native: true
  external: ''
  editor: ''

  $scope.copy_style = (e,style_name) ->
    _.kill_event(e)
    copy = _.clone $scope.styles.sheets[style_name]
    style_name = style_name.match(/(.*?)(:? copy(:? \d+)?)?$/)[1]
    name = "#{style_name} copy"
    i = 0
    name = "#{style_name} copy #{++i}" while name of $scope.styles.sheets
    copy.native = false
    $scope.styles.sheets[name] = copy
    $scope.styles.active = name


  $scope.delete_style = (e,style_name) ->
    _.kill_event(e)
    delete $scope.styles.sheets[style_name]
    $scope.styles.active = Object.keys($scope.styles.sheets)[0] if $scope.styles.active is style_name

  $scope.DLrun = (e) ->
    if e
      _.kill_event(e)
    Graph.getGraph($scope.litcoffee.code,$scope.styles,(graph) ->
      $scope.graph = graph.evaluate()
      $rootScope.$broadcast "Run")



  $document.ready () ->
    $timeout $scope.DLrun, 100

  $scope.$watch 'styles.active', () ->
    if $scope.styles.active of $scope.styles.sheets
      styles = $scope.styles.sheets[$scope.styles.active]
      if styles.css
        $scope.styles.editor = $filter('prettifyCSS')($filter('deSassify')(styles.css))
      else
        $http.get(styles.source).then (response) ->
          styles.css = response.data
          $scope.styles.editor = $filter('prettifyCSS')($filter('deSassify')(styles.css))

  $scope.$watch 'styles.editor', () ->
   if $scope.styles.sheets[$scope.styles.active]
    $scope.styles.sheets[$scope.styles.active].css = $scope.styles.editor

  $scope.$watch 'styles.external', () ->
    return unless $scope.styles.external and /^(https?:\/\/)?(\w+\.)+[\w\/]+/.test $scope.styles.external
    $http.get(_.corsproxy($scope.styles.external)).then (response) ->
      i = 0
      file_name = $scope.styles.external.match(/.+?\/(\w+)\.css/)
      name = file_name and file_name[1] or "external"
      name = "external #{++i}" while name of $scope.styles.sheets
      $scope.styles.sheets[name] =
        source: $scope.styles.external
        css: response.data
        external: true
        edited: false
      $scope.styles.active = name
      $scope.styles.external = ''


.directive 'menu', ($compile, $rootScope) ->
  scope: {
    col: '=',
    themes: '=',
    setTheme: '&'
  }
  restrict: 'C'
  controller: ($scope) ->
    $scope.menuitems ||= {show: false}
    $scope.$on 'bg_click', () ->
      $scope.$apply -> $scope.menuitems.show = false

  link: (scope, elm, attrs) ->
    elm.children('.menu-title').bind 'click', (e) ->
      _.kill_event(e)
      show = !scope.menuitems.show
      $rootScope.$broadcast 'bg_click'
      scope.$apply -> scope.menuitems.show = show
    menu_items = elm.children('.menu-items')
    menu_items.attr 'ng-class', "{in:menuitems.show}"
    menu_items.bind 'click', _.kill_event
    $compile(menu_items)(scope)