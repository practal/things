import { debug } from "./debug.js";
import { nat } from "./primitives.js";
import { AssertionFailed } from "./test.js";

export function freeze<V>(x : V) : V {
    if (typeof x === "function") {
        Object.freeze(x.prototype);
        Object.freeze(x);    
    } else {
        Object.freeze(x);
    }
    return x;
}
freeze(freeze);

export function notImplemented() : never {
    throw new Error("not implemented yet");
}

export function privateConstructor(name : string) : never {
    throw new Error("Private constructor of " + name + " cannot be called directly.");
}

export function internalError(msg? : string) : never {
    if (msg) throw new Error("Internal error: " + msg);
    else throw new Error("Internal error.");
}

export function force<V>(value : V | undefined | null) : V {
    if (value === null || value === undefined) {
        if (value === null) throw new Error("value is null");
        else throw new Error("value is undefined");
    }
    return value;
}
freeze(force);

export function isUnicodeLetter(c : string) : boolean {
    return RegExp(/^\p{L}$/u).test(c);
}

export function isUnicodeDigit(c : string) : boolean {
    return RegExp(/^\p{N}$/u).test(c);
}

export function isUnicodePunctuation(c : string) : boolean {
    return RegExp(/^\p{P}$/u).test(c);
}

export function isUnicodeDelimiterOpen(c : string) : boolean {
    return RegExp(/^\p{Ps}|\p{Pi}$/u).test(c);
}

export function isUnicodeDelimiterClose(c : string) : boolean {
    return RegExp(/^\p{Pe}|\p{Pf}$/u).test(c);
}

export function isUnicodeMathSymbol(c : string) : boolean {
    return RegExp(/^\p{Sm}$/u).test(c);
}

export function isUnicodeSpace(c : string) : boolean {
    return RegExp(/^\p{Zs}$/u).test(c);
}

export function groupBy<E, G>(groupOf : (elem : E) => G, elems : Iterable<E>) : [G, E[]][] {
    let groups : [G, E[]][] = [];
    let group : [G, E[]] | undefined = undefined;
    for (const e of elems) {
        const g = groupOf(e);
        if (group === undefined) {
            group = [g, [e]];
        } else {
            if (group[0] === g) {
                group[1].push(e);
            } else {
                groups.push(group);
                group = [g, [e]];
            }
        }
    }
    if (group !== undefined) groups.push(group);
    return groups;
}

export type Printer = (line : string) => void

export function timeIt<R>(label : string, op : () => R, print : Printer = debug) : R {
    const start_time = performance.now();
    const result = op();
    const end_time = performance.now();
    const duration = Math.round((end_time - start_time) * 10000) / 10000;
    print("Performed '" + label + "' in " + duration + " milliseconds.");
    return result;
}

export function assertTrue(condition : boolean) : asserts condition is true {
    if (condition !== true) throw new AssertionFailed();
}

export function assertFalse(condition : boolean) : asserts condition is false  {
    if (condition !== false) throw new AssertionFailed();
}

export function assertNever(value : never) : never {
    throw new AssertionFailed("unexpected value '" + value + "'");
}

export function assertIsDefined<T>(value : T) : asserts value is NonNullable<T> {
    if (value === undefined || value === null) throw new AssertionFailed("undefined value");
}

export type NotUndefined<T> = T extends undefined ? never : T;
export type Defined = Exclude<any, undefined>;

export function hexString(code : nat, minLength : nat) : string {
    return code.toString(16).padStart(minLength, '0').toUpperCase();
}