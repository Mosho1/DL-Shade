openElement = null;
closeElement = null;

var modeHandlers = {
        'Span': function (grid) {
            span = grid.Span.split(',');
            span = span.map(Math.floor);
        },
        'Rows': function (grid) {
            span = [grid.Rows, nodes.length / Number(grid.Rows)];
            flow = 'TToB';
        },
        'Cols': function (grid) {
            span = [nodes.length / grid.Cols, Number(grid.Cols)];
        },
        'ColWidth': function (grid) {
            widths = grid.ColWidth.match(/[^ ,]+/g);
            span[1] = Math.max(span[1], widths.length);
        },
        'RowHeight': function (grid) {
            heights = grid.RowHeight.match(/[^ ,]+/g);
            span[0] = Math.max(span[0], heights.length);
        },
        'Xy' : function (grid) {
            var nodes = grid.Sub.Node;
            //create a map for the nodes according to Xy elements
            var gridMap = _.map(nodes, function (node, index) {
                return [node.Xy.match(/[^ ,]+/g).reduce(function (prev, cur) {
                    return +prev * span[1] + +cur;
                })].concat(index);
            }).sort(function (a, b) { return a[0] - b[0]; });

            return nodes = (function () {
                var arr = [], i;
                for (i = 0; i < span[0] * span[1]; i++) {
                    arr.push((gridMap[0] || [-1])[0] === i ? nodes[gridMap.shift()[1]] : {'UI': 'Label'});
                }
                return arr;
            }());
        },
        'CSpan' : function (grid) {
            var nodes = grid.Sub.Node;
            //create a map for the nodes according to CSpan elements
            var cspan, i = 0;
            while (i < nodes.length) {
                cspan = +nodes[i].CSpan || 1;
                [].splice.apply(nodes, [i, 0].concat(new Array(cspan).join('0').split('')));
                i += cspan;
            }

            return nodes;
        }
    },

    makeCol = function (node) {
        var widths = this.widths;
        if (angular.isObject(node)) {
            var width = widths.length ? ('width:' + (widths[++colCount - 1] || widths[widths.length - 1]) + 'px; ') : '';
            that.openElement('td', '', {}, width, node.CSpan ? 'colspan="' + node.CSpan +'"' : ''); //TODO: add functionality to separate node attributes from the node object when they don't belong in the element
            that.nodeHandlers.Node(_.omit(node, 'CSpan'));
            that.closeElement();
        }
    },

    makeRow = function (nodes) {
        var heights = this.heights;
        var height = heights.length ? ('height:' + (heights[++rowCount - 1] || heights[heights.length - 1]) + 'px; ') : '';
        colCount = 0;
        openElement('tr', '', {}, height);
        _.each(nodes, makeCol);
        closeElement();
    },

// span[1] is number of cols. For each type of flow we have a loop to create appropriate rows.
    makeGrid = {
        'TToB' : function (nodes) {
            var i, filterFunction = function (elm, ind) {return ind % span[1] === i; };

            for (i = 0; i < span[1]; i++) {
                ret.makeRow(nodes.filter(filterFunction));
            }
        },
        'LToR' : function (nodes) {
            var i;
            for (i = 0; i < nodes.length; i += span[1]) {
                ret.makeRow(nodes.slice(i, i + span[1]));
            }
        }
    },

    handleMode = function (mode, grid) {
        var nodes = grid.Sub.Node;
        //check if parameters for each mode exist in grid (or nodes for 'Xy')
        if (grid[mode]
                || (mode === 'Xy' && _.every(nodes, 'Xy'))
                || (mode === 'CSpan' && _.some(nodes, 'CSpan'))) {
            ret.modeHandlers[mode](grid);
        }
    },

    gridElm = function (gridObj) {
        openElement = this.openElement;
        closeElement = this.closeElement.
        grid = gridObj;
        nodes = grid.Sub.Node;
        flow = grid.Flow || "LToR";
        rowCount = 0;
        span = [];
        widths = [];
        heights = [];
        that = this;

        modes = ['ColWidth', 'RowHeight', 'Span', 'Rows', 'Cols', 'Xy', 'CSpan'];

        modes.forEach(function (mode) {
            ret.handleMode(mode);
        });
        if (span[1] > 0) {
            that.openElement('table', '', grid, '');
            ret.makeGrid[flow]();
            that.closeElement();
        }

    };

exports = {}

