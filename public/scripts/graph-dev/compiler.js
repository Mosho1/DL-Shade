

var parser       = require('./parser').parser,
    nodes        = require('./nodes'),
    lexer        = require('./lexer'),
    astValidator = require('./ast-validator'),
    jsCompiler   = require('./js-compiler');

//Attaches handlers to the parser
parser.yy = nodes;


//Functions required by the parser's lexer.
parser.lexer = {

    lex: function () {
        var token = this.tokens[this.pos] ? this.tokens[this.pos++] : ['EOF'];
        this.yytext = token[1];
        this.yylineno = token[2];
        return token[0];
    },

    setInput: function (tokens) {
        this.tokens = tokens;
        this.pos = 0;
    },

    upcomingInput: function () {
        return "";
    }

};

exports.parser = parser;


//This is the function used by the `Graph` class to compile DL.
exports.compile = function (code) {
    var tokens = lexer.tokenise(code),
        ast = parser.parse(tokens),
    //TODO: make necessary changes to `astValidator` to output errors in the provided DL code.
    /*var valid = astValidator.validate(ast);
3
    if (!valid) {
        console.log("Didn't compile due to code error");
    }
          */
        js = jsCompiler.compile(ast);

    return js;
};