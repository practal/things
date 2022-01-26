import {primitives} from "../src/index";



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

test("JavaScript Behaviour: various", () => {
    console.log("typeof primitives = ", typeof primitives);
    expect(typeof primitives).toBe("object");

    function isNumber(x : BigInt) : boolean {
        try {
            return x === BigInt(Number(x));
        } catch {
            return false;
        }
    }

});





