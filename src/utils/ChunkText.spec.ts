import {chunkText, ExtractText} from "./ChunkText";

describe("ChunkText", () => {
    it("should be able to chunk text into parts", () => {
        expect(chunkText("abcdef", 3)).toStrictEqual(["abc", "def"]);
        expect(chunkText("abcde", 3)).toStrictEqual(["abc", "de"]);
    });
});

describe("ExtractText", () => {
    it("should be able to extract one by one", () => {
        const textExtractor = new ExtractText("testText");
        expect(textExtractor.extract(2)).toBe("te");
        expect(textExtractor.extract(2)).toBe("st");
        expect(textExtractor.extract(1)).toBe("T");
        expect(textExtractor.extract(5)).toBe("ext");
    });
});
