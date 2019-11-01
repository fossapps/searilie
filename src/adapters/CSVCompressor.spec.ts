import {ValueType} from "../Searilie";
import {CSVCompressor} from "./CSVCompressor";

describe("CSVCompressor", () => {
    it("[important] should identify itself as B", () => {
        // DO NOT CHANGE THIS TEST CASE once we change the identifier, all old values can't be deserialized
        const adapter = new CSVCompressor();
        expect(adapter.getIdentifier()).toBe("B");
    });
    it("should throw error if data is invalid", () => {
        const adapter = new CSVCompressor();
        expect(() => adapter.serialize([{a: "something"}])).not.toThrowError("Invalid data");
        expect(() => adapter.serialize([{a: 9}, {a: 1, b: 2}])).toThrowError("Invalid data");
        expect(() => adapter.serialize([{a: 10}])).not.toThrowError("Invalid data");
        expect(() => adapter.serialize([{a: 9}])).not.toThrowError("Invalid data");
        expect(() => adapter.serialize([{a: "9", b: false} as any])).toThrowError("Invalid data");
    });
    describe("serialization", () => {
        it("should serialize according to the following spec", () => {
            const adapter = new CSVCompressor();
            expect(adapter.serialize([{a: "something"}])).toBe("something");
            expect(adapter.serialize([{a: 1, b: 23}])).toBe("1,23");
            expect(adapter.serialize([{c: 1, a: 2}])).toBe("2,1");
            expect(adapter.serialize([{c: 88, a: 20}, {a: 25, c: 34}])).toBe("20,88;25,34");
            expect(adapter.serialize([{c: "apples", a: "balls", e: "volleyball"}, {a: 22, c: "3", e: "cat"}])).toBe("balls,apples,volleyball;22,3,cat");
            expect(adapter.serialize([{c: "", a: "balls", e: "volleyball"}, {a: 22, c: "3", e: "cat"}])).toBe("balls,,volleyball;22,3,cat");
            expect(adapter.serialize([{c: "apples", a: "", e: "volleyball"}, {a: 22, c: "3", e: "cat"}])).toBe(",apples,volleyball;22,3,cat");
        });
    });
    describe("deserialization", () => {
        it("should throw error if schema doesn't match", () => {
            const adapter = new CSVCompressor();
            expect(() => adapter.deserialize("s", {a: ValueType.String, b: ValueType.String})).toThrowError("invalid text");
            expect(() => adapter.deserialize("s,b,c", {a: ValueType.String, b: ValueType.String})).toThrowError("invalid text");
            expect(() => adapter.deserialize("s,c,e,ef", {a: ValueType.String, b: ValueType.String, c: ValueType.String})).toThrowError("invalid text");
            expect(() => adapter.deserialize("ss", {a: ValueType.String, b: ValueType.String})).toThrowError("invalid text");
            expect(() => adapter.deserialize("ss,be", {a: ValueType.String, b: ValueType.String})).not.toThrowError("invalid text");
            expect(() => adapter.deserialize("s,b", {a: ValueType.String, b: ValueType.String})).not.toThrowError("invalid text");
            expect(() => adapter.deserialize("s,c,ef", {a: ValueType.String, b: ValueType.String, c: ValueType.String})).not.toThrowError("invalid text");
            expect(() => adapter.deserialize("s,,ef", {a: ValueType.String, b: ValueType.String, c: ValueType.String})).not.toThrowError("invalid text");
        });
        it("should deserialize according to specs", () => {
            const adapter = new CSVCompressor();
            expect(adapter.deserialize("s", {a: ValueType.String})).toStrictEqual([{a: "s"}]);
            expect(adapter.deserialize("s,b,c", {a: ValueType.String, b: ValueType.String, e: ValueType.String})).toStrictEqual([{a: "s", b: "b", e: "c"}]);
            expect(adapter.deserialize("s,c;e,ef", {a: ValueType.String, b: ValueType.String})).toStrictEqual([{a: "s", b: "c"}, {a: "e", b: "ef"}]);
            expect(adapter.deserialize("ss", {a: ValueType.String})).toStrictEqual([{a: "ss"}]);
            expect(adapter.deserialize("ss,be", {a: ValueType.String, b: ValueType.String})).toStrictEqual([{a: "ss", b: "be"}]);
            expect(adapter.deserialize("s,c,ef", {a: ValueType.String, b: ValueType.String, c: ValueType.String})).toStrictEqual([{a: "s", b: "c", c: "ef"}]);
            expect(adapter.deserialize("s,,ef", {a: ValueType.String, b: ValueType.String, c: ValueType.String})).toStrictEqual([{a: "s", b: "", c: "ef"}]);
            expect(adapter.deserialize("1,50,ef", {a: ValueType.String, b: ValueType.String, c: ValueType.String})).toStrictEqual([{a: "1", b: "50", c: "ef"}]);
            expect(adapter.deserialize("1,50,ef", {a: ValueType.Number, b: ValueType.Number, c: ValueType.String})).toStrictEqual([{a: 1, b: 50, c: "ef"}]);
        });
    });
});
