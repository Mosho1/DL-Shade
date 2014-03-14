
angular.module('DLApp')

.service 'Graph', ($http) ->
           getGraph: (litcoffee,style,callback) -> 
                $http.post("/sendDL", {'DLcode':litcoffee, 'Shade':style})
                    .success((data, status, headers, config) ->
                       callback(new window.Graph(data)))
           getGraphDev: () ->


                       