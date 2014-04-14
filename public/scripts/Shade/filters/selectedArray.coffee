#SelectedArray filter
#=====
#Takes an array of elements and returns a formatted string.
#-------
angular.module("ShadeApp")

.filter "selectedArray", ->
  (arr) ->
    return arr[0]  if _.isString(arr[0]) and arr.length is 1
    _.reduce arr, ((str, item, ind) ->
      if _.isPlainObject(item)
        str + _.values(item) + ((if ind isnt arr.length - 1 then ";" else ''))
      else
        str
    ), ""
