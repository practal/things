import { int } from "./primitives.js";
import { assertNeverT } from "./test.js";
import { freeze } from "./utils.js";

export enum Relation {
    UNRELATED,
    LESS,
    EQUAL,
    GREATER
}

export type Total = Relation.LESS | Relation.EQUAL | Relation.GREATER

export function relationAsNumber(r : Relation) : number | undefined {
    switch(r) {
        case Relation.LESS: return -1;
        case Relation.EQUAL: return 0;
        case Relation.GREATER: return 1;
        default: return undefined;
    }
}

export function invertRelation(relation : Relation) : Relation {
    switch (relation) {
        case Relation.LESS: return Relation.GREATER;
        case Relation.GREATER: return Relation.LESS;
        case Relation.EQUAL: return Relation.EQUAL;
        case Relation.UNRELATED: return Relation.UNRELATED;
        default: assertNeverT(relation);
    }
}
freeze(invertRelation);

export interface Thing<T> {

    name : string

    is(value : any) : value is T

    assert(value : any) : asserts value is T

    display(value : T) : string

}

export interface Equality<T> extends Thing<T> {

    /** Here we can assume that `is(x)` and `is(y)` both hold.  */
    equal(x : T, y : T) : boolean

}

export interface Compare<T> {

    compare(x : T, y : T) : Relation

}

export interface Order<T> extends Equality<T>, Compare<T> {

    /** 
     * Here we can assume that `is(x)` and `is(y)` both hold. 
     * Must be compatible with {@link Equality.equals}: 
     * `equal(x, y) === (compare(x, y) === Relation.EQUAL)`
     **/
    compare(x : T, y : T) : Relation

}

export interface Hash<T> extends Equality<T> {

    /** 
     * Here we can assume that `is(x)` holds. 
     * Must be compatible with {@link Equality.equals}: 
     * `equal(x, y)` implies `hash(x) === hash(y)` 
     */
    hash(x : T) : int

}

export interface Data<T> extends Order<T>, Hash<T> {}

const defaultThingName = "thing";

export function mkThing<T>(
    name : string | undefined, 
    check : (value : any) => boolean,
    display : (value : T) => string = (v) => "" + v) : Thing<T> 
{
    name = name ?? defaultThingName;
    const thing : Thing<T> = {
        name: name,
        is: function (value: any): value is T {
            return check(value);
        },
        assert: function (value: any): asserts value is T {
            if (!check(value)) throw new Error("not a " + name + ": " + value);
        },
        display: display
    };
    return freeze(thing);
}
freeze(mkThing);

export function assertThings<T>(thing : Thing<T>, ...values : T[]) {
    for (const v of values) thing.assert(v);
}

export function mkEquality<T>(
    name : string | undefined, 
    check : (x : T) => boolean, 
    equal : (x : T, y : T) => boolean,
    display : (value : T) => string = (v) => "" + v) : Equality<T>
{
    name = name ?? defaultThingName;
    const eq : Equality<T> = {
        name: name,
        is: function (value: any): value is T {
            return check(value);
        },
        assert: function (value: any): asserts value is T {
            if (!check(value)) throw new Error("not a " + name + ": " + value);
        },
        equal: function (x: T, y: T): boolean {
            return equal(x, y);
        },
        display: display
    };
    return freeze(eq);
}
freeze(mkEquality);

export function mkOrder<T>(
    name : string | undefined, 
    check : (x : T) => boolean, 
    compare : (x : T, y : T) => Relation,
    display : (value : T) => string = (v) => "" + v) : Order<T>
{
    name = name ?? defaultThingName;
    const order : Order<T> = {
        name: name,
        is: function (value: any): value is T {
            return check(value);
        },
        assert: function (value: any): asserts value is T {
            if (!check(value)) throw new Error("not a " + name + ": " + value);
        },
        equal: function (x: T, y: T): boolean {
            return compare(x, y) === Relation.EQUAL;
        },
        compare: function (x: T, y: T): Relation {
            return compare(x, y);
        },
        display: display
    };
    return order;
}
freeze(mkOrder);

export function mkHash<T>(
    name : string | undefined, 
    check : (x : T) => boolean, 
    equal : (x : T, y : T) => boolean,
    hashing : (x : T) => int,
    display : (value : T) => string = (v) => "" + v) : Hash<T>
{
    name = name ?? defaultThingName;
    const hash : Hash<T> = {
        name: name,
        is: function (value: any): value is T {
            return check(value);
        },
        assert: function (value: any): asserts value is T {
            if (!check(value)) throw new Error("not a " + name + ": " + value);
        },
        equal: function (x: T, y: T): boolean {
            return equal(x, y);
        },
        hash: function(x: T): int {
            return hashing(x);
        },
        display: display
    };
    return hash;
}
freeze(mkHash);

export function mkOrderAndHash<T>(
    name : string | undefined, 
    check : (x : T) => boolean, 
    compare : (x : T, y : T) => Relation,
    hash : (x : T) => int,
    display : (value : T) => string = (v) => "" + v) : Order<T> & Hash<T>
{
    name = name ?? defaultThingName;
    const order : Order<T> & Hash<T> = {
        name: name,
        is: function (value: any): value is T {
            return check(value);
        },
        assert: function (value: any): asserts value is T {
            if (!check(value)) throw new Error("not a " + name + ": " + value);
        },
        equal: function (x: T, y: T): boolean {
            return compare(x, y) === Relation.EQUAL;
        },
        compare: function (x: T, y: T): Relation {
            return compare(x, y);
        },
        hash: function(x: T): int {
            return hash(x);
        },
        display: display
    };
    return order;
}
freeze(mkOrderAndHash);

export function mkData<T>(
    name : string | undefined, 
    check : (x : T) => boolean, 
    compare : (x : T, y : T) => Relation,
    hash : (x : T) => int,
    display : (value : T) => string = (v) => "" + v) : Data<T>
{
    return mkOrderAndHash<T>(name, check, compare, hash, display);
}
freeze(mkData);

