import {Thing} from "./thing.mjs";
import {nat, int} from "./primitives.mjs";
import { combineHashes, freeze } from "./utils.mjs";
import { MapThing } from "./map_thing.mjs";

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
freeze(pickRandomKey);

const seal = Symbol("SealedMap");

export class SealedMap<M> {
    #content : M
    constructor(secret : symbol, content : M) {
        if (secret !== seal) throw new Error("Cannot create SealedMap directly.");
        this.#content = content;
    }
    content(secret : symbol) : M {
        if (secret !== seal) throw new Error("Cannot access content of SealedMap directly.");
        return this.#content;
    }
}

export function sealMapThing<M, K, V>(mapThing : MapThing<M, K, V>) : MapThing<SealedMap<M>, K, V> {
    const thing : MapThing<SealedMap<M>, K, V>  = {
        keyT: mapThing.keyT,
        valueT: mapThing.valueT,
        empty(): SealedMap<M> {
            return new SealedMap(seal, mapThing.empty());
        },
        from(keyValues: Iterable<[K, V]>): SealedMap<M> {
            return new SealedMap(seal, mapThing.from(keyValues));
        },
        size(map: SealedMap<M>): nat {
            return mapThing.size(map.content(seal));
        },
        entries: function (map: SealedMap<M>): IterableIterator<[K, V]> {
            return mapThing.entries(map.content(seal));
        },
        get(map: SealedMap<M>, key: K): V | undefined {
            return mapThing.get(map.content(seal), key);
        },
        has(map: SealedMap<M>, key: K): boolean {
            return mapThing.has(map.content(seal), key);
        },
        put(map: SealedMap<M>, key: K, value: V): { old: V | undefined; result: SealedMap<M>; } {
            const content = map.content(seal);
            const r = mapThing.put(content, key, value);
            return { old: r.old, result: new SealedMap(seal, r.result) };
        },
        putIfUndefined(map: SealedMap<M>, key: K, value: V): { old: V | undefined; result: SealedMap<M>; } {
            const content = map.content(seal);
            const r = mapThing.putIfUndefined(content, key, value);
            return { old: r.old, result: new SealedMap(seal, r.result) };
        },
        remove(map: SealedMap<M>, key: K): { old: V | undefined; result: SealedMap<M>; } {
            const content = map.content(seal);
            const r = mapThing.remove(content, key);
            return { old: r.old, result: new SealedMap(seal, r.result) };
        },
        immutable: false,
        ordered: false,
        inDomain(map: SealedMap<M>): boolean {
            return mapThing.inDomain(map.content(seal));
        },
        equals(map1: SealedMap<M>, map2: SealedMap<M>): boolean {
            return mapThing.equals(map1.content(seal), map2.content(seal));
        },
        compare(map1: SealedMap<M>, map2: SealedMap<M>): number {
            return mapThing.compare(map1.content(seal), map2.content(seal));
        },
        hashOf(map: SealedMap<M>): number {
            return mapThing.hashOf(map.content(seal));
        },
        clone(map: SealedMap<M>): SealedMap<M> {
            const cloned = mapThing.clone(map.content(seal));
            return new SealedMap(seal, cloned);
        }
    };
    freeze(thing);
    return thing;
}
freeze(sealMapThing);

