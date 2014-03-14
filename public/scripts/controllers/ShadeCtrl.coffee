'use strict'

angular.module('DLApp')

  .controller 'ShadeCtrl', ($scope, $rootScope, $http, $element) ->
    $scope.vars = [];

    x2js = new X2JS

    templateData=x2js.xml_str2json($scope.shade)

    NodeHandlers =
      'Grid': 'pure-g'

    _.extend(templateData,{'NodeHandlers':NodeHandlers})
    template = _.template($http.get('scripts/shade_template.ejs')
      .success((data, status, headers, config) ->
        $($element[0]).append(template(templateData))
      )
    )




    $scope.setDLVar = (variable) ->
      $scope.graph.set(variable,parseInt($scope.vars[variable]))




      httpGet = (theUrl) ->
xmlHttp = null
xmlHttp = new XMLHttpRequest()
xmlHttp.open "GET", theUrl, false
xmlHttp.send null
xmlHttp.responseText


_.templateSettings.variable = "shd"

x2js = new X2JS
template = _.template(httpGet('scripts/shade_template.ejs'))
templateData=x2js.xml_str2json(httpGet('XML/shade.xml'))

NodeHandlers =
  'Grid': 'pure-g'

_.extend(templateData,{'NodeHandlers':NodeHandlers})


$("body").append(template(templateData))



  getGraph: (litcoffee,style,callback) ->
    $http.post("/sendDL", {'DLcode':litcoffee, 'Shade':style})
      .success((data, status, headers, config) ->
        callback(new window.Graph(data)))