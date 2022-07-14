import { Equality } from "./equality.mjs";
import { int } from "./primitives.mjs";

export interface HashOf<T> extends Equality<T> {

    /** 
     * Returns the hash of t. 
     * 
     * The following must be true for all x, y of type T: 
     * If equals(x, y) is true, then so is hashOf(x) === hashOf(y).
     */
    hashOf(t : T) : int

}


