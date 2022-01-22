import { Things } from "../interfaces/things";
import { Equality, Equatable } from "../interfaces/equatable";
import { Something } from "../interfaces/things";
import { int } from "../interfaces/primitives";
import { ComparisonResult } from "../interfaces/comparable";
import { freeze } from "./utils";
import { Hash, Hashable } from "../interfaces/hashable";

/** Implements Equality according to [sameValueZero](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#same-value-zero_equality). */
export const sameValueZeroEquality : Equality<any> = {
    equals: function (lhs: any, rhs: any): boolean {
        return lhs === rhs || Number.isNaN(lhs) && Number.isNaN(rhs);
    },
};

freeze(sameValueZeroEquality);

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