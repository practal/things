import { int, nat } from "./primitives.mjs";

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
    let sum = 1;
    for (const h of hashes) {
        sum = 31 * sum + h;
        sum = sum & sum;
    }
    return sum;
}
freeze(combineHashes);

/** 
 * Combines a sequence of hashes into a single hash. 
 * Looks what we really want here is the MurmurHash3 (https://github.com/scala/scala/blob/2.11.x/src/library/scala/util/hashing/MurmurHash3.scala).
 * But for now we just use addition like Java does.
 **/ 
export function combineHashesOrderInvariant(hashes : Iterable<int>) : int {
    let sum = 1;
    for (const h of hashes) {
        sum += (h | 0);
        sum = sum & sum;
    }
    return sum;
}
freeze(combineHashesOrderInvariant);

export function appendHash(hashOfSeq : int, hash : int) : int {
    let sum = hashOfSeq;
    sum = 31 * sum + hash;
    sum = sum & sum;
    return sum;
}

/** Calculates the hash of a string. */
export function hashOfString(s : string) : int {
    return combineHashes(iterateCodepoints(s));
}
freeze(hashOfString);

// Various hash seeds
export const mapHashSeed = hashOfString("Map");
export const arrayHashSeed = hashOfString("Array");
export const trueHash = hashOfString("true");
export const falseHash = hashOfString("false");
export const undefinedHash = hashOfString("undefined");
export const nullHash = hashOfString("null");
export const stringHashSeed = hashOfString("string");
export const numberHashSeed = hashOfString("number");
export const intHashSeed = hashOfString("int");
export const natHashSeed = hashOfString("nat");
export const objectHashSeed = hashOfString("object");
export const functionHashSeed = hashOfString("function");
export const bigintHashSeed = hashOfString("bigint");
export const symbolHashSeed = hashOfString("symbol");

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

export function is_nat(x : any) : x is nat {
    return Number.isSafeInteger(x) && x >= 0;
}

export function is_int(x : any) : x is int {
    return Number.isSafeInteger(x);
}

