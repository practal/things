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
    let N = 100000;
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
    let N = 1000000;
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
    let N = 1000000;
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
    let N = 1000000;
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
    let N = 1000000;
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
    let x = 7;
    expect(() => n.equals(m)).toThrow();
    expect(() => m.equals(n as any)).toThrow();
    expect(() => m.equals(x as any)).toThrow();
    expect(n.equals(new Nat(7))).toBe(true);
    expect(n.equals(new Nat(8))).toBe(false);
    expect(() => (x as any).equals(n)).toThrow();
});