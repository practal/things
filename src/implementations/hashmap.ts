import { int, nat } from "../interfaces/primitives";
import { MutableMap } from "../interfaces/map";
import { MutableThing } from "./thing";
import { MutableInt } from "./numberthing";
import { finalClass, freeze } from "./utils";
import { Things } from "../interfaces/things";
import { CopyOnWrite } from "./copyonwrite";

class HashMapImpl<Key, Value> extends MutableThing implements MutableMap<Key, Value> {

    static {
        freeze(HashMapImpl);
    }

    private readonly map : CopyOnWrite<Map<int, MutableMap<Key, Value>>>;

    private readonly counter : MutableInt

    constructor(private _Keys : Things<Key>, private _Values : Things<Value>) {
        super();
        if (new.target !== HashMapImpl) finalClass("HashMapImpl");
        this.map = new CopyOnWrite(new Map());
        this.counter = new MutableInt();
        Object.freeze(this);
    }

    Keys() { return this._Keys; }

    Values() { return this._Values; }

    put(key: Key, value: Value): Value | undefined {
        throw new Error("Method not implemented.");
    }

    putIfUndefined(key: Key, value: Value): Value | undefined {
        throw new Error("Method not implemented.");
    }

    remove(key: Key): Value | undefined {
        throw new Error("Method not implemented.");
    }

    clear(): void {
        throw new Error("Method not implemented.");
    }

    delete(key: Key): boolean {
        throw new Error("Method not implemented.");
    }

    forEach(callbackfn: (value: Value, key: Key, map: Map<Key, Value>) => void, thisArg?: any): void {
        throw new Error("Method not implemented.");
    }

    get(key: Key): Value | undefined {
        throw new Error("Method not implemented.");
    }

    has(key: Key): boolean {
        throw new Error("Method not implemented.");
    }

    set(key: Key, value: Value): this {
        throw new Error("Method not implemented.");
    }

    get size(): nat {
        throw new Error("Not implemented");
    }

    entries(): IterableIterator<[Key, Value]> {
        throw new Error("Method not implemented.");
    }

    keys(): IterableIterator<Key> {
        throw new Error("Method not implemented.");
    }

    values(): IterableIterator<Value> {
        throw new Error("Method not implemented.");
    }

    assign(value: this): void {
        throw new Error("Method not implemented.");
    }

    toString(): string {
        throw new Error("Method not implemented.");
    }

    clone(): this {
        throw new Error("Method not implemented.");
    }

    release(): void {
        throw new Error("Method not implemented.");
    }    

    [Symbol.iterator](): IterableIterator<[Key, Value]> {
        throw new Error("Method not implemented.");
    }

    [Symbol.toStringTag]: string;

}