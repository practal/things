import {Thing} from "./thing.mjs";
import {nat, int} from "./primitives.mjs";
import { combineHashes, freeze } from "./utils.mjs";

/** A basic subset of [[MapThing]] used by the utility functions. */
export interface MapThingBase<M, Key, Value> {

    readonly keyT : Thing<Key>
    readonly valueT : Thing<Value>
    
    size(map : M) : nat
 
    entries(map : M): IterableIterator<[Key, Value]> 

    get(map : M, key : Key) : Value | undefined

    has(map : M, key : Key) : boolean   

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
export function MapCompare<M, K, V>(thing : MapThingBase<M, K, V>, map1 : M, map2 : M) : number {
    if (thing.ordered)
        return MapCompareOrdered(thing, map1, map2);
    else 
        return MapCompareUnordered(thing, map1, map2);
}
freeze(MapCompare);

function MapCompareUnordered<M, K, V>(thing : MapThingBase<M, K, V>, map1 : M, map2 : M) : number {
    if (thing.size(map1) !== thing.size(map2)) return Number.NaN; 
    let c = 0;
    const valueT = thing.valueT;
    for (const [k, f] of thing.entries(map1)) {
        let g = thing.get(map2, k);
        if (g === undefined) {
            if (!thing.has(map2, k)) return Number.NaN; 
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

function MapCompareOrdered<M, K, V>(thing : MapThingBase<M, K, V>, map1 : M, map2 : M) : number {
    if (thing.size(map1) !== thing.size(map2)) return Number.NaN; 
    let entries1 = thing.entries(map1);
    let entries2 = thing.entries(map2);
    let c = 0;
    const keyT = thing.keyT;
    const valueT = thing.valueT;
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
 export function MapHash<M, K, V>(thing : MapThingBase<M, K, V>, map : M) : int {
    const valueT = thing.valueT;
    const keyT = thing.keyT;
    function* run() {
        yield thing.size(map);
        for (let [k, v] of thing.entries(map)) {
            yield keyT.hashOf(k);
            yield valueT.hashOf(v);
        }
    }
    return combineHashes(run());
}
freeze(MapHash);

export function pickRandomKey<M, K, V>(thing : MapThingBase<M, K, V>, map : M) : K | undefined {
    const size = thing.size(map);
    let i = Math.floor(Math.random() * size);
    if (i >= size) i = size - 1;
    for (const [k, v] of thing.entries(map)) {
        if (i === 0) return k;
        i--;
    }
    return undefined;
}

