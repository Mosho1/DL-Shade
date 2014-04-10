angular.module('ShadeApp')

.service 'shadeTemplate', ($http, x2js, ShadeParser, ShadeAttrDictionary) ->

  template = ->

  $http.get('/scripts/Shade/ng_template_shd.ejs')
  .success((data)->
      _.templateSettings.variable = "shd";
      template = _.template(data)
    )
  .error(()->
      console.log("could not retrieve shade template"))

  @toHTML = (shade) ->
    unless angular.isObject shade
      shade = x2js.xml2json(shade)
    parsed = ShadeParser.parse(shade) || {}
    _.extend parsed, ShadeAttrDictionary

    body: template(parsed),
    styles: parsed.styles,
    elementsById: parsed.elementsById




  return this
