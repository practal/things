import { Equality, invalidEquals } from "./equatable";
import { combineHashCodes, Hashable, Hash } from "./hashable";
import { finalClass, Thing, Things } from "./thing";
import { iterateCodepoints } from "./utils";

export type Primitive = number | string | boolean | symbol | bigint

export type int = number 

export type nat = number

export const ints : Things<int> = {
    
    hash(t: int): int {
        return t;
    },

    equals(lhs: int, rhs: int): boolean {
        return lhs === rhs;
    },
    
    compare(lhs: int, rhs: int): number {
        if (lhs < rhs) return -1;
        else if (lhs > rhs) return 1;
        else return 0;
    }
}

Object.freeze(ints);

export const numbers : Things<number> = {
    
    hash(t: number): int {
        if (Number.isInteger(t)) return t;
        else return strings.hash(`${t}`);
    },

    equals(lhs: number, rhs: number): boolean {
        return lhs === rhs || (Number.isNaN(lhs) && Number.isNaN(rhs));
    },
    
    compare(lhs: number, rhs: number): number {
        if (Number.isNaN(lhs) && Number.isNaN(rhs)) {
            return 0;
        } else {
            if (lhs < rhs) return -1;
            else if (lhs > rhs) return 1;
            else return 0;
        }
    }
}

Object.freeze(numbers);

export const booleans : Things<boolean> = {

    hash(b: boolean): int {
        return b ? 1 : 0;
    },

    equals(lhs: boolean, rhs: boolean): boolean {
        return lhs === rhs;
    },

    compare(lhs: boolean, rhs: boolean): number {
        return (lhs ? 1 : 0) - (rhs ? 1 : 0);
    }

}

Object.freeze(booleans);

export const symbols : Equality<symbol> = {

    equals(lhs: symbol, rhs: symbol): boolean {
        return lhs === rhs;
    }

}

Object.freeze(symbols);

export const strings : Things<string> = {

    hash(s: string): int {
        return combineHashCodes(iterateCodepoints(s));
    },

    equals(lhs: string, rhs: string): boolean {
        return lhs === rhs;
    },

    compare(lhs: string, rhs: string): number {
        if (lhs < rhs) return -1;
        else if (lhs > rhs) return 1;
        else return 0;
    }

}

Object.freeze(strings);

export const bigints : Things<bigint> = {

    hash(x: bigint): int {
        return strings.hash(`${x}`);
    },

    equals(lhs: bigint, rhs: bigint): boolean {
        return lhs === rhs;
    },

    compare(lhs: bigint, rhs: bigint): number {
        if (lhs < rhs) return -1;
        else if (lhs > rhs) return 1;
        else return 0;
    }

}

Object.freeze(bigints);

export const NumberArrays : Hash<readonly number[]> = {

    hash(t: readonly number[]): int {
        let codes = t.map(x => numbers.hash(x));
        return combineHashCodes(codes);
    },

    equals(lhs: readonly number[], rhs: readonly number[]): boolean {
        let len = lhs.length;
        if (len != rhs.length) return false;
        for (let i=0; i<len; i++) {
            if (!numbers.equals(lhs[i], rhs[i])) return false;
        }
        return true;
    }
    
}

Object.freeze(NumberArrays);


