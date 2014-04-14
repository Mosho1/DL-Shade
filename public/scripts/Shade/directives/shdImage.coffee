#shdImage directive
#=====

angular.module('ShadeApp')

.directive 'shdImage', ($http) ->
  restrict: 'E'
  replace: true
  scope: true
  require: '?ngModel'
  template: '<img ng-model="vars[vText].model" />'
  #When `require` is used, the required controller is sent to the linking function as the fourth argument.
  link: (scope, elm, attr, ngModel) ->
    scope.src = attr.src
    scope.vText = attr.vText
    if angular.isDefined(ngModel)
      #`$render` gets called whenever the view needs to be updates (whenever the scope variable assigned to `ng-model` is changed.
      ngModel.$render = () ->
        #Try to get the image using an HTTP request.
        $http.head(ngModel.$modelValue)
        #If found, use the image.
        .success(->elm.attr 'src', ngModel.$modelValue)
        #If not, use the image specified in the `src` attribute in the element.
        .error(->elm.attr 'src', scope.src)


