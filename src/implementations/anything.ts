import { bigints, booleans, numbers, strings } from "../implementations/primitives";
import { ComparisonResult, EQUAL, GREATER, LESS, UNRELATED } from "../interfaces/comparable";
import { Things } from "../interfaces/things";
import { Thing } from "./thing";
import { mirrorComparisonResult } from "./utils";

function isJSNumeric(x : any) : x is number | Number | bigint | BigInt {
    return typeof x === "number" || x instanceof Number || typeof x === "bigint" || x instanceof BigInt;
}

/** 
 * Implements the [[Things]] interface for any value. 
 * Cloning is supported only for values of type [[Thing]], and for primitive types and their wrappers. 
 */
export const Anything: Things<any> = {

    hashOf: function (t: any): number {
        if (t instanceof Thing) {
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

    equals: function (lhs: any, rhs: any): boolean {
        if (lhs instanceof Thing) {
            return lhs.isEqualTo(rhs);
        } else if (rhs instanceof Thing) {
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

    compare: function (lhs: any, rhs: any): ComparisonResult {
        if (lhs instanceof Thing) {
            return lhs.compareTo(rhs);
        } else if (rhs instanceof Thing) {
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
    },

    cloneOf: function (t: any, force?: boolean): any {
        if (t instanceof Thing) return t.clone(force);
        if (t instanceof Number || t instanceof String || t instanceof BigInt || t instanceof Symbol || t instanceof Boolean || t == null)
            return t;
        else {
            const ty = typeof t;
            switch (ty) {
                case "number": return t;
                case "string": return t;
                case "boolean": return t;
                case "bigint": return t;
                case "symbol": return t;
                default: throw new Error(`Don't know how to clone object of type ${ty}`);
            }
        }
    }
};

Object.freeze(Anything);