
angular.module('DLApp')

.factory 'Graph', () ->
  
    Graph = (data) ->
      console.log this
      @initialise.apply this, arguments
      # @variables = new VariableRegistry(data)
      return

    Graph:: =
      initialise: ->
        _.bindAll this
        return

      set: (name, value) ->
        @variables.set name, value
        return

      unset: (name) ->
        @variables.unset name
        return

      evaluate: ->
        @variables.evaluate()
        return

      get: ->

    return Graph