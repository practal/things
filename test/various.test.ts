import {int, numbers, AssocArrayFor,  nat, HashMapFor, MutableMap} from "../src/index";

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

test("SpeedDemon", () => {
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