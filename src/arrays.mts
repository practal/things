import {Things} from "./things.mjs";
import {arrayHashSeed, combineHashes, freeze, joinStrings} from "./utils.mjs";
import {int, Nats, Strings} from "./primitives.mjs";
import * as insta from "instatest";

insta.beginUnit("things", "array");

/** Views any array as a thing, given its elements are viewed as things. */
export function Arrays<E>(elems : Things<E>) : Things<Array<E>> {
    const thing : Things<Array<E>> = {
        inDomain(arr: E[]): boolean {
            if (!(arr instanceof Array)) return false;
            for (const e of arr) {
                if (!elems.inDomain(e)) return false;
            }
            return true;
        },
        equals(x: E[], y: E[]): boolean {
            return thing.compare(x, y) === 0;
        },
        compare(x: E[], y: E[]): number {
            const len = x.length;
            let c = Nats.compare(len, y.length);
            if (c !== 0) return c;
            for (let i=0; i<len; i++) {
                c = elems.compare(x[i], y[i]);
                if (c !== 0) return c;
            }
            return 0;
        },
        hashOf(arr: E[]): int {
            return combineHashes(function*() { 
                yield arrayHashSeed;
                yield arr.length;
                for (const e of arr) yield elems.hashOf(e);
            }()); 
        },
        clone(arr: E[]): E[] {
            if (elems.immutable) return [...arr];
            const brr: E[] = [];
            for (const e of arr) {
                brr.push(elems.clone(e));
            }
            return brr;
        },
        immutable: false,
        print(arr: E[]): string { return `[${ joinStrings(", ", arr.map(elems.print)) }]` }

    };
    freeze(thing);
    return thing;
}
freeze(Arrays);

export function ReadonlyArrays<E>(elems : Things<E>) : Things<Readonly<Array<E>>> {
    return Arrays(elems);
}
freeze(ReadonlyArrays);

insta.test("compare", () => {
    const a = [3, 4, 5];
    const b = [5, 4, 3];
    const T = Arrays(Nats);
    insta.assert(T.compare(a, b) < 0);
    insta.assert(T.compare(b, a) > 0);
    insta.assert(T.compare(a, b.reverse()) === 0);
    insta.assert(T.inDomain(a));
});

insta.test("clone", () => {
    const a = [14, 3, 25];
    const T = Arrays(Nats);
    const b = T.clone(a);
    insta.assert(T.equals(a, b));
    a[0] = 7;
    insta.assertFalse(T.equals(a, b));
    b[0] = 7;
    insta.assert(T.equals(a, b));
});

insta.endUnit("things", "array");


