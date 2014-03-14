  var x= {1:}









var UIHandlers = {
    'Grid': function (grid) {
        var span = [],
            widths = [],
            heights = [],
            colCount = 0,
            rowCount = 0,
            nodes = grid.Sub.Node,
            flow = grid.Flow || "LToR",

            modeHandlers = {
                'Span': function () {
                    span = grid.Span.split(',');
                    span = span.map(Math.floor);
                },
                'Rows': function () {
                    span = [grid.Rows, nodes.length / grid.Rows];
                    flow = 'TToB';
                },
                'Cols': function () {
                    span = [nodes.length / grid.Cols, grid.Cols];
                },
                'ColWidth': function () {
                    widths = grid.ColWidth.match(/[^ ,]+/g);
                    span[1] = Math.max(span[1], widths.length);
                },
                'RowHeight': function () {
                    heights = grid.RowHeight.match(/[^ ,]+/g);
                    span[0] = Math.max(span[0], heights.length);
                },
                'Xy' : function () {
                    //create a map for the nodes according to Xy elements
                    var gridMap = _.map(nodes, function (node, index) {
                        return [node.Xy.match(/[^ ,]+/g).reduce(function(prev,cur){
                            return +prev * span[1] + +cur; })].concat(index);
                    })
                        .sort(function (a, b) {return a[0] - b[0]; }),
                        //create an empty array
                        arr = [];
                    while (arr.length < span[0] * span[1]) {
                        arr.push('');
                    }
                    //magical line to create an array ordered according to gridMap while filling gaps ie empty grid slots with empty labels
                    nodes = arr.map(function (elm, ind) {
                        return gridMap[0][0] === ind ? nodes[gridMap.shift()[1]] : {'UI': 'Label'};
                    });
                }
            },

            modes = ['Span', 'Rows', 'Cols', 'ColWidth', 'RowHeight',  'Xy'],

            handleMode = function (mode) {
                //check if parameters for each mode exist in grid (or nodes for 'Xy')
                if (grid[mode] || (mode === 'Xy' && nodes[0][mode])) {
                    modeHandlers[mode]();
                }
            },

            makeCol = function (node) {
                openElement('div', 'span', {}, 'width:' + (widths[++colCount - 1] || widths[width.length - 1]) + 'px; ');
                UIHandlers[node.UI](node);
                closeElement('div');
            },

            makeRow = function (nodes) {
                colCount = 0;
                openElement('div', 'row', {}, 'height:' + (heights[++rowCount - 1] || heights[heights.length - 1]) + 'px; ');
                _.each(nodes, makeCol);
                closeElement('div');
            },

        // span[1] is number of cols. For each type of flow we have a loop to create appropriate rows.
            makeGrid = {
                'TToB' : function () {
                    var i, filterFunction = function (e, ind) {return ind % span[1] === i; };

                    for (i = 0; i < span[1]; i += 1) {
                        makeRow(nodes.filter(filterFunction));
                    }
                },
                'LToR' : function () {
                    var i;
                    for (i = 0; i < nodes.length; i += span[1]) {
                        makeRow(nodes.slice(i, i + span[1]));
                    }
                }
            };

        modes.forEach(function (mode) {
            handleMode(mode);
        });

        makeGrid[flow]();

    },

    'TestDL': function (node) {
        openElement('test-dl', '', node, '');
        closeElement('test-dl');
    },

    'Label': function (node) {
        openElement('div', '', node, '');
        closeElement('div');
    }

};