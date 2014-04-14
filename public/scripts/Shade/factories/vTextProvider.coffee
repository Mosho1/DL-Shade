#vTextProvider factory
#=====
#This factory returns an object that defines a directive. It accepts a template.

angular.module('ShadeApp')

.factory 'vTextProvider', () ->
  (template) ->
    @restrict = 'ACE'
    #If the template has `ng-transclude`, set the `transclude option to `true`.
    @transclude = !!template.match('ng-transclude')
    @replace = true
    @scope = true
    #Add the `ng-model` attribute to the template, with the variable with the name defined by `vText`.
    @template = template.replace /\/?>/, (match) -> ' ng-model="vars[vText].model" ' + match
    @link = (scope, elm, attr) ->
      scope.vText = attr.vText
      elm.after('<span>' + attr.label + '</span>') if attr.label #TODO: put this and the element in a parent element?
    return