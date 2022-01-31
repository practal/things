/**
 * A Cloneable object can be cloned, i.e. it can be copied.
 * 
 * Subsequent changes of the copy/clone do not affect the original object.
 * Note that cloning is *shallow*: 
 * * Isolation from changes only holds for modifications through the official API of the object. 
 * * Mutations done to accessible nested objects without cloning them first will show in both the original and the clone.
 **/
export interface Cloneable {

    /**
     * Makes a shallow clone of this object. 
     * 
     * Most things execute this in constant time with almost no runtime cost. 
     * For immutable things, this is easily achieved by just returning `this`. 
     * For mutable things, this can be achieved by deferring the cost of copying until actual mutation using [[CopyOnWrite | copy-on-write]].
     */
    clone() : this;

    /**
     * Optionally, call this method on a clone after you are done with it. This optimizes resource usage and avoids unnecessary copying, but can lead to non-constant runtime overhead.
     * 
     * Calling this method is not necessary, as normal garbage collection will take care of things. 
     * 
     * This should execute in constant time, and incur almost no runtime cost. 
     */
    release() : void;

}

/** A [[Mutable]] is a [[Cloneable]] which can be overwritten in place via [[assign]]. */
export interface Mutable extends Cloneable {

    /**
     * Overwrites the current value of this object with the value passed as the argument. 
     * 
     * Just like [[clone]], most things perform this in constant time. 
     */
     assign(value : this) : void;

}




