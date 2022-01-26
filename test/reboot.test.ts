import { Int, MutableInt, Num } from "../src/implementations/numberthing";
import { AssocArray, AssocArrayFor } from "../src/implementations/assoc_array";
import { HashMap, HashMapFor } from "../src/implementations/hashmap";
import { int, nat } from "../src/interfaces/primitives";
import { LESS, UNRELATED } from "../src/interfaces/comparable";
import { MutableMap } from "../src/interfaces/map";
import { numbers } from "../src/implementations/primitives";
import { Anything } from "../src/implementations/anything";

function randomNat(max : nat = Number.MAX_SAFE_INTEGER) : number {
    return Math.round(Math.random() * max);
}

function coinflip() : boolean {
    return Math.random() >= 0.5;
}

test("JavaScript Behaviour: reboot", () => {
    let a : number = 2;
    let b : Number = new Number(2);
    let c : number = 3;
    let d : BigInt = BigInt(2);
    let e : bigint = BigInt(2).valueOf();
    console.log("a", typeof a, "b", typeof b, "c", typeof c, "d", typeof d);
    let n = new Num(2);
    console.log("n.equals(a)", n.equals(a));
    console.log("n.equals(b)", n.equals(b));
    console.log("n.equals(c)", n.equals(c));
    console.log("n.equals(d)", n.equals(d));
    console.log("n.equals(e)", n.equals(e));
    expect((1 as any) == "1").toBe(true);
    expect((false as any) < "5").toBe(true);

    let M = new Map();
 
    expect(M instanceof Map).toBe(true);
});

test("JavaScript Behaviour: bigint", () => {
    let i = BigInt(Number.MAX_SAFE_INTEGER);
    i = i * i;
    let x : number = 2;
    let X : Number = new Number(2);
    expect(x < i).toBe(true);
    expect(x == X).toBe(true);
    expect(typeof(x as any) === "number").toBe(true);
    expect(typeof(X) === "object").toBe(true);
    let b : bigint = BigInt(2);
    let B = Object(BigInt(2));
    let c : bigint = BigInt(3);
    let C = Object(BigInt(3));
    expect(typeof(b)).toBe("bigint");    
    expect(typeof(B)).toBe("object");   
    expect(b == B).toBe(true); 
    expect(b === B).toBe(false); 
    expect((x as any) == b).toBe(true);
    expect((x as any) === b).toBe(false);
    expect((x as any) == B).toBe(true);
    expect((x as any) === B).toBe(false);
    expect(b < C).toBe(true);
    expect(B < C).toBe(true);
    expect(B < c).toBe(true);
    expect(b < c).toBe(true);
    expect(x < c).toBe(true);
    expect(x < C).toBe(true);
    expect(B instanceof BigInt).toBe(true);
});

function testMutableMap(arr : MutableMap<int, int>) {
    arr.assign([[1, 7], [3, 2], [3, 1]]);
    console.log(`testMutableMap: ${arr}`);
    expect(arr.size).toBe(2);
    expect(arr.get(1)).toBe(7);
    expect(arr.get(3)).toBe(1);
    expect(arr.get(2)).toBeUndefined();
    let brr = arr.clone();
    expect(brr.size).toBe(2);
    expect(brr.get(1)).toBe(7);
    expect(brr.get(3)).toBe(1);
    expect(brr.get(2)).toBeUndefined();
    expect(arr.delete(2)).toBe(false);
    expect(arr.delete(1)).toBe(true);
    console.log(`arr = ${arr}, brr = ${brr}`);
    expect(arr.size).toBe(1);
    expect(brr.size).toBe(2);
    expect(arr.isEqualTo(brr)).toBe(false);
    arr.put(1, 7);
    expect(arr.isEqualTo(brr)).toBe(true);
    brr.put(1, 8);
    console.log(`arr = ${arr}, brr = ${brr}`);
    expect(arr.compareTo(brr)).toBe(LESS);
    arr.put(3, 2);
    console.log(`arr = ${arr}, brr = ${brr}`);
    expect(arr.compareTo(brr)).toBe(UNRELATED);
}

test("AssocArray", () => {
    testMutableMap(AssocArray());
});

test("HashMap", () => {
    testMutableMap(HashMap());
});

test("AssocArray", () => {
    let a : Map<int, string | null> = AssocArrayFor(numbers, Anything);
    a.set(1, "one");
    a.set(2, null);
    expect(a.get(1)).toBe("one");
    expect(a.get(2)).toBe(null);
    expect(a.get(3)).toBe(undefined);
    console.log(`${a}`);
});


test("HashMap<number, number>", () => {
    let a : Map<number, number> = HashMapFor(numbers, numbers);
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

test("SpeedDemon native Map: number", () => {
    let a : Map<number, number> = new Map();
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


test("SpeedDemon number", () => {
    let a : Map<number, number> = HashMapFor(numbers, numbers);
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
   