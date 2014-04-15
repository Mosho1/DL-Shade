//Built-in DL functions
//====
var f = {
    //Turns an array into a list (string) delimited by `delim`
    a2l: function (arr, delim) {
        if (_.isArray(arr)) {
            return arr.join(delim);
        }
    },

    //Returns absolute value of `num`
    abs: function (num) {
        if (_.isFinite(num)) {
            return Math.abs(num);
        }
    },

    //Averages arguments sent.
    avg: function () {
        var i, avg = 0, num = 0, len = arguments.length;
        for (i = 0; i < arguments.length; i++) {
            num = Number(arguments[i]);
            //If `num` could not be converted to a number, ignore it
            !isNaN(num) ? avg += num : len--;
        }
        return avg / len;
    }
}




module.exports = f;


