import { Mutable } from "./cloneable";
import { int } from "./primitives";
import { Something, Things } from "./things";

/** 
 * The base interface for all maps. 
 * 
 * Despite its name, it is not necessarily a [[Something]], so that JavaScript's built-in Map also has this interface. 
 * All MapThings implemented by the *things* package are either [[MutableMap | MutableMaps]] or [[ImmutableMap | ImmutableMaps]].
 */
export interface MapThing<Key, Value> {

    /** The [[Things]] interface used for handling the keys of this map. If not present, this is assumed to be [[SameValueZero]]. */
    Keys?() : Things<Key>

    /** The [[Things]] interface used for handling the values of this map. If not present, this is assumed to be [[Anything]]. */
    Values?() : Things<Value>

    /** Same as [[entries]]. */
    [Symbol.iterator](): IterableIterator<[Key, Value]>

    /** Iterates over all key-value pairs that constitute this map. No guarantees are made concerning the order of these pairs. */
    entries(): IterableIterator<[Key, Value]>

    /** 
     * Returns the value associated with the key in this map. Returns undefined if there is no such associated value. 
     * 
     * Note that a return value of undefined does not necessarily mean that has(key) is false: it could also be that the key is associated with undefined. 
     */ 
    get(key : Key) : Value | undefined

    /** Checks if the key is associated with some value in this map. */
    has(key : Key) : boolean

    /** The number of keys associated with some value in this map. */
    readonly size : int

}

/** 
 * The base interface for all mutable maps. 
 * 
 * Despite its name, it is not necessarily a [[Something]], so that JavaScript's built-in Map also has this interface. 
 * All MutableMapThings implemented by the *things* package are [[MutableMap | MutableMaps]].
 */
export interface MutableMapThing<Key, Value> extends MapThing<Key, Value> {

    /** Removes all key-value entries from the map. After clear(), this map is empty. */
    clear() : void

    /** Deletes the key-value pair for the given key. Returns false, if there was no such key-value pair to begin with, and true otherwise. */
    delete(key: Key): boolean;

    /** Associates the key with the given value, overwriting a possible previous association. */
    set(key : Key, value : Value) : this
}

/** The base interface for all mutable maps implemented in the *things* package. */
export interface MutableMap<Key, Value> extends Map<Key, Value>, MutableMapThing<Key, Value>, Something, Mutable {

    Keys() : Things<Key>

    Values() : Things<Value>

    put(key : Key, value : Value) : Value | undefined

    putIfUndefined(key : Key, value : Value) : Value | undefined

    remove(key : Key) : Value | undefined

    assign(value : this) : void;

    assign(it : Iterable<[Key, Value]>) : void;

}

/** The base interface for all immutable maps implemented in the *things* package. */
export interface ImmutableMap<Key, Value> extends ReadonlyMap<Key, Value>, MapThing<Key, Value>, Something {

    Keys() : Things<Key>

    Values() : Things<Value>

    put(key : Key, value : Value) : { old : Value | undefined, result : ImmutableMap<Key, Value> }

    putIfUndefined(key : Key, value : Value) : { old : Value | undefined, result : ImmutableMap<Key, Value> }

    remove(key : Key) : { old : Value | undefined, result : ImmutableMap<Key, Value> }

}
