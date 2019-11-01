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

export class Searilie {
    constructor(private adapter: IAdapter) {}
    public encode(object: IObject[]): string {
        return `${this.adapter.getIdentifier()}${this.adapter.serialize(object)}`;
    }
    public decode(value: string, schema: ISchema): IObject[] {
        if (value.length === 0) {
            throw new Error("Invalid payload");
        }
        const [firstCharacter, ...rest] = value;
        if (this.adapter.getIdentifier() !== firstCharacter) {
            throw new Error("adapter mismatched");
        }
        return this.adapter.deserialize(rest.join(""), schema);
    }
}
