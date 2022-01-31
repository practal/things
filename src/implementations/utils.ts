import { ComparisonResult, EQUAL, GREATER, LESS, UNRELATED } from "../interfaces/comparable";
import { int, nat } from "../interfaces/primitives";

export function freeze(x : any) {
    if (typeof x === "function") {
        Object.freeze(x.prototype);
        Object.freeze(x);    
    } else {
        Object.freeze(x);
    }
}

export function finalClass(finalClass : string) : never {
    throw new Error(`Cannot subclass final class ${finalClass}.`);
}

/** Returns a sequence of the [codepoints](https://unicode.org/glossary/#code_point) of a string. */
export function* iterateCodepoints(s : string): Generator<nat, void, unknown> {
    for (let v of s) {
        yield v.codePointAt(0)!;
    }
}

Object.freeze(iterateCodepoints);

/** Concatenates a sequence of strings, with the separator inserted in between neighbouring strings. */
export function joinStrings(separator : string, strings : Iterable<string>) : string {
    let result = "";
    let first = true;
    for (let s of strings) {
        if (first) {
            result = s;
            first = false;
        } else {
            result += separator;
            result += s;
        }
    }
    return result;
}

freeze(joinStrings);

/** Combines a sequence of hashes into a single hash. */ 
export function combineHashes(hashes : Iterable<int>) : int {
    var sum = 1;
    for (let h of hashes) {
        sum = 31 * sum + h;
        sum = sum & sum;
    }
    return sum;
}

freeze(combineHashes);

/** Calculates the hash of a string. */
export function hashOfString(s : string) : int {
    return combineHashes(iterateCodepoints(s));
}

freeze(hashOfString);

export function mirrorComparisonResult(c : ComparisonResult) : ComparisonResult {
    switch (c) {
        case LESS: return GREATER;
        case GREATER: return LESS;
        case EQUAL: return EQUAL;
        case UNRELATED: return UNRELATED;
        default: throw new Error(`ComparisonResult expected, found: ${c}`);
    }
}

freeze(mirrorComparisonResult);

export function isNumber(x : any) : x is number | Number {
    return typeof(x) === "number" || x instanceof Number;
}

export function isString(x : any) : x is string | String {
    return typeof(x) === "string" || x instanceof String;
}

export function isFunction(x : any) : x is Function {
    return x instanceof Function;
}

/** Tries to turn its numeric argument into a number, and returns undefined if that is not possible. */
export function numberOf(x : any) : number | undefined {
    const v = x.valueOf();
    if (typeof v === "number") return v;
    else if (typeof v == "bigint") {
        try {
            let n = Number(v);
            if ((n as any) == v) return n;
            else return undefined;
        } catch {
            return undefined;
        }
    } else return undefined;
}

/** Tries to turn its numeric argument into a number, and throws an exception if that fails. */
export function asNumber(x : any) : number {
    const v = numberOf(x);
    if (v === undefined) throw new Error(`cannot convert ${x} to number`);
    else return v;
}

