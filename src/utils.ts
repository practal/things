import { int, nat } from "./primitives";

export function isInt(x : any) : x is int {
    return Number.isInteger(x);
}

export function isNat(x : any) : x is nat {
    return Number.isInteger(x) && x >= 0;
}

export function assertNat(n : any): asserts n is number {
    if (!(Number.isInteger(n) && n >= 0)) {
        throw new TypeError(`natural number expected, found: ${n}`);
    }
}

export function assertInt(n : any): asserts n is number {
    if (!Number.isInteger(n)) {
        throw new TypeError(`integer expected, found: ${n}`);
    }
}

export function* iterateCodepoints(s : string) {
    for (let v of s) {
        yield v.codePointAt(0)!;
    }
}