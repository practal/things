import { int, nat } from "../interfaces/primitives";
import { ComparisonResult, EQUAL, GREATER, LESS, UNRELATED } from "../interfaces/comparable";
import { numbers } from "./primitives";
import { Thing } from "./thing";
import { finalClass, freeze } from "./utils";

/** Numerical [[Things]]s */
export type NumberThing = Num | MutableNum | Int | MutableInt | Nat | MutableNat

export function isNumberThing(x : any) : x is NumberThing {
    return x instanceof Num || x instanceof MutableNum || x instanceof Int || x instanceof MutableInt || x instanceof Nat || x instanceof MutableNat;
}

freeze(isNumberThing);

/** The union of all numerical types known to this package. This includes the built-in numerical types of JavaScript, and all [[NumberThing]]s. */
export type Numeric = number | Number | bigint | BigInt | NumberThing

export function isNumeric(x : any) : x is Numeric {
    return typeof x === "number" || typeof x === "bigint" || isNumberThing(x) || x instanceof Number || x instanceof BigInt;
}

freeze(isNumeric);

function equals(lhs : number, rhs : Numeric) : boolean {
    if (typeof rhs === "number") return numbers.equals(lhs, rhs);
    else if (isNumberThing(rhs)) return numbers.equals(lhs, rhs.value);
    else if (rhs instanceof Number) return numbers.equals(lhs, rhs.valueOf());
    else if (typeof rhs === "bigint" || rhs instanceof BigInt) return (lhs as any)  == rhs;
    else return false;
}

function compare(lhs : number, rhs : Numeric) : ComparisonResult {
    if (typeof rhs === "number") return numbers.compare(lhs, rhs);
    else if (isNumberThing(rhs)) return numbers.compare(lhs, rhs.value);
    else if (rhs instanceof Number) return numbers.compare(lhs, rhs.valueOf());
    else if (typeof rhs === "bigint" || rhs instanceof BigInt) {
        if ((lhs as any) < rhs) return LESS;
        else if ((lhs as any) > rhs) return GREATER;
        else if ((lhs as any) == rhs) return EQUAL;
        else return UNRELATED;
    } else {
        return UNRELATED;
    }
}

/** An immutable [[Thing]] guaranteed to represent a number. */
export class Num extends Thing {

    static {
        freeze(Num);
    }

    constructor (public readonly value : number = 0) {
        super();
        if (new.target !== Num) finalClass("Num");
        if (typeof(value) !== "number") throw new Error(`Number expected, found: ${value}`);
        Object.freeze(this);
    }

    toString(): string {
        return `Num(${this.value.toString()})`;
    }

    clone(): this {
        return this;
    }

    release(): void {}

    equals(other : Numeric) : boolean {
        return equals(this.value, other);
    }

    compare(other : Numeric) : number {
        return compare(this.value, other);
    }    

    get hash(): number {
        return numbers.hashOf(this.value);
    }

}

/** A [[Thing]] guaranteed to represent a mutable number. */
export class MutableNum extends Thing {

    static {
        freeze(MutableNum);
    }

    #value : number

    constructor (value : number = 0) {
        super();
        if (new.target !== MutableNum) finalClass("MutableNum");
        if (typeof(value) !== "number") throw new Error(`Number expected, found: ${value}`);
        this.#value = value;
        Object.freeze(this);
    }

    toString(): string {
        return `MutableNum(${this.#value.toString()})`;
    }

