import { Equality, invalidEquals } from "./equatable";
import { combineHashCodes, Hashable, Hash } from "./hashable";
import { finalClass, Thing } from "./thing";
import { iterateCodepoints } from "./utils";

export type Primitive = number | string | boolean | symbol | bigint

export type int = number 

export type nat = number

export const numbers : Hash<number> = {
    
    hash(t: number): int {
        if (Number.isInteger(t)) return t;
        return strings.hash(`${t}`);
    },

    equals(lhs: number, rhs: number): boolean {
        return lhs === rhs;
    }
    
}

export const booleans : Hash<boolean> = {

    hash(b: boolean): int {
        return b ? 1 : 0;
    },

    equals(lhs: boolean, rhs: boolean): boolean {
        return lhs === rhs;
    }

}

export const symbols : Equality<symbol> = {

    equals(lhs: symbol, rhs: symbol): boolean {
        return lhs === rhs;
    }

}

export const strings : Hash<string> = {

    hash(s: string): int {
        return combineHashCodes(iterateCodepoints(s));
    },

    equals(lhs: string, rhs: string): boolean {
        return lhs === rhs;
    }

}

export const bigints : Hash<bigint> = {

    hash(x: bigint): int {
        return strings.hash(`${x}`);
    },

    equals(lhs: bigint, rhs: bigint): boolean {
        return lhs === rhs;
    }

}

export const NumberArrays : Hash<readonly number[]> = {

    hash(t: readonly number[]): int {
        let codes = t.map(x => numbers.hash(x));
        return combineHashCodes(codes);
    },

    equals(lhs: readonly number[], rhs: readonly number[]): boolean {
        let len = lhs.length;
        if (len != rhs.length) return false;
        for (let i=0; i<len; i++) {
            if (lhs[i] !== rhs[i]) return false;
        }
        return true;
    }
    
}


