angular.module('DLApp')


  .service 'x2js', ($rootScope) ->
          x2js = new X2JS
          this.xml2json = (XML) ->
            x2js.xml_str2json(XML)

          return this


