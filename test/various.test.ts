import { iterateCodepoints, joinStrings } from "../src/implementations/utils";
import {int, numbers, AssocArrayFor,  nat, HashMapFor, MutableMap, Int, HashMap, MutableInt, Num, Nat} from "../src/index";

test("AssocArray", () => {
    let a : Map<int, string | null> = AssocArrayFor(numbers);
    a.set(1, "one");
    a.set(2, null);
    expect(a.get(1)).toBe("one");
    expect(a.get(2)).toBe(null);
    expect(a.get(3)).toBe(undefined);
    console.log(`${a}`);
});

function randomNat(max : nat = Number.MAX_SAFE_INTEGER) : number {
    return Math.round(Math.random() * max);
}

function coinflip() : boolean {
    return Math.random() >= 0.5;
}

test("HashMap<number, number>", () => {
    let a : Map<number, number> = HashMapFor(numbers);
    let b : Map<number, number> = new Map();
    let N = 1000;
    for (let i = 0; i < N/2; i ++) {
        let key = randomNat(N);
        if (coinflip()) {
            let value = randomNat();
            a.set(key, value);
            b.set(key, value);
            expect(a.size).toBe(b.size);
        } else {
            let da = a.delete(key);
            let db = b.delete(key);
            expect(da).toBe(db);
            expect(a.size).toBe(b.size);
        }
    }
    for (let i = 0; i <= N; i ++) {
        expect(a.get(i)).toBe(b.get(i));
    }
    //(a as any).get = 3;
    console.log(`size of a = ${a.size}, size of b = ${b.size}`);
});

test("SpeedDemon number", () => {
    let a : Map<number, number> = HashMapFor(numbers);
    let N = 100000;
    for (let i = 0; i < N/2; i ++) {
        let key = randomNat(N);
        if (coinflip()) {
            let value = randomNat();
            a.set(key, value);
        } else {
            let da = a.delete(key);
        }
    }
    console.log(`size of a = ${a.size}`);
});

test("SpeedDemon Int", () => {
    let a : Map<Int, Int> = HashMap();
    let N = 100000;
    for (let i = 0; i < N/2; i ++) {
        let key = new Int(randomNat(N));
        if (coinflip()) {
            let value = new Int(randomNat());
            a.set(key, value);
        } else {
            let da = a.delete(key);
        }
    }
    console.log(`size of a = ${a.size}`);
});

test("SpeedDemon MutableInt", () => {
    let a : Map<MutableInt, MutableInt> = HashMap();
    let N = 100000;
    for (let i = 0; i < N/2; i ++) {
        let key = new MutableInt(randomNat(N));
        if (coinflip()) {
            let value = new MutableInt(randomNat());
            a.set(key, value);
        } else {
            let da = a.delete(key);
        }
    }
    console.log(`size of a = ${a.size}`);
});

test("SpeedDemon Num", () => {
    let a : Map<Num, Num> = HashMap();
    let N = 100000;
    for (let i = 0; i < N/2; i ++) {
        let key = new Num(randomNat(N));
        if (coinflip()) {
            let value = new Num(randomNat());
            a.set(key, value);
        } else {
            let da = a.delete(key);
        }
    }
    console.log(`size of a = ${a.size}`);
});

test("immutable Nat", () => {
    let n = new Nat(1);
    expect(() => (n as any).value = 5).toThrow();
});

test("equals Nat MutableInt number", () => {
    let n = new Nat(7);
    let m = new MutableInt(7);
    let o = new MutableInt(8);
    let x = 7;
    expect(n.equals(o)).toBe(false);
    expect(o.equals(n)).toBe(false);
    expect(m.equals(o)).toBe(false);
    expect(n.equals(m)).toBe(true);
    expect(m.equals(n)).toBe(true);
    expect(() => m.equals(x as any)).toThrow();
    expect(n.equals(new Nat(7))).toBe(true);
    expect(n.equals(new Nat(8))).toBe(false);
    expect(() => (x as any).equals(n)).toThrow();
});

enum R {
    LESS = -1,
    EQUAL,
    GREATER,
    UNRELATED
}

const LESS = -1;

test("JavaScript Behaviour: enum", () => {
    expect(R.LESS).toBe(-1);
    (R as any).LESS = 42;
    expect(R.LESS).toBe(42);
    Object.freeze(R);
    expect(() => {(R as any).LESS = 66;}).toThrow();
    expect(R.LESS).toBe(42);
    expect(LESS).toBe(-1);
    expect(() => {(LESS as any) = 2;}).toThrow();
    expect(LESS).toBe(-1);
    expect(() => {(LESS as any).x = 7;}).toThrow();

    function test() : -1 {
        return LESS;
    }

    console.log(`typeof LESS = ${typeof LESS}`)
});

test("JavaScript Behaviour: undefined and null", () => {
    expect(undefined === undefined).toBe(true);
    expect(undefined == undefined).toBe(true);
    let m = new Map();
    m.set(undefined, 7);
    m.set(undefined, 6);
    expect(m.size).toBe(1);
    expect(m.get(undefined)).toBe(6);
    m.set(undefined, undefined);
    expect(m.get(undefined)).toBe(undefined);
    expect(m.size).toBe(1);

    expect(0 == null).toBe(false);
    expect(null == undefined).toBe(true);
    expect(false == null).toBe(false);
    expect(undefined == undefined).toBe(true);
    expect((undefined as any) < (undefined as any)).toBe(false);
    expect(null == null).toBe(true);
    expect((null as any) < (null as any)).toBe(false);
    expect((undefined as any) < 1).toBe(false);

    expect(false < true).toBe(true);

    expect((false as any) < 1).toBe(true);

    expect((true as any) >= 1).toBe(true);
});

test("JavaScript Behaviour: NaN", () => {
    expect(Number.NaN < 0).toBe(false);
    expect(-0 === 0).toBe(true);
    expect(Number.NaN === Number.NaN).toBe(false);
    expect(Number.NaN == Number.NaN).toBe(false);
    expect(Number.NaN === undefined).toBe(false);
    expect(Number.NaN == undefined).toBe(false);

    let m = new Map();
    m.set(Number.NaN, 7);
    m.set(Number.NaN, 6);
    expect(m.size).toBe(1);
    expect(m.get(Number.NaN)).toBe(6);
    m.set(Number.NaN, Number.NaN);
    expect(m.get(Number.NaN)).toBe(Number.NaN);
    expect(Number.isNaN(m.get(Number.NaN))).toBe(true);
    expect(m.size).toBe(1);
});



