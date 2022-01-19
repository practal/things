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

    constructor (private readonly _value : int = 0) {
        super();
        if (!Number.isInteger(_value)) throw new Error(`Integer expected, found: ${_value}`);
        Object.freeze(this);
    }

    equals(other : Int) : boolean {
        return this._value === other._value;
    }

    get hash(): number {
        return this._value;
    }

    get value(): int {
        return this._value;
    }

}

export class MutableInt extends Thing implements Hashable {

    static {
        Object.freeze(MutableInt.prototype);
        Object.freeze(MutableInt);
    }

    constructor (private _value : int = 0) {
        super();
        if (!Number.isInteger(_value)) throw new Error(`Integer expected, found: ${_value}`);
        this._value = _value;
    }

    equals(other : MutableInt) : boolean {
        return this._value == other._value;
    }

    get hash(): int {
        return this._value;
    }

    get value(): int {
        return this._value;
    }

    set value(v : int) {
        if (!Number.isInteger(v)) throw new Error(`Integer expected, found: ${v}`);
        this._value = v;
    }

    increment() {
        if (this._value > Number.MAX_SAFE_INTEGER) throw new Error(`Int increment overflow`);
        this._value++;
    }

    decrement() {
        if (this._value < Number.MIN_SAFE_INTEGER) throw new Error(`Int decrement overflow`);
        this._value--;
    }

}

export class Nat extends Thing implements Hashable {

    static {
        Object.freeze(Nat.prototype);
        Object.freeze(Nat);
    }

    constructor (private readonly _value : nat = 0) {
        super();
        if (!(Number.isInteger(_value) && _value >= 0)) throw new Error(`Natural number expected, found: ${_value}`);
        Object.freeze(this);
    }

    equals(other : Nat) : boolean {
        return this._value === other._value;
    }

    get hash(): number {
        return this._value;
    }

    get value(): nat {
        return this._value;
    }

}

export class MutableNat extends Thing implements Hashable {

    static {
        Object.freeze(MutableNat.prototype);
        Object.freeze(MutableNat);
    }

    constructor (private _value : nat = 0) {
        super();
        if (!(Number.isInteger(_value) && _value >= 0)) throw new Error(`Integer expected, found: ${_value}`);
        this._value = _value;
    }

    equals(other : MutableNat) : boolean {
        return this._value == other._value;
    }

    get hash(): int {
        return this._value;
    }

    get value(): nat {
        return this._value;
    }

    set value(v : nat) {
        if (!(Number.isInteger(v) && v >= 0)) throw new Error(`Integer expected, found: ${v}`);
        this._value = v;
    }

    increment() {
        if (this._value > Number.MAX_SAFE_INTEGER) throw new Error(`Nat increment overflow`);
        this._value++;
    }

    decrement() {
        if (this._value < 1) throw new Error(`Nat decrement overflow`);
        this._value--;
    }

}

export class Num extends Thing implements Hashable {

    static {
        Object.freeze(Num.prototype);
        Object.freeze(Num);
    }

    constructor (private readonly _value : number = 0) {
        super();
        if (typeof(_value) !== "number") throw new Error(`Number expected, found: ${_value}`);
        Object.freeze(this);
    }

    equals(other : Num) : boolean {
        return this._value === other._value;
    }

    get hash(): number {
        return numbers.hash(this._value);
    }

    get value(): number {
        return this._value;
    }

}

export class MutableNum extends Thing implements Hashable {

    static {
        Object.freeze(MutableNum.prototype);
        Object.freeze(MutableNum);
    }

    constructor (private _value : number = 0) {
        super();
        if (typeof(_value) !== "number") throw new Error(`Number expected, found: ${_value}`);
    }

    equals(other : MutableNum) : boolean {
        return this._value === other._value;
    }

    get hash(): number {
        return numbers.hash(this._value);
    }

    get value(): number {
        return this._value;
    }

    set value(v : number) {
        if (typeof(v) !== "number") throw new Error(`Number expected, found: ${v}`);
        this._value = v;
    }

    increment() {
        this._value++;
    }

    decrement() {
        this._value--;
    }

}


