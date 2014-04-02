
var f = {
    a2l: function(arr, delim) {
        return arr.join(delim);
    },

    abs: function(num) {
        return Math.abs(num);
    },

    avg: function() {
        var avg=0, num=0, len=arguments[0].length;
        for (var i = 0; i < arguments[0].length; i++) {
            num = Number(arguments[0][i]);
            if (num) //if argument is valid add to avg calculation
                    avg+=num;
            else len--; //if argument is invalid, ignore it
        }
        return avg/len;            
    }
}




module.exports = f;


