import { nat } from "./primitives";

export interface Map<Key, Value> {

    get(key : Key) : Value | undefined

    has(key : Key) : boolean

    set(key : Key, value : Value) : this

    get size() : nat

}

export interface MutableMap<Key, Value> extends Map<Key, Value> {

    clear() : void

    delete(key : Key) : boolean

}

export interface ImmutableMap<Key, Value> extends Map<Key, Value> {

    delete(key : Key) : this

}

export function jsMap<Key, Value>(...keyValues : [Key, Value][]) : MutableMap<Key, Value> {
    return new globalThis.Map(keyValues);
}




