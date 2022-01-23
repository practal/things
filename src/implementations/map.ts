import { int } from "../interfaces/primitives";
import { Hash } from "../interfaces/hashable";
import { ints } from "./primitives";
import { ComparisonResult, EQUAL, PartialOrder, UNRELATED } from "../interfaces/comparable";
import { combineHashes, freeze, isFunction, isNumber } from "./utils";
import { MapThing } from "../interfaces/map";

/** 
 * Compares two maps based on the given partial order on values. 
 * This operation is only well-defined under the assumption that the two equalities on keys are compatible with each other.
 */
export function MapCompare<K, V>(F : MapThing<K, V>, G : MapThing<K, V>, Values : PartialOrder<V>) : ComparisonResult {
    if (F === G) { return 0; }
    let c = ints.compare(F.size, G.size);
    if (c != EQUAL) { return c; }
    for (let [k, f] of F) {
        let g = G.get(k);
        if (g === undefined) {
            if (!G.has(k)) return UNRELATED;
            if (f !== undefined) return UNRELATED;
        } else {
            const d = Values.compare(f, g);
            if (d != EQUAL && d != c) return UNRELATED;
            c = d;
        }
    }
    return c;
}

freeze(MapCompare);

/**
 * Computes the hash of a map based on the given hash functions for keys and values.
 */
export function MapHash<K, V>(M : MapThing<K, V>, Keys : Hash<K>, Values : Hash<V>) : int {
    function* run() {
        yield M.size;
        for (let [k, v] of M) {
            yield Keys.hashOf(k);
            yield Values.hashOf(v);
        }
    }
    return combineHashes(run());
}

freeze(MapHash);

export function isMapThing<K, V>(m : any) : m is MapThing<K, V> {
    return isNumber(m.size) && isFunction(m.get) && isFunction(m.has) && m.entries !== undefined;
}
