#vText elements
#=====
#Refer to `../factories/vTextProvider.coffee`

angular.module('ShadeApp')

.directive 'listBox', (vTextProvider) ->
  new vTextProvider '<select multiple ng-transclude />'

.directive 'inputs', (vTextProvider) ->
  new vTextProvider '<input />'

.directive 'shdDatePicker', (vTextProvider) ->
  new vTextProvider '<input type="text" datepicker-popup close-on-date-selection="false" />'

.directive 'timePicker', (vTextProvider) ->
  new vTextProvider '<div><timepicker /></div>'


