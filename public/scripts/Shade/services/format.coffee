#Format service
#=====
#Takes an input string, and a formatting string (using .NET's *Custom Numeric Format Strings* specifiers), and returns the formatted string.
angular.module('ShadeApp')

  .service 'format', ->
    (input, str) ->
      if angular.isNumber(input)
        input = input.toString()
        replacer = (match) ->
          #Skip decimal point
          i++  if input[i] is "."
          #If the input has a digit at location `i`, use it, otherwise ignore `#`'s or insert `0`'s.
          input[i++] or if match is "#" then "" else "0"

        #length of integer part
        length = parseInt(input, 10).toString().length
        #number of '#' or '0' matches
        matches = str.match(/[0#](?=.*\.)/g).length
        #Begin the replacement at the leftmost digit
        i = length - matches
        #Remove whitespace and commas, then replaces all `0`'s and `#`'s using the `replacer` function.
        output = str.replace(/[\s,]/g, '').replace(/[0#]/g, replacer)