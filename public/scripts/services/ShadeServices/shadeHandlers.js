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

        this.CbHandlers = {
            'SETDLVARIABLE': function (cb) {
                return cb.Event + ',setDL,' + cb.Stat.toLowerCase();
            },
            'SHOWPOPUP': function (cb) {
                return cb.Event + ',popup,' + cb.Stat.toLowerCase();

            }





        };

        this.UIHandlers = {

            Button: function (node, cb) {
                that.openElement('button', 'btn btn-default', node, '', cb, node.Text);
                that.closeElement();
            },

            'CheckBox': function (node) {
                that.openElement('input', '', node, '', 'type="checkbox"');
                that.closeElement();
            },

            'DropDown': require('./DropDown'),

            'Grid': require('./Grid'),

            'Label': function (node) {
                that.openElement('div', '', node);
                that.closeElement();
            },

            'ListBox': function (node) {
                that.openElement('select', '', node, '', 'multiple');
                handleSub(node);
                that.closeElement();
            },

            'ListItem' : function (node) {
                that.openElement('option', '', node);
                that.closeElement();
            },

            'MultiSelComboBox': _.partialRight(require('./DropDown'), true),

            'NumEdit': function (node) {
                that.openElement('input', '', node, '', 'type="text"');
                that.closeElement();
            },

            'Popup': function (node) {
                that.openElement('popup', '', node, 'display:none;');
                handleSub(node);
                that.closeElement();
            },

            'RadioButton': function (node) {
                var cur = that.getCurrent();
                that.openElement('input', '', node, '', 'type="radio" v-text="x" ng-value="' + cur.id + '"');
                that.closeElement();
            },

            'TabSet': function (node) {
                that.openElement('tabset', '', node);
                handleSub(node);
                that.closeElement();
            },

            'Tab': function (node) {
                that.openElement('tab', '', node, '', 'heading="' + node.Text + '"', '');
                handleSub(node);
                that.closeElement();
            },

            'TestDL': function (node) {
                that.openElement('test-dl', '', node);
                that.closeElement();
            },

            'Unknown': function (node) {
                console.log("can't find control - " + node.UI)
            }


        };




        this.nodeHandlers = {
            'Styles': require('./Styles').bind(that),

            'Node': function (node) {

                var handleCb = function (result, Cb) {
                    return result += (result ? ';' : '') + that.CbHandlers[Cb.Fn](Cb);
                }

                var controlBlock = node.Cb ? 'control-block="' + _.reduce(node.Cb.length ? node.Cb : [node.Cb], handleCb, '') + '" ' : '';
                (that.UIHandlers[node.UI] || that.UIHandlers.Unknown).call(that, node, controlBlock);
            },
            'Unknown': function (node, index) {
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
            'vActiveTabIndex': ''

        };

        this.attrValueHandlers = {

        };

        this.styleNameHandlers = {
            'Width': '',
            'Height': '',
            'Fg': 'color',
            'Bg': 'background-color'

        };

        this.styleValueHandlers = {
            'Width': function (width) { return width + "px"; },
            'Height': function (height) { return height + "px"; }
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
            elmId = 0,
            elements = [],
            currentElement = {'nodes': elements};


        //wrappers for creating HTML elements. Creates enumerated CSS classes for each element with style(s).
        this.openElement = function (elmName, className, node, customStyles, customAttr, content) {

            var nativeStyles = _.reduce(node, ShadeStyles.handleStyles, ''),
                nativeClass = ((nativeStyles || customStyles) ? "class" + ++classCount : '');
                cur = currentElement.nodes.push({
                    'elmName': elmName,
                    'nativeClass': nativeClass + (node.Style ? (' ' + node.Style) : ''),
                    'className' : className,
                    'node': node,
                    'customStyles': customStyles,
                    'customAttr': customAttr,
                    'content': angular.isDefined(content) ? content : node.Text,
                    'nodes': [],
                    'parent': currentElement,
                    'id': ++elmId

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
            currentElement = {'nodes': elements};
        };

        return this;

    })
