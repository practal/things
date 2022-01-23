import { Cloneable } from "../interfaces/cloneable";
import { nat } from "../interfaces/primitives";
import { freeze } from "./utils";

/** 
 * Helper class for cloning with [copy-on-write semantics](https://en.wikipedia.org/wiki/Copy-on-write), i.e. delaying the actual copying until the first modification. 
 * 
 * Here is an example for how to use CopyOnWrite:
 * 
 * ```
 * class Vector<E> implements Cloneable {
 *
 *     #elements : CopyOnWrite<E[]>;
 *  
 *     constructor(length : number, elem : E) {
 *         let elements : E[] = [];
 *         for (let i=0; i<length; i++) {
 *             elements.push(elem);
 *         }
 *         this.#elements = new CopyOnWrite(elements);
 *     }
 *
 *     clone(): this {
 *         this.#elements.clone();
 *         return this;
 *     }
 *
 *     release(): void {
 *         this.#elements.release();
 *     }
 *
 *     // we call this each time before making a change to #elements.value
 *     #prepareForWriting() {
 *         const copy = this.#elements.write(elements => [...elements]);
 *         if (copy !== undefined) {
 *             this.#elements = copy;
 *         }
 *     }
 *
 *     get(index : number) : E {
 *         return this.#elements.value[index];
 *     }
 *
 *     set(index : number, value : E) {
 *         this.#prepareForWriting();
 *         this.#elements.value[index] = value;
 *     }
 *
 *     get length() : number {
 *         return this.#elements.value.length;
 *     }
 *
 * }
 * ```
 */
export class CopyOnWrite<V>  {

    static {
        freeze(CopyOnWrite);
    }

    private refs : nat;

    constructor (private _value : V) {
        this.refs = 1;
    }

    clone() : this {
        this.refs += 1;
        return this;
    }

    release() {
        if (this.refs < 1) throw new Error("CopyOnWrite: Cannot release value with zero refs.");
        this.refs -= 1;
    }

    write(copy : (value: V) => V) : CopyOnWrite<V> | undefined {
        if (this.refs === 1) return undefined;
        if (this.refs < 1) throw new Error("CopyOnWrite: Cannot write, clone first");
        const w = copy(this._value);
        const c = new CopyOnWrite(w);
        this.refs -= 1;
        return c;
    }

    get value() : V {
        if (this.refs <= 0) throw new Error("CopyOnWrite: Cannot read value with zero refs.");
        return this._value;
    }

    set value(v) {
        if (this.refs != 1) throw new Error(`CopyOnWrite: Cannot write value with ${this.refs} refs.`);
    }
    
}

/** Example, for documentation purposes only. */
class Vector<E> implements Cloneable {

    #elements : CopyOnWrite<E[]>;
    
    constructor(length : number, elem : E) {
        let elements : E[] = [];
        for (let i=0; i<length; i++) {
            elements.push(elem);
        }
        this.#elements = new CopyOnWrite(elements);
    }

    clone(): this {
        this.#elements.clone();
        return this;
    }

    release(): void {
        this.#elements.release();
    }

    // we call this each time before making a change to #elements
    #prepareForWriting() {
        const copy = this.#elements.write(elements => [...elements]);
        if (copy !== undefined) {
            this.#elements = copy;
        }
    }

    get(index : number) : E {
        return this.#elements.value[index];
    }

    set(index : number, value : E) {
        this.#prepareForWriting();
        this.#elements.value[index] = value;
    }

    get length() : number {
        return this.#elements.value.length;
    }

}