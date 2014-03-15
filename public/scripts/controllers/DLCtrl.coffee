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
x=1;\n
y=2;\n
z=f.avg(x,y,6);";

angular.module('DLApp')


.service 'dndFile', ($rootScope) ->
  # provides Drag 'n' Drop behavoirs for local files
  allowed_file_exts = /\.(md|litcoffee|css)$/

  load_first_file_matching = (files, regexp) =>
    if mdfile = (()->(return f for f in files when regexp.test(f.name)))()
      reader = new FileReader()
      reader.onload = (e) =>
        e.fileName = mdfile.name.replace regexp, ''
        e.fileExt  = mdfile.name.match(regexp)[1]
        @callbacks.fileload(e)
      reader.readAsText(mdfile)

  default_drop = (e) =>
    files = e.dataTransfer.files
    if files.length
      load_first_file_matching files, /\.(md|litcoffee)$/
      load_first_file_matching files, /\.(css)$/

  @callbacks =
    active: (e) ->
    inactive: (e) ->
    fileload: (e) ->
    drop: (e) ->
    default_drop: default_drop

  init: (elm) =>
    elm.addEventListener "dragenter", (e) =>  _.kill_event(e); @callbacks.active(e)
    elm.addEventListener "dragover",  (e) =>  _.kill_event(e); @callbacks.active(e)
    elm.addEventListener "dragexit",  (e) =>  _.kill_event(e); @callbacks.inactive(e)
    elm.addEventListener "drop", (e) =>
      _.kill_event(e)
      @callbacks.drop(e)
      @callbacks.default_drop(e)
  onactive: (cb) => @callbacks.active = cb
  oninactive: (cb) => @callbacks.inactive = cb
  onfileload: (cb) => @callbacks.fileload = cb
  ondrop: (cb, replace_default) =>
    @callbacks.drop = cb
    @callbacks.default_drop = if replace_default then (()->) else default_drop



.controller 'DLCtrl', ($scope, $rootScope, $http, $filter, $element, $document, dndFile, Graph, graphService) ->
  $scope.litcoffee = default_lc

  dndFile.init $element[0],
  dndFile.onactive   () -> $scope.$apply () -> $scope.dragover = true
  dndFile.oninactive () -> $scope.$apply () -> $scope.dragover = false
  $element[0].addEventListener 'mousemove', () -> $scope.$apply () -> $scope.dragover = false
  dndFile.ondrop ((e) -> $scope.$apply () -> $scope.dragover = false), false
  dndFile.onfileload (e) ->
    $scope.$apply () ->
      if e.fileExt in ['md', 'litcoffee']
        $scope.litcoffee = e.target.result
      else if e.fileExt is 'css'
        name = e.fileName
        i = 0
        name = "#{e.fileName} #{++i}" while name of $scope.style.sheets
        $scope.style.sheets[name] =
          source: 'dragged file'
          native: false
          css: e.target.result
        $scope.style.active = name


  $document.keyup (e) ->
    if e.altKey and e.keyCode == 82
        $scope.DLrun(e)

  $scope.style =
    active: 'testDL'
    sheets:
      testDL:
        source: 'XML/shade.xml'
        native: true
      markdowncss:
        source: _.corsproxy('http://kevinburke.bitbucket.org/markdowncss/markdown.css')
        native: true
      GitHub:
        source: 'styles/md/github.css'
        native: true
    external: ''
    editor: ''

  $scope.copy_style = (e,style_name) ->
    _.kill_event(e)
    copy = _.clone $scope.style.sheets[style_name]
    style_name = style_name.match(/(.*?)(:? copy(:? \d+)?)?$/)[1]
    name = "#{style_name} copy"
    i = 0
    name = "#{style_name} copy #{++i}" while name of $scope.style.sheets
    copy.native = false
    $scope.style.sheets[name] = copy
    $scope.style.active = name


  $scope.delete_style = (e,style_name) ->
    _.kill_event(e)
    delete $scope.style.sheets[style_name]
    $scope.style.active = Object.keys($scope.style.sheets)[0] if $scope.style.active is style_name

  $scope.DLrun = (e) ->
    if e
      _.kill_event(e)
    Graph.getGraph($scope.litcoffee,$scope.style,(graph) ->
      $scope.graph = graph.evaluate()
      $rootScope.$broadcast('Run')
    )

  $document.ready($scope.DLrun())

  $scope.$watch 'style.active', () ->
    if $scope.style.active of $scope.style.sheets
      style = $scope.style.sheets[$scope.style.active]
      if style.css
        $scope.style.editor = $filter('prettifyCSS')($filter('deSassify')(style.css))
      else
        $http.get(style.source).then (response) ->
          style.css = response.data
          $scope.style.editor = $filter('prettifyCSS')($filter('deSassify')(style.css))

  $scope.$watch 'style.editor', () ->
   if $scope.style.sheets[$scope.style.active]
    $scope.style.sheets[$scope.style.active].css = $scope.style.editor

  $scope.$watch 'style.external', () ->
    return unless $scope.style.external and /^(https?:\/\/)?(\w+\.)+[\w\/]+/.test $scope.style.external
    $http.get(_.corsproxy($scope.style.external)).then (response) ->
      i = 0
      file_name = $scope.style.external.match(/.+?\/(\w+)\.css/)
      name = file_name and file_name[1] or "external"
      name = "external #{++i}" while name of $scope.style.sheets
      $scope.style.sheets[name] =
        source: $scope.style.external
        css: response.data
        external: true
        edited: false
      $scope.style.active = name
      $scope.style.external = ''


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