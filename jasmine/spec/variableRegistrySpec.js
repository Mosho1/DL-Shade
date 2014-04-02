/**
 * Created by Mosho on 4/2/14.
 */
describe("VariableEntry", function () {
    it("should create an empty entry", function () {
        var entry = new VariableEntry();
        expect(entry.name).toEqual('');
        expect(entry.expr).toEqual('');
        expect(entry.value).toEqual(null);
        expect(entry.setValue).toEqual(null);
        expect(entry.dependsOn).toEqual([]);
        expect(entry.dependedOnBy).toEqual([]);
    });
});