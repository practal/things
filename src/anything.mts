import {Thing} from "./thing.mjs";
import {freeze} from "./utils.mjs";
import {int, NumberT, StringT} from "./primitives.mjs";

/** Provides default [[Thing]] functionality for the type `any`. */
export const Anything : Thing<any> = {
    /** Always returns true. */
    inDomain(x: any): boolean {
        return true;
    },
    /** This is the same as `===`, with the exception that `NaN` is considered to be equal to itself. */
    equals(x: any, y: any): boolean {
        return x === y || (Number.isNaN(x) && Number.isNaN(y));
    },
    /** Implemented as `Anything.equals(x, y) ? 0 : (x < y ? -1 : (x > y ? 1 : Number.NaN))`. */
    compare(x: any, y: any): number {
        return Anything.equals(x, y) ? 0 : (x < y ? -1 : (x > y ? 1 : Number.NaN));
    },
    hashOf(x: any): int {
        switch (typeof(x)) {
            case "undefined": return 42;
            case "number": return NumberT.hashOf(x);
            case "boolean": return x ? 43 : 44;
            case "string": 
            case "object": 
            case "symbol": 
            case "function": 
            case "bigint": return StringT.hashOf(String(x));
        }
    },
    /** This is just the identity. */
    clone(x: any) {
        return x;
    },
    /** Returns true. The reasoning here is that primitive values are immutable, and objects are also immutable if viewed as references. */
    immutable: true
};
freeze(Anything);
