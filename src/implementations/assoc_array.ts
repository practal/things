import { Things } from "../interfaces/things";
import { Equatable, Equality } from "../interfaces/equatable";
import { MutableMap } from "../interfaces/map";
import { int, nat } from "../interfaces/primitives";
import { Thing } from "./thing";
import { joinStrings } from "./utils";
import { ComparisonResult } from "../interfaces/comparable";
import { Anything } from "./anything";

export function AssocArray<Key, Value>(keyValues : Iterable<[Key, Value]> = []) : MutableMap<Key, Value> {
    return AssocArrayFor(Anything, Anything, keyValues);
}

export function AssocArrayFor<Key, Value>(Keys : Things<Key>, Values : Things<Value>, keyValues : Iterable<[Key, Value]> = []) : MutableMap<Key, Value> {
    let m = new AssocArrayImpl<Key, Value>(Keys, Values);
    for (let [k, v] of keyValues) {
        m.set(k, v);
    }
    return m;
}

class AssocArrayImpl<Key, Value> extends Thing implements MutableMap<Key, Value> {
    
    static {
        Object.freeze(AssocArrayImpl.prototype);
        Object.freeze(AssocArrayImpl);
    }

    private _Keys : Things<Key>;
    private _Values : Things<Value>;
    private content : [Key, Value][]

    constructor(Keys : Things<Key>, Values : Things<Value>) {
        super();
        this._Keys = Keys;
        this._Values = Values;
        this.content = [];
        Object.freeze(this);
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
        return `AssocArray(${joinStrings(", ", this.content.map(kv => `${kv[0]} -> ${kv[1]}`))})`;       
    }

    get(key: Key): Value | undefined {
        const K = this.Keys();
        for (let [k, v] of this.content) {
            if (K.equals(k, key)) {
                return v;
            }
        }
        return undefined;
    }

    has(key: Key): boolean {
        const K = this.Keys();
        for (let [k, v] of this.content) {
            if (K.equals(k, key)) {
                return true;
            }
        }
        return false;
    }

    private find(key : Key) : int {
        const K = this.Keys();
        for (let i = 0; i < this.content.length; i++) {
            let [k, v] = this.content[i];
            if (K.equals(k, key)) return i;
        }
        return -1;
    }

    set(key: Key, value: Value): this {
        const i = this.find(key);
        if (i < 0) {
            this.content.push([key, value]);
        } else {
            this.content[i][1] = value;
        }
        return this;
    }

    put(key: Key, value: Value): Value | undefined {
        const i = this.find(key);
        if (i < 0) {
            this.content.push([key, value]);
            return undefined;
        } else {
            const oldValue = this.content[i][1];
            this.content[i][1] = value;
            return oldValue;
        }
    }

    putIfUndefined(key: Key, value: Value): Value | undefined {
        const i = this.find(key);
        if (i < 0) {
            this.content.push([key, value]);
            return undefined;
        } else {
            const old = this.content[i][1];
            if (old === undefined) {
                this.content[i][1] = value;    
            }
            return old;
        }
    }

    delete(key: Key): boolean {
        const i = this.find(key);
        if (i < 0) return false;
        this.content.splice(i, 1);
        return true;
    }

    remove(key: Key): Value | undefined {
        const i = this.find(key);
        if (i < 0) return undefined;
        const old = this.content[i][1];
        this.content.splice(i, 1);
        return old;
    }

    clear() {
        this.content = [];
    }

    get size(): nat {
        return this.content.length;
    }

    forEach(callbackfn: (value: Value, key: Key, map: Map<Key, Value>) => void, thisArg?: any): void {
        const that = this;
        this.content.forEach((kv : [Key, Value], index: number, arr : [Key, Value][]) => {
            callbackfn(kv[1], kv[0], that);
        }, thisArg);
    }

    entries(): IterableIterator<[Key, Value]> {
        return this.content.values();
    }

    keys(): IterableIterator<Key> {
        const that = this;
        function* run() {
            for (let [k, v] of that.content) {
                yield k;
            }
        }
        return run();
    }

    values(): IterableIterator<Value> {
        const that = this;
        function* run() {
            for (let [k, v] of that.content) {
                yield v;
            }
        }
        return run();
    }

    clone(force?: boolean): this {
        throw new Error("Method not implemented.");
    }

    isEqualTo(other: any): boolean {
        throw new Error();
    }

    compareTo(other: any): ComparisonResult {
        throw new Error();
    }
 
    get hash(): int {
        throw new Error();
    }
}
