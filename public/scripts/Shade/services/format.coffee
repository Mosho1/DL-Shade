angular.module('ShadeApp')

.service 'format', ->

    insertions =
    #: ''
      0: '0'

    (input, str) ->
      if angular.isNumber(input)
        output = [
          []
          []
        ]
        input = input.toString().split(".").map((elm) -> elm.split "")
        DelimOpt = /#+,+#+.*\./.test(str)
        str = str.replace(/\s|,/g,'')
        appendIndex = Math.min(str.indexOf("#"),str.indexOf("0"))
        appendLeft = str.slice(0, appendIndex)
        str = str.slice(appendIndex).split(".").map((elm) -> elm.split "")

        j = -1
        i = 0
        while str[1] and input[1] and i < str[1].length
          output[1].push ((if /[#0]/.test(str[1][i]) then input[1][++j] or insertions[str[1][i]] else str[1][i] or ""))
          i++

        j = input[0].length
        i = str[0].length - 1
        k = 0
        while Math.max(j, i) >= 0
          output[0].unshift ((if i < 0 or /[#0]/.test(str[0][i]) then input[0][--j] or insertions[str[0][i]] else str[0][i] or ""))
          i--

        appendLeft + output[0].join("") + (if output[1].length then ("." + output[1].join("")) else "")
