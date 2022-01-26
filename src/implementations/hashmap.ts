import { int, nat } from "../interfaces/primitives";
import { MutableMap } from "../interfaces/map";
import { MutableThing } from "./thing";
import { MutableInt } from "./numberthing";
import { finalClass, freeze, joinStrings } from "./utils";
import { Things } from "../interfaces/things";
import { CopyOnWrite } from "./copyonwrite";
import { AssocArrayFor } from "./assoc_array";
import { Anything } from "./anything";
import { isMapThing, MapCompare, MapHash } from "./map";
import { ComparisonResult, EQUAL, UNRELATED } from "../interfaces/comparable";

export function HashMap<Key, Value>(keyValues : Iterable<[Key, Value]> = []) : MutableMap<Key, Value> {
    return HashMapFor(Anything, Anything, keyValues);
}

freeze(HashMap);

export function HashMapFor<Key, Value>(Keys : Things<Key>, Values : Things<Value>, keyValues : Iterable<[Key, Value]> = []) : MutableMap<Key, Value> {
    let m = HashMapImpl.create(Keys, Values);
    for (let [k, v] of keyValues) {
        m.set(k, v);
    }
    return m;
}

freeze(HashMapFor);

class HashMapImpl<Key, Value> extends MutableThing implements MutableMap<Key, Value> {

    static {
        freeze(HashMapImpl);
    }

    private _Keys : Things<Key>
    private _Values : Things<Value>

    #map : CopyOnWrite<Map<int, MutableMap<Key, Value>>>;

    #counter : nat

    private constructor(Keys : Things<Key>, Values : Things<Value>, map : CopyOnWrite<Map<int, MutableMap<Key, Value>>>, counter : nat) {
        super();
        if (new.target !== HashMapImpl) finalClass("HashMapImpl");
        this._Keys = Keys;
        this._Values = Values;
        this.#counter = counter;
        this.#map = map;
        this.#counter = counter;
        Object.freeze(this);
    }

    static create<K, V>(Keys : Things<K>, Values : Things<V>) : HashMapImpl<K, V> {
        return new HashMapImpl(Keys, Values, new CopyOnWrite(new Map()), 0);
    }

    Keys() : Things<Key> { return this._Keys; }

    Values() : Things<Value> { return this._Values; }

    private copyIfNeeded() {
        function* it(m : Map<int, MutableMap<Key, Value>>) : Generator<[int, MutableMap<Key, Value>], void, unknown> {
            for (let [k, v] of m) {
                yield [k, v.clone()];
            }
        }
        this.#map = this.#map.copyIfShared(m => new Map(it(m)));
    }

    put(key: Key, value: Value): Value | undefined {
        this.copyIfNeeded();
        const code = this._Keys.hashOf(key);
        const keyValues = this.#map.value.get(code);
        if (keyValues === undefined) {
            let keyValues = AssocArrayFor(this._Keys, this._Values);
            keyValues.set(key, value);
            this.#map.value.set(code, keyValues);
            this.#counter++;
            return undefined;
        } else {
            let oldSize = keyValues.size;
            let old = keyValues.put(key, value);
            if (oldSize < keyValues.size) this.#counter++;
            return old;
        }        
    }

    putIfUndefined(key: Key, value: Value): Value | undefined {
        this.copyIfNeeded();
        const code = this._Keys.hashOf(key);
        const keyValues = this.#map.value.get(code);
        if (keyValues === undefined) {
            let keyValues = AssocArrayFor(this._Keys, this._Values);
            keyValues.set(key, value);
            this.#map.value.set(code, keyValues);
            this.#counter++;
            return undefined;
        } else {
            let oldSize = keyValues.size;
            let old = keyValues.putIfUndefined(key, value);
            if (oldSize < keyValues.size) this.#counter++;
            return old;
        }            
    }

