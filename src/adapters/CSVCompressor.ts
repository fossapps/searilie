import {IAdapter, IObject, ISchema, TIdentifier, ValueType} from "../Searilie";
import {Validator} from "../validation/Validator";

export class CSVCompressor implements IAdapter {
    private static encodeObject(obj: IObject): string {
        return Object.keys(obj).sort().map((x) => obj[x]).join(",");
    }

    private static isValid(object: IObject[]): boolean {
        return Validator.validateArray(object);
    }

    private static parse(text: string, schema: ISchema): IObject {
        const object: IObject = {};
        const parts = text.split(",");
        Object.keys(schema).sort().forEach((key: string, index: number) => {
            object[key] = schema[key] === ValueType.Number ? parseInt(parts[index], 10) : parts[index];
        });
        return object;
    }

    public deserialize(text: string, schema: ISchema): IObject[] {
        const schemaLength = Object.keys(schema).length;
        const payloadSections = text.split(";");
        if (!payloadSections.every((x) => x.split(",").length === schemaLength)) {
            throw new Error("invalid text");
        }
        return payloadSections.map((section: string) => CSVCompressor.parse(section, schema));
    }

    public getIdentifier(): TIdentifier {
        return "B";
    }

    public serialize(object: IObject[]): string {
        if (!CSVCompressor.isValid(object)) {
            throw new Error("Invalid data");
        }
        return object.map(CSVCompressor.encodeObject).join(";");
    }
}
