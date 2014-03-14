
var f = {
    a2l: function(args) {
        rv = "";
        for (var v in args[0]) {
            if (typeof args[0][v] === 'object')
                rv+=this.a2l(args[0][v]) + args[1];
            else
                rv+=args[0][v] + args[1];
        }
        return rv.slice(0, - 1);
    },

    abs: function(num) {
        return Math.abs(num);
    },

    arrayLength: function(arr){
      return Object.keys(arr).length;
    },

    arrayContainsIndex: function(arr, ind) {
        for (var v in arr)
            if (arr[v] === ind) return true;
        return false;
    },

    avg: function() {
        var avg=0, num=0, len=arguments.length;
        for (var i = 0; i < arguments.length; i++) {
            num = Number(arguments[i]);
            if (num) //if argument is valid add to avg calculation
                avg+=num;
            else len--; //if argument is invalid, ignore it
        }
        return avg/len;
    },

    avgList: function(list,delim) {
        if (typeof list !== 'string'){
            console.log("avgList must be called with a list");
            return; }
        if (!delim){
            console.log("avgList must be called with a delimiter");
            return; }
        var arr = list.split(delim);
        var sum = arr.reduce(function(a, b) { return Number(a) + Number(b) });
        return sum / arr.length;
    }
}




module.exports = f;


