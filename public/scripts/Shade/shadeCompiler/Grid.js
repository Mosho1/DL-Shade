var that = {},

    modeHandlers =  {
        'Span': function (grid) {
            span = grid.Span.split(',');
            span = span.map(Math.floor);

            return {'span': span};
        },
        'Rows': function (grid) {
            span = [grid.Rows, grid.Sub.Node.length / Number(grid.Rows)];
            flow = 'TToB';

            return {'span': span};
        },
        'Cols': function (grid) {
            span = [grid.Sub.Node.length / grid.Cols, Number(grid.Cols)];

            return {'span': span};
        },
        'ColWidth': function (grid, span) {
            widths = grid.ColWidth.match(/[^ ,]+/g);
            span[1] = Math.max(span[1], widths.length);

            return {'span': span, 'widths': widths};
        },
        'RowHeight': function (grid, span) {
            heights = grid.RowHeight.match(/[^ ,]+/g);
            span[0] = Math.max(span[0], heights.length);

            return {'span': span, 'heights': heights};
        },
        'Xy' : function (grid, span) {
            var nodes = grid.Sub.Node;
            //create a map for the nodes according to Xy elements
            var gridMap = _.map(nodes, function (node, index) {
                return [node.Xy.match(/[^ ,]+/g).reduce(function (prev, cur) {
                    return +prev * span[1] + +cur;
                })].concat(index);
            }).sort(function (a, b) { return a[0] - b[0]; });

            grid.Sub.Node = (function () {
                var arr = [], i;
                for (i = 0; i < span[0] * span[1]; i++) {
                    arr.push((gridMap[0] || [-1])[0] === i ? nodes[gridMap.shift()[1]] : {'UI': 'Label'});
                }
                return arr;
            }());

            return {'grid': grid};
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

            return {'grid': grid};
        }
    },

    makeCol = function (node) {
        if (angular.isObject(node)) {
            var colCount = this.colCount;
            var widths = this.widths;
            var width = widths.length ? ('width:' + (widths[++colCount - 1] || widths[widths.length - 1]) + 'px; ') : '';

            that.openElement('td', '', {}, width, node.CSpan ? 'colspan="' + node.CSpan +'"' : ''); //TODO: add functionality to separate node attributes from the node object when they don't belong in the element
            that.nodeHandlers.Node(_.omit(node, 'CSpan'));
            that.closeElement();
        }
    },

    makeRow = function (nodes, heights, widths, rowCount) {
        var height = heights.length ? ('height:' + (heights[++rowCount - 1] || heights[heights.length - 1]) + 'px; ') : '';
        colCount = 0;

        that.openElement('tr', '', {}, height);
        _.each(nodes, makeCol, {widths: widths, colCount: colCount});
        that.closeElement();
    },

// span[1] is number of cols. For each type of flow we have a loop to create appropriate rows.
    makeGrid =  {
        'TToB' : function (grid, heights, widths, span) {
            var i, filterFunction = function (elm, ind) {return ind % span[1] === i; },
                nodes = grid.Sub.Node;

            for (i = 0; i < span[1]; i++) {
                makeRow(nodes.filter(filterFunction), heights, widths);
            }
        },
        'LToR' : function (grid, heights, widths, span) {
            var rowCount = 0;
            var i, nodes = grid.Sub.Node;
            for (i = 0; i < nodes.length; i += span[1]) {
                makeRow(nodes.slice(i, i + span[1]), heights, widths, rowCount);
            }
        }
    },

    handleMode = function (mode, data) {
        nodes = this.Sub.Node;
        //check if parameters for each mode exist in grid (or nodes for 'Xy')
        if (this[mode]
                || (mode === 'Xy' && _.every(nodes, 'Xy'))
                || (mode === 'CSpan' && _.some(nodes, 'CSpan'))) {
            return modeHandlers[mode](this, data.span);
        }
    },

    modes = ['ColWidth', 'RowHeight', 'Span', 'Rows', 'Cols', 'Xy', 'CSpan'];

module.exports = function (grid) {

    that = this;

    if (_.isObject(grid)) {

        var flow = grid.Flow || "LToR";

        data = {grid: grid, heights: '', widths: '', span: []};

        _.each(modes, function (mode) {
            _.extend(data, handleMode.call(grid, mode, data));
        });

        if (data.span[1] > 0) {
            that.openElement('table', '', grid, '');
            makeGrid[flow](data.grid, data.heights, data.widths, data.span);
            that.closeElement();
        }
    }

};

module.exports.test = {
    modeHandlers: modeHandlers,
    makeCol: makeCol,
    makeRow: makeRow,
    makeGrid: makeGrid,
    handleMode: handleMode
};