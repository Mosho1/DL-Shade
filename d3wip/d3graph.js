var renderGraph = function(graph) {

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};


var g_state = "";

 var   width = 1000,
       height = 500;

var svg = d3.select("#canvas").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.behavior.zoom().scaleExtent([0.5, 6]).on("zoom", zoom))
  .append("g");

  

var	div_area = width*height,
	num_nodes = graph.nodes.length,
	node_area = div_area/num_nodes,
    node_to_padding_ratio = 0.50,
	node_dia_inc_pad = Math.sqrt(node_area),
	node_radius_wo_pad = node_dia_inc_pad/2*node_to_padding_ratio,
	node_padding = node_dia_inc_pad/2*(1-node_to_padding_ratio),
	nodes_in_width = parseInt(width/(node_dia_inc_pad)),
    nodes_in_height = parseInt(height/(node_dia_inc_pad));  


var xScale = d3.scale.linear()
	.domain([0,nodes_in_width])
	.range([node_radius_wo_pad,width-node_radius_wo_pad]);

var yScale = d3.scale.linear()
	.domain([0,nodes_in_height])
	.range([node_radius_wo_pad,height-node_radius_wo_pad]);

var xScale2 = d3.scale.linear()
	.domain([0,nodes_in_width])
	.range([0,width]);

var yScale2 = d3.scale.linear()
	.domain([0,nodes_in_height])
	.range([0,height]);

var getX = function(index){return xScale(index%nodes_in_width)};
var getY = function(index){return yScale(parseInt(index/nodes_in_width))};

var getX_abs = function(index){return xScale2(index%nodes_in_width)};
var getY_abs = function(index){return yScale2(parseInt(index/nodes_in_width))};


var lines = svg.attr("class", "line")
  .selectAll("line").data(graph.links)
  .enter().append("line")
  .attr("x1", function(d) { return xScale(d.source%nodes_in_width); })
  .attr("y1", function(d) { return yScale(parseInt(d.source/nodes_in_width)); })
  .attr("x2", function(d) { return xScale(d.target%nodes_in_width); })
  .attr("y2", function(d) {  return yScale(parseInt(d.target/nodes_in_width)); })
  .attr("src", function(d) {  return d.source; })
  .attr("trgt", function(d) {  return d.target; })
  .attr("viewed", function() {  return 0; })
  .attr("focused", function() {  return 0; })
  .style("stroke", "grey");
    
