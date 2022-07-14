/** Partial equivalence relation on T. */
export interface Equality<T> {

    /**
     * Tests if x is equivalent to y for a subset D of T. 
     * D consists of those elements x of T for which equals(x, x) holds. 
     * Equivalence testing must be *symmetric* and *transitive*:
     * * *Symmetry*: If equals(x, y) is true, then so is equals(y, x). 
     * * *Transitivity*: If equals(x, y) and equals(y, z) are both true, then so is equals(x, z). 
     */ 
    equals(x : T, y : T) : boolean

}
