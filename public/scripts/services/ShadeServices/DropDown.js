module.exports = function (node, wat, multiSelect) { //TODO: wat

    var items = node.Items.replace(/\s/g, '').split(/;+/),
        options = {},
        handleCol = function (col) {
            options[col.Name] = _.transform(_.omit(col, 'Name'), function (str, val, opt) {
                str.push(opt.charAt(0) + '=' + val);
            }, []);
        };

    items = [items[0], items.slice(1).join(',')];



    (function (c) {
        if (c && c.Col) {
            c.Col.length ? _.each(c.Col, handleCol) : handleCol(c.Col);

            options = (function (items, opts) {
                return items.map(function (item) {
                    return (opts[item] || []).join('&');
                }).join('|');
            }(items[0].split('|'), options));
        }
        }(node.Cols))

    this.openElement('drop-down', '', node, '', "multi-select = " + !!multiSelect + " header=" + items[0] + " items=" + items[1] + " options=" + options);
    this.closeElement();

}