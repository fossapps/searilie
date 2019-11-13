import {IObject} from "../Searilie";

const yes = () => true;

type TValueValidator = (value: string | number, key: string) => boolean;
// tslint:disable-next-line:no-unnecessary-class
export class Validator {
    public static isSupported(object: IObject, valueValidator: TValueValidator = yes): boolean {
        return Object.keys(object).every((x) => {
            return (typeof object[x] === "string" || typeof object[x] === "number") && valueValidator(object[x], x);
        });
    }
    public static validateArray(object: IObject[], valueValidator?: TValueValidator): boolean {
        if (object.length === 0) {
            return true;
        }
        const firstItem = object[0];
        const lengthOfFirstItem = Object.keys(firstItem).length;
        if (!object.every((x) => Object.keys(x).length === lengthOfFirstItem)) {
            return false;
        }
        const firstSignature = this.getSignature(firstItem);
        // now see if everything has same signature
        return object.every((x) => this.getSignature(x) === firstSignature && this.isSupported(x, valueValidator));
    }

    private static getSignature(object: IObject): string {
        return Object.keys(object).sort().join("");
    }
}
