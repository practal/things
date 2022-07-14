import { Things } from "../interfaces/things";
import { MutableMap } from "../interfaces/map";
import { int, nat } from "../interfaces/primitives";
import { MutableThing } from "./thing";
import { freeze, joinStrings } from "./utils";
import { ComparisonResult, EQUAL, UNRELATED } from "../interfaces/comparable";
import { Anything } from "./anything";
import { isMap, MapCompare, MapHash } from "./map";

/**
 * Creates a mutable associative array without copy-on-write [[Cloneable.clone | cloning]]. 
 * 
 * This is equivalent to [[PlainAssocArrayFor]]([[Anything]], [[Anything]], keyValues).
 **/
export function PlainAssocArray<Key, Value>(keyValues : Iterable<[Key, Value]> = []) : MutableMap<Key, Value> {
    return PlainAssocArrayFor(Anything, Anything, keyValues);
}

freeze(PlainAssocArray);

/**
 * Creates a mutable associative array without copy-on-write [[Cloneable.clone | cloning]]. 
 **/
export function PlainAssocArrayFor<Key, Value>(Keys : Things<Key>, Values : Things<Value>, keyValues : Iterable<[Key, Value]> = []) : MutableMap<Key, Value> {
    let m = PlainAssocArrayImpl.create(Keys, Values);
    for (let [k, v] of keyValues) {
        m.set(k, v);
    }
    return m;
}

freeze(PlainAssocArrayFor);

class PlainAssocArrayImpl<Key, Value> extends MutableThing implements MutableMap<Key, Value> {
    
    static {
        freeze(PlainAssocArrayImpl);
    }

    private _Keys : Things<Key>;
    private _Values : Things<Value>;
    
    #content : [Key, Value][];

    private constructor(Keys : Things<Key>, Values : Things<Value>, content : [Key, Value][]) {
        super();
        this._Keys = Keys;
        this._Values = Values;
        this.#content = content;
        Object.freeze(this);
    }

    static create<Key, Value>(Keys : Things<Key>, Values : Things<Value>) : PlainAssocArrayImpl<Key, Value> {
        return new PlainAssocArrayImpl(Keys, Values, []);
    }

    public Keys() { return this._Keys; }

    public Values() { return this._Values; }
    
    [Symbol.iterator](): IterableIterator<[Key, Value]> {
        return this.entries();
    }

    get [Symbol.toStringTag](): string {
        return this.toString();
    }

    public toString() : string {
        return `AssocArray(${joinStrings(", ", this.#content.map(kv => `${kv[0]} -> ${kv[1]}`))})`;       
    }

    get(key: Key): Value | undefined {
        const K = this.Keys();
        for (let [k, v] of this.#content) {
            if (K.equals(k, key)) {
                return v;
            }
        }
        return undefined;
    }

    has(key: Key): boolean {
        const K = this.Keys();
        for (let [k, v] of this.#content) {
            if (K.equals(k, key)) {
                return true;
            }
        }
        return false;
    }

    private find(key : Key) : int {
        const K = this.Keys();
        const content = this.#content;
        for (let i = 0; i < content.length; i++) {
            let [k, v] = content[i];
            if (K.equals(k, key)) return i;
        }
        return -1;
    }

    private copy() {
        this.#content = this.#content.map(kv => [kv[0], kv[1]]);
    }

    set(key: Key, value: Value): this {
        const i = this.find(key);
        if (i < 0) {
            this.#content.push([key, value]);
        } else {
            this.#content[i][1] = value;
        }
        return this;
    }

    put(key: Key, value: Value): Value | undefined {
        const i = this.find(key);
        if (i < 0) {
            this.#content.push([key, value]);
            return undefined;
        } else {
            const oldValue = this.#content[i][1];
            this.#content[i][1] = value;
            return oldValue;
        }
    }

    putIfUndefined(key: Key, value: Value): Value | undefined {
        const i = this.find(key);
        if (i < 0) {
            this.#content.push([key, value]);
            return undefined;
        } else {
            const old = this.#content[i][1];
            if (old === undefined) {
                this.#content[i][1] = value;    
            }
            return old;
        }
    }

    delete(key: Key): boolean {
        const i = this.find(key);
        if (i < 0) return false;
        this.#content.splice(i, 1);
        return true;
    }

    remove(key: Key): Value | undefined {
        const i = this.find(key);
        if (i < 0) return undefined;
        const old = this.#content[i][1];
        this.#content.splice(i, 1);
        return old;
    }

    clear() {
        this.#content = [];
    }

    assign(it : Iterable<[Key, Value]>) : void {
        const temp = PlainAssocArrayImpl.create(this.Keys(), this.Values());
        for (let [k, v] of it) {
            temp.put(k, v);
        }
        this.#content = temp.#content;
    }

    get size(): nat {
        return this.#content.length;
    }

    forEach(callbackfn: (value: Value, key: Key, map: Map<Key, Value>) => void, thisArg?: any): void {
        const that = this;
        this.#content.forEach((kv : [Key, Value], index: number, arr : [Key, Value][]) => {
            callbackfn(kv[1], kv[0], that);
        }, thisArg);
    }

    entries(): IterableIterator<[Key, Value]> {
        return this.#content.values();
    }

    keys(): IterableIterator<Key> {
        const content = this.#content;
        function* run() {
            for (let [k, v] of content) {
                yield k;
            }
        }
        return run();
    }

    values(): IterableIterator<Value> {
        const content = this.#content;
        function* run() {
            for (let [k, v] of content) {
                yield v;
            }
        }
        return run();
    }

    clone(): this {
        const temp = PlainAssocArrayImpl.create(this.Keys(), this.Values());
        for (let [k, v] of this) {
            temp.put(k, v);
        }
        return temp as this;
    }

    release(): void {
        // nothing to do
    }

    isEqualTo(other: any): boolean {
        if (this === other) return true;
        if (!isMap(other)) return false;
        return MapCompare(this, other, this.Values()) === EQUAL;
    }

    compareTo(other: any): ComparisonResult {
        if (this === other) return EQUAL;
        if (!isMap(other)) return UNRELATED;
        return MapCompare(this, other, this.Values());
    }
 
    get hash(): int {
        return MapHash(this, this.Keys(), this.Values());
    }
}