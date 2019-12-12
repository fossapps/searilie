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

    private static leftStart(text: string, targetLength: number, padString: string = ""): string {
        // tslint:disable-next-line:no-bitwise
        targetLength = targetLength >> 0; // truncate if number, or convert non-number to 0;
        if (this.length >= targetLength) {
            return String(text);
        } else {
            targetLength = targetLength - text.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); // append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(text);
        }
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
            const str = (object[x] as number).toString(36);
            return TinyNumberCompressor.leftStart(str, length, "0");
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
