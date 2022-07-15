import {Thing} from "./thing.mjs";
import {freeze} from "./utils.mjs";
import {int, NumberThing, StringThing} from "./primitives.mjs";

export const Anything : Thing<any> = {
    inDomain(x: any): boolean {
        return true;
    },
    equals(x: any, y: any): boolean {
        return x === y || (Number.isNaN(x) && Number.isNaN(y));
    },
    compare(x: any, y: any): number {
        return Anything.equals(x, y) ? 0 : (x < y ? -1 : (x > y ? 1 : Number.NaN));
    },
    hashOf(x: any): int {
        switch (typeof(x)) {
            case "number": return NumberThing.hashOf(x);
            default: return StringThing.hashOf(String(x));
        }
    },
    clone(x: any) {
        return x;
    },
    immutable: true
};
freeze(Anything);
