import { Things } from "../interfaces/things";
import { ComparisonResult, EQUAL, GREATER, LESS, UNRELATED } from "../interfaces/comparable"
import { freeze, hashOfString } from "./utils";
import { int, primitive } from "../interfaces/primitives";


/** 
 * Implements the [[Things]] interface for any subtype of all primitive types. 
 * 
 * Comparison is based on the built-in JavaScript operators === and <, but diverges from 
 * it for Number.NaN: equals(NaN, NaN) holds, so that [[Equality.equals | equality is reflexive]].
 */
export class Primitives<P extends primitive> implements Things<P> {

    static {
        freeze(Primitives);
    }

    hashOf(t: P): int {
        if (Number.isInteger(t)) 
            return t as int;
        else 
            return t == null ? 0 : hashOfString(t.toString());
    }

    equals(lhs: P, rhs: P): boolean {
        return lhs === rhs || (Number.isNaN(lhs) && Number.isNaN(rhs));
    }

    compare(lhs: P, rhs: P): ComparisonResult {
        if (lhs === rhs) return EQUAL;
        else if (typeof lhs === "symbol") return UNRELATED;
        else {
            if (lhs < rhs) return LESS;
            else if (lhs > rhs) return GREATER;
            else if (Number.isNaN(lhs) && Number.isNaN(rhs)) return EQUAL;
            else return UNRELATED;
        }
    }

}

export const primitives : Things<primitive> = new Primitives<primitive>();

freeze(primitives);

class _ints implements Things<int> {

    static {
        freeze(_ints);
    }

    hashOf(t: int): int { 
        return t;
    }

    equals(lhs: int, rhs: int): boolean {
        return lhs === rhs;
    }

    compare(lhs: int, rhs: int): ComparisonResult {
        if (lhs < rhs) return LESS;
        else if (lhs > rhs) return GREATER;
        else return EQUAL;
    }

}

/** 
 * Implements the [[Things]] interface for all integers. 
 */
export const ints : Things<int> = new _ints();

freeze(ints);

class _booleans implements Things<boolean> {

    static {
        freeze(_booleans);
    }

    hashOf(b: boolean): int { 
        return b ? 1 : 0;
    }

    equals(lhs: boolean, rhs: boolean): boolean {
        return lhs === rhs;
    }

    compare(lhs: boolean, rhs: boolean): ComparisonResult {
        if (lhs === rhs) return EQUAL;
        else return lhs < rhs ? LESS : GREATER;
    }

}

/** 
 * Implements the [[Things]] interface for all booleans. 
 */
export const booleans : Things<boolean> = new _booleans();

freeze(booleans);

/** Implements the [[Things]] interface for all numbers. */ 
export const numbers : Things<number> = new Primitives<number>();

freeze(numbers);

/** Implements the [[Things]] interface for all strings. */ 
export const strings = new Primitives<string>();

freeze(strings);

/** Implements the [[Things]] interface for all bigints. */ 
export const bigints = new Primitives<bigint>();

freeze(bigints);