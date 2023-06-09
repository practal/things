import { Things } from "./things.mjs";
import { freeze } from "./utils.mjs";
import { int, Numbers } from "./primitives.mjs";
import { MapThings } from "./map_things.mjs";
import * as insta from "instatest";
import { testMapThings } from "./test_map_things.mjs";
import { EmptyMapHash, MapCheckKeyValue, MapCompare, MapFrom, MapHash, MapPrint, MapT, SealedMaps } from "./map_utils.mjs";

insta.beginUnit("things", "assoc_array");

type AssocArrayData<Key, Value> = {hash : int | null, array: [Key, Value][] };

/** A [[MapThing]] for (possibly ordered) association arrays. */
function AssocArrayDataT<Key, Value>(keys : Things<Key>, values : Things<Value>, ordered : boolean) : MapThings<AssocArrayData<Key, Value>, Key, Value> {
    if (!keys.immutable) throw new Error("Keys must be immutable.");
    const thing : MapThings<AssocArrayData<Key, Value>, Key, Value> = {
        keys: keys,
        values: values,
        empty(): AssocArrayData<Key, Value> {
            return {hash : EmptyMapHash, array: []};
        },
        from(keyValues: Iterable<[Key, Value]>): AssocArrayData<Key, Value> {
            return MapFrom(thing, keyValues);
        },
        size(map: AssocArrayData<Key, Value>): number {
            return map.array.length;
        },
        entries(map: AssocArrayData<Key, Value>): IterableIterator<[Key, Value]> {
            return map.array.values();
        },
        get(map: AssocArrayData<Key, Value>, key: Key): Value | undefined {
            for (const [k, v] of map.array) {
                const c = keys.compare(k, key);
                if (c === 0) return v; 
                if (ordered) {
                    if (c > 0) return undefined; 
                    else if (!(c < 0)) throw new Error(`Incompatible key '${key}'.`); 
                } 
            }
            return undefined;
        },
        has(map: AssocArrayData<Key, Value>, key: Key): boolean {
            for (const [k, v] of map.array) {
                const c = keys.compare(k, key);
                if (c === 0) return true; 
                if (ordered) {
                    if (c > 0) return false; 
                    else if (!(c < 0)) throw new Error(`Incompatible key '${key}'.`); 
                }
            }
            return false;
        },
        put(map: AssocArrayData<Key, Value>, key: Key, value: Value): { old: Value | undefined; result: AssocArrayData<Key, Value>; } {
            MapCheckKeyValue(thing, key, value);
            for (const [i, [k, v]] of map.array.entries()) {
                const c = keys.compare(k, key);
                if (c === 0) {
                    map.array[i] = [key, value];
                    map.hash = null;
                    return {old: v, result: map};                    
                } 
                if (ordered) {
                    if (c > 0) {
                        map.array.splice(i, 0, [key, value]);
                        map.hash = null;
                        return {old: undefined, result: map};
                    } else if (!(c < 0)) throw new Error(`Incompatible key '${key}'.`); 
                }
            }            
            map.array.push([key, value]);
            map.hash = null;
            return {old: undefined, result: map};
        },
        putIfNew(map: AssocArrayData<Key, Value>, key: Key, value: Value): { old: Value | undefined; result: AssocArrayData<Key, Value>; } {
            MapCheckKeyValue(thing, key, value);
            for (const [i, [k, v]] of map.array.entries()) {
                const c = keys.compare(k, key);
                if (c === 0) {
                    return {old: v, result: map};                    
                } 
                if (ordered) {
                    if (c > 0) {
                        map.array.splice(i, 0, [key, value]);
                        map.hash = null;
                        return {old: undefined, result: map};
                    } else if (!(c < 0)) throw new Error(`Incompatible key '${key}'.`); 
                }
            }            
            map.array.push([key, value]);
            map.hash = null;
            return {old: undefined, result: map};
        },
        remove(map: AssocArrayData<Key, Value>, key: Key): { old: Value | undefined; result: AssocArrayData<Key, Value>; } {
            for (const [i, [k, v]] of map.array.entries()) {
                const c = keys.compare(k, key);
                if (c === 0) {
                    map.array.splice(i, 1);
                    map.hash = null;
                    return {old: v, result: map};                    
                } 
                if (ordered) {
                    if (c > 0) {
                        return {old: undefined, result: map};
                    } else if (!(c < 0)) throw new Error(`Incompatible key '${key}'.`); 
                }
            }            
            return {old: undefined, result: map};            
        },
        immutable: false,
        ordered: ordered,
        inDomain(map: AssocArrayData<Key, Value>): boolean {
            // This will only ever be called with data that has already been checked at the time of creation.
            return true;
        },
        equals(arr1: AssocArrayData<Key, Value>, arr2: AssocArrayData<Key, Value>): boolean {
            return thing.compare(arr1, arr2) === 0;
        },
        compare(arr1: AssocArrayData<Key, Value>, arr2: AssocArrayData<Key, Value>): number {
            return MapCompare(thing, arr1, arr2);
        },
        hashOf(map: AssocArrayData<Key, Value>): int {
            if (map.hash === null) {
                map.hash = MapHash(thing, map);
            }
            return map.hash;
        },
        clone(map: AssocArrayData<Key, Value>): AssocArrayData<Key, Value> {
            if (keys.immutable && values.immutable) return {hash: map.hash, array: [...map.array]};
            let brr : [Key, Value][] = [];
            for (const [k, v] of map.array) {
                brr.push([keys.clone(k), values.clone(v)]);
            }
            return {hash: map.hash, array: brr};
        },
        print(map: AssocArrayData<Key, Value>): string { return MapPrint(thing, map); }

    };
    freeze(thing);
    return thing;   
}
freeze(AssocArrayDataT);

export type AssocArray<Key, Value> = MapT<Key, Value>

export function AssocArrays<Key, Value>(keys : Things<Key>, values : Things<Value>, ordered : boolean) : MapThings<AssocArray<Key, Value>, Key, Value> {
    return SealedMaps(AssocArrayDataT(keys, values, ordered));
}
freeze(AssocArrays);

testMapThings(AssocArrays(Numbers, Numbers, true));
testMapThings(AssocArrays(Numbers, Numbers, false));

insta.endUnit("things", "assoc_array");
