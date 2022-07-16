import { AssocArray, AssocArrayT } from "./assoc_array.mjs";
import { MapThing } from "./map_thing.mjs";
import { MapCompare, MapHash, SealedMapT } from "./map_utils.mjs";
import { int, nat, NumberT } from "./primitives.mjs";
import { Thing } from "./thing.mjs";
import { freeze } from "./utils.mjs";
import * as insta from "instatest";
import { testMapThing } from "./test_map_thing.mjs";

insta.beginUnit("things", "hash_map");

export type HashMap<K, V> = {size : nat, content: Map<int, AssocArray<K, V>>};

function incSize<C>(map : { size : nat, content: C }) : { size : nat, content: C } {
    map.size++;
    return map;
}

function decSize<C>(map : { size : nat, content: C }) : { size : nat, content: C } {
    map.size--;
    return map;
}

export function HashMapT<K, V>(keyT : Thing<K>, valueT : Thing<V>) : MapThing<HashMap<K, V>, K, V> {
    const assoc = AssocArrayT(keyT, valueT, false);
    const thing : MapThing<HashMap<K, V>, K, V> = {
        keyT: keyT,
        valueT: valueT,
        empty(): HashMap<K, V> {
            return { size : 0, content : new Map() };
        },
        from(keyValues: Iterable<[K, V]>): HashMap<K, V> {
            let map = thing.empty();
            for (const [k, v] of keyValues) {
                thing.put(map, k, v).result;
            }
            return map;
        },
        size(map: HashMap<K, V>): nat {
            return map.size;
        },
        entries(map: HashMap<K, V>): IterableIterator<[K, V]> {
            return function*() {
                for (const [_, arr] of map.content) {
                    for (const kv of assoc.entries(arr)) {
                        yield kv;
                    }
                }
            }();
        },
        get(map: HashMap<K, V>, key: K): V | undefined {
            const slot = keyT.hashOf(key);
            const arr = map.content.get(slot);
            return arr ? assoc.get(arr, key) : undefined;
        },
        has(map: HashMap<K, V>, key: K): boolean {
            const slot = keyT.hashOf(key);
            const arr = map.content.get(slot);
            return arr ? assoc.has(arr, key) : false;
        },
        put(map: HashMap<K, V>, key: K, value: V): { old: V | undefined; result: HashMap<K, V>; } {
            const slot = keyT.hashOf(key);
            let arr = map.content.get(slot);
            if (arr) {
                const arrSize = assoc.size(arr);
                const old = assoc.put(arr, key, value).old;
                if (assoc.size(arr) > arrSize) {
                    return { old: old, result: incSize(map) };
                } else {
                    return { old: old, result: map };
                } 
            } else {
                arr = assoc.from([[key, value]]);
                map.content.set(slot, arr);
                return { old: undefined, result: incSize(map) };
            }
        },
        putIfUndefined(map: HashMap<K, V>, key: K, value: V): { old: V | undefined; result: HashMap<K, V>; } {
            const slot = keyT.hashOf(key);
            let arr = map.content.get(slot);
            if (arr) {
                const arrSize = assoc.size(arr);
                const old = assoc.putIfUndefined(arr, key, value).old;
                if (assoc.size(arr) > arrSize) {
                    return { old: old, result: incSize(map) };
                } else {
                    return { old: old, result: map };
                } 
            } else {
                arr = assoc.from([[key, value]]);
                map.content.set(slot, arr);
                return { old: undefined, result: incSize(map) };
            }        
        },
        remove(map: HashMap<K, V>, key: K): { old: V | undefined; result: HashMap<K, V>; } {
            const slot = keyT.hashOf(key);
            let arr = map.content.get(slot);
            if (arr) {
                const arrSize = assoc.size(arr);
                const old = assoc.remove(arr, key).old;
                if (assoc.size(arr) < arrSize) {
                    return { old: old, result: decSize(map) };
                } else {
                    return { old: old, result: map };
                } 
            } else {
                return { old: undefined, result: map };
            }        
        },
        immutable: false,
        ordered: false,
        inDomain: function (map: HashMap<K, V>): boolean {
            return true; // todo?
        },
        equals: function (map1: HashMap<K, V>, map2: HashMap<K, V>): boolean {
            return thing.compare(map1, map2) === 0;
        },
        compare: function (map1: HashMap<K, V>, map2: HashMap<K, V>): number {
            return MapCompare(thing, map1, map2);
        },
        hashOf: function (map: HashMap<K, V>): number {
            return MapHash(thing, map);
        },
        clone: function (map: HashMap<K, V>): HashMap<K, V> {
            let content : Map<int, AssocArray<K, V>> = new Map();
            for (const [slot, arr] of map.content) {
                content.set(slot, assoc.clone(arr));
            }
            return { size : map.size, content : content };
        }
    };
    freeze(thing);
    return thing;
}

testMapThing(HashMapT(NumberT, NumberT), "HashMap");
testMapThing(SealedMapT(HashMapT(NumberT, NumberT)), "Sealed HashMap");

insta.endUnit("things", "hash_map");

