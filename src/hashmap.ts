import { AssocArrayFor } from "./assoc_array";
import { defaultHashables, Hashable, Hashables } from "./hashable";
import { MutableMap } from "./map";
import { int, nat } from "./primitives";
import { Thing } from "./thing";
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

class Counter {
    private counter : int = 0;
    get get(): int { return this.counter; }
    increment() { this.counter += 1; }
    decrement() { this.counter -= 1; }
    reset() { this.counter = 0; }
}

class HashMapImpl<Key, Value> extends Thing implements MutableMap<Key, Value> {

    static {
        Object.freeze(HashMapImpl.prototype);
        Object.freeze(HashMapImpl);
    }

    private readonly map : Map<int, MutableMap<Key, Value>>;

    private readonly counter : Counter

    constructor(private Keys : Hashables<Key>) {
        super();
        this.map = new Map();
        this.counter = new Counter();
        Object.freeze(this);
    }

    [Symbol.iterator](): IterableIterator<[Key, Value]> {
        return this.entries();
    }

    get [Symbol.toStringTag](): string {
        return `HashMap(${joinStrings(", ", [...this.entries()].map(kv => `${kv[0]} -> ${kv[1]}`))})`;
    }

    clear(): void {
        this.map.clear();
        this.counter.reset();
    }

    delete(key: Key): boolean {
        const code = this.Keys.hash(key);
        const keyValues = this.map.get(code);
        if (keyValues === undefined) return false;
        if (keyValues.delete(key)) {
            this.counter.decrement(); 
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
            this.counter.decrement();
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
            this.counter.increment(); 
        } else {
            let oldSize = keyValues.size;
            keyValues.set(key, value);
            if (oldSize < keyValues.size) this.counter.increment(); 
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
            this.counter.increment(); 
            return undefined;
        } else {
            let oldSize = keyValues.size;
            let old = keyValues.put(key, value);
            if (oldSize < keyValues.size) this.counter.increment(); 
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
            this.counter.increment();
            return undefined;
        } else {
            let oldSize = keyValues.size;
            let old = keyValues.putIfUndefined(key, value);
            if (oldSize < keyValues.size) this.counter.increment(); 
            return old;
        }
    }

    get size(): nat {
        return this.counter.get;
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
