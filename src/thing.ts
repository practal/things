import { Equatable } from "./equatable";
import { Hash, Hashable } from "./hashable";
import { Comparable, PartialOrder } from "./comparable";
import { bigints, booleans, int, numbers, strings } from "./primitives";

export class Thing implements Equatable, Hashable, Comparable {
 
    static {
        Object.setPrototypeOf(Thing.prototype, null);
        Object.freeze(Thing.prototype);
        Object.freeze(Thing);
    }

    equals(other: this): boolean {
        return this === other;
    }

    get hash(): int {
        return strings.hash(this.toString());
    }

    compare(other: any): number {
        if (this.equals(other)) { return 0; } else { return Number.NaN; }
    }   
    
    public toString(): string {
        return "something";
    }

}

export function finalClass(finalClass : string) : never {
    throw new Error(`Cannot subclass final class ${finalClass}.`);
}

export const Things: Hash<any> & PartialOrder<any> = {

    equals(lhs : any, rhs : any) : boolean {
        if (lhs instanceof Thing) {
            return lhs.equals(rhs); 
        } else if (rhs instanceof Thing) {
            return rhs.equals(lhs);
        } else {
            return lhs === rhs || (Number.isNaN(lhs) && Number.isNaN(rhs));
        }
    },

    hash(t : any) : int {
        if (t instanceof Thing) {
            return t.hash;
        } else {
            switch (typeof t) {
                case "number": return numbers.hash(t);
                case "string": return strings.hash(t);
                case "boolean": return booleans.hash(t);
                case "bigint": return bigints.hash(t);
                default: return strings.hash(`${t}`);
            }
        }
        throw new Error();
    },

    compare(lhs : any, rhs : any) : number {
        if (lhs instanceof Thing) {
            return lhs.compare(rhs); 
        } else if (rhs instanceof Thing) {
            return -rhs.compare(lhs);
        } else {
            if (lhs < rhs) return -1;
            else if (lhs > rhs) return 1;
            else if (lhs === rhs) return 0;
            else return Number.NaN;
        }
    }
}

Object.freeze(Things);

export function canonicalThings<T>() : Hash<T> & PartialOrder<T> {
    return Things;
}

Object.freeze(canonicalThings);
