
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