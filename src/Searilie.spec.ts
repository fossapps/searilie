import {TinyCompressor} from "./adapters/TinyCompressor";
import {IAdapter, IObject, Searilie, ValueType} from "./Searilie";

describe("Searilie", () => {
    it("should throw error if payload is wrong", () => {
        const serializer = new Searilie(undefined as any);
        expect(() => serializer.decode("", {a: ValueType.Number})).toThrowError("Invalid payload");
    });
    it("should throw error if identifier mismatches", () => {
        const mockAdapter: IAdapter = {
            deserialize: (): IObject[] => [{a: "2"}],
            getIdentifier: () => "A",
            serialize: () => "something"
        };
        const serializer = new Searilie(mockAdapter);
        expect(serializer.encode([{a: "s"}])).toBe("Asomething");
        expect(() => serializer.decode("Bs", {a: ValueType.String})).toThrowError("adapter mismatched");
    });
    it("should deserialize using adapter", () => {
        const mockAdapter: IAdapter = {
            deserialize: (): IObject[] => [{a: 2}],
            getIdentifier: () => "Z",
            serialize: () => "something"
        };
        const serializer = new Searilie(mockAdapter);
        expect(serializer.decode("Z23", {a: ValueType.Number})).toStrictEqual([{a: 2}]);
    });
    describe("Integration with TinyCompressor", () => {
        const serializer = new Searilie(new TinyCompressor());
        expect(serializer.encode([{a: "h", b: 2}])).toEqual("Ah2");
        expect(serializer.decode("Ah2", {a: ValueType.String, b: ValueType.Number})).toStrictEqual([{a: "h", b: 2}]);
    });
});
