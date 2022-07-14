import { Hashable } from "../interfaces/hashable";
import { Equatable } from "../interfaces/equatable";
import { bigints, booleans, numbers, strings } from "../implementations/primitives";
import { Comparable, ComparisonResult, EQUAL, GREATER, LESS, UNRELATED } from "../interfaces/comparable";
import { Things } from "../interfaces/things";
import { Thing } from "./thing";
import { freeze, mirrorComparisonResult } from "./utils";

function isJSNumeric(x : any) : x is number | Number | bigint | BigInt {
    return typeof x === "number" || x instanceof Number || typeof x === "bigint" || x instanceof BigInt;
}

/** Heuristic test if x is [[Comparable]]. */
export function isComparable(x : any) : x is Comparable {
    if (x instanceof Thing) return true;
    return typeof((x as Comparable).compareTo) === "function";
}

freeze(isComparable);

/** Heuristic test if x is [[Hashable]]. */
export function isHashable(x : any) : x is Hashable {
    if (x instanceof Thing) return true;
    return typeof((x as Hashable).hash) === "function";
}

freeze(isHashable);

/** Heuristic test if x is [[Equatable]]. */
export function isEquatable(x : any) : x is Equatable {
    if (x instanceof Thing) return true;
    return typeof((x as Equatable).isEqualTo) === "function";    
}

freeze(isEquatable);

/** 
 * Implements the [[Things]] interface for any value. 
 */
export const Anything : Things<any> = {

    hashOf(t: any): number {
        if (isHashable(t)) {
            return t.hash;
        } else {
            switch (typeof t) {
                case "number": return numbers.hashOf(t);
                case "string": return strings.hashOf(t);
                case "boolean": return booleans.hashOf(t);
                case "bigint": return bigints.hashOf(t);
                default: return strings.hashOf(`${t}`);
            }
        }
    },

    equals(lhs: any, rhs: any): boolean {
        if (isEquatable(lhs)) {
            return lhs.isEqualTo(rhs);
        } else if (isEquatable(rhs)) {
            return rhs.isEqualTo(lhs);
        } else {
            const lnumeric = isJSNumeric(lhs);
            const rnumeric = isJSNumeric(rhs);
            if (lnumeric && rnumeric) {
                return lhs == rhs || (Number.isNaN(lhs) && Number.isNaN(rhs));
            } else if (lnumeric || rnumeric) {
                return false;
            } else {
                return lhs === rhs;
            }
        }
    },

    compare(lhs: any, rhs: any): ComparisonResult {
        if (isComparable(lhs)) {
            return lhs.compareTo(rhs);
        } else if (isComparable(rhs)) {
            return mirrorComparisonResult(rhs.compareTo(lhs));
        } else {
            const lnumeric = isJSNumeric(lhs);
            const rnumeric = isJSNumeric(rhs);
            if (lnumeric && rnumeric) {
                if (lhs == rhs || (Number.isNaN(lhs) && Number.isNaN(rhs))) return EQUAL;
                if (lhs < rhs) return LESS;
                else if (lhs > rhs) return GREATER;
                else return UNRELATED;
            } else if (lnumeric || rnumeric) {
                return UNRELATED;
            } else {
                if (lhs === rhs) return EQUAL;
                if (typeof lhs === typeof rhs) {
                    if (lhs < rhs) return LESS;
                    else if (lhs > rhs) return GREATER;
                    else return UNRELATED;
                } else return UNRELATED;
            }
        }
    }

};

freeze(Anything);