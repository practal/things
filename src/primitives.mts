import {Thing} from "./thing.mjs";
import {combineHashes, freeze, hashOfString, intHashSeed, natHashSeed, numberHashSeed} from "./utils.mjs";
import * as insta from "instatest";

insta.beginUnit("things", "primitives");

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

export const NumberT : Thing<number> = {

    inDomain(x: number): boolean {
        return typeof(x) === "number";
    },

    equals(x: number, y: number): boolean {
        return x === y || (Number.isNaN(x) && Number.isNaN(y));
    },

    compare(x: number, y: number): number {
        return NumberT.equals(x, y) ? 0 : (x < y ? -1 : (x > y ? 1 : Number.NaN));
    },

    hashOf(t: number): int {
        const i = Math.round(t);
        return combineHashes([numberHashSeed, (Number.isSafeInteger(i)) ? i : 0]);
    },

    clone(x: number): number {
        return x;
    },

    immutable: true
};
freeze(NumberT);

export const IntT : Thing<int> = {

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
        return combineHashes([intHashSeed, t]);
    },

    clone(x: int): int {
        return x;
    },

    immutable: true
};
freeze(IntT);

export const NatT : Thing<nat> = {

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
        return combineHashes([natHashSeed, t]);
    },

    clone(x: nat): nat {
        return x;
    },

    immutable: true
};
freeze(NatT);

export const StringT : Thing<string> = {

    inDomain(x: string): boolean {
        return typeof(x) === "string";
    },

    equals(x: string, y: string): boolean {
        return x === y;
    },

    compare(x: string, y: string): number {
        return x === y ? 0 : (x < y ? -1 : (x > y ? 1 : Number.NaN));
    },

    hashOf(t: string): int {
        return hashOfString(t);
    },

    clone(x: string): string {
        return x;
    },

    immutable: true
};
freeze(StringT);

insta.test("compare numbers", () => {
    insta.assert(NumberT.compare(2, 3) < 0);
    insta.assert(NumberT.compare(-4, Number.NEGATIVE_INFINITY) > 0);
    insta.assert(NumberT.compare(-4, Number.POSITIVE_INFINITY) < 0);
    insta.assertEq(NumberT.compare(-4, -4), 0);
    insta.assert(NumberT.inDomain(3));
    // @ts-ignore
    insta.assertFalse(NumberT.inDomain("2"));
});

insta.endUnit("things", "primitives");


