import { freeze } from "./utils.mjs";
import { int, Numbers } from "./primitives.mjs";
import { Things } from "./things.mjs";
import { MapThings } from "./map_things.mjs";
import { Anything } from "./anything.mjs";
import { MapCheckKeyValue, MapCompare, MapFrom, MapHash, MapPrint } from "./map_utils.mjs";
import * as insta from "instatest";
import { testMapThings } from "./test_map_things.mjs";

insta.beginUnit("things", "map");

/** 
 * Views maps as as [[MapThings | map things]] as long as keys and values are viewed as things too.
 * This only is well-defined if the equality of keys coincides with equality of [[Anything]] on the domain of keys. 
 * This is for example the case if keys is [[Anything]], [[NumberT]], [[IntT]], [[NatT]] or [[StringT]]. 
 * If you cannot guarantee for this to be the case, use [[HashMaps]] instead.
 */ 
export function Maps<Key, Value>(keys : Things<Key>, values : Things<Value>) : MapThings<Map<Key, Value>, Key, Value> {
    if (!keys.immutable) throw new Error("Keys must be immutable.");
    const thing : MapThings<Map<Key, Value>, Key, Value> = {
        keys: keys,
        values: values,
        empty(): Map<Key, Value> {
            return new Map<Key, Value>();
        },
        from(keyValues: Iterable<[Key, Value]>): Map<Key, Value> {
            return MapFrom(thing, keyValues);
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
            MapCheckKeyValue(thing, key, value);
            const old = map.get(key);
            map.set(key, value);
            return {old: old, result: map};
        },
        putIfNew(map: Map<Key, Value>, key: Key, value: Value): { old: Value | undefined; result: Map<Key, Value>; } {
            MapCheckKeyValue(thing, key, value);
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
            if (!(map instanceof Map)) return false;
            for (const [k, v] of map.entries()) {
                if (!(keys.inDomain(k) && values.inDomain(v))) return false;
            }
            return true;
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
        clone(map: Map<Key, Value>): Map<Key, Value> {
            if (keys.immutable && values.immutable) return new Map(map.entries());
            let result: Map<Key, Value> = new Map();
            for (const [k, v] of map.entries()) {
                result.set(keys.clone(k), values.clone(v));
            }
            return result;
        },
        print(map: Map<Key, Value>): string {
            return MapPrint(thing, map);
        }
    };
    freeze(thing);
    return thing;
}
freeze(Maps);

testMapThings(Maps(Numbers, Numbers));

insta.endUnit("things", "map");
