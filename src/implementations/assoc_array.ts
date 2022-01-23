import { Things } from "../interfaces/things";
import { Equatable, Equality } from "../interfaces/equatable";
import { MutableMap } from "../interfaces/map";
import { int, nat } from "../interfaces/primitives";
import { Thing } from "./thing";
import { freeze, joinStrings } from "./utils";
import { ComparisonResult, EQUAL, UNRELATED } from "../interfaces/comparable";
import { Anything } from "./anything";
import { isMapThing, MapCompare, MapHash } from "./map";
import { CopyOnWrite } from "./copyonwrite";

export function AssocArray<Key, Value>(keyValues : Iterable<[Key, Value]> = []) : MutableMap<Key, Value> {
    return AssocArrayFor(Anything, Anything, keyValues);
}

freeze(AssocArray);

export function AssocArrayFor<Key, Value>(Keys : Things<Key>, Values : Things<Value>, keyValues : Iterable<[Key, Value]> = []) : MutableMap<Key, Value> {
    let m = new AssocArrayImpl<Key, Value>(Keys, Values);
    for (let [k, v] of keyValues) {
        m.set(k, v);
    }
    return m;
}

freeze(AssocArray);

class AssocArrayImpl<Key, Value> extends Thing implements MutableMap<Key, Value> {
    
    static {
        freeze(AssocArrayImpl);
    }

    private _Keys : Things<Key>;
    private _Values : Things<Value>;
    private content : CopyOnWrite<[Key, Value][]>;

    constructor(Keys : Things<Key>, Values : Things<Value>) {
        super();
        this._Keys = Keys;
        this._Values = Values;
        this.content = new CopyOnWrite([]);
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
        return `AssocArray(${joinStrings(", ", this.content.value.map(kv => `${kv[0]} -> ${kv[1]}`))})`;       
    }

    get(key: Key): Value | undefined {
        const K = this.Keys();
        for (let [k, v] of this.content.value) {
            if (K.equals(k, key)) {
                return v;
            }
        }
        return undefined;
    }

    has(key: Key): boolean {
        const K = this.Keys();
        for (let [k, v] of this.content.value) {
            if (K.equals(k, key)) {
                return true;
            }
        }
        return false;
    }

    private find(key : Key) : int {
        const K = this.Keys();
        const content = this.content.value;
        for (let i = 0; i < content.length; i++) {
            let [k, v] = content[i];
            if (K.equals(k, key)) return i;
        }
        return -1;
    }

    private prepareWriting() {
        const newContent = this.content.write(content => {
            return [...content];
        });
        if (newContent !== undefined) {
            this.content = newContent;
        }
    }

    set(key: Key, value: Value): this {
        const i = this.find(key);
        this.prepareWriting();
        if (i < 0) {
            this.content.value.push([key, value]);
        } else {
            this.content.value[i][1] = value;
        }
        return this;
    }

    put(key: Key, value: Value): Value | undefined {
        const i = this.find(key);
        if (i < 0) {
            this.prepareWriting();
            this.content.value.push([key, value]);
            return undefined;
        } else {
            const oldValue = this.content.value[i][1];
            this.prepareWriting();
            this.content.value[i][1] = value;
            return oldValue;
        }
    }

    putIfUndefined(key: Key, value: Value): Value | undefined {
        const i = this.find(key);
        if (i < 0) {
            this.prepareWriting();
            this.content.value.push([key, value]);
            return undefined;
        } else {
            const old = this.content.value[i][1];
            if (old === undefined) {
                this.prepareWriting();
                this.content.value[i][1] = value;    
            }
            return old;
        }
    }

    delete(key: Key): boolean {
        const i = this.find(key);
        if (i < 0) return false;
        this.prepareWriting();
        this.content.value.splice(i, 1);
        return true;
    }

    remove(key: Key): Value | undefined {
        const i = this.find(key);
        if (i < 0) return undefined;
        this.prepareWriting();
        const old = this.content.value[i][1];
        this.content.value.splice(i, 1);
        return old;
    }

    clear() {
        this.prepareWriting();
        this.content.value = [];
    }

    get size(): nat {
        return this.content.value.length;
    }

    forEach(callbackfn: (value: Value, key: Key, map: Map<Key, Value>) => void, thisArg?: any): void {
        const that = this;
        this.content.value.forEach((kv : [Key, Value], index: number, arr : [Key, Value][]) => {
            callbackfn(kv[1], kv[0], that);
        }, thisArg);
    }

    entries(): IterableIterator<[Key, Value]> {
        return this.content.value.values();
    }

    keys(): IterableIterator<Key> {
        const content = this.content.value;
        function* run() {
            for (let [k, v] of content) {
                yield k;
            }
        }
        return run();
    }

    values(): IterableIterator<Value> {
        const content = this.content.value;
        function* run() {
            for (let [k, v] of content) {
                yield v;
            }
        }
        return run();
    }

    clone(): this {
        this.content.clone();
        return this;
    }

    release(): void {
        this.content.release();
    }

    isEqualTo(other: any): boolean {
        if (!isMapThing(other)) return false;
        return MapCompare(this, other, this.Values()) === EQUAL;
    }

    compareTo(other: any): ComparisonResult {
        if (!isMapThing(other)) return UNRELATED;
        return MapCompare(this, other, this.Values());
    }
 
    get hash(): int {
        return MapHash(this, this.Keys(), this.Values());
    }
}
