import { Thing } from "./thing.mjs";
import { MapThing } from "./map_thing.mjs";
import * as insta from "instatest";

export function testMapThing<M>(thing : MapThing<M, number, number>) {
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
}