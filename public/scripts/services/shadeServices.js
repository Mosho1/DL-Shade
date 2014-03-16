angular.module('ShadeApp')

    .value('ShadeDictionary', {
        //dictionary for attribute names
        'attrNameHandlers' : {
            'vDL': '',
            'vText': 'vtext'
        },

        //dictionary for attribute values
        'attrValueHandlers' : {

        },

        //dictionary for style names
        'styleNameHandlers' : {
            'width': '',
            'height': ''

        },

        //dictionary for style values
        'styleValueHandlers' : {
            'width': function (width) { return width + "px" },
            'height': function (height) { return height + "px" }
        }

    })

    .service('ShadeParser', function (ShadeDictionary) {
        var styleNames = ShadeDictionary.styleNameHandlers,
            styleValues = ShadeDictionary.styleValueHandlers;

        this.parse = function (shd) {

            var gstyles = "", //styles will be appended to this variable as they are created, to be later appended to the HTML ouput of this template
                classCount = 0,
                elements = [],
                currentElement = {'nodes': elements},

                addStyles = function (className, styles) {
                    if (className && styles) {
                        gstyles += "." + className + " { " + styles + "}\n";
                    }
                },

                handleStyles = function (styles, value, style) {
                    var stval, type;
                    if (value && styleNames.hasOwnProperty(style)) {
                        styles += (styleNames[style] || style) + ': ';
                        type = typeof (stval = (styleValues[value] || styleValues[style]));
                        if (type === 'undefined') {
                            styles += value;
                        } else if (type === 'function') {
                            styles += stval(value);
                        } else {
                            styles += stval;
                        }
                        styles += " !important;";
                    }

                    return styles;



                },

            //wrappers for creating HTML elements. Creates enumerated CSS classes for each element with style(s).
                openElement = function (elmName, className, node, customStyles) {
                    var nativeStyles = _.reduce(node, handleStyles, ''),
                        nativeClass = "class" + classCount,
                        cur = currentElement.nodes.push({
                            'elmName': elmName,
                            'nativeClass': nativeClass,
                            'className' : className,
                            'node': node,
                            'customStyles': customStyles,
                            'nodes': [],
                            'parent': currentElement
                        });
                    if (customStyles || nativeStyles) {
                        addStyles(nativeClass, (customStyles || '') + (nativeStyles || ''));
                    }

                    currentElement = currentElement.nodes[cur - 1];

                    classCount++;

                },

                closeElement = function () {
                    currentElement = currentElement.parent;
                },

                UIHandlers = {
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
                                        return [node.Xy.match(/[^ ,]+/g).reduce(function (prev, cur) {
                                            return +prev * span[1] + +cur;
                                        })].concat(index);
                                    }).sort(function (a, b) { return a[0] - b[0]; });

                                    nodes = function () {
                                        var arr = [];
                                        for (var i = 0; i < span[0] * span[1]; i++)
                                            arr.push((gridMap[0] || [-1])[0] === i ? nodes[gridMap.shift()[1]] : {'UI': 'Label'});
                                        return arr;
                                    }();
                                }
                            },

                            makeCol = function (node) {
                                openElement('div', 'span', {}, 'width:' + (widths[++colCount - 1] || widths[width.length - 1]) + 'px; ');
                                UIHandlers[node.UI](node);
                                closeElement();
                            },

                            makeRow = function (nodes) {
                                colCount = 0;
                                openElement('div', 'row', {}, 'height:' + (heights[++rowCount - 1] || heights[heights.length - 1]) + 'px; ');
                                _.each(nodes, makeCol);
                                closeElement();
                            },

                        // span[1] is number of cols. For each type of flow we have a loop to create appropriate rows.
                            makeGrid = {
                                'TToB' : function () {
                                    var filterFunction = function (elm, ind) {return ind % span[1] === i; };
                                    for (var i = 0; i < span[1]; i++) {
                                        makeRow(nodes.filter(filterFunction));
                                    }
                                },
                                'LToR' : function () {
                                    for (var i = 0; i < nodes.length; i += span[1]) {
                                        makeRow(nodes.slice(i, i + span[1]));
                                    }
                                }
                            },

                            handleMode = function (mode) {
                                //check if parameters for each mode exist in grid (or nodes for 'Xy')
                                if (grid[mode] || (mode === 'Xy' && _.every(nodes, 'Xy'))) {
                                    modeHandlers[mode]();
                                }
                            },

                            modes = ['Span', 'Rows', 'Cols', 'ColWidth', 'RowHeight',  'Xy'];

                        modes.forEach(function (mode) {
                            handleMode(mode);
                        });

                        makeGrid[flow]();

                    },

                    'TestDL': function (node) {
                        openElement('test-dl', '', node, '');
                        closeElement();
                    },

                    'Label': function (node) {
                        openElement('div', '', node, '');
                        closeElement();
                    },

                    'NumEdit': function (node) {
                        openElement('num-edit', '', node, '');
                        closeElement();
                    }

                },

                nodeHandlers = {
                    'Styles': function (styles) {
                        //parses styles. A bit messy, but gets the job done concisely and shouldn't be too hard to follow with the comments.
                        var parsedStyles = styles.replace(/[^!-~]/g,"") //remove unneeded characters
                            .split('}') //split lines into array
                            .map(function(elm){
                                return elm.split('{');}) //split each line into an array: [name,styles]
                            .map(function(elm){
                                if (elm[1]) //if element has styles
                                    return [elm[0],(elm[1].split(';')//split styles into an array: ["styleName:styleValue" x <number of styles>]
                                        .map(function(elm){
                                            return elm.split(':')}) //split each "styleName:styleValue" pair into an array [styleName,styleValue]
                                        .reduce(function(obj,val,ind){ //reduce the style array into an object where each style is a field.
                                            obj[val[0]]=val[1]; // obj = {styleName: styleValue}
                                            return obj;
                                        }
                                        ,{})
                                        )]
                            })
                            .filter(function(elm){return elm;}) //remove garbage (undefined or otherwise falsey elements)
                            .forEach(function(elm){ //for each of the parsed and organized classes
                                var styles = _.reduce(elm[1],handleStyles,''); //parse the styles using our handlers
                                addStyles(elm[0],styles); //add styles to string to be added to the HTML output
                            });
                    },

                    'Node': function (node) {
                        UIHandlers[node['UI']](node);
                    },
                    'Unknown': function(node) {
                        console.log("can't recognize tag <" + node +">.");
                    }
                },

                handleNodes = function (node, index) {
                    (nodeHandlers[index] || nodeHandlers['Unknown'])(node);
                };

            if (shd) {
                _.each(shd.Shade, handleNodes);
                return {'styles': gstyles, 'elements': elements};
            }

        }

        return this;

    })