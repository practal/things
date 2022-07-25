import {HashMaps, Numbers, NumbersDescending, Nats} from "./index.mjs";
console.log("things Example");
console.log("--------------");
const M = HashMaps(Numbers, Numbers);
let h = M.from([[1, 7], [3, 2], [3, 1]]);
console.log("h = " + M.print(h));
console.log("get(h, 3) = " + M.get(h, 3));
let g = M.from([[3, 5], [1, 7]]);
console.log("g = " + M.print(g));
console.log(`compare(h, g) = ${M.compare(h, g)}`);
console.log(`compare(g, h) = ${M.compare(g, h)}`);
M.put(h, 3, 5);
console.log(`put(h, 3, 5): h = ${M.print(h)}`);
console.log(`equals(h, g) = ${M.equals(h, g)}`);
console.log(`compare(h, g) = ${M.compare(h, g)}`);
M.remove(h, 3);
console.log(`remove(h, 3): h = ${M.print(h)}`);
console.log(`equals(h, g) = ${M.equals(h, g)}`);
console.log(`compare(h, g) = ${M.compare(h, g)}`);
const N = HashMaps(Nats, NumbersDescending);
h = N.from([[1, 7], [3, 2], [3, 1]]);
g = N.from([[3, 5], [1, 7]]);
console.log("h = " + N.print(h));
console.log("g = " + N.print(g));
console.log(`compare(h, g) = ${N.compare(h, g)}`);
console.log(`compare(g, h) = ${N.compare(g, h)}`);
try {
    M.print(h);
} catch (error) {
    console.log("" + error);
}
console.log(M.print(M.from(N.entries(h))));
try {
    N.from([[1.1, 7]]);
} catch (error) {
    console.log("" + error);
}

