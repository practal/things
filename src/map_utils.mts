import { Things } from "./things.mjs";
import { nat, int, Strings } from "./primitives.mjs";
import { combineHashes, combineHashesOrderInvariant, freeze, joinStrings, mapHashSeed } from "./utils.mjs";
import { MapThings } from "./map_things.mjs";
import { Seal, Sealed } from "./seal.mjs";

/** A basic subset of [[MapThings]] used by the utility functions. */
export interface MapThingsBase<M, Key, Value> {

    readonly keys : Things<Key>
    readonly values : Things<Value>
    
    size(map : M) : nat
 
    entries(map : M): IterableIterator<[Key, Value]> 

    get(map : M, key : Key) : Value | undefined

    has(map : M, key : Key) : boolean   

    empty() : M

    put(map : M, key : Key, value : Value) : { old : Value | undefined, result : M }

    ordered : boolean
    
}

/** 
 * Compares two maps based on the given partial order on values. One map is less than another map iff
 * * both maps have the same keys
 * * for each key the associated value is less than or equal to the other associated value 
 * * for at least one key the associated value is less than the other associated value
 * 
 * One map is equal to another map iff:
 * * both maps have the same keys
 * * for each key the associated value is equal to the other associated value
 * 
 */
export function MapCompare<M, K, V>(things : MapThingsBase<M, K, V>, map1 : M, map2 : M) : number {
    if (things.ordered)
        return MapCompareOrdered(things, map1, map2);
    else 
        return MapCompareUnordered(things, map1, map2);
}
freeze(MapCompare);

function MapCompareUnordered<M, K, V>(things : MapThingsBase<M, K, V>, map1 : M, map2 : M) : number {
    if (things.size(map1) !== things.size(map2)) return Number.NaN; 
    let c = 0;
    const valueT = things.values;
    for (const [k, f] of things.entries(map1)) {
        let g = things.get(map2, k);
        if (g === undefined) {
            if (!things.has(map2, k)) return Number.NaN; 
            if (f !== undefined) return Number.NaN; 
        } else {
            const d = valueT.compare(f, g);
            if (Number.isNaN(d)) return Number.NaN;
            if (d !== 0) {
                if ((d > 0 && c < 0) || (d < 0 && c > 0)) return Number.NaN;
                c = d;
            }
        }
    }
    return c;
}

function MapCompareOrdered<M, K, V>(things : MapThingsBase<M, K, V>, map1 : M, map2 : M) : number {
    if (things.size(map1) !== things.size(map2)) return Number.NaN; 
    let entries1 = things.entries(map1);
    let entries2 = things.entries(map2);
    let c = 0;
    const keyT = things.keys;
    const valueT = things.values;
    do {
        const next1 = entries1.next();
        const next2 = entries2.next();
        if (next1.done && next2.done) return c;
        if (next1.done || next2.done) return Number.NaN;
        const [k1, v1] = next1.value;
        const [k2, v2] = next2.value;
        if (!keyT.equals(k1, k2)) return Number.NaN;
        const d = valueT.compare(v1, v2);
        if (Number.isNaN(d)) return Number.NaN;
        if (d !== 0) {
            if ((d > 0 && c < 0) || (d < 0 && c > 0)) return Number.NaN;
            c = d;
        }
    } while (true)
}

/**
 * Computes the hash of a map based on the size of the map and the 
 * given hash functions for keys and values.
 */
 export function MapHash<M, K, V>(things : MapThingsBase<M, K, V>, map : M) : int {
    const valueT = things.values;
    const keyT = things.keys;
    function* run() {
        for (let [k, v] of things.entries(map)) {
            yield combineHashes([keyT.hashOf(k), valueT.hashOf(v)]);
        }
    }
    return combineHashes([mapHashSeed, things.size(map), combineHashesOrderInvariant(run())]);
}
freeze(MapHash);

export function MapFrom<M, K, V>(things : MapThingsBase<M, K, V>, keyValues : Iterable<[K, V]>) : M {
    let map = things.empty();
    for (const [key, value] of keyValues) {
        map = things.put(map, key, value).result;
    }
    return map;
}

/**
 * Computes the hash of an empty map.
 */
