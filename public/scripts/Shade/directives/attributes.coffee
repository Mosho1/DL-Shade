#Attribute directives
#=====
angular.module('ShadeApp')

#Format directive
#------------
######Implements some of .NET's *Custom Numeric Format Strings* specifiers.
.directive 'format', (format) ->
  restrict: 'A'
  require: '?ngModel'
  link:
    #When `require` is used, the required controller is sent to the linking function as the fourth argument.
    post: (scope, elm, attr, ngModel) ->
      formatStr = attr.format
      if angular.isDefined ngModel
        #`$formatters` is an array of functions to be executed one after another on the model before it reaches the view.
        ngModel.$formatters.push (value) ->
          if angular.isNumber value
            value = format value, formatStr
        #`$formatters` is an array of functions to be executed one after another on the view before it reaches the model.
        ngModel.$parsers.unshift (value) ->
          if isNaN value
            value = ngModel.$modelValue
          +value
        #Apply formatting when the input loses focus.
        elm.on 'blur', () ->
          if isNaN elm.val()
            elm.val format +ngModel.$modelValue, formatStr
          else
            elm.val format +elm.val(), formatStr

#vActiveTabIndex directive
#-----------
######Controls the active tab in a Bootstrap *Tabs* component.
.directive 'vActiveTabIndex', () ->
  restrict: 'A'
  link: (scope, elm, attr) ->
    scope.vactive = attr.vActiveTabIndex
    #Watch for changes in the variable controlling the active tab.
    scope.$watch 'vars[vactive].model', (vactive) ->
      vactive = Number(vactive)
      if angular.isDefined scope.tabs[vactive]
        #Set the tab's active variable to `true`, and the rest to `false`.
        _.each scope.tabs, (tab, ind) ->
          tab.active = false
          if ind is vactive
            tab.active = true

    #Watch for changes in the `active` scope variable, caused by means other than the DL variable, and update the variable.
    scope.$watch 'active', (active) ->
      scope.vars[scope.vactive].model = active

#vSub directive
#-----------
######Compiles shade from a DL string and adds it to the UI.
.directive 'vSub', ($compile, shadeData, shadeTemplate, x2js) ->
  restrict: 'A'
  link: (scope, elm, attr) ->
    scope.vSub = attr.vSub
    #Watch vSub for changes (will run when the variable is initially set as well)
    scope.$watch 'vSub', () ->
      #The `shadeData` service contains each HTML element's Shade counterpart, in JSON format
      shadeNode = shadeData.getElementById(attr.shdId)
      #Push the Shade node into the array of nodes of the parent element
      shadeNode.Sub.Node.push (x2js.xml2json scope.vars[scope.vSub].model).Node
      #Compile the updated element with the inserted vSub node.
      content = shadeTemplate.toHTML {Shade:{Node:shadeNode}}
      body = angular.element content.body
      #Update and compile the element to the scope.
      elm.html body.html()
      $compile(elm.contents())(scope)
