import { UNRELATED } from "../interfaces/comparable";
import { numbers } from "./primitives";
import { Thing } from "./thing";
import { finalClass, freeze } from "./utils";

export type NumberThing = Num

export type Numeric = number | Number | bigint | BigInt | NumberThing

export function valueOf(x : Numeric) : number | undefined {
    if (x instanceof Num) {
        return x.value;
    }
    if (x instanceof Number) {
        return x.valueOf();
    }
    if (typeof x === "number") {
        return x;
    }
    if (typeof x === "bigint" || x instanceof BigInt) {
        try {
            const n = Number(x);
            if (x === BigInt(n)) return n;
        } catch {
            return undefined;
        }
    }
    return undefined;
}

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

    clone(force?: boolean): this {
        return this;
    }

    equals(other : Numeric) : boolean {
        const otherValue = valueOf(other);
        if (otherValue === undefined) return false;
        return numbers.equals(this.value, otherValue);
    }

    compare(other : Numeric) : number {
        const otherValue = valueOf(other);
        if (otherValue === undefined) return UNRELATED;
        return numbers.compare(this.value, otherValue);
    }    

    get hash(): number {
        return numbers.hashOf(this.value);
    }

}
