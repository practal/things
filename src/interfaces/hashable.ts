import { Equatable, Equality } from "./equatable";
import { int } from "../primitives";

export interface Hashable extends Equatable {

    /** 
     * Returns the hash of this object, which must be an integer.
     * 
     * Furthermore, the following must be true: if this.isEqualTo(other), and other is Hashable, then this.hash === other.hash.
     */
    get hash() : int

}

export interface Hash<T> extends Equality<T> {

    /** 
     * Returns the hash of t. The hash must be an integer.
     * 
     * Furthermore, the following must be true for all x, y of type T: if equals(x, y) is true, then hashOf(x) === hashOf(t) is true as well.
     */
    hashOf(t : T) : int

}


