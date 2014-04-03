angular.module('DLApp').service('graphService', function() {
    
    var div_name = { 'Table': '#DLtable_wrapper', 'Graph': 'svg' };

    var graphState = function(theme,state) {$(div_name[theme]).css('display',state);};

    this.deleteGraph = function(theme) {$(div_name[theme]).remove();};

    this.hideGraph = function (theme) {graphState(theme,'none');};
    this.showGraph = function (theme) {graphState(theme,'');};

    var formatArrayObject = function (obj) {
        var cases = {'number':function(value){return value.toFixed(2)},
                     'object':function(value){return formatArrayObject(value)}};
        return "{"+ $.map(obj, function (value, index) {
            return (cases[typeof value] || function(v){return v})(value)
        }) + "}";
    }

    this.drawGraph = {
        'Table': function (_graph, div) {
            if ($('#DLtable_wrapper').length != 0) return;
            if (!_graph) return;
            var data = JSON.parse(JSON.stringify(_graph.variables.variables));
            var _v;
            for (var key in data) {
                var v = data[key];
                if (v.hasOwnProperty('expr')) {
                    for (var _key in v) {
                        var attr = v[_key];
                        if (attr && typeof attr == 'object' && _key == 'value')
                            v[_key] = formatArrayObject(attr);
                        else if (typeof attr == 'number')
                            v[_key] = attr.toFixed(2);
                        else if (typeof attr == 'function')
                            delete v[_key];
                    }
                }
                else delete data[key];
            }

            var tableData = [];
            $.each(data, function (index, value) {
                if (data.hasOwnProperty(index))
                    tableData.push([index].concat(_.toArray(value)));
            });
            for (var key in data)
                {_v = data[key]; break;}
            var tableColumns = [];
            tableColumns.push({ "sTitle": "name", "sClass": "center"});
            for (var attr in _v){
                if (_v.hasOwnProperty(attr))
                    tableColumns.push({ "sTitle": attr, "sClass": "center" });}
            $(div).append( '<table cellpadding ="0" cellspacing ="0" border="0" class = "display" id="DLtable"></table>');
            $('#DLtable').dataTable( {
            "aaData": tableData,
            "aoColumns": tableColumns
            });

            
        },
            

        'Graph': function(_graph,div) {

            if (!_graph) return;

            d3.select("svg")
                    .remove();

            var data = _.cloneDeep(_graph.variables);

            function ArrayObjectLookup(array, attr) {
                for (var i = 0; i< array.length; i++)
                    if(array[i].name == attr) return i;
                }
   
            var graph = {"nodes":[],"links":[]};
        
            for (var v in data.variables) {var _v = data.variables[v];
                if (_v.hasOwnProperty("expr")) {_v.name = v;graph.nodes.push(_v);}}
 
            $.each(data.edges, function (index, value){
                graph.links[index] = {"source":ArrayObjectLookup(graph.nodes,this[0]),"target":ArrayObjectLookup(graph.nodes,this[1])};});

            d3.selection.prototype.moveToFront = function() {
                return this.each(function(){
                this.parentNode.appendChild(this);
                });
            };

            var g_state = "";



            var canvas=$(div);

            while (!canvas.width() || !canvas.height())
                canvas = canvas.parent();
            
            var width = canvas.width(),
                height = canvas.height();

            var svg = d3.select(div).append("svg")
                .attr("width", width)
                .attr("height", height)
                .call(d3.behavior.zoom().scaleExtent([0.25, 2]).on("zoom", zoom)).on("dblclick.zoom",null)
                .append("g");

            var width_padding = 20;
            var height_padding = 20;

            var	div_area = (width-width_padding)*(height-height_padding),
	            num_nodes = graph.nodes.length,
	            node_area = div_area/(num_nodes+num_nodes%2),
                node_to_padding_ratio = 0.50,
	            node_dia_inc_pad = Math.sqrt(node_area),
	            node_radius_wo_pad = node_dia_inc_pad/2*node_to_padding_ratio,
	            node_padding = node_dia_inc_pad/2*(1-node_to_padding_ratio),
	            nodes_in_width = parseInt(width/(node_dia_inc_pad)) || 1,
                nodes_in_height = parseInt(height/(node_dia_inc_pad)) || 1;  

            var xScale = d3.scale.linear()
	            .domain([0,nodes_in_width])
	            .range([width_padding + node_radius_wo_pad,width - width_padding -node_radius_wo_pad]);

            var yScale = d3.scale.linear()
	            .domain([0,nodes_in_height])
	            .range([height_padding + node_radius_wo_pad,height - height_padding- node_radius_wo_pad]);

            var getX = function(index){return xScale(index%nodes_in_width)};
            var getY = function(index){return yScale(parseInt(index/nodes_in_width))};

            var lines = svg.append("g").attr("class", "line")
                .selectAll("line").data(graph.links)
                .enter().append("line")
                .attr("x1", function(d) {return getX(d.source); })
                .attr("y1", function(d) { return getY(parseInt(d.source)); })
                .attr("x2", function(d) { return getX(d.target); })
                .attr("y2", function(d) {  return getY(d.target); })
                .attr("src", function(d) {  return d.source; })
                .attr("trgt", function(d) {  return d.target; })
                .attr("viewed", function() {  return 0; })
                .attr("focused", function() {  return 0; })
                .style("stroke", "grey");
 
            var circles = svg.append("g")
                .attr("class","nodes")
                .selectAll("circle")
                .data(graph.nodes)
                .enter()
                .append("g")
                .attr("transform",function(d,i){d.x = getX(i);d.y=getY(i);return "translate(" + d.x + "," + d.y + ")";})
                .attr("name", function(d){return d.name;})
                .attr("viewed",  0)
	            .attr("focused", 0)
                .attr("index", function(d, i) {return i;});

            circles.append("circle")
                .style("stroke", "gray")
                .style("fill", "white")
                .attr("r", node_radius_wo_pad)
                .on("mouseover", function(){
                    g_elem = this.parentNode;
		            if (d3.select(g_elem).attr("focused")!=1 && g_state == "focus") return;
		            if (g_state == "focus") {d3.select(this).style("fill", "aliceblue"); return;}
		            d3.select(g_elem).attr("viewed",1);
		            var that = this;

		            renderViewed("red","src","trgt");
                    renderViewed("green","trgt","src");
                          
		            lines.filter(function() {
			            return d3.select(this).attr("viewed")==0;
		                }).transition().style("opacity", 0);

		            var toChange = circles.filter(function(){
			            return d3.select(this).attr("viewed")==0;
			            });
                    toChange .selectAll("circle").transition().style("opacity", 0.2);
                    toChange.selectAll("text").transition().style("opacity", 0.2);

		            d3.select(this).style("fill", "aliceblue");
	            })
                .on("mouseout", function(){
	                    if (g_state == "focus"){
		                    lines.filter(function(){return d3.select(this).attr("focused")==1;})
				                .style("stroke", "grey")
				                .attr("viewed",0)
			                    .transition().style("opacity", 1);

		                var toChange = circles.filter(function(){return d3.select(this).attr("focused")==1;})
                                                .attr("viewed",0);
                            toChange.selectAll("circle")
		    	                    .transition().style("opacity", 1);
                            toChange.selectAll("text")
		    	                    .transition().style("opacity", 1);
		  
		                    d3.select(this).style("fill", "white");
	                    }
	                    else {
		                    lines.style("stroke", "grey")
				                .attr("viewed",0)
			                    .transition().style("opacity", 1);
		                    circles.attr("viewed",0)
                                .selectAll("circle")
                                .style("stroke", "grey")
	       	                    .transition().style("opacity", 1);
                            circles.selectAll("text")
	       	                    .transition().style("opacity", 1);
		                    d3.select(this).style("fill", "white");
	                    }
                })

	            .on("dblclick", function(){
		            if (g_state == "focus") {
			
			            circles.attr("transform",function(d,i){return "translate(" + d.x + "," + d.y + ")";})
		                        .attr("viewed", function() {  return 0; })
				                .attr("focused", function() {  return 0; })
                                .selectAll("circle").attr("r", node_radius_wo_pad);      

			            lines.attr("x1", function(d) { return getX(d.source); })
			                    .attr("y1", function(d) { return getY(d.source); })
			                    .attr("x2", function(d) { return getX(d.target); })
			                    .attr("y2", function(d) {  return getY(d.target); });
			            lines.attr("viewed", function() {  return 0; })
			                    .attr("focused", function() {  return 0; })
			                    .style("stroke", "grey");
                        g_state = "";
			            return; 
		            }
		            g_state = "focus";
		            var node = d3.select(this.parentNode);
		            node.moveToFront();
		
		            node.attr("focused",1).attr("transform","translate("+width/2+","+height/2+")").selectAll("circle").attr("r",height/8);
        
		            var that = this.parentNode;

		            renderFocused("src","trgt",that);
                    renderFocused("trgt","src",that);

		                lines.filter(function() {
			                return d3.select(this).attr("focused") != 1;
	                    }).transition().style("opacity", 0);

		                var toChange =circles.filter(function(){
			                return d3.select(this).attr("focused") != 1;
			            });

                    toChange.selectAll("circle").transition().style("opacity", 0);
                    toChange.selectAll("text").transition().style("opacity", 0);
	            });

                circles.append("text")
                    .attr("text-anchor","middle")
                    .text(function(d){return d.name})
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "50px")
                    .attr("y",10);

            function zoom() {
	                svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	            }

            function renderViewed(color,src,trgt) {
      
                    lines.filter(function() {	
			            return d3.select(this).attr(src) == d3.select(g_elem).attr("index");
		                }).style("stroke", color).attr("viewed",1)
			            .each(function(){
				            var that = this;
				            circles.filter(function() {
					            return d3.select(this).attr("index") == d3.select(that).attr(trgt);
					            }).attr("viewed",1)
                                    .selectAll("circle").style("stroke", color)
                            });
            }

            function renderFocused(src,trgt,_that) {
                var x = src == "src" ? 1 : 3;
                var dep_radius = height/16;
                var nodes_in_wid = parseInt(width/dep_radius*2/node_to_padding_ratio);
                var matches=0;
		            lines.filter(function(d, i) {	
		                if (d3.select(this).attr(src) == d3.select(_that).attr("index")) matches++;
			            return d3.select(this).attr(src) == d3.select(_that).attr("index");
		                }).attr("focused",1).attr("x1",function(d, i){ return width/2;})
		                .attr("y1",function(d, i){ return height/2;})
			            .attr("x2",function(d, i){                       
				                return  (width/2-((matches>nodes_in_wid)?width/2-dep_radius*4/2:dep_radius*4/2*(matches-1))) + (i%nodes_in_wid)*dep_radius*4;
			                })
			            .attr("y2",function(d, i){return x*height/4 - parseInt(i/nodes_in_wid)*dep_radius*4;})
			            .each(function(d, i){
				            var that = this;
				            circles.filter(function() {
					            return d3.select(this).attr("index") == d3.select(that).attr(trgt);
					            }).attr("focused",1)
                                    .attr("transform",function(){
                                        d.xf = (width/2-((matches>nodes_in_wid)?width/2-dep_radius*4/2:dep_radius*4/2*(matches-1))) + (i%nodes_in_wid)*dep_radius*4;
                                        d.yf = x*height/4 - parseInt(i/nodes_in_wid)*dep_radius*4;
						                return "translate(" + d.xf + "," + d.yf + ")";
						            })
                                    .selectAll("circle")
					                .attr("r",dep_radius);
				            });
      
            }
       }
    }});
