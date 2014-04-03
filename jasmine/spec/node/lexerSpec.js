/**
 * Created by Mosho on 4/2/14.
 */

tokenise = require('../../../public/scripts/graph-dev/lexer.js').tokenise;


describe("lexer-test", function () {
    it("should lex DL code", function () {
         expect(tokenise("x=1;")).toBeNull();
    });

});
