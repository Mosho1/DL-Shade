
var compiler = require("../src/compiler"),
    graph = require("../src/graph-text").Graph,
	express = require("../node_modules/express");

    //express.js app configuration
	var app = express();

	app.configure(function(){
	  app.set('port', process.env.PORT || 8082);
	  app.set('views', __dirname + '/views');
	  app.set('view engine', 'jade');
	  app.use(express.favicon());
	  app.use(express.logger('dev'));
	  app.use(express.bodyParser());
	  app.use(express.methodOverride());
	  app.use(app.router);
	  app.use(express.static(__dirname));
	});

	 

	app.configure('development', function(){
	  app.use(express.errorHandler());
	});


    //route handlers 
	app.all("*", function(request, response, next) {
	
	  next();
	});

    
	app.post("/sendDL", function(request, response) {
	  var _graph = new graph(request.body.DLcode);
	   response.writeHead(200, { 'Content-Type': 'application/json'});
	   response.end(JSON.stringify(_graph));
	});

app.get("/", function(request, response) {
    response.render('index_DL.jade');
});



	app.listen(app.get('port'));
	console.log("Express app started on port %d",app.get('port'));
