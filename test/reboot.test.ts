import { Num } from "../src/implementations/numberthing";

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
});

/*test("SpeedDemon number", () => {
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
});*/
   