/**
 * A Cloneable object can be cloned, i.e. it can be copied with [[clone | copy-on-write semantics]].
 * 
 * Subsequent changes of the copy/clone do not affect the original object.
 * Note that cloning is *shallow*: 
 * * Isolation from changes only holds for modifications through the official API of the object. 
 * * Mutations done to accessible nested objects without cloning them first will show in both the original and the clone.
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
     * Optionally, call this method on a clone after you are done with it. This optimizes resource usage and avoids unnecessary copying, but can lead to non-constant runtime overhead.
     * 
     * Calling this method is not necessary, as normal garbage collection will take care of things. 
     */
    release() : void;

}

/** A [[Mutable]] is a [[Cloneable]] which can be overwritten in place via [[assign]]. */
export interface Mutable extends Cloneable {

    /**
     * Overwrites the current value of this object with the value passed as the argument. 
     * 
     * Just like [[clone]], this operation is supposed to perform in constant time, and incur almost no runtime cost. 
     */
     assign(value : this) : void;

}




