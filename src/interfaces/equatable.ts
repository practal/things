export interface Equality<T> {

    /**
     * Tests if lhs is equal to rhs. Equality testing must obey the following rules for all x, y, z of type T:
     * * *Reflexivity*: equals(x, x) is true 
     * * *Symmetry*: if equals(x, y) is true, then equals(y, x) is true as well
     * * *Transitivity*: if equals(x, y) is true, and equals(y, z) is true, then x.equals(z) is true as well
     * * *Undefinedness*: if equals(undefined, x) or equals(x, undefined) is true, then x === undefined
     */ 
    equals(lhs : T, rhs : T) : boolean

}

export interface Equatable {

    /**
     * Tests if this object is equal to other. Equality testing must obey the following rules:
     * * *Reflexivity*: x.isEqualTo(x) is true
     * * *Symmetry*: if x.isEqualTo(y) is true, and y is an Equatable, then y.isEqualTo(x) is true as well
     * * *Transitivity*: if x.isEqualTo(y) is true, and y.isEqualTo(z) is true, then x.isEqualTo(z) is true as well
     * * *Undefinedness*: x.isEqualTo(undefined) is false
     */ 
    isEqualTo(other : any) : boolean

}