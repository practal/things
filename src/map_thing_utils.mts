import {Thing} from "./thing.mjs";
import {nat, int} from "./primitives.mjs";
import { combineHashes } from "./utils.mjs";

/** A basic subset of [[MapThing]] used by the utility functions. */
export interface MapThingBase<M, Key, Value> {

    readonly keyT : Thing<Key>
    readonly valueT : Thing<Value>
    
    size(map : M) : nat
 
    entries(map : M): IterableIterator<[Key, Value]> 

    get(map : M, key : Key) : Value | undefined

    has(map : M, key : Key) : boolean   
    
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


