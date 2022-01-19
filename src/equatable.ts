export interface Equality<T> {

    /**
     * Tests if lhs is equal to rhs. Equality testing must obey the following rules:
     * * *Reflexivity*: equals(x, x) is true for any x : T
     * * *Symmetry*: if equals(x, y) is true for any x, y : T, then equals(y, x) is true as well
     * * *Transitivity*: if equals(x, y) is true, and equals(y, z) is true for any x, y, z : T, then x.equals(z) is true as well
     * * *Undefinedness*: if equals(undefined, x) or equals(x, undefined) is true for any x : T, then x === undefined
     */ 
    equals(lhs : T, rhs : T) : boolean

}

export interface Equatable {

    /**
     * Tests if this object is equal to other. Equality testing must obey the following rules:
     * * *Reflexivity*: x.equals(x) is true
     * * *Symmetry*: if x.equals(y) is true, then y.equals(x) is true as well
     * * *Transitivity*: if x.equals(y) is true, and y.equals(z) is true, then x.equals(z) is true as well
     * * *Undefinedness*: x.equals(undefined) is not true
     */ 
    equals(other : any) : boolean

}

/** Defines equals(lhs, rhs) as lhs.equals(rhs). */
export function canonicalEquality<T extends Equatable>() : Equality<T> {
    return new class {
        equals(lhs : T, rhs : T) : boolean {
            return lhs.equals(rhs);
        }        
    };
}

const anyEquatables: Equality<any> = {
    equals(lhs : any, rhs : any) : boolean {
        return lhs === rhs;
    }
}

/** Defines equals(lhs, rhs) as lhs === rhs. */
export function strictEquality<T>() : Equality<T> {
    return anyEquatables;
}

/** Throws an exception with a message that lhs and rhs cannot be tested for equality. */
export function invalidEquals(lhs : any, rhs : any) : never {
    throw new Error(`Cannot test ${lhs} and ${rhs} for equality`);
}
