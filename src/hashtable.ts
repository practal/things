import { AssocArray, createAssocArray } from "./assoc_array";
import { defaultHashables, Hashable, Hashables } from "./hashable";
import { jsMap, MutableMap } from "./map";
import { int, nat } from "./primitives";

export function createHashMap<Key, Value>(Keys : Hashables<Key>) : MutableMap<Key, Value> {
    return new HashMapImpl(Keys);
}

export function HashMap<Key extends Hashable, Value>(keyValues : Iterable<[Key, Value]>) : MutableMap<Key, Value> {
    let map = createHashMap<Key, Value>(defaultHashables<Key>());
    for (let [k, v] of keyValues) {
        map.set(k, v);
    }
    return map;
}

class HashMapImpl<Key, Value> implements MutableMap<Key, Value> {

    private map : MutableMap<int, MutableMap<Key, Value>>;
    private count : nat;

    constructor(private Keys : Hashables<Key>) {
        this.map = jsMap();
        this.count = 0;
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
            return true;
        } else {
            return false;
        }
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
            let keyValues = createAssocArray<Key, Value>(this.Keys);
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

    get size(): nat {
        return this.count;
    }
}
