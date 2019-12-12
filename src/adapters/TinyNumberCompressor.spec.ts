import {ValueType} from "../Searilie";
import {TinyNumberCompressor} from "./TinyNumberCompressor";

describe("TinyNumberCompressor", () => {
    it("PadStart should work ", () => {
        expect(TinyNumberCompressor.leftPad("0", 3, "a")).toBe("aa0");
    });

    it("should be defined", () => {
        expect(TinyNumberCompressor).toBeDefined();
    });

    it("[important] should return an identifier", () => {
        // DO NOT CHANGE THIS TEST CASE once we change the identifier, all old values can't be deserialized
        const adapter = new TinyNumberCompressor(jest.fn());
        expect(adapter.getIdentifier()).toBe("C");
    });

    describe("constructor", () => {
        it("should accept keyLengthFactoryFunction", () => {
            expect(() => new TinyNumberCompressor(jest.fn())).not.toThrow();
        });
    });

    describe("validation", () => {
        it("should throw error for string values", () => {
            const mockFn = jest.fn();
            const tinyNumberCompressor = new TinyNumberCompressor(mockFn);
            expect(() => tinyNumberCompressor.serialize([{a: "something"}])).toThrow();
            expect(() => tinyNumberCompressor.serialize([{a: "s"}])).toThrow();
        });

        it("should throw error if number doesn't fit in given number of spaces", () => {
            const mockFn = jest.fn(() => 1);
            const tinyNumberCompressor = new TinyNumberCompressor(mockFn);
            expect(() => tinyNumberCompressor.serialize([{a: 36}])).toThrow();
            expect(() => tinyNumberCompressor.serialize([{a: 35}])).not.toThrow();
            expect(mockFn).toHaveBeenCalled();
            // if mock returns 2 it can store upto 1295
            mockFn.mockImplementation(() => 2);
            expect(() => tinyNumberCompressor.serialize([{a: 36}])).not.toThrow();
            expect(() => tinyNumberCompressor.serialize([{a: 1295}])).not.toThrow();
            expect(() => tinyNumberCompressor.serialize([{a: 1296}])).toThrow();
        });
    });
    describe("TinyNumberCompressor encoding", () => {
        it("should be able to encode data", () => {
            const mockFn = jest.fn(() => 1);
            const tinyNumberCompressor = new TinyNumberCompressor(mockFn);
            expect(tinyNumberCompressor.serialize([])).toBe("");
            expect(tinyNumberCompressor.serialize([{a: 29, b: 18, c: 23, d: 34}])).toBe("tiny");
            mockFn.mockImplementation(() => 2);
            expect(tinyNumberCompressor.serialize([{a: 29, b: 18, c: 23, d: 34}])).toBe("0t0i0n0y");
            mockFn.mockImplementation((...args: any[]) => args[0] === "a" ? 2 : 1);
            expect(tinyNumberCompressor.serialize([{a: 29, b: 18, c: 23, d: 34}])).toBe("0tiny");
            expect(tinyNumberCompressor.serialize([{a: 630, b: 16, c: 17, d: 5}])).toBe("high5");
        });
    });
    describe("deserialization", () => {
        it("should throw error if length is mismatched", () => {
            const tinyNumberCompressor = new TinyNumberCompressor(jest.fn(() => 2));
            // we have 2 spaces, if we pass 1 or 3 character, it should be invalid
            expect(() => tinyNumberCompressor.deserialize("s", {a: ValueType.Number})).toThrow("invalid data");
            expect(() => tinyNumberCompressor.deserialize("dog", {a: ValueType.Number})).toThrow("invalid data");
            expect(() => tinyNumberCompressor.deserialize("dog", {a: ValueType.Number, b: ValueType.Number})).toThrow("invalid data");
            expect(() => tinyNumberCompressor.deserialize("dogs", {a: ValueType.Number, b: ValueType.Number})).not.toThrow("invalid data");
        });
        it("should deserialize correctly", () => {
            const tinyNumberCompressor = new TinyNumberCompressor(jest.fn(() => 2));
            // we have 2 spaces, if we pass 1 or 3 character, it should be invalid
            expect(tinyNumberCompressor.deserialize("dogs", {a: ValueType.Number, b: ValueType.Number})).toStrictEqual([{a: 492, b: 604}]);
        });
    });
});
