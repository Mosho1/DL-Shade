#Graph service
#=====

#Creates a graph object from DL code

angular.module('DLApp')

.service 'Graph', ($http, $window) ->
           #Creates a graph object and sends it to the callback
           getGraph: (DLcode,style,callback) ->
                #If we have the `createGraph` function in the global namespace, use it. Otherwise send it to the server.
                if ($window.DL.createGraph)
                    callback($window.DL.createGraph(DLcode))
                else
                  $http.post("/sendDL", {'DLcode':DLcode, 'Shade':style})
                      .success((data, status, headers, config) ->
                         callback($window.DL.Graph(data)))

           getTokens: (DLcode) ->
                return $window.DL.tokens(DLcode)

           getFunctions: () ->
                return $window.DL.builtInFunctions