import { defaultEquatables, Equatable, Equatables } from "./equatable";
import { MutableMap } from "./map";
import { int, nat } from "./primitives";
import { Thing } from "./thing";
import { joinStrings } from "./utils";

export function AssocArray<Key extends Equatable, Value>(keyValues : Iterable<[Key, Value]> = []) : MutableMap<Key, Value> {
    return AssocArrayFor(defaultEquatables(), keyValues);
}

export function AssocArrayFor<Key, Value>(Keys : Equatables<Key>, keyValues : Iterable<[Key, Value]> = []) : MutableMap<Key, Value> {
    let m = new AssocArrayImpl<Key, Value>(Keys);
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

    private content : [Key, Value][]

    constructor(private Keys : Equatables<Key>) {
        super();
        this.content = [];
        Object.freeze(this);
    }
    
    [Symbol.iterator](): IterableIterator<[Key, Value]> {
        return this.entries();
    }

    get [Symbol.toStringTag](): string {
        return `AssocArray(${joinStrings(", ", this.content.map(kv => `${kv[0]} -> ${kv[1]}`))})`;
    }

    public toString() : string {
        return `AssocArray(${joinStrings(", ", this.content.map(kv => `${kv[0]} -> ${kv[1]}`))})`;       
    }

    get(key: Key): Value | undefined {
        for (let [k, v] of this.content) {
            if (this.Keys.equals(k, key)) {
                return v;
            }
        }
        return undefined;
    }

    has(key: Key): boolean {
        for (let [k, v] of this.content) {
            if (this.Keys.equals(k, key)) {
                return true;
            }
        }
        return false;
    }

    private find(key : Key) : int {
        for (let i = 0; i < this.content.length; i++) {
            let [k, v] = this.content[i];
            if (this.Keys.equals(k, key)) return i;
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

}
