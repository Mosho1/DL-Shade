angular.module('DLApp')


  .service 'shadeTemplate', ($http, x2js) ->

    template = ""

    $http.get('/scripts/shade_template_ng.js')
      .success((data)->
        _.templateSettings.variable = "shd";
        template = _.template(data)
      )
      .error(()->
        console.log("could not retrieve shade template"))

    NodeHandlers =
      'Grid': 'pure-g'

    this.toHTML = (shade) ->
        templateData=x2js.xml2json(shade)
        _.extend(templateData,{'NodeHandlers':NodeHandlers})
        template(templateData)

    return this