import { AssocArrayFor } from "./assoc_array";
import { defaultHashables, Hashable, Hashables } from "./hashable";
import { MutableMap } from "./map";
import { int, nat } from "./primitives";
import { joinStrings } from "./utils";

export function HashMap<K extends Hashable, V>(keyValues : Iterable<[K, V]> = []) : MutableMap<K, V> {
    return HashMapFor(defaultHashables(), keyValues);
}

export function HashMapFor<K, V>(Keys : Hashables<K>, keyValues : Iterable<[K, V]> = []) : MutableMap<K, V> {
    let map = new HashMapImpl<K, V>(Keys);
    for (let [k, v] of keyValues) {
        map.set(k, v);
    }
    return map;
}

class HashMapImpl<Key, Value> implements MutableMap<Key, Value> {

    private map : Map<int, MutableMap<Key, Value>>;

    private count : nat;

    constructor(private Keys : Hashables<Key>) {
        this.map = new Map();
        this.count = 0;
    }

    [Symbol.iterator](): IterableIterator<[Key, Value]> {
        return this.entries();
    }

    get [Symbol.toStringTag](): string {
        return `HashMap(${joinStrings(", ", [...this.entries()].map(kv => `${kv[0]} -> ${kv[1]}`))})`;
    }

    clear(): void {
        this.map.clear();
        this.count = 0;
    }

    delete(key: Key): boolean {
        const code = this.Keys.hash(key);
        const keyValues = this.map.get(code);
        if (keyValues === undefined) return false;
        if (keyValues.delete(key)) {
            this.count -= 1;
            if (keyValues.size === 0) {
                this.map.delete(code);
            }
            return true;
        } else {
            return false;
        }
    }

    remove(key: Key): Value | undefined {
        const code = this.Keys.hash(key);
        const keyValues = this.map.get(code);
        if (keyValues === undefined) return undefined;
        const oldSize = keyValues.size;
        const oldValue = keyValues.remove(key);
        const newSize = keyValues.size;
        if (newSize < oldSize) {
            this.count -= 1;
            if (newSize === 0) {
                this.map.delete(code);
            }
        } 
        return oldValue;
    }

    get(key: Key): Value | undefined {
        const code = this.Keys.hash(key);
        const keyValues = this.map.get(code);
        if (keyValues === undefined) return undefined;
        return keyValues.get(key);
    }

    has(key: Key): boolean {
        const code = this.Keys.hash(key);
        const keyValues = this.map.get(code);
        if (keyValues === undefined) return false;
        return keyValues.has(key);
    }

    set(key: Key, value: Value): this {
        const code = this.Keys.hash(key);
        const keyValues = this.map.get(code);
        if (keyValues === undefined) {
            let keyValues = AssocArrayFor<Key, Value>(this.Keys);
            keyValues.set(key, value);
            this.map.set(code, keyValues);
            this.count += 1;
        } else {
            let oldSize = keyValues.size;
            keyValues.set(key, value);
            if (oldSize < keyValues.size) this.count += 1;
        }
        return this;
    }

    put(key: Key, value: Value): Value | undefined {
        const code = this.Keys.hash(key);
        const keyValues = this.map.get(code);
        if (keyValues === undefined) {
            let keyValues = AssocArrayFor<Key, Value>(this.Keys);
            keyValues.set(key, value);
            this.map.set(code, keyValues);
            this.count += 1;
            return undefined;
        } else {
            let oldSize = keyValues.size;
            let old = keyValues.put(key, value);
            if (oldSize < keyValues.size) this.count += 1;
            return old;
        }
    }

    putIfUndefined(key: Key, value: Value): Value | undefined {
        const code = this.Keys.hash(key);
        const keyValues = this.map.get(code);
        if (keyValues === undefined) {
            let keyValues = AssocArrayFor<Key, Value>(this.Keys);
            keyValues.set(key, value);
            this.map.set(code, keyValues);
            this.count += 1;
            return undefined;
        } else {
            let oldSize = keyValues.size;
            let old = keyValues.putIfUndefined(key, value);
            if (oldSize < keyValues.size) this.count += 1;
            return old;
        }
    }

    get size(): nat {
        return this.count;
    }

    forEach(callbackfn: (value: Value, key: Key, map: MutableMap<Key, Value>) => void, thisArg?: any): void {
        for (let keyValues of this.map.values()) {
            for (let [k, v] of keyValues) {
                callbackfn.call(thisArg, v, k, this);
            }
        }
    }

    entries(): IterableIterator<[Key, Value]> {
        const that = this;
        function* run() {
            for (let keyValues of that.map.values()) {
                for (let kv of keyValues) {
                    yield kv;
                }
            }    
        }
        return run();
    }

    keys(): IterableIterator<Key> {
        const that = this;
        function* run() {
            for (let keyValues of that.map.values()) {
                for (let [k, v] of keyValues) {
                    yield k;
                }
            }    
        }
        return run();
    }

    values(): IterableIterator<Value> {
        const that = this;
        function* run() {
            for (let keyValues of that.map.values()) {
                for (let [k, v] of keyValues) {
                    yield v;
                }
            }    
        }
        return run();
    }    
}
