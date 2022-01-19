export interface Equatables<T> {

    equals(lhs : T, rhs : T) : boolean

}

export interface Equatable {

    equals(other : this) : boolean

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
