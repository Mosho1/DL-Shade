/*!
 DLengine lexer

 TODO: So much similar code in this file, there must be a way to refactor this
*/


var LONG       = /^[0-9]+/,
    DOUBLE     = /^[0-9]+\.[0-9]+/,
    STRING     = /^(\'|\")(\\.|[^\"])*(\'|\")/,
    WHITESPACE = /^[^\n\S]+/,
    KEYWORD    = /^([a-z]+)/ig,
    IDENTIFIER = /^(([a-z])([a-z0-9_$])*)/ig,
    TERMINATOR = /^(\n|;)/,
    MULTILINE_COMMENT = /^\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\//gm,
    SINGLELINE_COMMENT = /^((\/\/|#)).*$/;

var KEYWORDS = [
    // values
    "print",
    "var",
    "val",

    // control
    "if",
    "else",

    // language
    "fun",
    "class",
    "public",
    "new"
];

var SYNTAX = [
    '{', '}',
    '(', ')',
    '[', ']',
    '!',
    '.',
    ',',
    ':',
    '?',
    "@",
    "$"
];

var LITERALS = {

    COMPARE: [
        "===",
        "!==",
        "==",
        "!=",
        "<=",
        ">=",
        "<",
        ">"
    ],

    BOOLOP: [
        '||',
        '&&'
    ],

    BOOLEAN: [
        "true",
        "false"
    ],

     ASSIGN: [
    //     "+=",
    //     "-=",
    //     "*=",
    //     "/=",
         "="
     ],

    MATH: [
        "*",
        "/",
        "^",
        "%",
        "+",
        "-"
    ]




    // INDENT: [ '{' ],
    // DEDENT: [ '}' ]

};

var Lexer = function(){};

Lexer.prototype = {

    tokenise: function(code) {
        this.lineNo = 0;
        var chunk, tokens = [], i = 0, token;

        chunk = code.substring(i);
        


        while (i < code.length) {
            chunk = code.substring(i);

            // Discard whitespace
            token = this.whitespace(chunk);
            if (token.length === 2) {
                i += token[1].length;

                continue;
            }

            token = this.comments(chunk);
            if (token.length == 2) {
                i += token[1].length;
                this.lineNo = token[1].split("\n").length - 1;
                continue;
            }

            // Test for literal
            token = this.literals(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                tokens.push(token);
                continue;
            }

            // Test for keyword
            token = this.keyword(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                tokens.push(token);
                continue;
            }

            // Test for identifier (variable name, method name, etc)
            token = this.identifier(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                tokens.push(token);
                continue;
            }

            // Test for statement terminators
            token = this.terminator(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                if (tokens.length!=0) //discard newlines at beginning of document
                    tokens.push(token);

                if (token[1] == "\n") {
                    this.lineNo += 1;
                }

                continue;
            }

            // Test for syntax
            token = this.syntax(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                tokens.push(token);
                continue;
            }

            // Test for string
            token = this.string(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                tokens.push(token);
                continue;
            }

            // Test for long
            token = this.long(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                tokens.push(token);
                continue;
            }

            // Test for double
            token = this.double(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                tokens.push(token);
                continue;
            }

            // Test for boolean
            token = this.boolean(chunk);
            if (token.length === 2) {
                i += token[1].length;
                token[2] = this.lineNo;
                tokens.push(token);
                continue;
            }

            console.log("Could not match chunk starting with " + chunk[0] + "...skipping");
            i += 1;
        }

        tokens.push(['EOF', '', this.lineNo]);

        return tokens;
    },

    syntax: function(chunk)
    {
        var token = [];

        _.find(SYNTAX, function(syntax) {
            if (chunk.indexOf(syntax) === 0) {
                token = [syntax, syntax];
                return true;
            }
        }, this);

        return token;
    },

    comments: function(chunk)
    {
        var token = [];

        _.find([SINGLELINE_COMMENT, MULTILINE_COMMENT], function(regex) {
            if (chunk.search(regex) === 0) {
                var result = chunk.match(regex)[0];

                token = ["COMMENT", result];
                return true;
            }
        });

        return token;
    },

    keyword: function(chunk) {
        if (chunk.search(KEYWORD) === 0) {
            var result = chunk.match(KEYWORD)[0];
            var index = KEYWORDS.indexOf(result);

            if (index !== -1) {
                return [result.toUpperCase(), result];
            }
        }

        return [];
    },

    identifier: function(chunk) {
        if (chunk.search(IDENTIFIER) === 0) {
            var result = chunk.match(IDENTIFIER)[0];

            return ["IDENTIFIER", result];
        }

        return [];
    },

    whitespace: function(chunk) {
        if (chunk.search(WHITESPACE) === 0) {
            var result = chunk.match(WHITESPACE)[0];

            return ["WHITESPACE", result];
        }

        return [];
    },

    long: function(chunk) {
        if (chunk.search(LONG) === 0) {
            var result = chunk.match(LONG)[0];

            return ["LONG", result];
        }

        return [];
    },

    double: function(chunk) {
        if (chunk.search(DOUBLE) === 0) {
            var result = chunk.match(DOUBLE)[0];

            return ["DOUBLE", result];
        }

        return [];
    },

    boolean: function(chunk) {
        if (chunk.search(BOOLEAN) === 0) {
            var result = chunk.match(BOOLEAN)[0];

            return ["BOOLEAN", result];
        }

        return [];
    },

    literals: function(chunk) {
        var token = [];

        _(LITERALS).find(function(lits, name) {
            return _(lits).find(function(lit) {
                if (chunk.indexOf(lit) === 0) {
                    token = [name, lit];
                    return true;
                }
            });
        });

        return token;
    },

    string: function(chunk) {
        if (chunk.search(STRING) === 0) {
            var result = chunk.match(STRING)[0];

            return ["STRING", result];
        }

        return [];
    },

    terminator: function(chunk) {
        if (chunk.search(TERMINATOR) === 0) {
            return ['TERMINATOR', chunk[0]];
        }

        return [];
    }

};

exports.Lexer = Lexer;

exports.tokenise = function(code) {
    var lexer = new Lexer();
    return lexer.tokenise(code);
};