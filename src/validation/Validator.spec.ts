import {Validator} from "./Validator";

describe("ContainsSupportedValues", () => {
    it("should return true for string or numbers", () => {
        const a = {a: "abc", tiny: "awesome", something: 1};
        expect(Validator.isSupported(a)).toBeTruthy();
    });
    it("should return false if any of value is boolean, or nested object", () => {
        expect(Validator.isSupported({a: "abc", tiny: "awesome", something: false} as any)).toBeFalsy();
        expect(Validator.isSupported({a: "abc", tiny: "awesome", something: {key: "s"}} as any)).toBeFalsy();
        expect(Validator.isSupported({a: "abc", tiny: "awesome", something: jest.fn()} as any)).toBeFalsy();
    });
    it("should use validator function to validate values", () => {
        const falsyMock = jest.fn(() => false);
        const truthyMock = jest.fn(() => true);
        expect(Validator.isSupported({a: "abc", tiny: "awesome", value: 1}, falsyMock)).toBeFalsy();
        expect(Validator.isSupported({a: "abc", tiny: "awesome", value: 3}, truthyMock)).toBeTruthy();
        expect(Validator.isSupported({a: "abc", tiny: "awesome", value: 5}, falsyMock)).toBeFalsy();
    });
    describe("array validation", () => {
        it("should accept empty array", () => {
            expect(Validator.validateArray([])).toBeTruthy();
        });
        it("should be able to validate based on number of keys", () => {
            expect(Validator.validateArray([
                {a: "something"},
                {a: "good"},
                {a: "will"},
                {a: "happen"}
            ])).toBeTruthy();
            expect(Validator.validateArray([
                {a: "something", b: "awesome", c: "will"},
                {a: "happen"}
            ])).toBeFalsy();
            expect(Validator.validateArray([
                {a: "something"},
                {a: "awesome", b: "will", c: "happen"}
            ])).toBeFalsy();
        });
        it("should be able to match exact keys", () => {
            expect(Validator.validateArray([
                {c: "something", a: "awesome"},
                {a: "good", b: "something"},
                {a: "will", r: "good"},
                {a: "happen", c: "something"}
            ])).toBeFalsy();
            expect(Validator.validateArray([
                {a: "something"},
                {b: "good"},
                {a: "will"},
                {a: "happen"}
            ])).toBeFalsy();
            expect(Validator.validateArray([
                {c: "something", a: "awesome"},
                {a: "good", c: "something"},
                {a: "will", c: "good"},
                {a: "happen", c: "something"}
            ])).toBeTruthy();
        });
        it("should also validate if it's supported", () => {
            expect(Validator.validateArray([
                {c: "something", a: "awesome"},
                {a: "good", c: "something"},
                {a: "will", c: "good"},
                {a: "happen", c: false} as any
            ])).toBeFalsy();
            expect(Validator.validateArray([
                {c: "something", a: "awesome"},
                {a: "good", c: "something"},
                {a: "will", c: "good"},
                {a: "happen", c: {}} as any
            ])).toBeFalsy();
            const mockTruthy = jest.fn(() => true);
            const mockFalsy = jest.fn(() => false);
            expect(Validator.validateArray(
                [
                    {c: "something", a: "awesome"},
                    {a: "good", c: "something"},
                    {a: "will", c: "good"},
                    {a: "happen", c: "good"} as any
                ],
                mockTruthy)).toBeTruthy();
            expect(Validator.validateArray(
                [
                    {c: "something", a: "awesome"},
                    {a: "good", c: "something"},
                    {a: "will", c: "good"},
                    {a: "happen", c: "good"} as any
                ],
                mockFalsy)).toBeFalsy();
        });
    });
});
