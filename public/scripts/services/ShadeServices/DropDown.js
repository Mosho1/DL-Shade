module.exports = function (node) {

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

    this.openElement('drop-down', '', node, '', "header=" + items[0] + " items=" + items[1] + " options=" + options);
    this.closeElement();

}