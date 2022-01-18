import { defaultEquatables, Equatable, Equatables } from "./equatable";
import { Dict, MutableMap } from "./map";
import { nat } from "./primitives";

export function createAssocArray<Key, Value>(Keys : Equatables<Key>) : Dict<Key, Value> {
    return new AssocArrayImpl(Keys);
}

export function AssocArray<Key extends Equatable, Value>(keyValues : Iterable<[Key, Value]> = []) : Dict<Key, Value> {
    let m = new AssocArrayImpl<Key, Value>(defaultEquatables<Key>());
    for (let [k, v] of keyValues) {
        m.set(k, v);
    }
    return m;
}

class AssocArrayImpl<Key, Value> implements Dict<Key, Value> {

    private content : [Key, Value][]

    constructor(private Keys : Equatables<Key>) {
        this.content = [];
    }

    get(key: Key): Value | undefined {
        for (let [k, v] of this.content) {
            if (this.Keys.equals(key, k)) {
                return v;
            }
        }
        return undefined;
    }

    has(key: Key): boolean {
        for (let [k, v] of this.content) {
            if (this.Keys.equals(key, k)) {
                return true;
            }
        }
        return false;
    }

    private find(key : Key) : nat | undefined {
        for (let i = 0; i < this.content.length; i++) {
            let [k, v] = this.content[i];
            if (this.Keys.equals(key, k)) return i;
        }
        return undefined;
    }

    set(key: Key, value: Value): this {
        const i = this.find(key);
        if (i === undefined) {
            this.content.push([key, value]);
        } else {
            this.content[i][1] = value;
        }
        return this;
    }

    delete(key: Key): boolean {
        const i = this.find(key);
        if (i === undefined) return false;
        this.content.splice(i, 1);
        return true;
    }

    put(key: Key, value: Value): Value | undefined {
        const i = this.find(key);
        if (i === undefined) {
            this.content.push([key, value]);
            return undefined;
        } else {
            const oldValue = this.content[i][1];
            this.content[i][1] = value;
            return oldValue;
        }
    }

    putIfAbsent(key: Key, value: Value): Value | undefined {
        const i = this.find(key);
        if (i === undefined) {
            this.content.push([key, value]);
            return undefined;
        } else {
            return this.content[i][1];
        }
    }

    clear() {
        this.content = [];
    }

    get size(): nat {
        return this.content.length;
    }



}
