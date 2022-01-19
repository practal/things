import { Equatables } from "./equatable";
import { combineHashCodes, Hashable, Hashables } from "./hashable";
import { Thing } from "./thing";
import { iterateCodepoints } from "./utils";

export type Primitive = number | string | boolean | symbol | bigint

export type int = number 

export type nat = number

export const numbers : Hashables<number> = {
    
    hash(t: number): int {
        if (Number.isInteger(t)) return t;
        return strings.hash(`${t}`);
    },

    equals(lhs: number, rhs: number): boolean {
        return lhs === rhs;
    }
    
}

export const booleans : Hashables<boolean> = {

    hash(b: boolean): int {
        return b ? 1 : 0;
    },

    equals(lhs: boolean, rhs: boolean): boolean {
        return lhs === rhs;
    }

}

export const symbols : Equatables<symbol> = {

    equals(lhs: symbol, rhs: symbol): boolean {
        return lhs === rhs;
    }

}

export const strings : Hashables<string> = {

    hash(s: string): int {
        return combineHashCodes(iterateCodepoints(s));
    },

    equals(lhs: string, rhs: string): boolean {
        return lhs === rhs;
    }

}

export const bigints : Hashables<bigint> = {

    hash(x: bigint): int {
        return strings.hash(`${x}`);
    },

    equals(lhs: bigint, rhs: bigint): boolean {
        return lhs === rhs;
    }

}

export const NumberArrays : Hashables<readonly number[]> = {

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

export class Int extends Thing implements Hashable {

    static {
        Object.freeze(Int.prototype);
        Object.freeze(Int);
    }

    constructor (public readonly value : int = 0) {
        super();
        if (!Number.isInteger(value)) throw new Error(`Integer expected, found: ${value}`);
        Object.freeze(this);
    }

    equals(other : Int) : boolean {
        return this.value === other.value;
    }

    get hash(): number {
        return this.value;
    }

}

export class MutableInt extends Thing implements Hashable {

    static {
        Object.freeze(MutableInt.prototype);
        Object.freeze(MutableInt);
    }

    #value : int

    constructor (_value : int = 0) {
        super();
        if (!Number.isInteger(_value)) throw new Error(`Integer expected, found: ${_value}`);
        this.#value = _value;
        Object.freeze(this);
    }

    equals(other : MutableInt) : boolean {
        return this.#value == other.#value;
    }

    get hash(): int {
        return this.#value;
    }

    get value(): int {
        return this.#value;
    }

    set value(v : int) {
        if (!Number.isInteger(v)) throw new Error(`Integer expected, found: ${v}`);
        this.#value = v;
    }

    increment() {
        if (this.#value > Number.MAX_SAFE_INTEGER) throw new Error(`Int increment overflow`);
        this.#value++;
    }

    decrement() {
        if (this.#value < Number.MIN_SAFE_INTEGER) throw new Error(`Int decrement overflow`);
        this.#value--;
    }

}

export class Nat extends Thing implements Hashable {

    static {
        Object.freeze(Nat.prototype);
        Object.freeze(Nat);
    }

    constructor (public readonly value : nat = 0) {
        super();
        if (!(Number.isInteger(value) && value >= 0)) throw new Error(`Natural number expected, found: ${value}`);
        Object.freeze(this);
    }

    equals(other : Nat) : boolean {
        return this.value === other.value;
    }

    get hash(): number {
        return this.value;
    }

}

export class MutableNat extends Thing implements Hashable {

    static {
        Object.freeze(MutableNat.prototype);
        Object.freeze(MutableNat);
    }

    #value : nat

    constructor (_value : nat = 0) {
        super();
        if (!(Number.isInteger(_value) && _value >= 0)) throw new Error(`Integer expected, found: ${_value}`);
        this.#value = _value;
        Object.freeze(this);
    }

    equals(other : MutableNat) : boolean {
        return this.#value == other.#value;
    }

    get hash(): int {
        return this.#value;
    }

    get value(): nat {
        return this.#value;
    }

    set value(v : nat) {
        if (!(Number.isInteger(v) && v >= 0)) throw new Error(`Integer expected, found: ${v}`);
        this.#value = v;
    }

    increment() {
        if (this.#value > Number.MAX_SAFE_INTEGER) throw new Error(`Nat increment overflow`);
        this.#value++;
    }

    decrement() {
        if (this.#value < 1) throw new Error(`Nat decrement overflow`);
        this.#value--;
    }

}

export class Num extends Thing implements Hashable {

    static {
        Object.freeze(Num.prototype);
        Object.freeze(Num);
    }

    constructor (public readonly value : number = 0) {
        super();
        if (typeof(value) !== "number") throw new Error(`Number expected, found: ${value}`);
        Object.freeze(this);
    }

    equals(other : Num) : boolean {
        return this.value === other.value;
    }

    get hash(): number {
        return numbers.hash(this.value);
    }

}

export class MutableNum extends Thing implements Hashable {

    static {
        Object.freeze(MutableNum.prototype);
        Object.freeze(MutableNum);
    }

    #value : number
    
    constructor (_value : number = 0) {
        super();
        if (typeof(_value) !== "number") throw new Error(`Number expected, found: ${_value}`);
        this.#value = _value;
        Object.freeze(this);
    }

    equals(other : MutableNum) : boolean {
        return this.#value === other.#value;
    }

    get hash(): number {
        return numbers.hash(this.#value);
    }

    get value(): number {
        return this.#value;
    }

    set value(v : number) {
        if (typeof(v) !== "number") throw new Error(`Number expected, found: ${v}`);
        this.#value = v;
    }

    increment() {
        this.#value++;
    }

    decrement() {
        this.#value--;
    }

}


