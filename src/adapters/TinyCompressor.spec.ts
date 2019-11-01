import {ValueType} from "../Searilie";
import {TinyCompressor} from "./TinyCompressor";

describe("TinyCompressor", () => {
    it("[important] should return an identifier", () => {
        // DO NOT CHANGE THIS TEST CASE once we change the identifier, all old values can't be deserialized
        const adapter = new TinyCompressor();
        expect(adapter.getIdentifier()).toBe("A");
    });
    it("throws error if invalid data", () => {
        const adapter = new TinyCompressor();
        expect(() => adapter.serialize([{a: "something"}])).toThrowError("Invalid data");
        expect(() => adapter.serialize([{a: "s"}])).not.toThrowError("Invalid data");
        expect(() => adapter.serialize([{a: 1}])).not.toThrowError("Invalid data");
        expect(() => adapter.serialize([{a: 10}])).toThrowError("Invalid data");
        expect(() => adapter.serialize([{a: 9}])).not.toThrowError("Invalid data");
        expect(() => adapter.serialize([{a: 9}, {a: 1, b: 2}])).toThrowError("Invalid data");
        expect(() => adapter.serialize([{a: "9"}])).not.toThrowError("Invalid data");
        expect(() => adapter.serialize([{a: ""}])).toThrowError("Invalid data");
    });
    it("should compress data according to spec", () => {
        const adapter = new TinyCompressor();
        expect(adapter.serialize([{a: "s"}])).toBe("s");
        expect(adapter.serialize([{a: 1}])).toBe("1");
        expect(adapter.serialize([{c: 1, a: 2}])).toBe("21");
        expect(adapter.serialize([{c: 1, a: 2}, {a: 2, c: 3}])).toBe("2123");
        expect(adapter.serialize([{c: 1, a: 2, e: "v"}, {a: 2, c: 3, e: "c"}])).toBe("21v23c");
    });
    it("should throw error if schema and payload doesn't match", () => {
        const adapter = new TinyCompressor();
        expect(() => adapter.deserialize("s", {a: ValueType.String, b: ValueType.String})).toThrowError("invalid text");
        expect(() => adapter.deserialize("sbc", {a: ValueType.String, b: ValueType.String})).toThrowError("invalid text");
        expect(() => adapter.deserialize("sceef", {a: ValueType.String, b: ValueType.String, c: ValueType.String})).toThrowError("invalid text");
    });
    it("should decompress data according to spec", () => {
        const adapter = new TinyCompressor();
        expect(adapter.deserialize("s", {a: ValueType.String})).toStrictEqual([{a: "s"}]);
        expect(adapter.deserialize("st", {a: ValueType.String})).toStrictEqual([{a: "s"}, {a: "t"}]);
        expect(adapter.deserialize("s", {a: ValueType.String})).toStrictEqual([{a: "s"}]);
        expect(adapter.deserialize("suv", {a: ValueType.String})).toStrictEqual([{a: "s"}, {a: "u"}, {a: "v"}]);
        expect(adapter.deserialize("supe", {a: ValueType.String, b: ValueType.String})).toStrictEqual([{a: "s", b: "u"}, {a: "p", b: "e"}]);
        expect(adapter.deserialize("s2p2", {a: ValueType.String, b: ValueType.Number})).toStrictEqual([{a: "s", b: 2}, {a: "p", b: 2}]);
    });
});
