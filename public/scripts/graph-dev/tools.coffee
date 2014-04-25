#Used to add an observable property to an object (i.e. property with a getter and setter)
module.exports =
  observe:
    (object, property, value, handler) ->
      {get, set} = handler or {}

      getter = ->
        return get?()

      setter = (newValue) ->
        set?(newValue)
        return value = newValue


      if _.isFunction Object.defineProperty
        Object.defineProperty object, property, get: getter, set: setter
      else
        object.__defineGetter__(property, getter)
        object.__defineSetter__(property, setter)
