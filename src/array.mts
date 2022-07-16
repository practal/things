import {Thing} from "./thing.mjs";
import {arrayHashSeed, combineHashes, freeze} from "./utils.mjs";
import {int, NatT, StringT} from "./primitives.mjs";
import * as insta from "instatest";

insta.beginUnit("things", "array");

/** Views any array as a thing, given its elements are viewed as things. */
export function ArrayT<E>(elemT : Thing<E>) : Thing<Array<E>> {
    const thing : Thing<Array<E>> = {
        inDomain(arr: E[]): boolean {
            if (!(arr instanceof Array)) return false;
            for (const e of arr) {
                if (!elemT.inDomain(e)) return false;
            }
            return true;
        },
        equals(x: E[], y: E[]): boolean {
            return thing.compare(x, y) === 0;
        },
        compare(x: E[], y: E[]): number {
            const len = x.length;
            let c = NatT.compare(len, y.length);
            if (c !== 0) return c;
            for (let i=0; i<len; i++) {
                c = elemT.compare(x[i], y[i]);
                if (c !== 0) return c;
            }
            return 0;
        },
        hashOf(arr: E[]): int {
            return combineHashes(function*() { 
                yield arrayHashSeed;
                yield arr.length;
                for (const e of arr) yield elemT.hashOf(e);
            }()); 
        },
        clone(arr: E[]): E[] {
            if (elemT.immutable) return [...arr];
            const brr: E[] = [];
            for (const e of arr) {
                brr.push(elemT.clone(e));
            }
            return brr;
        },
        immutable: false
    };
    freeze(thing);
    return thing;
}
freeze(ArrayT);

insta.test("compare", () => {
    const a = [3, 4, 5];
    const b = [5, 4, 3];
    const T = ArrayT(NatT);
    insta.assert(T.compare(a, b) < 0);
    insta.assert(T.compare(b, a) > 0);
    insta.assert(T.compare(a, b.reverse()) === 0);
    insta.assert(T.inDomain(a));
});

insta.test("clone", () => {
    const a = [14, 3, 25];
    const T = ArrayT(NatT);
    const b =  T.clone(a);
    insta.assert(T.equals(a, b));
    a[0] = 7;
    insta.assertFalse(T.equals(a, b));
    b[0] = 7;
    insta.assert(T.equals(a, b));
});

insta.endUnit("things", "array");


