/**
 * A Cloneable object can be cloned, i.e. it can be copied, with [[clone | copy-on-write semantics]] being the default.
 * 
 * Subsequent changes of the copy/clone do not affect the original object.
 * Of course this isolation from changes is only true for modifications through the official API of the object: 
 * Mutations done to accessible objects nested in the original and shared by the clone will of course propagate anyway.
 **/
export interface Cloneable {

    /**
     * Makes a clone of this object, with copy-on-write semantics being the default. 
     * 
     * If force is false or undefined, then this should execute in constant time, and incur almost no runtime cost. 
     * For immutable things, this is easily achieved by just returning `this`. 
     * For mutable things, this can be achieved by delaying the actual copying until the first modification.
     * 
     * If force is true, then the actual copying should be done without delay.
     */
    clone(force? : boolean) : this

}