    remove(key: Key): Value | undefined {
        this.copyIfNeeded();
        const code = this._Keys.hashOf(key);
        const keyValues = this.#map.value.get(code);
        if (keyValues === undefined) return undefined;
        const oldSize = keyValues.size;
        const oldValue = keyValues.remove(key);
        const newSize = keyValues.size;
        if (newSize < oldSize) {
            this.#counter--;
            if (newSize === 0) {
                this.#map.value.delete(code);
            }
        } 
        return oldValue;
    }

    clear(): void {
        if (this.#counter == 0) return;
        this.#map = this.#map.set(new Map());
        this.#counter = 0;
    }

    delete(key: Key): boolean {
        const old_counter = this.#counter;
        this.remove(key);
        return this.#counter < old_counter;
    }

    forEach(callbackfn: (value: Value, key: Key, map: Map<Key, Value>) => void, thisArg?: any): void {
        for (let keyValues of this.#map.value.values()) {
            for (let [k, v] of keyValues) {
                callbackfn.call(thisArg, v, k, this);
            }
        }    
    }

    get(key: Key): Value | undefined {
        const code = this._Keys.hashOf(key);
        const keyValues = this.#map.value.get(code);
        if (keyValues === undefined) return undefined;
        return keyValues.get(key);
    }

    has(key: Key): boolean {
        const code = this._Keys.hashOf(key);
        const keyValues = this.#map.value.get(code);
        if (keyValues === undefined) return false;
        return keyValues.has(key);
    }

    set(key: Key, value: Value): this {
        this.put(key, value);
        return this;
    }

    get size(): nat {
        return this.#counter;
    }

    entries(): IterableIterator<[Key, Value]> 
    {
        const maps = this.#map.value.values();
        function* it() : Generator<[Key, Value], void, unknown> {
            for (let keyValues of maps) {
                for (let [k, v] of keyValues) {
                    yield [k, v];
                }
            }      
        }
        return it();
    }

    keys(): IterableIterator<Key> {
        const maps = this.#map.value.values();
        function* it() : Generator<Key, void, unknown> {
            for (let keyValues of maps) {
                for (let [k, v] of keyValues) {
                    yield k;
                }
            }      
        }
        return it();
    }

    values(): IterableIterator<Value> {
        const maps = this.#map.value.values();
        function* it() : Generator<Value, void, unknown> {
            for (let keyValues of maps) {
                for (let [k, v] of keyValues) {
                    yield v;
                }
            }      
        }
        return it();
    }

    clone(): this {
        this.#map.acquire();
        return new HashMapImpl(this._Keys, this._Values, this.#map, this.#counter) as this;       
    }

    assign(it : Iterable<[Key, Value]>) : void {
        if (it instanceof HashMapImpl && this._Keys === it._Keys && this._Values === it._Values) {
            it.#map.acquire();
            this.#map.release();
            this.#map = it.#map;
            this.#counter = it.#counter;
        } else {
            const temp = HashMapImpl.create(this._Keys, this._Values);
            for (let [k, v] of it) {
                temp.put(k, v);
            }
            this.#map = this.#map.set(temp.#map.value);
            this.#counter = temp.#counter;
        }
    }

    toString(): string {
        return `HashMap[size=${this.size}](${joinStrings(", ", [...this.entries()].map(kv => `${kv[0]} -> ${kv[1]}`))})`;       
    }    

    release(): void {
        for (let [k, m] of this.#map.value) {
            m.release();
        }
        this.#map.release();
    }    

    [Symbol.iterator](): IterableIterator<[Key, Value]> {
        return this.entries();
    }

    get [Symbol.toStringTag](): string {
        return this.toString();
    }

    isEqualTo(other: any): boolean {
        if (this === other) return true;
        if (other instanceof HashMapImpl && this.#map === other.#map) return true;
        if (!isMapThing(other)) return false;
        return MapCompare(this, other, this.Values()) === EQUAL;
    }

    compareTo(other: any): ComparisonResult {
        if (this === other) return EQUAL;
        if (other instanceof HashMapImpl && this.#map === other.#map) return EQUAL;
        if (!isMapThing(other)) return UNRELATED;
        return MapCompare(this, other, this.Values());
    }
 
    get hash(): int {
        return MapHash(this, this.Keys(), this.Values());
    }    

}