angular.module('ShadeServices', [])

    .service('ShadeHandlers', function (ShadeElements, ShadeStyles) {

        this.openElement = ShadeElements.openElement;
        this.closeElement = ShadeElements.closeElement;
        this.addStyles = ShadeStyles.addStyles;
        var that = this;

        this.CbHandlers = {
            'SETDLVARIABLE': function (cb) {
                return 'control-block="' + cb.Event + ',setDL,' + cb.Stat  + '" ';
            },
            'SHOWPOPUP': {}





        };

        this.UIHandlers = {
            'Grid': require('./Grid'),

            DropDown: require('./DropDown'),

            Button: function (node, cb) {
                that.openElement('button', 'btn btn-default', node, '', cb, node.Text);
                that.closeElement();
            },

            'TestDL': function (node) {
                that.openElement('test-dl', '', node, '');
                that.closeElement();
            },

            'Label': function (node) {
                that.openElement('div', '', node, '');
                that.closeElement();
            },

            'NumEdit': function (node) {
                that.openElement('num-edit', '', node, '');
                that.closeElement();
            }


        };


        this.nodeHandlers = {
            'Styles': require('./Styles').bind(that),

            'Node': function (node) {
                var controlBlock = node.Cb ? that.CbHandlers[node.Cb.Fn](node.Cb) : '';
                that.UIHandlers[node.UI].call(that, node, controlBlock);
            },
            'Unknown': function (node) {
                console.log("can't recognize tag <" + node + ">.");
            }
        };

    return this;


    })



    .service('ShadeParser', function (ShadeHandlers, ShadeStyles, ShadeElements) {

        var handleNodes = function (node, index) {
            if (node.length) {
                _.each(node, handleNodes.bind({index: index}));
            } else {
                var handlers = ShadeHandlers.nodeHandlers;
                (handlers[index] || handlers[this.index] || handlers.Unknown)(node);
            }
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


    .service('ShadeStaticHandlers', function() {

        this.attrNameHandlers = {
            'vDL': '',
            'vText': '',
            'Name': 'id',

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
