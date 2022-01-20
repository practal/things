import { int, nat } from "../interfaces/primitives";

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

Object.freeze(joinStrings);

/** Combines a sequence of hashes into a single hash. */ 
export function combineHashes(hashes : Iterable<int>) : int {
    var sum = 1;
    for (let h of hashes) {
        sum = 31 * sum + h;
        sum = sum & sum;
    }
    return sum;
}

Object.freeze(combineHashes);

/** Calculates the hash of a string. */
export function hashOfString(s : string) : int {
    return combineHashes(iterateCodepoints(s));
}

Object.freeze(hashOfString);