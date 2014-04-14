#shadeData service
#=====
#Holds data used by the application.
#-------
angular.module('ShadeApp')

  .service 'shadeData', () ->
    data = {}
    #Setter
    @set = (_data) -> data = _data
    #Getter
    @get = () -> data
    #Gets Shade element by id, in JSON format
    @getElementById = (id) -> data.elementsById[id]
    #Get Styles generated by the Shade compiler
    @getStyles = () -> data.styles
    #Get the HTML body generated by the Shade compiler
    @getBody = () -> data.body
    @