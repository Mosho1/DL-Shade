'use strict'

#Module declaration
angular.module('DLApp', ['ShadeApp'])

#A few helper functions
#-----
_.kill_event = (e) ->
  if _.isObject(e)
    e.cancelBubble = true
    e.stopPropagation()
    e.preventDefault()

#Used to fetch external resources
_.corsproxy = (css_url) ->
  m = css_url.match(/https?:\/\/(.+)/)
  return false unless m
  "http://www.corsproxy.com/#{m[1]}"

_.position = (elm) ->
  p =
    x: elm.offsetLeft || 0
    y: elm.offsetTop  || 0
  while elm = elm.offsetParent
    p.x += elm.offsetLeft
    p.y += elm.offsetTop
  p


String::toDash = ->
  @replace /([A-Z])/g, ($1) ->
    "-" + $1.toLowerCase()

_.toDash = (str) ->
  str.replace /([A-Z])/g, ($1) ->
    "-" + $1.toLowerCase()

_.mapKeys = (object, callback, thisArg) ->
  result = {}
  callback = _.createCallback(callback, thisArg, 3)
  _.forOwn object, (value, key, object) ->
    result[callback(value, key, object)] = value
    return

  result