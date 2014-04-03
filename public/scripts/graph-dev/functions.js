
var f = {
    a2l: function (arr, delim) {
        return arr.join(delim);
    },

    abs: function (num) {
        return Math.abs(num);
    },

    avg: function () {
        var i, avg = 0, num = 0, len = arguments.length;
        for (i = 0; i < arguments.length; i++) {
            num = Number(arguments[i]);
            !isNaN(num) ? avg += num : len--;
        }
        return avg / len;
    }
}




module.exports = f;


