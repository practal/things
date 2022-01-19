export interface Equatables<T> {

    equals(lhs : T, rhs : T) : boolean

}

export interface Equatable {

    /**
     * Tests if this object is equal to other. Equality testing must obey the following rules:
     * * *Reflexivity*: x.equals(x) is true
     * * *Symmetry*: if x.equals(y) is true, then y.equals(x) is true as well
     * * *Transitivity*: if x.equals(y) is true, and y.equals(z) is true, then x.equals(z) is true as well
     */ 
    equals(other : any) : boolean

}

export function defaultEquatables<T extends Equatable>() : Equatables<T> {
    return new class {
        equals(lhs : T, rhs : T) : boolean {
            return lhs.equals(rhs);
        }        
    };
}

const anyEquatables: Equatables<any> = {
    equals(lhs : any, rhs : any) : boolean {
        return lhs === rhs;
    }
}

export function jsEquatables<T>() : Equatables<T> {
    return anyEquatables;
}

export function invalidEquals(lhs : any, rhs : any) : never {
    throw new Error(`Cannot test ${lhs} and ${rhs} for equality`);
}
