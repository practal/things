import {Thing} from "./thing.mjs";
import {nat} from "./primitives.mjs";

/** General interface for working with maps. The interface works for both mutable and immutable maps. */
export interface MapThing<M, Key, Value> extends Thing<M> {

    readonly keyT : Thing<Key>
    readonly valueT : Thing<Value>

    /** Creates an empty map. */
    empty() : M

    /** Creates a map from the given sequence of key/value pairs. */
    from(keyValues : Iterable<[Key, Value]>) : M
    
    /** The number of keys associated with some value in map. */
    size(map : M) : nat
 
    /** Iterates over all key-value pairs in map. No guarantees are made concerning the order of these pairs. */
    entries(map : M): IterableIterator<[Key, Value]> 

    /** 
     * Returns the value associated with the key in the map. Returns undefined if there is no such associated value. 
     * 
     * Note that a return value of undefined does not necessarily mean that has(map, key) is false: it could also be that the key is associated with undefined. 
     */ 
    get(map : M, key : Key) : Value | undefined

    /** Checks if the key is associated with some value in map. */
    has(map : M, key : Key) : boolean   
    
    /** 
     * Assigns value to key in map. If the key was previously associated with some value v, v is returned as old, otherwise old is undefined. 
     * 
     * The changed map is returned as result. Note that put works for both immutable and mutable maps: 
     * For mutable maps, the result will be just map, that is result === map will hold.
     */
    put(map : M, key : Key, value : Value) : { old : Value | undefined, result : M }

    /** 
     * Assigns value to key in map, if the key was not present in map before. 
     * If the key was previously associated with some value v, v is returned as old, and result === map. 
     * Otherwise, old will be undefined.
     * 
     * The changed map is returned as result. Note that putIfUndefined works for both immutable and mutable maps: 
     * For mutable maps, the result will be just map, i.e. result === map will hold then.
     */    
    putIfUndefined(map : M, key : Key, value : Value) : { old : Value | undefined, result : M }

    /**
     * Removes key and its association with a value from map, and returns the changed map as result. If key has previously been associated with a value v, v is returned as old. 
     * Otherwise old is undefined, and result === map is guaranteed to hold. 
     * 
     * Note that remove works for both immutable and mutable maps: 
     * For mutable maps, the result will be just map, i.e. result === map will hold then.
     */
    remove(map : M, key : Key) : { old : Value | undefined, result : M}

    /**
     * Returns whether maps of type M are immutable or not. Note that immutable maps must have both immutable keys and immutable values.
     */ 
    immutable : boolean

}