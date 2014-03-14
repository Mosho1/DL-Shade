
angular.module('DLApp')


.directive 'aceEditor', () ->
  restrict: 'A'
  require: '?ngModel'
  scope: false
  link: (scope, elm, attrs, ngModel) ->
    scope.acee = acee = window.ace.edit(elm[0])
    scope.session = session = acee.getSession()
    scope.mode = attrs.mode
    scope.makeCompletions = (collection, meta) ->
      return collection.map (elm)->
        name:elm, value:elm, meta:meta

    acee.setTheme("ace/theme/solarized_light")
    acee.getSession().setMode("ace/mode/#{scope.mode}")
    acee.setOptions
      showGutter: true,
      enableCustomAutocompletion: true,
    acee.setReadOnly false
    acee.setHighlightActiveLine false
    acee.setShowPrintMargin false

    acee.commands.on "afterExec", (e) ->
      acee.execCommand "startCustomAutocomplete"  if e.command.name is "insertstring" and /^[\w.]$/.test(e.args)
      return


    if angular.isDefined(ngModel)
      ngModel.$formatters.push (value) ->
        if angular.isUndefined(value) or value is null
          return ''
        else if angular.isObject(value) or angular.isArray(value)
          throw new Error('ace-editor cannot use an object or an array as a model')
        return value
      ngModel.$render = -> session.setValue(ngModel.$viewValue)

    session.on 'change', (e) ->
      newValue = session.getValue()
      if newValue isnt scope.$eval(attrs.value) and !scope.$$phase and angular.isDefined(ngModel)
        scope.$apply -> ngModel.$setViewValue(newValue)

  controller: ($scope, $rootScope) ->
    $rootScope.$on 'panel_resized', ()-> $scope.acee.resize()

    $scope.themes = [
      'merbivore', 'merbivore_soft', 'mono_industrial', 'monokai', 'pastel_on_dark', 'solarized_dark',
      'solarized_light', 'terminal', 'textmate', 'tomorrow', 'tomorrow_night', 'tomorrow_night_blue',
      'tomorrow_night_eighties', 'twilight', 'vibrant_ink', 'xcode'
    ]

    $scope.setTheme = (name) ->
      $scope.acee.setTheme "ace/theme/" + name

.directive 'dlEditor', (Graph) ->
  restrict: 'A'
  scope: false
  link: (scope,elm,attrs) ->
    scope.langTools = window.ace.require("ace/ext/language_tools")
    DLcompleter =
      getCompletions: (editor, session, pos, prefix, callback) ->
        unless session.$modeId is "ace/mode/" + attrs.mode
          return callback null, []
        identifiers = scope.makeCompletions Object.keys(scope.$parent.$parent.graph.variables.variables), "variable"
        functions = scope.makeCompletions Graph.getFunctions(), "function"
        nameList = identifiers.concat(functions)
        callback null, nameList


    scope.langTools.addCompleter(DLcompleter)


.directive 'shadeEditor', (Graph, ShadeDictionary) ->
  restrict: 'A'
  scope: false
  link: (scope,elm,attrs) ->
    scope.langTools = window.ace.require("ace/ext/language_tools")
    DLcompleter =
      getCompletions: (editor, session, pos, prefix, callback) ->
        unless session.$modeId is "ace/mode/" + attrs.mode
          return callback null, []
        attrNames = scope.makeCompletions Object.keys(ShadeDictionary.attrNameHandlers), "attribute name"
        attrValues = scope.makeCompletions Object.keys(ShadeDictionary.attrValueHandlers), "attribute value"
        styleNames = scope.makeCompletions Object.keys(ShadeDictionary.styleNameHandlers), "style name"
        styleValues = scope.makeCompletions Object.keys(ShadeDictionary.styleValueHandlers), "style value"
        nameList = attrNames.concat(attrValues, styleNames, styleValues)
        callback null, nameList


    scope.langTools.addCompleter(DLcompleter)


