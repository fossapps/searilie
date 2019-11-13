import {IAdapter, IObject, ISchema, TIdentifier} from "../Searilie";
import {chunkText, ExtractText} from "../utils/ChunkText";
import {Validator} from "../validation/Validator";

type KeyLengthFactory = (key: string) => number;

export class TinyNumberCompressor implements IAdapter {
    constructor(private keyLengthFactory: KeyLengthFactory) {
        this.encodeObject = this.encodeObject.bind(this);
    }

    public static getMaxNumberForNumberOfCharacters(numOfChars: number): number {
        return (36 ** numOfChars) - 1;
    }

    public deserialize(text: string, schema: ISchema): IObject[] {
        const charLengthForSchema = this.getCharLengthForSchema(schema);
        if (text.length % charLengthForSchema !== 0) {
            throw new Error("invalid data");
        }
        // chunk items
        const chunks = chunkText(text, charLengthForSchema);
        // each chunk needs to be deserialized and returned
        // this means it's valid
        return chunks.map((x) => this.decodeChunk(x, schema));
    }

    public getIdentifier(): TIdentifier {
        return "C";
    }

    public serialize(object: IObject[]): string {
        // validate first,
        if (!this.isValid(object)) {
            throw new Error("invalid data");
        }
        return object.map(this.encodeObject).join("");
    }

    private getCharLengthForSchema(schema: ISchema): number {
        return Object.keys(schema).map((x) => this.keyLengthFactory(x)).reduce((a, b) => a + b, 0);
    }

    private encodeObject(object: IObject): string {
        return Object.keys(object).sort().map((x) => {
            const length = this.keyLengthFactory(x);
            return (object[x] as number).toString(36).padStart(length, "0");
        }).join("");
    }

    private isValid(object: IObject[]): boolean {
        return Validator.validateArray(object, (value, key) => {
            if (typeof value !== "number") {
                return false;
            }
            const spaceAllocatedForKey = this.keyLengthFactory(key);
            const maxValueForKeySize = TinyNumberCompressor.getMaxNumberForNumberOfCharacters(spaceAllocatedForKey);
            return value <= maxValueForKeySize;
        });
    }

    private decodeChunk(chunk: string, schema: ISchema): IObject {
        const object: IObject = {};
        const textExtractor = new ExtractText(chunk);
        const keys = Object.keys(schema).sort();
        for (const key of keys) {
            const length = this.keyLengthFactory(key);
            object[key] = parseInt(textExtractor.extract(length), 36);
        }
        return object;
    }
}
