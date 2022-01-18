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

export interface Dict<Key, Value> extends MutableMap<Key, Value> {

    put(key : Key, value : Value) : Value | undefined

    putIfAbsent(key : Key, value : Value) : Value | undefined

}

export interface ImmutableMap<Key, Value> extends Map<Key, Value> {

    remove(key : Key) : this

}

export type Mapping<Key, Value> = ImmutableMap<Key, Value>

export function jsMap<Key, Value>(...keyValues : [Key, Value][]) : MutableMap<Key, Value> {
    return new globalThis.Map(keyValues);
}






