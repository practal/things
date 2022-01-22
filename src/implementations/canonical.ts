import { Things } from "../interfaces/things";
import { Equality, Equatable } from "../interfaces/equatable";
import { Something } from "../interfaces/things";
import { int } from "../interfaces/primitives";
import { ComparisonResult, EQUAL, UNRELATED } from "../interfaces/comparable";
import { freeze } from "./utils";
import { Hash, Hashable } from "../interfaces/hashable";
import { Anything } from "./anything";

/** Implements Equality according to [SameValueZero](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#same-value-zero_equality). */
export const SameValueZero : Things<any> = {

    /** 
     * Implements [SameValueZero](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#same-value-zero_equality) equality, 
     * i.e. it works like strict equality (===) except that NaN is equal to itself. 
     */
    equals(lhs: any, rhs: any): boolean {
        return lhs === rhs || (Number.isNaN(lhs) && Number.isNaN(rhs));
    },

    /** Same as [[Anything.compareTo]], except that if lhs and rhs are equal according to [[Anything.compareTo]], but not equal according to SameValueZero, then lhs and rhs are deemed to be [[UNRELATED]]. */
    compare(lhs: any, rhs: any): ComparisonResult {
        if (lhs === rhs || (Number.isNaN(lhs) && Number.isNaN(rhs))) return EQUAL;
        const c = Anything.compare(lhs, rhs);
        if (c === EQUAL) return UNRELATED; else return c;
    },
    
    /** Same as [[Anything.cloneOf]]. */
    cloneOf(t : any, force? : boolean) : any {
        return Anything.cloneOf(t, force);
    },

    /** Same as [[Anything.hashOf]]. */
    hashOf(t : any) : int {
        return Anything.hashOf(t);
    }
};

freeze(SameValueZero);

class CanonicalEquality<T extends Equatable> implements Equality<T> {
    
    static {
        freeze(CanonicalEquality);
    }

    constructor() {
        Object.freeze(this);
    }

    equals(lhs : T, rhs : T) : boolean {
        return lhs.isEqualTo(rhs);
    }   

}

/** Defines equals(lhs, rhs) as lhs.equals(rhs). */
export function canonicalEquality<T extends Equatable>() : Equality<T> {
    return Object.freeze(new CanonicalEquality<T>());
}

freeze(canonicalEquality);

class CanonicalHash<T extends Hashable> implements Hash<T> {

    static {
        freeze(CanonicalHash);
    }

    equals(lhs : T, rhs : T) : boolean {
        return lhs.isEqualTo(rhs);
    }

    hashOf(t : T) : int {
        return t.hash;
    }       

}

/** Implements [[Things]] based on the funtionality of [[Hashable]]. */
export function canonicalHash<T extends Hashable>() : Hash<T> {
    return Object.freeze(new CanonicalHash<T>()); 
}

freeze(canonicalHash);

class CanonicalThings<T extends Something> implements Things<T> {

    static {
        freeze(CanonicalThings);
    }

    equals(lhs : T, rhs : T) : boolean {
        return lhs.isEqualTo(rhs);
    }

    compare(lhs : T, rhs : T) : ComparisonResult {
        return lhs.compareTo(rhs);
    }

    hashOf(t : T) : int {
        return t.hash;
    }       

    cloneOf(t : T, force? : boolean) : T {
        return t.clone(force) as T;
    }

}

/** Implements [[Things]] based on the funtionality of [[Something]]. */
export function canonicalThings<T extends Something>() : Things<T> {
    return Object.freeze(new CanonicalThings<T>()); 
}

freeze(canonicalThings);