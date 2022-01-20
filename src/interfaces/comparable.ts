import { Equatable, Equality } from "./equatable";

export const UNRELATED = 0;
export type UNRELATED = 0;

export const LESS = 1;
export type LESS = 1;

export const EQUAL = 2;
export type EQUAL = 2;

export const GREATER = 3;
export type GREATER = 3;

export type ComparisonResult = UNRELATED | LESS | EQUAL | GREATER;

export interface PartialOrder<T> extends Equality<T> {

    /**
     * Compares lhs with rhs and returns how they relate to each other, e.g. LESS if lhs is less than rhs.
     * 
     * It is possible to represent partial orders, by returning UNRELATED if lhs and rhs are not related.
     * 
     * Comparison must have the following properties for all x, y, z of type T:
     * * *Compatible with Equality*: compare(x, y) is true iff equals(x, y) is true
     * * *Antisymmetry*: 
     *   * compare(x, y) === LESS implies compare(y, x) === GREATER
     *   * compare(x, y) === GREATER implies compare(y, x) === LESS
     *   
     *   From this it follows that compare(x, y) === UNRELATED implies compare(y, x) === UNRELATED. 
     */
    compare(lhs : T, rhs : T) : ComparisonResult

}

export interface Comparable extends Equatable {

    /**
     * Compares this object with other. 
     * 
     * It is possible to represent partial orders, by returning NaN if this and other are not related.
     * 
     * Comparison must have the following properties:
     * * *Compatible with equality*: this.compareTo(other) === EQUAL is true iff this.isEqualTo(other) is true
     * * *Antisymmetry*:
     *   * this.compareTo(other) === LESS implies other.compareTo(this) === GREATER if other is a Comparable
     *   * this.compareTo(other) === GREATER implies other.compareTo(this) === LESS if other is a Comparable
     * 
     *   From this it follows that this.compareTo(other) === UNRELATED implies other.compareTo(this) === UNRELATED if other is a Comparable.
     */
    compareTo(other : any) : ComparisonResult

}