    clone(): this {
        return new MutableNum(this.#value) as this;
    }

    release(): void {}

    equals(other : Numeric) : boolean {
        return equals(this.#value, other);
    }

    compare(other : Numeric) : number {
        return compare(this.#value, other);
    }    

    get hash(): number {
        return numbers.hashOf(this.#value);
    }

    get value(): number {
        return this.#value;
    }

    set value(v) {
        if (typeof(v) !== "number") throw new Error(`Number expected, found: ${v}`);
        this.#value = v;
    }

    /** Increments the value and returns the new value. */
    increment() : number {
        this.#value++;
        return this.#value;
    }

    /** Decrements the value and returns the new value. */
    decrement() : number {
        this.#value--;
        return this.#value;
    }

}

/** An immutable [[Thing]] guaranteed to represent an integer. */
export class Int extends Thing {

    static {
        freeze(Int);
    }

    constructor (public readonly value : int = 0) {
        super();
        if (new.target !== Int) finalClass("Int");
        if (!Number.isInteger(value)) throw new Error(`Integer expected, found: ${value}`);
        Object.freeze(this);
    }

    toString(): string {
        return `Int(${this.value.toString()})`;
    }

    clone(): this {
        return this;
    }

    release(): void {}

    equals(other : Numeric) : boolean {
        return equals(this.value, other);
    }

    compare(other : Numeric) : number {
        return compare(this.value, other);
    }    

    get hash(): number {
        return this.value;
    }

}

/** A [[Thing]] guaranteed to represent a mutable integer. */
export class MutableInt extends Thing {

    static {
        freeze(MutableInt);
    }

    #value : int

    constructor (value : int = 0) {
        super();
        if (new.target !== MutableInt) finalClass("MutableInt");
        if (!Number.isInteger(value)) throw new Error(`Integer expected, found: ${value}`);
        this.#value = value;
        Object.freeze(this);
    }

    toString(): string {
        return `MutableInt(${this.#value.toString()})`;
    }

    clone(): this {
        return new MutableInt(this.#value) as this;
    }

    release(): void {}

    equals(other : Numeric) : boolean {
        return equals(this.#value, other);
    }

    compare(other : Numeric) : number {
        return compare(this.#value, other);
    }    

    get hash(): number {
        return this.#value;
    }

    get value(): number {
        return this.#value;
    }

    set value(v) {
        if (!Number.isInteger(v)) throw new Error(`Integer expected, found: ${v}`);
        this.#value = v;
    }

    /** Increments the value and returns the new value. */
    increment() : int {
        if (this.#value <= Number.MAX_SAFE_INTEGER) {
            this.#value++;
            return this.#value;
        } else {
            throw new Error("MutableInt increment overflow");
        }
    }

    /** Decrements the value and returns the new value. */
    decrement() : int {
        if (this.#value >= Number.MIN_SAFE_INTEGER) {
            this.#value--;
            return this.#value;
        } else {
            throw new Error("MutableInt decrement overflow");
        }
    }

}

/** An immutable [[Thing]] guaranteed to represent a natural number. */
export class Nat extends Thing {

    static {
        freeze(Nat);
    }

    constructor (public readonly value : nat = 0) {
        super();
        if (new.target !== Nat) finalClass("Nat");
        if (!Number.isInteger(value) || value < 0) throw new Error(`Natural number expected, found: ${value}`);
        Object.freeze(this);
    }

    toString(): string {
        return `Nat(${this.value.toString()})`;
    }

    clone(): this {
        return this;
    }

    release(): void {}

    equals(other : Numeric) : boolean {
        return equals(this.value, other);
    }

    compare(other : Numeric) : number {
        return compare(this.value, other);
    }    

    get hash(): number {
        return this.value;
    }

}

/** A [[Thing]] guaranteed to represent a mutable natural number. */
export class MutableNat extends Thing {

    static {
        freeze(MutableNat);
    }

    #value : nat

    constructor (value : nat = 0) {
        super();
        if (new.target !== MutableNat) finalClass("MutableInt");
        if (!Number.isInteger(value) || value < 0) throw new Error(`Natural number expected, found: ${value}`);
        this.#value = value;
        Object.freeze(this);
    }

    toString(): string {
        return `MutableNat(${this.#value.toString()})`;
    }

    clone(): this {
        return new MutableNat(this.#value) as this;
    }

    release(): void {}

    equals(other : Numeric) : boolean {
        return equals(this.#value, other);
    }

    compare(other : Numeric) : number {
        return compare(this.#value, other);
    }    

    get hash(): int {
        return this.#value;
    }

    get value(): nat {
        return this.#value;
    }

    set value(v) {
        if (!Number.isInteger(v) || v < 0) throw new Error(`Natural number expected, found: ${v}`);
        this.#value = v;
    }

    /** Increments the value and returns the new value. */
    increment() : nat {
        if (this.#value <= Number.MAX_SAFE_INTEGER) {
            this.#value++;
            return this.#value;
        } else {
            throw new Error("MutableNat increment overflow");
        }
    }

    /** Decrements the value and returns the new value. */
    decrement() : nat {
        if (this.#value > 0) {
            this.#value--;
            return this.#value;
        } else {
            throw new Error("MutableNat decrement overflow");
        }
    }

}


