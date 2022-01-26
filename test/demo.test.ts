import { HashMap, LESS } from "../src";

test("Demo I", () => {
    const h = HashMap([[1, 7], [3, 2], [3, 1]]);
    console.log(`h = ${h}`);
    console.log(`h.size = ${h.size}`);
    console.log(`h.get(3) = ${h.get(3)}`);
    const g = HashMap([[1, 7], [3, 5]]);
    console.log(`g = ${g}`);
    console.log(`(h.compareTo(g) == LESS) = ${h.compareTo(g) == LESS}`);
    h.put(3, 5);
    console.log(`h = ${h}`);
    console.log(`h.isEqualTo(g) = ${h.isEqualTo(g)}`);
});

test("Demo II", () => {
    const h = HashMap([[1, 7], [3, 2]]);
    const g = new Map([[1, 7], [3, 2]]); 
    console.log(h.isEqualTo(g));
});