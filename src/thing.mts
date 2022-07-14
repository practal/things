import {nat, int} from "./primitives.mjs";

export interface Thing<T>  {

    /** Specifies the elements of type T that form the domain of things. */
    inDomain(x : T) : boolean

    /**
     * Tests if x is equivalent to y where both x and y are assumed to be [[inDomain | in the domain]]. 
     * Equivalence testing must be *reflexive*, *symmetric* and *transitive* on the domain:
     * * *Reflexivity*: The condition equals(x, x) holds.
     * * *Symmetry*: If equals(x, y) is true, then so is equals(y, x). 
     * * *Transitivity*: If equals(x, y) and equals(y, z) are both true, then so is equals(x, z). 
     */ 
    equals(x : T, y : T) : boolean

    /**
     * Compares x with y and returns how they relate to each other.
     * 
     * It is possible to represent partial orders by returning NaN 
     * if x and y are not related.
     * 
     * Comparison must have the following properties for all a, b, c and d [[inDomain | in the domain]]: 
     * * *Compatibility with Equality*: 
     *   * If equals(a, b) and equals(c, d) are both true, then a relates to c in the same way as b relates to d. 
     *   * We have that equals(a, b) is true iff compare(a, b) === 0 is true.
     *   * If a and b are related, then both equals(a, a) and equals(b, b) are both true. 
     * * *Antisymmetry*: 
     *   * compare(a, b) < 0 implies compare(b, a) > 0
     *   * compare(a, b) > 0 implies compare(b, a) < 0
     * * *Transitivity*: 
     *   * If compare(a, b) < 0 and compare(b, c) < 0, then compare(a, c) < 0.
     * @returns 
     *   * 0 if x and y are equal
     *   * a negative value if x < y, 
     *   * a positive value if x > y
     *   * NaN if x and y are unrelated 
     */
    compare(x : T, y : T) : number

    /** 
     * Returns the hash of t. 
     * 
     * The following must be true for all x, y of type T: 
     * If equals(x, y) is true, then so is hashOf(x) === hashOf(y).
     */
    hashOf(t : T) : int    
    
    /** 
     * Clones x, so that mutations of x do not affect the clone and vice versa. Cloning must be compatible with hashing and order:
     * 
     * * hashOf(x) = hashOf(clone(x))
     * * compare(x, y) = compare(x, clone(y))
     * 
     * If T [[isImmutable | is immutable]], then this will just return x.
     */
    clone(x : T) : T 

    /** 
     * Returns true if it is known that elements of type T are immutable, otherwise returns false.
     */
    readonly immutable : boolean

}

