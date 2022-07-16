import { MapThing } from "./map_thing.mjs";
import { freeze } from "./utils.mjs";
import * as insta from "instatest";
import { pickRandomKey } from "./map_utils.mjs";

export function testMapThing<M>(thing : MapThing<M, number, number>, descr? : string) {
    if (!descr) descr = `testMapThing(ordered: ${thing.ordered})`;
    else descr = `${descr}/testMapThing(ordered: ${thing.ordered})`;
    insta.test(descr, () => {
        let nums = new Map<number, number>();
        let map = thing.empty();
        const N = 1000;
        for (let i=0; i<N; i++) {
            const x = Math.round(Math.random() * N);
            const y = Math.round(Math.random() * N);
            nums.set(x, y);
            map = thing.put(map, x, y).result;
        }
        insta.assertEq(nums.size, thing.size(map));
        let map2 = thing.from(nums.entries());
        insta.assert(thing.equals(map, map2));
        insta.assertEq(thing.size(map), thing.size(map2));
        insta.test("putIfUndefined&size", () => {
            for (let x=0; x<=N; x++) {
                if (nums.has(x)) {
                    insta.assert(thing.has(map, x));
                    insta.assertEq(thing.get(map, x), nums.get(x));
                    const size = thing.size(map);
                    const value = Math.random();
                    const result = thing.putIfUndefined(map, x, value);
                    insta.assertEq(result.old, nums.get(x));
                    insta.assert(result.result === map);
                    insta.assertEq(size, thing.size(map));
                    insta.assertEq(thing.get(map, x), nums.get(x));
                } else {
                    insta.assertFalse(thing.has(map, x));
                    insta.assertEq(thing.get(map, x), undefined);
                    const size = thing.size(map);
                    const value = Math.random();
                    const result = thing.putIfUndefined(map, x, value);
                    insta.assertEq(result.old, undefined);
                    map = result.result;
                    insta.assertEq(size + 1, thing.size(map));
                    insta.assertEq(thing.get(map, x), value);
                }
            }
            insta.assertEq(thing.size(map), N+1);
        });
        insta.test ("remove", () => {
            let removed = 0;
            for (let i=0; i<N; i++) {
                const x = Math.round(Math.random() * 2 * N);
                const has = thing.has(map, x);
                const y = thing.get(map, x);
                const result = thing.remove(map, x);
                map = result.result;
                insta.assertEq(result.old, y);
                insta.assertEq(thing.get(map, x), undefined);
                if (has) removed += 1;
            }
            insta.assertEq(thing.size(map), N+1 - removed);
        });
        insta.test("order", () => {
            if (!thing.ordered) {
                thing.put(map, Number.NaN, 42);
                insta.assertEq(thing.get(map, Number.NaN), 42);
            }
            if (thing.ordered) {
                let last = 0;
                let first = true;
                for (const [k, v] of thing.entries(map)) {
                    if (!first) {
                        insta.assert(thing.keyT.compare(last, k) < 0);
                    } else {
                        first = false;
                    }
                    last = k;
                }
            }
        });
        insta.test("clone&compare", () => {
            map2 = thing.clone(map);
            insta.assert(thing.equals(map, map2));
            const k = pickRandomKey(thing, map2)!;
            map2 = thing.put(map2, k, thing.get(map2, k)! + 1).result;
            insta.assert(thing.compare(map, map2) < 0);
            insta.assert(thing.compare(map2, map) > 0);
            map2 = thing.remove(map2, k).result;
            insta.assertEq(thing.compare(map, map2), Number.NaN);
            insta.assertEq(thing.compare(map2, map), Number.NaN);
        });
    });
}
freeze(testMapThing);