import { Equatable, Equality } from "./equatable";
import { int } from "./primitives";

export interface Hashable extends Equatable {

    /** 
     * Returns the hash code of this object. This must either be an integer, or an exception must be thrown to signal that this object cannot be hashed. 
     * Furthermore, the following must be true: if this.equals(other), then either this.hash === other.hash, or otherwise both this.hash and other.hash throw an exception
     */
    get hash() : int

}

export interface Hash<T> extends Equality<T> {

    /** 
     * Returns the hash code of t. This must either be an integer, or an exception must be thrown to signal that t cannot be hashed. 
     * Furthermore, the following must be true: for all x, y : T, if equals(x, y), then either x.hash === y.hash, or otherwise both x.hash and y.hash throw an exception.
     */
    hash(t : T) : int

}

/** Uses canonical equality and defines hash(t) as t.hash(). */
export function canonicalHash<T extends Hashable>() : Hash<T> {
    return new class {
        equals(lhs : T, rhs : T) : boolean {
            return lhs.equals(rhs);
        }        
        hash(t : T) : int {
            return t.hash;
        }
    };
}

/** Combines a sequence of hash codes into a single hash code. */ 
export function combineHashCodes(codes : Iterable<int>) : int {
    var sum = 1;
    for (let code of codes) {
        sum = 31 * sum + code;
        sum = sum & sum;
    }
    return sum;
}