export const EmptyMapHash: int = combineHashes([mapHashSeed, 0, combineHashes([])]);

/** Prints a map. */
export function MapPrint<M, K, V>(things : MapThingsBase<M, K, V>, map : M) : string {
    const joined = joinStrings(", ", function*() { 
        for (const [k, v] of things.entries(map)) {
            yield things.keys.print(k) + " ↦ " + things.values.print(v);
        }
    }());
    return "[" + joined + "]";
}
freeze(MapPrint);

function forceToString(x : any) : string {
    return String(x);
}

export function MapCheckKeyValue<M, K, V>(things : MapThingsBase<M, K, V>, key : K, value : V) {
    if (!things.keys.inDomain(key)) { throw new Error(`Key '${forceToString(key)}' is not in domain.`); }
    if (!things.values.inDomain(value)) { throw new Error(`Value '${forceToString(value)}' is not in domain.`); }
}
freeze(MapCheckKeyValue);
 
export function pickRandomKey<M, K, V>(things : MapThingsBase<M, K, V>, map : M) : K | undefined {
    const size = things.size(map);
    let i = Math.floor(Math.random() * size);
    if (i >= size) i = size - 1;
    for (const [k, v] of things.entries(map)) {
        if (i === 0) return k;
        i--;
    }
    return undefined;
}
freeze(pickRandomKey);

export type SealedMap = Sealed<"Map">

export function SealedMaps<M, K, V>(mapThings : MapThings<M, K, V>) : MapThings<SealedMap, K, V> {
    const seal : Seal<"Map", M> = Seal();
    const things : MapThings<any, K, V>  = {
        keys: mapThings.keys,
        values: mapThings.values,
        empty(): SealedMap {
            return seal.make(mapThings.empty());
        },
        from(keyValues: Iterable<[K, V]>) : SealedMap {
            return seal.make(mapThings.from(keyValues));
        },
        size(map: SealedMap): nat {
            return mapThings.size(seal.content(map));
        },
        entries: function (map: SealedMap): IterableIterator<[K, V]> {
            return mapThings.entries(seal.content(map));
        },
        get(map: SealedMap, key: K): V | undefined {
            return mapThings.get(seal.content(map), key);
        },
        has(map: SealedMap, key: K): boolean {
            return mapThings.has(seal.content(map), key);
        },
        put(map: SealedMap, key: K, value: V): { old: V | undefined; result: SealedMap; } {
            const content = seal.content(map);
            const r = mapThings.put(content, key, value);
            if (r.result === content) return { old: r.old, result: map };
            else return { old: r.old, result: seal.make(r.result) };
        },
        putIfNew(map: SealedMap, key: K, value: V): { old: V | undefined; result: SealedMap; } {
            const content = seal.content(map);
            const r = mapThings.putIfNew(content, key, value);
            if (r.result === content) return { old: r.old, result: map };
            else return { old: r.old, result: seal.make(r.result) };
        },
        remove(map: SealedMap, key: K): { old: V | undefined; result: SealedMap; } {
            const content = seal.content(map);
            const r = mapThings.remove(content, key);
            if (r.result === content) return { old: r.old, result: map };
            else return { old: r.old, result: seal.make(r.result) };
        },
        immutable: mapThings.immutable,
        ordered: mapThings.ordered,
        inDomain(map: SealedMap): boolean {
            let m : M
            try {
                m = seal.content(map);
            } catch {
                return false;
            }
            return mapThings.inDomain(m);
        },
        equals(map1: SealedMap, map2: SealedMap): boolean {
            return mapThings.equals(seal.content(map1), seal.content(map2));
        },
        compare(map1: SealedMap, map2: SealedMap): number {
            return mapThings.compare(seal.content(map1), seal.content(map2));
        },
        hashOf(map: SealedMap): number {
            return mapThings.hashOf(seal.content(map));
        },
        clone(map: SealedMap): SealedMap {
            const content = seal.content(map);
            const cloned = mapThings.clone(content);
            if (cloned === content) return map;
            else return seal.make(cloned);
        }, 
        print(map: SealedMap): string {
            const content = seal.content(map);
            return mapThings.print(content);
        }
    };
    freeze(things);
    return things;
}
freeze(SealedMaps);

