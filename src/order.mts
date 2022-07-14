import { Equality } from "./equality.mjs";

/**
 * The type of comparison results, used by [[Order.compare]].
 */
export type ComparisonResult = 0 | 1 | 2 | 3;

export const UNRELATED : ComparisonResult = 0;
export const LESS : ComparisonResult = 1;
export const EQUAL : ComparisonResult = 2;
export const GREATER : ComparisonResult = 3;

/** Partial order on T. */
export interface Order<T> extends Equality<T> {

    /**
     * Compares x with y and returns how they relate to each other.
     * 
     * It is possible to represent partial orders by returning [[UNRELATED]] if x and y are not related.
     * 
     * Comparison must have the following properties for all a, b, c and d of type T:
     * * *Compatibility with Equality*: 
     *   * If equals(a, b) and equals(c, d) are both true, then so is compare(a, c) === compare(b, d). 
     *   * We have that equals(a, b) is true iff compare(a, b) === [[EQUAL]] is true.
     *   * Order and equality have the same domain, i.e. 
     *     equals(a, a) and equals(b, b) are both true if and only if a and b are related. 
     * * *Antisymmetry*: 
     *   * compare(a, b) === [[LESS]] implies compare(b, a) === [[GREATER]]
     *   * compare(a, b) === [[GREATER]] implies compare(b, a) === [[LESS]]
     * * *Transitivity*: 
     *   * If compare(a, b) === [[LESS]] and compare(b, c) === [[LESS]], then compare(a, c) === [[LESS]].
     */
    compare(x : T, y : T) : ComparisonResult

}