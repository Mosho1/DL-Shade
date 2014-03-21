angular.module('ShadeServices', [])

    .service('ShadeHandlers', function (ShadeElements, ShadeStyles) {

        var openElement = ShadeElements.openElement,
            closeElement = ShadeElements.closeElement,
            that = this;

        this.UIHandlers = {
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

                            nodes = (function () {
                                var arr = [], i;
                                for (i = 0; i < span[0] * span[1]; i++) {
                                    arr.push((gridMap[0] || [-1])[0] === i ? nodes[gridMap.shift()[1]] : {'UI': 'Label'});
                                }
                                return arr;
                            }());
                        }
                    },

                    makeCol = function (node) {
                        openElement('div', 'span', {}, 'height:100%; width:' + (widths[++colCount - 1] || widths[widths.length - 1]) + 'px; ');
                        that.UIHandlers[node.UI](node);
                        closeElement();
                    },

                    makeRow = function (nodes) {
                        colCount = 0;
                        openElement('div', 'row', {}, 'width:100%; height:' + (heights[++rowCount - 1] || heights[heights.length - 1]) + 'px; ');
                        _.each(nodes, makeCol);
                        closeElement();
                    },

                // span[1] is number of cols. For each type of flow we have a loop to create appropriate rows.
                    makeGrid = {
                        'TToB' : function () {
                            var i, filterFunction = function (elm, ind) {return ind % span[1] === i; };

                            for (i = 0; i < span[1]; i++) {
                                makeRow(nodes.filter(filterFunction));
                            }
                        },
                        'LToR' : function () {
                            var i;
                            for (i = 0; i < nodes.length; i += span[1]) {
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
            },

            DropDown: function (node) {

                var items = node.Items.replace(/\s/g, '').split(/;+/),
                    options = {};
                items = [items[0], items.slice(1).join(',')];

                if (node.Cols && node.Cols.Col) {
                    node.Cols.Col.forEach(function (col) {
                        options[col.Name] = _.transform(_.omit(col, 'Name'), function (str, val, opt) {
                            str.push(opt.charAt(0) + '=' + val);
                        }, []);
                    });

                    options = (function (items, opts) {
                        return items.map(function (item) {
                            return opts[item].join('&');
                        }).join('|');
                    }(items[0].split('|'), options));
                }

                openElement('drop-down', '', node, '', "header=" + items[0] + " items=" + items[1] + " options=" + options);
                closeElement();

            }
        };


        this.nodeHandlers = {
            'Styles': function (styles) {
                //parses styles. A bit messy, but gets the job done concisely and shouldn't be too hard to follow with the comments.
                var parsedStyles = styles.replace(/[^!-~]/g, "") //remove unneeded characters
                    .split('}') //split lines into array
                    .map(function (elm) {
                        return elm.split('{');
                    }) //split each line into an array: [name,styles]
                    .map(function (elm) {
                        if (elm[1]) { //if element has styles
                            return [elm[0], (elm[1].split(';')//split styles into an array: ["styleName:styleValue" x <number of styles>]
                                .map(function (elm) {
                                    return elm.split(':');
                                }) //split each "styleName:styleValue" pair into an array [styleName,styleValue]
                                .reduce(function (obj, val, ind) { //reduce the style array into an object where each style is a field.
                                    obj[val[0]] = val[1]; // obj = {styleName: styleValue}
                                    return obj;
                                }, {})
                                )];
                        }
                    })
                    .filter(function (elm) {return elm; }) //remove garbage (undefined or otherwise falsey elements)
                    .forEach(function (elm) { //for each of the parsed and organized classes
                        var styles = _.reduce(elm[1], ShadeStyles.handleStyles, ''); //parse the styles using our handlers
                        ShadeStyles.addStyles(elm[0], styles); //add styles to string to be added to the HTML output
                    });
            },

            'Node': function (node) {
                that.UIHandlers[node.UI](node);
            },
            'Unknown': function (node) {
                console.log("can't recognize tag <" + node +">.");
            }
        };

    return this;


    })

    .service('ShadeStaticHandlers', function() {

        this.attrNameHandlers = {
            'vDL': '',
            'vText': ''

        };

        this.attrValueHandlers = {

        };

        this.styleNameHandlers = {
            'Width': '',
            'Height': ''

        };

        this.styleValueHandlers = {
            'width': function (width) { return width + "px"; },
            'height': function (height) { return height + "px"; }
        };



        return this;


    })

    .service('ShadeStyles', function (ShadeStaticHandlers) {

        var styleNames = ShadeStaticHandlers.styleNameHandlers,
            styleValues = ShadeStaticHandlers.styleValueHandlers,
            gstyles = "";

        this.addStyles = function (className, styles) {
            if (className && styles) {
                gstyles += "." + className + " { " + styles + "}\n";
            }
        };

        this.handleStyles = function (styles, value, style) {
            var stval, type;
            if (value && styleNames.hasOwnProperty(style)) {
                styles += (styleNames[style] || style) + ': ';
                type = typeof (stval = (styleValues[value] || styleValues[style]));
                if (type === 'undefined') {
                    styles += value.toLowerCase();
                } else if (type === 'function') {
                    styles += stval(value);
                } else {
                    styles += stval;
                }
                styles += " !important;";
            }

            return styles;



        };

        this.getStyles = function () {
            return gstyles;
        };

        this.init = function () {
            gstyles = "";
        };

        return this;

    })


    .service('ShadeElements', function (ShadeStyles) {

        var classCount = 0,
            elements = [],
            currentElement = {'nodes': elements};


        //wrappers for creating HTML elements. Creates enumerated CSS classes for each element with style(s).
        this.openElement = function (elmName, className, node, customStyles, customAttr, content) {

            var nativeStyles = _.reduce(node, ShadeStyles.handleStyles, ''),
                nativeClass = nativeStyles || customStyles ? "class" + classCount : null,
                cur = currentElement.nodes.push({
                    'elmName': elmName,
                    'nativeClass': nativeClass,
                    'className' : className,
                    'node': node,
                    'customStyles': customStyles,
                    'customAttr': customAttr,
                    'content': content,
                    'nodes': [],
                    'parent': currentElement

                });
            if (customStyles || nativeStyles) {
                ShadeStyles.addStyles(nativeClass, (customStyles || '') + (nativeStyles || ''));
            }

            currentElement = currentElement.nodes[cur - 1];

            classCount++;

        };

        this.closeElement = function () {
            currentElement = currentElement.parent;
        };

        this.getElements = function () {
            return elements;
        };

        this.init = function () {
            classCount = 0;
            elements = [];
            currentElement = {'nodes': elements};
        };

        return this;

    })


    .service('ShadeParser', function (ShadeHandlers, ShadeStyles, ShadeElements) {




        var handleNodes = function (node, index) {
            var handlers = ShadeHandlers.nodeHandlers;
            (handlers[index] || handlers.Unknown)(node);
        };

        this.parse = function (shd) {
            if (shd) {
                ShadeStyles.init();
                ShadeElements.init();

                _.each(shd.Shade, handleNodes);
                return {'styles': ShadeStyles.getStyles(), 'elements': ShadeElements.getElements()};
            }

        }

        return this;

    })