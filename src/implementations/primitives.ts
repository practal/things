import { Things } from "../interfaces/things";
import { ComparisonResult, EQUAL, GREATER, LESS, UNRELATED } from "../interfaces/comparable"
import { hashOfString } from "./utils";
import { int, primitive } from "../interfaces/primitives";


/** 
 * Implements the [[Things]] interface for all primitive types. 
 * 
 * Comparison is based on the built-in JavaScript operators === and <, but diverges from 
 * it for Number.NaN: equals(NaN, NaN) holds, so that [[Equality.equals | equality is reflexive]].
 */
export class primitives<P extends primitive> implements Things<P> {

    static {
        Object.freeze(primitives);
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

    cloneOf(t: P, force?: boolean): P {
        return t;
    }
}

/** 
 * Implements the [[Things]] interface for all integers. 
 */
 export class ints implements Things<int> {

    static {
        Object.freeze(ints);
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

    cloneOf(t: int, force?: boolean): int {
        return t;
    }

}

/** Implements the [[Things]] interface for all booleans. */ 
export class booleans implements Things<boolean> {

    static {
        Object.freeze(booleans);
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

    cloneOf(t: boolean, force?: boolean): boolean {
        return t;
    }

}

/** Implements the [[Things]] interface for all numbers. */ 
export type numbers = primitives<number>

/** Implements the [[Things]] interface for all strings. */ 
export type strings = primitives<string>

/** Implements the [[Things]] interface for all bigints. */ 
export type bigints = primitives<bigint>

