import {HEADER_SEPARATOR, INTEGER_IDENTIFIER} from "./constants";

export interface IObject {
    [key: string]: number | string;
}
export interface ISchema {
    [key: string]: ValueType;
}
export enum ValueType {
    Number,
    String
}

export type TIdentifier = "A" | "B" | "C" | "D" | "E"
    | "F" | "G" | "H" | "I" | "J"
    | "K" | "L" | "M" | "N" | "O" |
    "P" | "Q" | "R" | "S" | "T" |
    "U" | "V" | "W" | "X" | "Y" | "Z";

export interface IAdapter {
    serialize(object: IObject[]): string;
    deserialize(text: string, schema: ISchema): IObject[];
    getIdentifier(): TIdentifier;
}
interface IPayloadInfo {
    identifier: TIdentifier;
    payload: string;
}

export class Searilie {
    constructor(private adapter: IAdapter) {}
    private static getIdentifierAndPayload(text: string): IPayloadInfo {
        if (text.length === 0) {
            throw new Error("Invalid payload");
        }
        const [firstCharacter, ...rest] = text;
        return {
            identifier: firstCharacter.toUpperCase() as TIdentifier,
            payload: rest.join("")
        };
    }
    public encodeWithHeaders(object: IObject[]): string {
        const headers = this.getHeaders(object);
        const encodedData = this.adapter.serialize(object);
        return `${this.adapter.getIdentifier()}${headers}:${encodedData}`;
    }

    public getSchemaFromHeaders(text: string): ISchema {
        const schema: ISchema = {};
        const headers = text.split(":")[0];
        headers.split(",").forEach((x) => {
            const [first, ...rest] = x;
            if (first === INTEGER_IDENTIFIER) {
                schema[rest.join("")] = ValueType.Number;
            } else {
                schema[x] = ValueType.String;
            }
        });
        return schema;
    }
    public decodeUsingHeaders(value: string): IObject[] {
        const schema = this.getSchemaFromHeaders(value.split(":")[0]);
        const {payload, identifier} = Searilie.getIdentifierAndPayload(value);
        if (this.adapter.getIdentifier() !== identifier) {
            throw new Error("adapter mismatched");
        }
        return this.adapter.deserialize(payload, schema);
    }
    public encode(object: IObject[]): string {
        return `${this.adapter.getIdentifier()}${this.adapter.serialize(object)}`;
    }

    public decode(value: string, schema: ISchema): IObject[] {
        const {payload, identifier} = Searilie.getIdentifierAndPayload(value);
        if (this.adapter.getIdentifier() !== identifier) {
            throw new Error("adapter mismatched");
        }
        return this.adapter.deserialize(payload, schema);
    }

    private getHeaders(objects: IObject[]): string {
        return Object.keys(objects[0])
            .sort()
            .map((x) => typeof objects[0][x] === "number" ? `${INTEGER_IDENTIFIER}${x}` : x)
            .join(HEADER_SEPARATOR);
    }
}
