import { int, nat } from "./thing.mjs";

export function freeze(x : any) {
    if (typeof x === "function") {
        Object.freeze(x.prototype);
        Object.freeze(x);    
    } else {
        Object.freeze(x);
    }
}
freeze(freeze);

/** Returns a sequence of the [codepoints](https://unicode.org/glossary/#code_point) of a string. */
export function* iterateCodepoints(s : string): Generator<nat, void, unknown> {
    for (const v of s) {
        yield v.codePointAt(0)!;
    }
}
freeze(iterateCodepoints);

/** Concatenates a sequence of strings, with the separator inserted in between neighbouring strings. */
export function joinStrings(separator : string, strings : Iterable<string>) : string {
    let result = "";
    let first = true;
    for (const s of strings) {
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
    for (const h of hashes) {
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

export function assert_nat(x : any) : asserts x is nat {
    if (!(Number.isSafeInteger(x) && x >= 0)) 
        throw new Error(`Natural number expected, found: ${x}`);
}
freeze(assert_nat);

export function assert_int(x : any) : asserts x is int {
    if (!Number.isSafeInteger(x)) 
        throw new Error(`Integer expected, found: ${x}`);
}
freeze(assert_int);

