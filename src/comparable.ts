import { Equatable, Equality } from "./equatable";

export interface PartialOrder<T> extends Equality<T> {

    /**
     * Compares lhs with rhs and returns a number C, where:
     * * C < 0 is true if lhs is less than rhs 
     * * C === 0 is true if lhs is equal to rhs
     * * C > 0 is true if lhs is greater than rhs
     * * otherwise lhs and rhs are not comparable
     * 
     * It is thus possible to represent partial orders, by returning NaN if lhs and rhs are not related.
     * 
     * Comparison must have the following properties:
     * * *Compatible with equality*: C === 0 is true iff equals(lhs, rhs) is true
     * * *Antisymmetry*: For all x, y, z : T, we have
     *   * compare(x, y) < 0 implies compare(y, x) > 0
     *   * compare(x, y) > 0 implies compare(y, x) < 0 
     */
    compare(lhs : T, rhs : T) : number 

}

export interface Comparable extends Equatable {

    /**
     * Compares this object with other. The result is returned as a number C, where
     * * C < 0 is true if this is less than other 
     * * C === 0 is true if this is equal to other
     * * C > 0 is true if this is greater than other
     * * otherwise this and other are not comparable
     * 
     * It is thus possible to represent partial orders, by returning NaN if this and other are not comparable.
     * Comparison must have the following properties:
     * * *Compatible with equality*: C === 0 is true iff this.equals(other) is true
     * * *Antisymmetry*: For all other we have
     *   * this.compare(other) < 0 implies other.compare(this) > 0
     *   * this.compare(other) > 0 implies other.compare(this) < 0 
     */
    compare(other : any) : number

}