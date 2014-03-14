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

