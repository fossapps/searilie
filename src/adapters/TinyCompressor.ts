import {IAdapter, IObject, ISchema, TIdentifier, ValueType} from "../Searilie";
import {chunkText} from "../utils/ChunkText";
import {Validator} from "../validation/Validator";

export class TinyCompressor implements IAdapter {
    private static isValid(object: IObject[]): boolean {
        return Validator.validateArray(object, (value) => value.toString().length === 1);
    }

    private static encodeObject(obj: IObject): string {
        return Object.keys(obj).sort().map((x) => obj[x]).join("");
    }

    private static parseText(text: string, schema: ISchema): IObject {
        const object: IObject = {};
        Object.keys(schema).sort().forEach((key: string, index: number) => {
            object[key] = schema[key] === ValueType.Number ? parseInt(text[index], 10) : text[index];
        });
        return object;
    }

    public getIdentifier(): TIdentifier {
        return "A";
    }

    public deserialize(text: string, schema: ISchema): IObject[] {
        const numOfKeysInSchema = Object.keys(schema).length;
        if (text.length % numOfKeysInSchema !== 0) {
            throw new Error("invalid text");
        }
        const parts = chunkText(text, numOfKeysInSchema);
        return parts.map((part) => TinyCompressor.parseText(part, schema));
    }

    public serialize(object: IObject[]): string {
        if (!TinyCompressor.isValid(object)) {
            throw new Error("Invalid data");
        }
        return object.map((x) => TinyCompressor.encodeObject(x)).join("");
    }
}
