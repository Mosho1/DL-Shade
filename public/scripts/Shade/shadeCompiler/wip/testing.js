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
            return cb.Event + ',setDL,' + cb.Stat.toLowerCase();
        },
        SHOWPOPUP: function (cb) {
            return cb.Event + ',popup,' + cb.Stat.toLowerCase();

        }

    };
    //TODO: change arguments to handlers below from array to an object
    this.UIHandlers = {

        Button: function (node, cb) {
            that.openElement('button', 'btn btn-default', node, '', cb, node.Text);
            that.closeElement();
        },

        CheckBox: function (node) {
            var attrs = node.Value ? '' : ' label="' + node.Text + '"';
            that.openElement('check-box', '', node, '', attrs);
            that.closeElement();
        },

        DatePicker: function (node) {
            that.openElement('shd-date-picker', '', node, '');
            that.closeElement();

        },

        DropDown: require('./DropDown'),

        Grid: require('./Grid'),

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

        MultiSelComboBox: _.partialRight(require('./DropDown'), true),

        NumEdit: function (node) {
            that.openElement('num-edit', '', node);
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
            var attrs = node.Value ? '' : ' value="' + node.Text +'" label="' + node.Text + '"';
            that.openElement('radio-button', '', node, '', attrs);
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
            that.openElement('input', '', node, '', 'placeholder="' + node.Text + '"', '');
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




    nodeHandlers = {
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
            var handlers = nodeHandlers;
            (handlers[index] || handlers[this.index] || handlers.Unknown)(node, index);
        }
    };

    return this;




})