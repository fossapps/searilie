import {CSVCompressor, TinyCompressor} from "./adapters";
import {HEADER_SEPARATOR, INTEGER_IDENTIFIER, PAYLOAD_SEPARATOR} from "./constants";
import {IAdapter, IObject, Searilie, ValueType} from "./Searilie";

describe("Searilie", () => {
    it("should throw error if payload is wrong", () => {
        const serializer = new Searilie(undefined as any);
        expect(() => serializer.decode("", {a: ValueType.Number})).toThrowError("Invalid payload");
    });
    it("should throw error if identifier mismatches", () => {
        const mockAdapter: IAdapter = {
            getIdentifier: () => "A",
            serialize: () => "something"
        } as any;
        const serializer = new Searilie(mockAdapter);
        expect(serializer.encode([{a: "s"}])).toBe("Asomething");
        expect(() => serializer.decode("Bs", {a: ValueType.String})).toThrowError("adapter mismatched");
    });
    it("should deserialize using adapter", () => {
        const mockAdapter: IAdapter = {
            deserialize: (): IObject[] => [{a: 2}],
            getIdentifier: () => "Z"
        } as any;
        const serializer = new Searilie(mockAdapter);
        expect(serializer.decode("Z23", {a: ValueType.Number})).toStrictEqual([{a: 2}]);
    });
    describe("Integration with TinyCompressor", () => {
        const serializer = new Searilie(new TinyCompressor());
        expect(serializer.encode([{a: "h", b: 2}])).toEqual("Ah2");
        expect(serializer.decode("Ah2", {a: ValueType.String, b: ValueType.Number})).toStrictEqual([{a: "h", b: 2}]);
    });
    describe("encode with headers", () => {
        it("should have headers while encoding", () => {
            const serializer = new Searilie(new TinyCompressor());
            expect(serializer.encodeWithHeaders([{a: "h", b: 2}])).toBe(`Aa${HEADER_SEPARATOR}${INTEGER_IDENTIFIER}b${PAYLOAD_SEPARATOR}h2`);
        });
    });
    describe("decode using headers", () => {
        it("should throw error if wrong adapter", () => {
            const adapter: IAdapter = {
                deserialize: jest.fn(() => [{a: 2}]),
                getIdentifier: jest.fn(() => "Z")
            } as any;
            const serializer = new Searilie(adapter);
            expect(() => serializer.decodeUsingHeaders(`Aa,${INTEGER_IDENTIFIER}b:h2`)).toThrow("adapter mismatched");
        });
        it("should be able to decode properly", () => {
            const adapter: IAdapter = {
                deserialize: jest.fn(() => [{a: 2}]),
                getIdentifier: jest.fn(() => "A")
            } as any;
            const serializer = new Searilie(adapter);
            expect(serializer.decodeUsingHeaders(`Aa,${INTEGER_IDENTIFIER}b:h2`)).toStrictEqual([{a: 2}]);
        });
    });
    describe("decode and encode with headers", () => {
        it("should decode and encode properly", () => {
            const tinySerializer = new Searilie(new TinyCompressor());
            const csv = new Searilie(new CSVCompressor());
            expect(tinySerializer.encodeWithHeaders([{a: 2, b: 5}, {a: 3, b: 8}])).toBe(`A${INTEGER_IDENTIFIER}a${HEADER_SEPARATOR}${INTEGER_IDENTIFIER}b${PAYLOAD_SEPARATOR}2538`);
            expect(csv.encodeWithHeaders([{a: "23", b: 2}, {a: "35", b: 100}])).toBe(`Ba${HEADER_SEPARATOR}${INTEGER_IDENTIFIER}b${PAYLOAD_SEPARATOR}23,2;35,100`);
        });
    });
});
