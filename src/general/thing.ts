import { combineHashes, hashOfString, iterateCodepoints } from "../implementations/utils";
import { ComparisonResult, EQUAL, UNRELATED } from "../interfaces/comparable";
import { Something } from "../interfaces/things";
import { int } from "./primitives";

/** The abstract base class used for all implementations of the [[Something]] interface in the [[things]] package. */
export abstract class Thing implements Something {

    static {
        Object.setPrototypeOf(Thing.prototype, null);
        Object.freeze(Thing.prototype);
        Object.freeze(Thing);
    }

    abstract toString(): string 
    
    abstract clone(force?: boolean): this

    /**
     * Implements equality via ===, JavaScript's built-in strict equality.
     * 
     * Subclasses will override this to implement a more suitable notion of [[Equatable.isEqualTo | equality]].
     */
    isEqualTo(other: any): boolean {
        return this === other;
    }

    /**
     * Implements [[Comparable.compareTo | comparison]] by returning [[EQUAL]] if [[Equatable.isEqualTo | this.isEqualTo(other)]], and otherwise [[UNRELATED]].
     * 
     * Subclasses can implement an ordering beyond equality by overriding this method.
     */
    compareTo(other: any): ComparisonResult {
        return this.isEqualTo(other) ? EQUAL : UNRELATED;
    }
 
    /** 
     * Implements [[Hashable.hash | hashing]] by computing the hash of [[toString | this.toString()]].
     * 
     * This is a default implementation of hashing that usually gives acceptable results.  
     * 
     * The subclass should override it, as it is more efficient to reimplement hashing in subclasses based on the actual data structure.
     * For this, [[utils.combineHashes]] can be used to compute the hash of a thing from the hashes of its components.
     */
    get hash(): int {
        return hashOfString(this.toString());
    }

}