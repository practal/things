import { Hashable } from "./hashable";
import { int, nat, numbers } from "./primitives";
import { finalClass, Thing } from "./thing";

export type NumberThing = Int | MutableInt | Nat | MutableNat | Num | MutableNum;

export function assertNumberThing(x : any) : asserts x is NumberThing {
    if (!(x instanceof Int || x instanceof MutableInt || x instanceof Nat || x instanceof MutableNat || x instanceof Num || x instanceof MutableNum)) 
        throw new Error(`Cannot test for equality with ${x}`);
}

export function isNumberThing(x : any) : x is NumberThing {
    return x instanceof Int || x instanceof MutableInt || x instanceof Nat || x instanceof MutableNat || x instanceof Num || x instanceof MutableNum;
}

export class Int extends Thing implements Hashable {

    static {
        Object.freeze(Int.prototype);
        Object.freeze(Int);
    }

    constructor (public readonly value : int = 0) {
        super();
        if (new.target !== Int) finalClass("Int");
        if (!Number.isInteger(value)) throw new Error(`Integer expected, found: ${value}`);
        Object.freeze(this);
    }

    equals(other : NumberThing) : boolean {
        assertNumberThing(other);
        return this.value === other.value;
    }

    get hash(): number {
        return this.value;
    }

    toString() : string {
        return `Int(${this.value})`;
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
        if (new.target !== MutableInt) finalClass("MutableInt");
        if (!Number.isInteger(_value)) throw new Error(`Integer expected, found: ${_value}`);
        this.#value = _value;
        Object.freeze(this);
    }

    equals(other : NumberThing) : boolean {
        assertNumberThing(other);
        return this.#value == other.value;
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

    toString() : string {
        return `MutableInt(${this.value})`;
    }
}

export class Nat extends Thing implements Hashable {

    static {
        Object.freeze(Nat.prototype);
        Object.freeze(Nat);
    }

    constructor (public readonly value : nat = 0) {
        super();
        if (new.target !== Nat) finalClass("Nat");
        if (!(Number.isInteger(value) && value >= 0)) throw new Error(`Natural number expected, found: ${value}`);
        Object.freeze(this);
    }

    equals(other : NumberThing) : boolean {
        assertNumberThing(other);
        return this.value === other.value;
    }

    get hash(): number {
        return this.value;
    }

    toString() : string {
        return `Nat(${this.value})`;
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
        if (new.target !== MutableNat) finalClass("MutableNat");
        if (!(Number.isInteger(_value) && _value >= 0)) throw new Error(`Integer expected, found: ${_value}`);
        this.#value = _value;
        Object.freeze(this);
    }

    equals(other : NumberThing) : boolean {
        assertNumberThing(other);
        return this.#value == other.value;
    }

    get hash(): int {
        return this.#value;
    }

    get value(): nat {
        return this.#value;
    }

    set value(v : nat) {
        if (!(Number.isInteger(v) && v >= 0)) throw new Error(`Natural number expected, found: ${v}`);
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

    toString() : string {
        return `MutableNat(${this.value})`;
    }
}

export class Num extends Thing implements Hashable {

    static {
        Object.freeze(Num.prototype);
        Object.freeze(Num);
    }

    constructor (public readonly value : number = 0) {
        super();
        if (new.target !== Num) finalClass("Num");
        if (typeof(value) !== "number") throw new Error(`Number expected, found: ${value}`);
        Object.freeze(this);
    }

    equals(other : NumberThing) : boolean {
        assertNumberThing(other);
        return this.value === other.value;
    }

    get hash(): number {
        return numbers.hash(this.value);
    }

    toString() : string {
        return `Num(${this.value})`;
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
        if (new.target !== MutableNum) finalClass("MutableNum");
        if (typeof(_value) !== "number") throw new Error(`Number expected, found: ${_value}`);
        this.#value = _value;
        Object.freeze(this);
    }

    equals(other : NumberThing) : boolean {
        assertNumberThing(other);
        return this.#value === other.value;
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

    toString() : string {
        return `MutableNum(${this.value})`;
    }
}
