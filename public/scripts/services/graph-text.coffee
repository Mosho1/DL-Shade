
angular.module('DLApp')

.service 'Graph', ($http, $window) ->
           getGraph: (DLcode,style,callback) ->
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