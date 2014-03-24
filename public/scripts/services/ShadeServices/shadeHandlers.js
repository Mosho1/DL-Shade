angular.module('ShadeServices', [])

    .service('ShadeHandlers', function (ShadeElements, ShadeStyles) {

        this.openElement = ShadeElements.openElement;
        this.closeElement = ShadeElements.closeElement;
        this.addStyles = ShadeStyles.addStyles;
        var that = this;

        this.CbHandlers = {
            'SETDLVARIABLE': function (cb) {
                return cb.Event + ',setDL,' + cb.Stat;
            },
            'SHOWPOPUP': function (cb) {
                return cb.Event + ',popup,' + cb.Stat;

            }





        };

        this.UIHandlers = {
            'Grid': require('./Grid'),

            DropDown: require('./DropDown'),

            Button: function (node, cb) {
                that.openElement('button', 'btn btn-default', node, '', cb, node.Text);
                that.closeElement();
            },

            'TestDL': function (node) {
                that.openElement('test-dl', '', node);
                that.closeElement();
            },

            'Label': function (node) {
                that.openElement('div', '', node);
                that.closeElement();
            },

            'NumEdit': function (node) {
                that.openElement('num-edit', '', node);
                that.closeElement();
            },

            'Popup': function (node) {
                that.openElement('popup', '', node, 'display:none;');
                _.each(((angular.isArray(node.Sub) ? node.Sub : {Node: node.Sub}) || {Node: {}}).Node, that.handleNodes);
                that.closeElement();
            }


        };




        this.nodeHandlers = {
            'Styles': require('./Styles').bind(that),

            'Node': function (node) {

                var handleCb = function (result, Cb) {
                    return result += (result ? ';' : '') + that.CbHandlers[Cb.Fn](Cb);
                }

                var controlBlock = node.Cb ? 'control-block="' + _.reduce(node.Cb.length ? node.Cb : [node.Cb], handleCb, '') + '" ' : '';
                that.UIHandlers[node.UI].call(that, node, controlBlock);
            },
            'Unknown': function (node) {
                console.log("can't recognize tag <" + node + ">.");
            }
        };

        this.handleNodes = function (node, index) {
            if (angular.isArray(node)) {
                _.each(node, that.handleNodes.bind({index: index}));
            } else {
                var handlers = that.nodeHandlers;
                (handlers[index] || handlers[this.index] || handlers.Unknown)(node);
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
