import {Thing} from "./thing.mjs";
import {bigintHashSeed, combineHashes, falseHash, freeze, functionHashSeed, objectHashSeed, stringHashSeed, symbolHashSeed, trueHash, undefinedHash} from "./utils.mjs";
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
        function hash(seed : int) : int {
            return combineHashes([seed, StringT.hashOf(String(x))]);
        }
        switch (typeof(x)) {
            case "undefined": return undefinedHash;
            case "number": return NumberT.hashOf(x);
            case "boolean": return x ? trueHash : falseHash;
            case "string": return hash(stringHashSeed)
            case "object": return hash(objectHashSeed);
            case "symbol": return hash(symbolHashSeed);
            case "function": return hash(functionHashSeed);
            case "bigint": return hash(bigintHashSeed);
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
