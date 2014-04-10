angular.module('ShadeApp')

  .service 'shadeData', () ->
    data = {}
    @set = (_data) -> data = _data
    @get = () -> data
    @getElementById = (id) -> data.elementsById[id]
    @getStyles = () -> data.styles
    @getBody = () -> data.body
    @