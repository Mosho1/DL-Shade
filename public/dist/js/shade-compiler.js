(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var handleCol = function (col) {
        this[col.Name] = _.transform(_.omit(col, 'Name'), function (str, val, opt) {
            str.push(opt.charAt(0) + '=' + val);
        }, []);
    },

    getOptions = function (c) {
        var opts = {};
        if (c.Col.length) {
            _.each(c.Col, handleCol, opts);
        } else {
            handleCol.call(opts, c.Col);
        }
        return opts;
    },

    getHeaderAndItems = function (node) {
        var items = node.Items.replace(/\s/g, '').split(/;+/);
        return {
            header: items[0],
            items: items.slice(1).join(',')
        };
    },

    makeOptionString = function (items, opts) {
        return items.map(function (item) {
            return (opts[item] || []).join('&');
        }).join('|');
    },

    makeOptions = function (c, items) {
        if (c && c.Col) {
            var options = getOptions(c);
            return makeOptionString(items.split('|'), options);
        }
    },

    createPropertyString = function (options) {
        return _.map(options, function (option, key) {
            return key + '=' + option;
        }).join(' ');
    };

module.exports = function (node, wat, multiSelect) { //TODO: wat

    var parts = getHeaderAndItems(node),
        options = makeOptions(node.Cols, parts.items);

    var propertyString = createPropertyString({
        'multi-select': !!multiSelect,
        'header': parts.header,
        'items': parts.items,
        'options': options
    });

    this.openElement('drop-down', '', node, '', propertyString);
    this.closeElement();
};

module.exports.test = {
    handleCol: handleCol,
    getOptions: getOptions,
    getHeaderAndItems: getHeaderAndItems,
    makeOptionString: makeOptionString,
    makeOptions: makeOptions,
    createPropertyString: createPropertyString
};
},{}],2:[function(require,module,exports){
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
            var colCount = this.colCount,
                widths = this.widths,
                lastWidth = widths[colCount++] || widths[widths.length - 1],
                width = widths.length ? ('width:' + lastWidth + 'px; ') : '';

            that.openElement('td', '', {}, width, node.CSpan ? 'colspan="' + node.CSpan +'"' : ''); //TODO: add functionality to separate node attributes from the node object when they don't belong in the element
            that.nodeHandlers.Node(_.omit(node, 'CSpan'));
            that.closeElement();
        }
    },

    makeRow = function (nodes, heights, widths, rowCount) {
        var lastHeight = heights[rowCount++] || heights[heights.length - 1],
            height = heights.length ? 'height:' + lastHeight + 'px; ' : '',
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
            var rowCount = 0, i,
                nodes = grid.Sub.Node;
            for (i = 0; i < nodes.length; i += span[1]) {
                makeRow(nodes.slice(i, i + span[1]), heights, widths, rowCount);
            }
        },
        'single': function (grid, heights, widths) {
            makeRow([grid.Sub.Node], heights, widths, 0);
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

        var flow = grid.Sub.Node.length ? grid.Flow || "LToR" : 'single';

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
},{}],3:[function(require,module,exports){
module.exports = function (styles) {

    var that = this;
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
            var styles = _.reduce(elm[1], that.handleStyles, ''); //parse the styles using our handlers
            that.addStyles(elm[0], styles); //add styles to string to be added to the HTML output
        });
}
},{}],4:[function(require,module,exports){
angular.module('ShadeServices', [])

    .service('ShadeHandlers', function (ShadeElements, ShadeStyles) {

        this.openElement = ShadeElements.openElement;
        this.closeElement = ShadeElements.closeElement;
        this.getCurrent = ShadeElements.getCurrent;
        this.addStyles = ShadeStyles.addStyles;
        this.handleStyles = ShadeStyles.handleStyles;

        var that = this,
            handleSub = function (node) {
                _.each(((angular.isArray(node.Sub) ? node.Sub : {Node: node.Sub}) || {Node: {}}).Node, that.handleNodes);
            }

        //control-block handlers
        this.CbHandlers = {
            SETDLVARIABLE: function (cb) {
                return cb.Event + ',setDL,' + cb.Stat;
            },
            SHOWPOPUP: function (cb) {
                return cb.Event + ',popup,' + cb.Stat;

            },
            MESSAGE: function () {}

        };
        //TODO: change arguments to handlers below from array to an object
        this.UIHandlers = {

            Button: function (node, cb) {
                that.openElement('shd-button', 'btn btn-default', node, '', cb, '');
                that.closeElement();
            },

            CheckBox: function (node) {
                var attrs = node.Value ? '' : 'type="checkbox" label="' + node.Text + '"';
                that.openElement('div', 'inputs', node, '', attrs);
                that.closeElement();
            },

            DatePicker: function (node) {
                that.openElement('shd-date-picker', '', node, '');
                that.closeElement();

            },

            DropDown: require('./DropDown'),

            Grid: require('./Grid'),

            Image: function (node) {
                that.openElement('shd-image', '', node, '', '', '');
                that.closeElement();
            },

            Item: function (node) {
                that.openElement('li');
                that.openElement('a', '', {}, '', 'href="#"',node.Text)
                if (node.Sub) {
                    that.openElement('ul');
                    handleSub(node);
                    that.closeElement();
                }
                that.closeElement();
                that.closeElement();
            },

            Label: function (node) {
                that.openElement('div', '', node);
                that.closeElement();
            },

            ListBox: function (node) {
                that.openElement('list-box', '', node);
                handleSub(node);
                that.closeElement();
            },

            ListItem : function (node) {
                that.openElement('option', '', node);
                that.closeElement();
            },

            Menu : function (node) {
                that.openElement('ul', 'menu');
                handleSub(node);
                that.closeElement();
            },

            MultiSelComboBox: _.partialRight(require('./DropDown'), true),

            NumEdit: function (node) {
                that.openElement('div', 'inputs', node, '', 'type="text"');
                that.closeElement();
            },

            NumericUpDown: function (node) {
                that.openElement('num-up-down', '', node);
                that.closeElement();
            },

            Popup: function (node) {
                that.openElement('popup', '', node, 'display:none;');
                handleSub(node);
                that.closeElement();
            },

            RadioButton: function (node) {
                var attrs = node.Value ? '' : 'type="radio" value="' + node.Text +'" label="' + node.Text + '"';
                that.openElement('div', 'inputs', node, '', attrs);
                that.closeElement();
            },

            TabSet: function (node) {
                that.openElement('tabset', '', node);
                handleSub(node);
                that.closeElement();
            },

            Tab: function (node) {
                that.openElement('tab', '', node, '', 'heading="' + node.Text + '"', '');
                handleSub(node);
                that.closeElement();
            },

            TestDL: function (node) {
                that.openElement('test-dl', '', node);
                that.closeElement();
            },

            TextBox: function (node) {
                var attrs = 'type="text" placeholder="' + node.Text + '"'
                that.openElement('div', 'inputs', node, '', attrs, '');
                that.closeElement();
            },

            TimePicker: function (node) {
                that.openElement('time-picker', '', node, 'display:inline-block;');
                that.closeElement();
            },

            Unknown: function (node) {
                console.log("can't find control - " + node.UI)
            }




        };




        this.nodeHandlers = {
            Styles: require('./Styles').bind(that),

            Node: function (node) {

                var handleCb = function (result, Cb) {
                    return result += (result ? ';' : '') + that.CbHandlers[Cb.Fn](Cb);
                }

                var controlBlock = node.Cb ? 'control-block="' + _.reduce(node.Cb.length ? node.Cb : [node.Cb], handleCb, '') + '" ' : '';
                (that.UIHandlers[node.UI] || that.UIHandlers.Unknown).call(that, node, controlBlock);
            },
            Unknown: function (node, index) {
                console.log("can't recognize tag <" + index + ">.");
            }
        };


        this.handleNodes = function (node, index) {
            if (angular.isArray(node)) {
                _.each(node, that.handleNodes.bind({index: index}));
            } else {
                var handlers = that.nodeHandlers;
                (handlers[index] || handlers[this.index] || handlers.Unknown)(node, index);
            }
        };

        return this;




    })



    .service('ShadeParser', function (ShadeHandlers, ShadeStyles, ShadeElements) {



        this.parse = function (shd) {
            if (shd) {
                ShadeStyles.init();
                ShadeElements.init();

                _.each(shd.Shade, ShadeHandlers.handleNodes);
                return {
                    styles: ShadeStyles.getStyles(),
                    elements: ShadeElements.getElements()
                };
            }

        }

        return this;

    })

    //translations from shade attributes and styles to HTML
    .service('ShadeStaticHandlers', function() {

        this.attrNameHandlers = {
            vDL: '',
            vText: '',
            Name: 'id',
            vActiveTabIndex: '',
            CSpan: 'colspan',
            DefaultValue: 'dvalue',
            Maximum: 'max',
            Minimum: 'min',
            FormatString: 'format',
            Source: 'src',
            Text: '',
            vSub: ''

        };

        this.attrValueHandlers = {

        };

        this.styleNameHandlers = {
            Width: '',
            Height: '',
            Fg: 'color',
            Bg: 'background-color'

        };

        this.styleValueHandlers = {
            Width: function (width) { return width + "px"; },
            Height: function (height) { return height + "px"; }
        };



        return this;


    })

    //responsible for creating a global string of styles for elements to be appended to a <style> tag
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

    //creates an object describing an HTML page's element hierarchy.
    // This is later fed to the template that generates the HTML
    .service('ShadeElements', function (ShadeStyles) {

        var classCount = 0,
            elmId = 0,
            elements = [],
            currentElement = {nodes: elements};


        //wrappers for creating HTML elements. Creates enumerated CSS classes for each element with style(s).
        this.openElement = function (elmName, className, node, customStyles, customAttr, content, close) {

            var nativeStyles = _.reduce(node, ShadeStyles.handleStyles, ''),
                nativeClass = ((nativeStyles || customStyles) ? "class" + ++classCount : ''),
                node = node || {};
            cur = currentElement.nodes.push({
                elmName: elmName,
                nativeClass: nativeClass + (node.Style ? (' ' + node.Style) : ''),
                'className' : className,
                node: node,
                customStyles: customStyles,
                customAttr: customAttr,
                content: angular.isDefined(content) ? content : node.Text,
                nodes: [],
                parent: currentElement,
                id: ++elmId,
                close: _.isUndefined(close)

            });
            if (customStyles || nativeStyles) {
                ShadeStyles.addStyles(nativeClass, (customStyles || '') + (nativeStyles || ''));
            }

            currentElement = currentElement.nodes[cur - 1];



        };

        this.closeElement = function () {
            currentElement = currentElement.parent;
        };

        this.getCurrent = function () {
            return currentElement;
        }

        this.getElements = function () {
            return elements;
        };

        this.init = function () {
            classCount = 0;
            elmId = 0;
            elements = [];
            currentElement = {nodes: elements};
        };

        return this;

    })

},{"./DropDown":1,"./Grid":2,"./Styles":3}]},{},[4])