var circles = svg.selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
    .style("stroke", "gray")
    .style("fill", "white")
    .attr("r", node_radius_wo_pad)
    .attr("cx", function(d, i){ return getX(i);})
    .attr("cy", function(d, i){ return getY(i);})
	.attr("index", function(d, i){return i;})
	.attr("viewed", function() {  return 0; })
	.attr("focused", function() {  return 0; })
    .on("mouseover", function(){
		if (d3.select(this).attr("focused")!=1 && g_state == "focus") return;
		if (g_state == "focus") {d3.select(this).style("fill", "aliceblue"); return;}
		d3.select(this).attr("viewed",1);
		var that = this;
		lines.filter(function() {	
			return d3.select(this).attr("src") == d3.select(that).attr("index");
		  }).style("stroke", "red").attr("viewed",1)
			.each(function(){
				var that = this;
				circles.filter(function() {
					return d3.select(this).attr("index") == d3.select(that).attr("trgt");
					}).style("stroke", "red").attr("viewed",1);});

		lines.filter(function() {
			return d3.select(this).attr("trgt") == d3.select(that).attr("index");
		  }).style("stroke", "green").attr("viewed",1)
			.each(function(){
				var that = this;
				circles.filter(function() {
					return d3.select(this).attr("index") == d3.select(that).attr("src");
					}).style("stroke", "green").attr("viewed",1);
			});


		lines.filter(function() {
			return d3.select(this).attr("viewed")==0;
		  }).transition().style("opacity", 0);

		circles.filter(function(){
			return d3.select(this).attr("viewed")==0;
			}).transition().style("opacity", 0.2);

		d3.select(this).style("fill", "aliceblue");
	})
    .on("mouseout", function(){
	 if (g_state == "focus"){
		 
		 lines.filter(function(){return d3.select(this).attr("focused")==1;})
				.style("stroke", "grey")
				.attr("viewed",0)
			  .transition().style("opacity", 1);
		 circles.filter(function(){return d3.select(this).attr("focused")==1;})
				.style("stroke", "grey")
				.attr("viewed",0)
			  .transition().style("opacity", 1);
		  
		 d3.select(this).style("fill", "white");
	 }
	 else {
		  lines.style("stroke", "grey")
				.attr("viewed",0)
			  .transition().style("opacity", 1);
		 circles.style("stroke", "grey")
				.attr("viewed",0)
			  .transition().style("opacity", 1);
		  
		 d3.select(this).style("fill", "white");
	 }
    })

	.on("mousedown", function(){
		if (g_state == "focus") {
			g_state = "";
			circles.attr("r", node_radius_wo_pad)
				   .attr("cx", function(d, i){ return getX(i);})
				   .attr("cy", function(d, i){ return getY(i);})
			       .attr("index", function(d, i){return i;})
				   .attr("viewed", function() {  return 0; })
				   .attr("focused", function() {  return 0; });
			
			lines.attr("x1", function(d) { return xScale(d.source%nodes_in_width); })
			     .attr("y1", function(d) { return yScale(parseInt(d.source/nodes_in_width)); })
			     .attr("x2", function(d) { return xScale(d.target%nodes_in_width); })
			     .attr("y2", function(d) {  return yScale(parseInt(d.target/nodes_in_width)); })
			     .attr("viewed", function() {  return 0; })
			     .attr("focused", function() {  return 0; })
			     .style("stroke", "grey");
			return; 
		}
		g_state = "focus";
		var node = d3.select(this);
		node.moveToFront();
		var x_pos = getX(node.attr("index"));
		var y_pos = getY(node.attr("index"));
		var dep_radius = height/16;
		node.attr("focused",1).attr("cx",width/2).attr("cy",height/2).attr("r",height/8);
		var _dia = dep_radius*4;
		var focused_nodes_in_width = parseInt(width/_dia);
		var that = this;
		var matches=0;
		lines.filter(function(d, i) {	
		   if (d3.select(this).attr("src") == d3.select(that).attr("index")) matches++;
			return d3.select(this).attr("src") == d3.select(that).attr("index");
		  }).attr("focused",1).attr("x1",function(d, i){ return width/2;})
		    .attr("y1",function(d, i){ return height/2;})
			.attr("x2",function(d, i){
				 var _dia = dep_radius*4;
				 var temp = (matches>focused_nodes_in_width)?width/2-_dia/2:_dia/2*(matches-1);
				 var start_x =   width/2-temp;
				 return  start_x + (i%focused_nodes_in_width)*_dia;
			 })
			.attr("y2",function(d, i){return height/4 - parseInt(i/focused_nodes_in_width)*_dia;})
			.each(function(d, i){
				var that = this;
				circles.filter(function() {
					return d3.select(this).attr("index") == d3.select(that).attr("trgt");
					}).attr("focused",1).attr("cx",function(){
						 var _dia = dep_radius*4;
						 var temp = (matches>focused_nodes_in_width)?width/2-_dia/2:_dia/2*(matches-1);
						 var start_x =   width/2-temp;
						 return  start_x + (i%focused_nodes_in_width)*_dia;
						})
					 .attr("cy",function(){ return height/4 - parseInt(i/focused_nodes_in_width)*_dia;})
					 .attr("r",dep_radius);
				});

		matches=0;
		lines.filter(function(d, i) {	
		   if (d3.select(this).attr("trgt") == d3.select(that).attr("index")) matches++;
			return d3.select(this).attr("trgt") == d3.select(that).attr("index");
		  }).attr("focused",1)
			.attr("x1",function(d, i){ return width/2;})
		    .attr("y1",function(d, i){ return height/2;})
			.attr("x2",function(d, i){
				 var _dia = dep_radius*4;
				 var temp = (matches>focused_nodes_in_width)?width/2-_dia/2:_dia/2*(matches-1);
				 var start_x =   width/2-temp;
				 return  start_x + (i%focused_nodes_in_width)*_dia;
			 })
			.attr("y2",function(d, i){return 3*height/4 + parseInt(i/focused_nodes_in_width)*_dia;})
			.each(function(d, i){
				var that = this;
				circles.filter(function() {
					return d3.select(this).attr("index") == d3.select(that).attr("src");
					}).attr("focused",1).attr("cx",function(){
						 var _dia = dep_radius*4;
						 var temp = (matches>focused_nodes_in_width)?width/2-_dia/2:_dia/2*(matches-1);
						 var start_x =   width/2-temp;
						 return  start_x + (i%focused_nodes_in_width)*_dia;
						})
					 .attr("cy",function(){ return 3*height/4 + parseInt(i/focused_nodes_in_width)*_dia;})
					 .attr("r",dep_radius);
					
				});

		 lines.filter(function() {
			 return d3.select(this).attr("focused") != 1;
	     }).transition().style("opacity", 0);

		 circles.filter(function(){
			 return d3.select(this).attr("focused") != 1;
			}).transition().style("opacity", 0);
	
		


	});



	


function zoom() {
	 svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}

    }