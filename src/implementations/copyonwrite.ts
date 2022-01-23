import { Cloneable, Mutable } from "../interfaces/cloneable";
import { nat } from "../interfaces/primitives";
import { freeze } from "./utils";

/** 
 * Helper class for cloning with [copy-on-write semantics](https://en.wikipedia.org/wiki/Copy-on-write) / [implicit sharing](https://doc.qt.io/qt-5/implicit-sharing.html).
 * 
 * Internally, CopyOnWrite maintains a reference count of how many clients are currently interested in the value it is holding.
 * A new client registers its interest by calling [[acquire]], and renounces its interest via [[release]]. 
 * A client does not need to ever release, but should do so when possible to maximise sharing and minimise copying.
 * 
 * While interested, a client can access the [[value]] and freely read from it. It is only allowed to write to it though if [[canWrite]] is true.
 * To ensure that [[canWrite]] is true before writing, use [[copyIfNeeded]]. Use [[set]] to replace the value altogether regardless of [[canWrite]]. 
 * 
 * The following is an example of how to implement [[Cloneable]] and [[Mutable]] by wrapping internal data with CopyOnWrite:
 * 
 * ```
 * class Vector<E> implements Cloneable, Mutable {
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
 *         this.#elements.acquire();
 *         return this;
 *     }
 *
 *     release(): void {
 *         this.#elements.release();
 *     }
 *
 *     get(index : number) : E {
 *         return this.#elements.value[index];
 *     }
 *
 *     set(index : number, value : E) {
 *         this.#elements = this.#elements.copyIfNeeded(elements => [...elements]);
 *         this.#elements.value[index] = value;
 *     }
 * 
 *     assign(it : this) : void {
 *         it.#elements.acquire();
 *         this.#elements.release();
 *         this.#elements = it.#elements;
 *     }
 * 
 *     clear() : void {
 *         this.#elements = this.#elements.set([]);
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

    /** Creates a new CopyOnWrite wrapper for _value. The caller of the constructor is its only client. */
    constructor (private _value : V) {
        this.refs = 1;
    }

    /** Registers a new client interested in the value of this CopyOnWrite wrapper. */
    acquire() {
        this.refs += 1;
    }

    /** Renounces a client's interest in the value of this CopyOnWrite wrapper. */
    release() {
        if (this.refs < 1) throw new Error("CopyOnWrite: Cannot release value with zero refs.");
        this.refs -= 1;
    }

    /**
     * If [[canWrite]] is true, this just returns `this`. Otherwise the client copies the value 
     * to a fresh CopyOnWrite wrapper for which [[canWrite]] is true. It then release this wrapper, and returns the fresh one.
     */
    copyIfNeeded(copy : (value: V) => V) : CopyOnWrite<V> {
        if (this.refs === 1) return this;
        if (this.refs < 1) throw new Error("CopyOnWrite: Cannot write, clone first");
        const w = copy(this._value);
        const c = new CopyOnWrite(w);
        this.refs -= 1;
        return c;
    }    

    /** Returns the value that this CopyOnWrite wrapper holds. */
    get value() : V {
        if (this.refs <= 0) throw new Error("CopyOnWrite: Cannot read value with zero refs.");
        return this._value;
    }

    /** True if there is only one client interested in the value of this CopyOnWrite wrapper. */
    get canWrite() : boolean {
        return this.refs === 1;
    }

    /**
     * If [[canWrite]] is true, this sets the new value of this CopyOnWrite wrapper, and return `this`.
     * Otherwise a new wrapper with the new value is created, and returned after releasing this wrapper.
     */
    set(v: V) : CopyOnWrite<V> {
        if (this.refs === 1) {
            this._value = v;
            return this;
        } else if (this.refs > 1) {
            const c = new CopyOnWrite(v);
            this.refs -= 1;
            return c;
        } else {
            throw new Error(`CopyOnWrite: Cannot write value with ${this.refs} refs.`);
        }
    }
    
}

/** Example, for documentation purposes only. */
class Vector<E> implements Cloneable, Mutable {

    #elements : CopyOnWrite<E[]>;
    
    constructor(length : number, elem : E) {
        let elements : E[] = [];
        for (let i=0; i<length; i++) {
            elements.push(elem);
        }
        this.#elements = new CopyOnWrite(elements);
    }

    clone(): this {
        this.#elements.acquire();
        return this;
    }

    release(): void {
        this.#elements.release();
    }

    get(index : number) : E {
        return this.#elements.value[index];
    }

    set(index : number, value : E) {
        this.#elements = this.#elements.copyIfNeeded(elements => [...elements]);
        this.#elements.value[index] = value;
    }

    assign(it : this) : void {
        it.#elements.acquire();
        this.#elements.release();
        this.#elements = it.#elements;
    }

    clear() : void {
        this.#elements = this.#elements.set([]);
    }

    get length() : number {
        return this.#elements.value.length;
    }

}