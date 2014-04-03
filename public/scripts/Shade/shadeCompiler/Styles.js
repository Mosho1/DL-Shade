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