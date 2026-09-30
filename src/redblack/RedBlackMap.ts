import { Compare, Relation, freeze, nat } from "../index.js";
import { RedBlackSet } from "./RedBlackSet.js"

/**
 * Persistent ordered map, implemented by a set of [key, value] pairs compared
 * only by key. Iteration visits the stored pairs in ascending key order.
 * Updates leave the input map unchanged and may share existing structure.
 * Keys, values, and entry pairs are not deep-frozen: callers must not mutate
 * stored pairs or change keys in a way that invalidates their ordering.
 */
export interface RedBlackMap<K, V> extends Iterable<[K, V]> {

    /** Underlying persistent set; its comparator ignores each pair's value. */
    keyValues : RedBlackSet<[K, V]>

    /** Number of distinct comparator equality classes of keys. */
    size : nat

    /** Whether a comparator-equal key exists, even if its value is undefined. */
    has(key : K) : boolean 

    /** Returns the associated value, or undefined; use `has` to distinguish absence. */
    get(elem : K) : V | undefined 

    /**
     * Inserts or replaces an entry. For a comparator-equal key, replaces both
     * the stored key representative and its value with the supplied key/value.
     */
    set(key : K, value : V) : RedBlackMap<K, V> 

    /** Like `set`, in iteration order; the last entry for each equal key wins. */
    setMultiple(keyValuePairs : Iterable<[K, V]>) : RedBlackMap<K, V> 

    /**
     * Inserts only if no comparator-equal key exists. Otherwise preserves both
     * the stored key and its value (including undefined) and returns this map.
     */
    setIfAbsent(key : K, value : V) : RedBlackMap<K, V>

    /**
     * Like `setIfAbsent`, in iteration order. Existing entries win; otherwise
     * the first entry for each equal key wins. Returns this map if none is added.
     */
    setMultipleIfAbsent(keyValuePairs : Iterable<[K, V]>) : RedBlackMap<K, V>

    /** Removes the entry with a comparator-equal key, if present. */
    delete(key : K) : RedBlackMap<K, V>

    /** Like `delete`, processing keys in iteration order. */
    deleteMultiple(keys : Iterable<K>) : RedBlackMap<K, V>

    /** Keeps entries accepted by `predicate`, tested in ascending key order. */
    filter(predicate : (key : K, value : V) => boolean) : RedBlackMap<K, V> 

}

function promote<K, V>(key : K) : [K, V] {
    return [key, undefined as V];
}

function* promoteMultiple<K, V>(keys : Iterable<K>) : Generator<[K, V], void, void> {
    for (const key of keys) yield promote(key); 
}

/** Lifts a key comparator to entry pairs, comparing only their keys. */
export function promoteCompare<K>(key : Compare<K>) : Compare<[K, any]> {
    const order : Compare<[K, any]> = {
        compare: function (x: [K, any], y: [K, any]): Relation {
            return key.compare(x[0], y[0]);
        },
    };
    return order;
}

class RedBlackMapImpl<K, V> implements Iterable<[K, V]> {
    
    keyValues : RedBlackSet<[K, V]>

    constructor(keyValues : RedBlackSet<[K, V]>) {
        this.keyValues = keyValues;
        freeze(this);
    }

    get size() : nat { 
        return this.keyValues.size; 
    }

    has(key : K) : boolean {
        return this.keyValues.has(promote(key));
    } 

    get(elem : K) : V | undefined {
        const kv = this.keyValues.findEqual(promote(elem));
        if (kv === undefined) return undefined;
        return kv[1];
    } 

    set(key : K, value : V) : RedBlackMapImpl<K, V> {
        return new RedBlackMapImpl(this.keyValues.insert([key, value]));
    }

    setMultiple(keyValuePairs : Iterable<[K, V]>) : RedBlackMapImpl<K, V> {
        return new RedBlackMapImpl(this.keyValues.insertMultiple(keyValuePairs));
    } 

    setIfAbsent(key : K, value : V) : RedBlackMapImpl<K, V> {
        const keyValues = this.keyValues.insertIfAbsent([key, value]);
        return keyValues === this.keyValues ? this : new RedBlackMapImpl(keyValues);
    }

    setMultipleIfAbsent(keyValuePairs : Iterable<[K, V]>) : RedBlackMapImpl<K, V> {
        const keyValues = this.keyValues.insertMultipleIfAbsent(keyValuePairs);
        return keyValues === this.keyValues ? this : new RedBlackMapImpl(keyValues);
    }

    delete(key : K) : RedBlackMapImpl<K, V> {
        return new RedBlackMapImpl(this.keyValues.delete(promote(key)));
    }

    deleteMultiple(keys : Iterable<K>) : RedBlackMapImpl<K, V> {
        return new RedBlackMapImpl(this.keyValues.deleteMultiple(promoteMultiple(keys)));
    }

    [Symbol.iterator]() {
        return this.keyValues[Symbol.iterator]();
    }

    filter(predicate : (key : K, value : V) => boolean) : RedBlackMapImpl<K, V> {
        return new RedBlackMapImpl(this.keyValues.filter(kv => predicate(kv[0], kv[1])));
    }

}
freeze(RedBlackMapImpl);

/**
 * Creates a persistent ordered map. Initial entries are processed in iteration
 * order using insert-or-replace: the last entry for each comparator-equal key
 * wins. Keys must have a stable total ordering; an encountered comparison of
 * `Relation.UNRELATED` throws. Values may be undefined.
 */
export function RedBlackMap<K, V>(order : Compare<K>, keyValuePairs? : Iterable<[K, V]>) : RedBlackMap<K, V> {
    return new RedBlackMapImpl(RedBlackSet(promoteCompare(order), keyValuePairs));
}
freeze(RedBlackMap);
