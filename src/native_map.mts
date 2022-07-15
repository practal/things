import { freeze } from "./utils.mjs";
import { int } from "./primitives.mjs";
import { MapThing } from "./map_thing.mjs";
import { Anything } from "./anything.mjs";
import { MapCompare, MapHash } from "./map_thing_utils.mjs";
import * as insta from "instatest";
import { testMapThing } from "./test_map_thing.mjs";

insta.beginUnit("things", "native_map_thing");

function NativeMapT<Key, Value>() : MapThing<Map<Key, Value>, Key, Value> {
    const thing : MapThing<Map<Key, Value>, Key, Value> = {
        keyT: Anything,
        valueT: Anything,
        empty(): Map<Key, Value> {
            return new Map<Key, Value>();
        },
        from(keyValues: Iterable<[Key, Value]>): Map<Key, Value> {
            return new Map(keyValues);
        },
        size(map: Map<Key, Value>): number {
            return map.size;
        },
        entries(map: Map<Key, Value>): IterableIterator<[Key, Value]> {
            return map.entries();
        },
        get(map: Map<Key, Value>, key: Key): Value | undefined {
            return map.get(key);
        },
        has(map: Map<Key, Value>, key: Key): boolean {
            return map.has(key);
        },
        put(map: Map<Key, Value>, key: Key, value: Value): { old: Value | undefined; result: Map<Key, Value>; } {
            const old = map.get(key);
            map.set(key, value);
            return {old: old, result: map};
        },
        putIfUndefined(map: Map<Key, Value>, key: Key, value: Value): { old: Value | undefined; result: Map<Key, Value>; } {
            if (map.has(key)) 
                return { old: map.get(key), result: map };
            else {
                map.set(key, value);
                return { old: undefined, result: map };
            }
        },
        remove(map: Map<Key, Value>, key: Key): { old: Value | undefined; result: Map<Key, Value>; } {
            const old = map.get(key);
            map.delete(key);
            return { old: old, result: map };
        },
        immutable: false,
        ordered: false,
        inDomain(map: Map<Key, Value>): boolean {
            return (map instanceof Map);
        },
        equals(map1: Map<Key, Value>, map2: Map<Key, Value>): boolean {
            return thing.compare(map1, map2) === 0;
        },
        compare(map1: Map<Key, Value>, map2: Map<Key, Value>): number {
            return MapCompare(thing, map1, map2);
        },
        hashOf(map: Map<Key, Value>): int {
            return MapHash(thing, map);
        },
        clone: function (map: Map<Key, Value>): Map<Key, Value> {
            return new Map(map.entries());
        }
    };
    freeze(thing);
    return thing;
}
freeze(NativeMapT);

export const NativeMapThing = NativeMapT<any, any>();

testMapThing(NativeMapThing);

insta.endUnit("things", "native_map_thing");
