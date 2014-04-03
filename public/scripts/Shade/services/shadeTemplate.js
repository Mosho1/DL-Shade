// Generated by CoffeeScript 1.7.1
(function() {
  angular.module('ShadeApp').service('shadeTemplate', function($http, x2js, ShadeParser, ShadeAttrDictionary) {
    var template;
    template = function() {};
    $http.get('/scripts/ng_template_shd.js').success(function(data) {
      _.templateSettings.variable = "shd";
      return template = _.template(data);
    }).error(function() {
      return console.log("could not retrieve shade template");
    });
    this.toHTML = function(shade) {
      var parsed;
      parsed = ShadeParser.parse(x2js.xml2json(shade));
      _.extend(parsed, ShadeAttrDictionary);
      return {
        'body': template(parsed || {}),
        'styles': (parsed || {
          styles: ''
        }).styles
      };
    };
    return this;
  });

}).call(this);
