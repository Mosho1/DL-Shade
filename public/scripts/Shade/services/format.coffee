angular.module('ShadeApp')

  .service 'format', ->
    (input, str) ->
      if angular.isNumber(input)
        input = input.toString()
        replacer = (match) ->
          i++  if input[i] is "."
          input[i++] or if match is "#" then "" else "0"

        #length of integer part
        length = parseInt(input, 10).toString().length
        #number of '#' or '0' matches
        matches = str.match(/[0#](?=.*\.)/g).length
        i = length - matches
        output = str.replace(/[\s,]/g, '').replace(/[0#]/g, replacer)