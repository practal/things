import { AssocArray, AssocArrays } from "./assoc_arrays.mjs";
import { MapThings } from "./map_things.mjs";
import { EmptyMapHash, MapCheckKeyValue, MapCompare, MapFrom, MapHash, MapPrint, MapT, SealedMaps } from "./map_utils.mjs";
import { int, nat, Numbers } from "./primitives.mjs";
import { Things } from "./things.mjs";
import { freeze } from "./utils.mjs";
import * as insta from "instatest";
import { testMapThings } from "./test_map_things.mjs";

insta.beginUnit("things", "hash_map");

type HashMapData<K, V> = {size : nat, hash : int | null, content: Map<int, AssocArray<K, V>>};

function keepSize<C>(map : { size : nat, hash : int | null, content: C }) : { size : nat, hash : int | null, content: C } {
    map.hash = null
    return map;
}

function incSize<C>(map : { size : nat, hash : int | null, content: C }) : { size : nat, hash : int | null, content: C } {
    map.size++;
    map.hash = null
    return map;
}

function decSize<C>(map : { size : nat, hash : int | null, content: C }) : { size : nat, hash : int | null, content: C } {
    map.size--;
    map.hash = null;
    return map;
}

function HashMapDataT<K, V>(keyT : Things<K>, valueT : Things<V>) : MapThings<HashMapData<K, V>, K, V> {
    const assoc = AssocArrays(keyT, valueT, false);
    const thing : MapThings<HashMapData<K, V>, K, V> = {
        keys: keyT,
        values: valueT,
        empty(): HashMapData<K, V> {
            return { size : 0, hash : EmptyMapHash, content : new Map() };
        },
        from(keyValues: Iterable<[K, V]>): HashMapData<K, V> {
            return MapFrom(thing, keyValues);
        },
        size(map: HashMapData<K, V>): nat {
            return map.size;
        },
        entries(map: HashMapData<K, V>): IterableIterator<[K, V]> {
            return function*() {
                for (const [_, arr] of map.content) {
                    for (const kv of assoc.entries(arr)) {
                        yield kv;
                    }
                }
            }();
        },
        get(map: HashMapData<K, V>, key: K): V | undefined {
            const slot = keyT.hashOf(key);
            const arr = map.content.get(slot);
            return arr ? assoc.get(arr, key) : undefined;
        },
        has(map: HashMapData<K, V>, key: K): boolean {
            const slot = keyT.hashOf(key);
            const arr = map.content.get(slot);
            return arr ? assoc.has(arr, key) : false;
        },
        put(map: HashMapData<K, V>, key: K, value: V): { old: V | undefined; result: HashMapData<K, V>; } {
            MapCheckKeyValue(thing, key, value);
            if (!keyT.inDomain(key)) throw new Error("Key is not in domain.");
            if (!valueT.inDomain(value)) throw new Error("Value is not in domain.");
            const slot = keyT.hashOf(key);
            let arr = map.content.get(slot);
            if (arr) {
                const arrSize = assoc.size(arr);
                const old = assoc.put(arr, key, value).old;
                if (assoc.size(arr) > arrSize) {
                    return { old: old, result: incSize(map) };
                } else {
                    return { old: old, result: keepSize(map) };
                } 
            } else {
                arr = assoc.from([[key, value]]);
                map.content.set(slot, arr);
                return { old: undefined, result: incSize(map) };
            }
        },
        putIfNew(map: HashMapData<K, V>, key: K, value: V): { old: V | undefined; result: HashMapData<K, V>; } {
            MapCheckKeyValue(thing, key, value);
            const slot = keyT.hashOf(key);
            let arr = map.content.get(slot);
            if (arr) {
                const arrSize = assoc.size(arr);
                const old = assoc.putIfNew(arr, key, value).old;
                if (assoc.size(arr) > arrSize) {
                    return { old: old, result: incSize(map) };
                } else {
                    return { old: old, result: keepSize(map) };
                } 
            } else {
                arr = assoc.from([[key, value]]);
                map.content.set(slot, arr);
                return { old: undefined, result: incSize(map) };
            }        
        },
        remove(map: HashMapData<K, V>, key: K): { old: V | undefined; result: HashMapData<K, V>; } {
            const slot = keyT.hashOf(key);
            let arr = map.content.get(slot);
            if (arr) {
                const arrSize = assoc.size(arr);
                const old = assoc.remove(arr, key).old;
                if (assoc.size(arr) < arrSize) {
                    return { old: old, result: decSize(map) };
                } else {
                    return { old: old, result: keepSize(map) };
                } 
            } else {
                return { old: undefined, result: map };
            }        
        },
        immutable: false,
        ordered: false,
        inDomain(map: HashMapData<K, V>): boolean {
            return true; 
        },
        equals(map1: HashMapData<K, V>, map2: HashMapData<K, V>): boolean {
            return thing.compare(map1, map2) === 0;
        },
        compare(map1: HashMapData<K, V>, map2: HashMapData<K, V>): number {
            return MapCompare(thing, map1, map2);
        },
        hashOf(map: HashMapData<K, V>): number {
            if (map.hash === null) {
                map.hash = MapHash(thing, map);
            }
            return map.hash;
        },
        clone(map: HashMapData<K, V>): HashMapData<K, V> {
            let content : Map<int, AssocArray<K, V>> = new Map();
            for (const [slot, arr] of map.content) {
                content.set(slot, assoc.clone(arr));
            }
            return { size : map.size, hash: map.hash, content : content };
        },
        print(map: HashMapData<K, V>): string { return MapPrint(thing, map); }
    };
    freeze(thing);
    return thing;
}
freeze(HashMapDataT);

export type HashMap<K, V> = MapT<K, V>

export function HashMaps<K, V>(keys : Things<K>, values : Things<V>) : MapThings<HashMap<K, V>, K, V> {
    return SealedMaps(HashMapDataT(keys, values));
}

testMapThings(HashMaps(Numbers, Numbers));

insta.endUnit("things", "hash_map");

