/**
 * A Cloneable object can be cloned, i.e. it can be copied with [[clone | copy-on-write semantics]].
 * 
 * Subsequent changes of the copy/clone do not affect the original object.
 * Of course this isolation from changes is only true for modifications through the official API of the object: 
 * Mutations done to accessible nested objects nested in the original without cloning them first will show in both the original and the clone.
 **/
export interface Cloneable {

    /**
     * Makes a clone of this object, instantaneously. 
     * 
     * This should execute in constant time, and incur almost no runtime cost. 
     * For immutable things, this is easily achieved by just returning `this`. 
     * For mutable things, this can be achieved using [[CopyOnWrite | copy-on-write]].
     */
    clone() : this;

    /**
     * Call this method on a clone after you are done with it. This optimizes resource usage and avoids unnecessary copying.
     */
    release() : void;

}

export interface Cloning<T> {

    /**
     * Makes a clone of t, instantaneously. 
     * 
     * This should execute in constant time, and incur almost no runtime cost. 
     * For immutable t, this is easily achieved by just returning t itself. 
     * For mutable things, this can be achieved using [copy-on-write](https://en.wikipedia.org/wiki/Copy-on-write), i.e. delaying the actual copying until the first modification.
     */
    cloneOf(t : T) : T;

    /**
     * After you are done with a clone, call this method with the clone as its argument to optimize resource usage and avoid unnecessary copying. 
     */ 
    release(clone : T) : void;

}