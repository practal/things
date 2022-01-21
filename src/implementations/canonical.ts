// todo: 
// sameValueZeroEquality
// canonicalEquality
// canonicalHash
// canonicalThings

import { Equality } from "../interfaces/equatable";

/** Implements Equality according to [sameValueZero](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#same-value-zero_equality). */
export const sameValueZeroEquality : Equality<any> = {

    equals: function (lhs: any, rhs: any): boolean {
        return lhs === rhs || Number.isNaN(lhs) && Number.isNaN(rhs);
    }
};

Object.freeze(sameValueZeroEquality);