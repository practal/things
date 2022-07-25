import { MapThings } from "./map_things.mjs";
import { freeze } from "./utils.mjs";
import * as insta from "instatest";
import { pickRandomKey } from "./map_utils.mjs";

export function testMapThings<M>(things : MapThings<M, number, number>, descr? : string) {
    if (!descr) descr = `testMapThing(ordered: ${things.ordered})`;
    else descr = `${descr}/testMapThing(ordered: ${things.ordered})`;
    insta.test(descr, () => {
        let nums = new Map<number, number>();
        let map = things.empty();
        const N = 1000;
        for (let i=0; i<N; i++) {
            const x = Math.round(Math.random() * N);
            const y = Math.round(Math.random() * N);
            nums.set(x, y);
            map = things.put(map, x, y).result;
        }
        insta.assertEq(nums.size, things.size(map));
        let map2 = things.from(nums.entries());
        insta.assert(things.equals(map, map2));
        insta.assertEq(things.size(map), things.size(map2));
        insta.test("putIfUndefined&size", () => {
            for (let x=0; x<=N; x++) {
                if (nums.has(x)) {
                    insta.assert(things.has(map, x));
                    insta.assertEq(things.get(map, x), nums.get(x));
                    const size = things.size(map);
                    const value = Math.random();
                    const result = things.putIfNew(map, x, value);
                    insta.assertEq(result.old, nums.get(x));
                    insta.assert(result.result === map);
                    insta.assertEq(size, things.size(map));
                    insta.assertEq(things.get(map, x), nums.get(x));
                } else {
                    insta.assertFalse(things.has(map, x));
                    insta.assertEq(things.get(map, x), undefined);
                    const size = things.size(map);
                    const value = Math.random();
                    const result = things.putIfNew(map, x, value);
                    insta.assertEq(result.old, undefined);
                    map = result.result;
                    insta.assertEq(size + 1, things.size(map));
                    insta.assertEq(things.get(map, x), value);
                }
            }
            insta.assertEq(things.size(map), N+1);
        });
        insta.test ("remove", () => {
            let removed = 0;
            for (let i=0; i<N; i++) {
                const x = Math.round(Math.random() * 2 * N);
                const has = things.has(map, x);
                const y = things.get(map, x);
                const result = things.remove(map, x);
                map = result.result;
                insta.assertEq(result.old, y);
                insta.assertEq(things.get(map, x), undefined);
                if (has) removed += 1;
            }
            insta.assertEq(things.size(map), N+1 - removed);
        });
        insta.test("order", () => {
            if (!things.ordered) {
                things.put(map, Number.NaN, 42);
                insta.assertEq(things.get(map, Number.NaN), 42);
            }
            if (things.ordered) {
                let last = 0;
                let first = true;
                for (const [k, v] of things.entries(map)) {
                    if (!first) {
                        insta.assert(things.keys.compare(last, k) < 0);
                    } else {
                        first = false;
                    }
                    last = k;
                }
            }
        });
        insta.test("clone&compare", () => {
            map2 = things.clone(map);
            insta.assert(things.equals(map, map2));
            const k = pickRandomKey(things, map2)!;
            map2 = things.put(map2, k, things.get(map2, k)! + 1).result;
            insta.assert(things.compare(map, map2) < 0);
            insta.assert(things.compare(map2, map) > 0);
            map2 = things.remove(map2, k).result;
            insta.assertEq(things.compare(map, map2), Number.NaN);
            insta.assertEq(things.compare(map2, map), Number.NaN);
        });
        insta.test("hashing", () => {
            const map1 = things.from([[10, 7], [20, 49]]);
            const map2 = things.from([[20, 49], [10, 7]]);
            insta.assert(things.equals(map1, map2));
            insta.assertEq(things.hashOf(map1), things.hashOf(map2));
        });
    });
}
freeze(testMapThings);