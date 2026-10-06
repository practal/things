import assert from "node:assert/strict";
import { freeze } from "./freeze.js";
import { mkOpaque, type Opaque } from "./opaque.js";
import { Test } from "./test.js";

declare const tag : unique symbol;

Test(() => {
    const first = mkOpaque<typeof tag, string>("Example", text => text);
    const second = mkOpaque<typeof tag, string>("Example");
    const value = first.create("private data");
    assert.equal(first.type.is(value), true);
    assert.equal(first.read(value), "private data");
    assert.equal(first.type.display(value), "private data");
    assert.equal(second.type.is(value), false);
    assert.throws(() => second.read(value), TypeError);
    assert.deepEqual(Reflect.ownKeys(value), []);

    // @ts-expect-error The nominal brand is not supplied by a plain object.
    const fake : Opaque<typeof tag> = {};
    assert.equal(first.type.is(fake), false);
}, "Opaque: independent runtime families and private state");

Test(() => {
    const factory = mkOpaque<typeof tag, number>("Example");
    const value = factory.create(42);
    const prototype = Object.getPrototypeOf(value);
    const Constructor = prototype.constructor;
    for (const candidate of [
        undefined, null, 0, "Example", Symbol(), () => {}, {}, Object.freeze({}),
        { ...value }, Object.create(value), Object.create(prototype)
    ]) {
        assert.equal(factory.type.is(candidate), false);
        assert.throws(() => factory.read(candidate), TypeError);
    }
    assert.throws(() => Reflect.construct(Constructor, [{}, 99]), TypeError);
    class Subclass extends Constructor {}
    assert.throws(() => new Subclass(), TypeError);
    // Reflection must not expose the private-state reader as a static method.
    assert.deepEqual(Reflect.ownKeys(Constructor), ["length", "name", "prototype"]);
    assert.equal(factory.read(value), 42);
}, "Opaque: prototype imitations and reflected constructors confer no authority");

Test(() => {
    const factory = mkOpaque<typeof tag, undefined>("Example");
    const unexpected = () => { assert.fail("Caller code was invoked."); };
    const handler : ProxyHandler<object> = {
        get: unexpected, has: unexpected, getPrototypeOf: unexpected
    };
    const revoked = Proxy.revocable(factory.create(undefined), handler);
    revoked.revoke();
    for (const value of [
        new Proxy(factory.create(undefined), handler), revoked.proxy,
        { [Symbol.toPrimitive]: unexpected, toString: unexpected }
    ]) {
        assert.equal(factory.type.is(value), false);
        for (const check of [factory.type.assert, factory.read]) {
            assert.throws(() => check(value), {
                name: "TypeError", message: "Expected a Example."
            });
        }
    }
}, "Opaque: validation never calls proxies or string coercion");

Test(() => {
    const factory = mkOpaque<typeof tag, undefined>("Example");
    const value = factory.create(undefined);
    const prototype = Object.getPrototypeOf(value);
    assert.equal(Object.getPrototypeOf(prototype), null);
    assert.equal(Object.getPrototypeOf(factory), null);
    assert.equal(Object.getPrototypeOf(factory.type), null);
    for (const object of [
        value, prototype, prototype.constructor, factory, factory.type,
        factory.create, factory.read, factory.type.is, factory.type.assert, factory.type.display
    ]) {
        assert.equal(Object.isFrozen(object), true);
        assert.equal(Reflect.set(object, "tampered", true), false);
        assert.equal(Reflect.setPrototypeOf(object, {}), false);
    }
    assert.equal(Reflect.set(factory.type, "is", () => true), false);
    assert.equal(factory.type.is({}), false);
}, "Opaque: instances, prototypes, factories and descriptors resist mutation");

Test(() => {
    interface Members {
        readonly text : string;
        readonly plus : (suffix : string) => string;
    }
    const members : Members = {
        get text() : string { return factory.read(this); },
        plus(suffix : string) : string { return factory.read(this) + suffix; }
    };
    const factory = mkOpaque<typeof tag, string, Members>("Example", undefined, members);
    const value = factory.create("private");
    const other = factory.create("other");
    assert.equal(value.text, "private");
    assert.equal(value.plus("!"), "private!");
    assert.equal(value.plus.call(other, "!"), "other!");
    assert.deepEqual(Reflect.ownKeys(value), []);
    const prototype = Object.getPrototypeOf(value);
    assert.equal(Object.getPrototypeOf(other), prototype);
    assert.equal(Object.isFrozen(prototype), true);
    assert.equal(Object.isFrozen(value.plus), true);
    assert.equal(Object.isFrozen(Object.getOwnPropertyDescriptor(prototype, "text")!.get), true);
    assert.equal(Reflect.set(value, "text", "changed"), false);
    assert.equal(Reflect.set(prototype, "plus", () => "changed"), false);
    assert.equal(Reflect.set(members, "plus", () => "changed"), true);
    assert.equal(value.plus("!"), "private!");
    for (const fake of [{}, Object.create(value), new Proxy(value, {})]) {
        assert.throws(() => value.plus.call(fake, "!"), TypeError);
        assert.throws(() => Reflect.get(prototype, "text", fake), TypeError);
    }
}, "Opaque: shared methods and getters preserve encapsulation and validate receivers");

Test(() => {
    for (const members of [
        { data: {} }, { data: 1 }, { constructor() {} }, { set text(_value : string) {} }
    ]) {
        assert.throws(() => mkOpaque<typeof tag, undefined, object>("Example", undefined, members), TypeError);
    }
}, "Opaque: public members must be methods or readonly getters");

Test(() => {
    const freezeBefore = Object.freeze;
    const setPrototypeBefore = Object.setPrototypeOf;
    const hasBefore = WeakMap.prototype.has;
    const getBefore = WeakMap.prototype.get;
    const factory = mkOpaque<typeof tag, string>("Example");
    let checks = false;
    try {
        Object.freeze = <T>(value : T) : Readonly<T> => value;
        Object.setPrototypeOf = <T>(value : T) : T => value;
        WeakMap.prototype.has = () => true;
        WeakMap.prototype.get = () => "forged";
        const later = mkOpaque<typeof tag, string>("Later");
        const value = factory.create("actual");
        const laterValue = later.create("later");
        checks = Object.isFrozen(value) && Object.isFrozen(laterValue)
            && Object.getPrototypeOf(Object.getPrototypeOf(laterValue)) === null
            && !factory.type.is({}) && !later.type.is(value)
            && factory.read(value) === "actual" && later.read(laterValue) === "later";
    } finally {
        Object.freeze = freezeBefore;
        Object.setPrototypeOf = setPrototypeBefore;
        WeakMap.prototype.has = hasBefore;
        WeakMap.prototype.get = getBefore;
    }
    assert.equal(checks, true);
}, "Opaque: later built-in replacements cannot change authentication or freezing");

Test(() => {
    const original = Object.freeze;
    class Example {}
    try {
        Object.freeze = <T>(value : T) : Readonly<T> => value;
        freeze(Example);
    } finally {
        Object.freeze = original;
    }
    assert.equal(Object.isFrozen(Example), true);
    assert.equal(Object.isFrozen(Example.prototype), true);
}, "freeze: retains native freezing for functions and their prototypes");
