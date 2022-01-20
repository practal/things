export interface MutableMap<Key, Value> extends Map<Key, Value> {

    put(key : Key, value : Value) : Value | undefined

    putIfUndefined(key : Key, value : Value) : Value | undefined

    remove(key : Key) : Value | undefined

}

export interface ImmutableMap<Key, Value> extends ReadonlyMap<Key, Value> {

    put(key : Key, value : Value) : {old : Value | undefined, result : ImmutableMap<Key, Value> }

    putIfUndefined(key : Key, value : Value) : {old : Value | undefined, result : ImmutableMap<Key, Value> }

    remove(key : Key) : { old : Value | undefined, result : ImmutableMap<Key, Value> }

}