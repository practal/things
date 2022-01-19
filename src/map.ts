import { PartialOrder } from "./comparable";
import { combineHashCodes, Hash } from "./hashable";
import { int, ints } from "./primitives";

export interface MutableMap<Key, Value> extends Map<Key, Value> {

    put(key : Key, value : Value) : Value | undefined

    putIfUndefined(key : Key, value : Value) : Value | undefined

    remove(key : Key) : Value | undefined

}

export interface ImmutableMap<Key, Value> extends ReadonlyMap<Key, Value> {

    put(key : Key, value : Value) : {old : Value | undefined, result : ImmutableMap<Key, Value> }

    putIfUndefined(key : Key, value : Value) : {old : Value | undefined, result : ImmutableMap<Key, Value> }

    remove(key : Key) : { old : Value | undefined, result : ImmutableMap<Key, Value> }

}

export function MapCompare<K, V>(F : Map<K, V>, G : Map<K, V>, Values : PartialOrder<V>) : number {
    if (F === G) { return 0; }
    let c = ints.compare(F.size, G.size);
    if (c != 0) { return c; }
    for (let [k, f] of F) {
        let g = G.get(k);
        if (g === undefined) {
            if (!G.has(k)) return Number.NaN;
            if (f !== undefined) return Number.NaN;
        } else {
            c = Values.compare(f, g);
            if (c != 0) return Number.NaN;
        }
    }
    return 0;
}

export function MapHash<K, V>(M : Map<K, V>, Keys : Hash<K>, Values : Hash<V>) : int {
    function* run() {
        yield M.size;
        for (let [k, v] of M) {
            yield Keys.hash(k);
            yield Values.hash(v);
        }
    }
    return combineHashCodes(run());
}


