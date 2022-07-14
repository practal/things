import {Thing} from "./thing.mjs";
import {freeze} from "./utils.mjs";

/** The union of all [primitive types](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) of JavaScript. */
export type primitive = number | string | boolean | symbol | bigint | null | undefined 

/** 
 * The type of integers. 
 * 
 * Use of int is just for documentation purposes: 
 * As it is just an alias for number, the difference to number is not enforced by the type or runtime system. 
 */
export type int = number 

/** 
 * The type of natural numbers starting from 0. 
 * 
 * Use of nat is just for documentation purposes: 
 * As it is just an alias for number, the difference to number is not enforced by the type or runtime system. 
 */
export type nat = number

export const NumberThing : Thing<number> = {

    inDomain(x: number): boolean {
        return typeof(x) === "number";
    },

    equals(x: number, y: number): boolean {
        return x === y || (Number.isNaN(x) && Number.isNaN(y));
    },

    compare(x: number, y: number): number {
        return x === y ? 0 : (x < y ? -1 : (x > y ? 1 : Number.NaN));
    },

    hashOf(t: number): int {
        const i = Math.round(t);
        return (Number.isSafeInteger(i)) ? i : 0;
    },

    clone(x: number): number {
        return x;
    },

    immutable: true
};
freeze(NumberThing);

export const IntThing : Thing<int> = {

    inDomain(x: int): boolean {
        return Number.isSafeInteger(x);
    },

    equals(x: int, y: int): boolean {
        return x === y;
    },

    compare(x: int, y: int): number {
        return x === y ? 0 : (x < y ? -1 : (x > y ? 1 : Number.NaN));
    },

    hashOf(t: int): int {
        return t;
    },

    clone(x: int): int {
        return x;
    },

    immutable: true
};
freeze(IntThing);

export const NatThing : Thing<nat> = {

    inDomain(x: nat): boolean {
        return Number.isSafeInteger(x) && x >= 0;
    },

    equals(x: nat, y: nat): boolean {
        return x === y;
    },

    compare(x: nat, y: nat): number {
        return x === y ? 0 : (x < y ? -1 : (x > y ? 1 : Number.NaN));
    },

    hashOf(t: nat): int {
        return t;
    },

    clone(x: nat): nat {
        return x;
    },

    immutable: true
};
freeze(NatThing);


