import { Thing } from "./thing.mjs";
import { freeze } from "./utils.mjs";
import { int, NumberT } from "./primitives.mjs";
import { MapThing } from "./map_thing.mjs";
import * as insta from "instatest";
import { testMapThing } from "./test_map_thing.mjs";
import { AppendMapHash, EmptyMapHash, MapCompare, MapHash, SealedMap, SealedMapT } from "./map_utils.mjs";

insta.beginUnit("things", "assoc_array");

type AssocArrayData<Key, Value> = {hash : int | null, array: [Key, Value][]};

/** A [[MapThing]] for (possibly ordered) association arrays. */
function AssocArrayDataT<Key, Value>(keyT : Thing<Key>, valueT : Thing<Value>, ordered : boolean) : MapThing<AssocArrayData<Key, Value>, Key, Value> {
    const thing : MapThing<AssocArrayData<Key, Value>, Key, Value> = {
        keyT: keyT,
        valueT: valueT,
        empty(): AssocArrayData<Key, Value> {
            return {hash : EmptyMapHash, array: []};
        },
        from(keyValues: Iterable<[Key, Value]>): AssocArrayData<Key, Value> {
            let m = thing.empty();
            for (const [k, v] of keyValues) {
                thing.put(m, k, v);
            }
            return m;
        },
        size(map: AssocArrayData<Key, Value>): number {
            return map.array.length;
        },
        entries(map: AssocArrayData<Key, Value>): IterableIterator<[Key, Value]> {
            return map.array.values();
        },
        get(map: AssocArrayData<Key, Value>, key: Key): Value | undefined {
            for (const [k, v] of map.array) {
                const c = keyT.compare(k, key);
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
                const c = keyT.compare(k, key);
                if (c === 0) return true; 
                if (ordered) {
                    if (c > 0) return false; 
                    else if (!(c < 0)) throw new Error(`Incompatible key '${key}'.`); 
                }
            }
            return false;
        },
        put(map: AssocArrayData<Key, Value>, key: Key, value: Value): { old: Value | undefined; result: AssocArrayData<Key, Value>; } {
            for (const [i, [k, v]] of map.array.entries()) {
                const c = keyT.compare(k, key);
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
            if (map.hash !== null) map.hash = AppendMapHash(thing, map.hash, key, value);
            return {old: undefined, result: map};
        },
        putIfUndefined(map: AssocArrayData<Key, Value>, key: Key, value: Value): { old: Value | undefined; result: AssocArrayData<Key, Value>; } {
            for (const [i, [k, v]] of map.array.entries()) {
                const c = keyT.compare(k, key);
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
            if (map.hash !== null) map.hash = AppendMapHash(thing, map.hash, key, value);
            return {old: undefined, result: map};
        },
        remove(map: AssocArrayData<Key, Value>, key: Key): { old: Value | undefined; result: AssocArrayData<Key, Value>; } {
            for (const [i, [k, v]] of map.array.entries()) {
                const c = keyT.compare(k, key);
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
            try {
                if (!(map.array instanceof Array)) return false;
                if (ordered) {
                    let first = true;
                    let last : Key 
                    for (const [k, v] of map.array) {
                        if (!(keyT.inDomain(k) && valueT.inDomain(v))) return false;
                        if (first) first = false;
                        else {
                            if (!(keyT.compare(last!, k) < 0)) return false;
                        }
                        last = k;
                    }
                } else {
                    for (const [k, v] of map.array) {
                        if (!(keyT.inDomain(k) && valueT.inDomain(v))) return false;
                    }
                }
                return map.hash === null || (map.hash === MapHash(thing, map));
            } catch {
                return false;
            } 
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
            if (keyT.immutable && valueT.immutable) return {hash: map.hash, array: [...map.array]};
            let brr : [Key, Value][] = [];
            for (const [k, v] of map.array) {
                brr.push([keyT.clone(k), valueT.clone(v)]);
            }
            return {hash: map.hash, array: brr};
        }
    };
    freeze(thing);
    return thing;   
}
freeze(AssocArrayDataT);

testMapThing(AssocArrayDataT(NumberT, NumberT, true), "assoc array data");
testMapThing(AssocArrayDataT(NumberT, NumberT, false), "assoc array data");

export type AssocArray<Key, Value> = SealedMap

export function AssocArrayT<Key, Value>(keyT : Thing<Key>, valueT : Thing<Value>, ordered : boolean) : MapThing<AssocArray<Key, Value>, Key, Value> {
    return SealedMapT(AssocArrayDataT(keyT, valueT, ordered));
}
freeze(AssocArrayT);

testMapThing(AssocArrayT(NumberT, NumberT, true), "sealed assoc array");
testMapThing(AssocArrayT(NumberT, NumberT, false), "sealed assoc array");

insta.endUnit("things", "assoc_array");
