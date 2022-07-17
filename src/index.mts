/**
 * # *things* — Data Structures for modern JavaScript and TypeScript
 * 
 * *This is an experimental package. It is subject to rapid change, experimentation, and bugs.*
 * 
 * ## Installation
 * 
 * To add *things* to your project:
 * ```shell
 * npm install things
 * ```
 * 
 * ## Example
 * 
 * Try out the following code example to get started:
 * ```typescript
 * import {HashMapT, NumberT, NumberDescendingT, NatT} from "things";
 * console.log("things Example");
 * console.log("--------------");
 * const M = HashMapT(NumberT, NumberT);
 * const h = M.from([[1, 7], [3, 2], [3, 1]]);
 * console.log("h = " + M.print(h));
 * console.log("get(h, 3) = " + M.get(h, 3));
 * const g = M.from([[3, 5], [1, 7]]);
 * console.log("g = " + M.print(g));
 * console.log(`compare(h, g) = ${M.compare(h, g)}`);
 * console.log(`compare(g, h) = ${M.compare(g, h)}`);
 * M.put(h, 3, 5);
 * console.log(`put(h, 3, 5): h = ${M.print(h)}`);
 * console.log(`equals(h, g) = ${M.equals(h, g)}`);
 * console.log(`compare(h, g) = ${M.compare(h, g)}`);
 * M.remove(h, 3);
 * console.log(`remove(h, 3): h = ${M.print(h)}`);
 * console.log(`equals(h, g) = ${M.equals(h, g)}`);
 * console.log(`compare(h, g) = ${M.compare(h, g)}`);
 * const N = HashMapT(NatT, NumberDescendingT);
 * h = N.from([[1, 7], [3, 2], [3, 1]]);
 * g = N.from([[3, 5], [1, 7]]);
 * console.log("h = " + N.print(h));
 * console.log("g = " + N.print(g));
 * console.log(`compare(h, g) = ${N.compare(h, g)}`);
 * console.log(`compare(g, h) = ${N.compare(g, h)}`);
 * try {
 *     M.print(h);
 * } catch (error) {
 *     console.log("" + error);
 * }
 * console.log(M.print(M.from(N.entries(h))));
 * ```
 * This will generate the following output:
 * ```text
 * things Example
 * --------------
 * h = [1 ↦ 7, 3 ↦ 1]
 * get(h, 3) = 1
 * g = [3 ↦ 5, 1 ↦ 7]
 * compare(h, g) = -1
 * compare(g, h) = 1
 * put(h, 3, 5): h = [1 ↦ 7, 3 ↦ 5]
 * equals(h, g) = true
 * compare(h, g) = 0
 * remove(h, 3): h = [1 ↦ 7]
 * equals(h, g) = false
 * compare(h, g) = NaN
 * h = [Nat(1) ↦ 7, Nat(3) ↦ 1]
 * g = [Nat(3) ↦ 5, Nat(1) ↦ 7]
 * compare(h, g) = 1
 * compare(g, h) = -1
 * Error: Cannot access sealed content. 
 * [1 ↦ 7, 3 ↦ 1]
 * ```
 * 
 * ## Features
 * * Data structure package specifically designed for both JavaScript and TypeScript, based on [ES modules](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/).
 * * Provides a hardened and tamper-proof API surface through careful design and the excessive use of [Object.freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze).
 * * Supports both mutable and immutable data structures. 
 * * Highly flexible, as all functionality lives outside the type it applies to. For example, you can view numbers either ascendingly ordered as [[NumberT]], or descendingly ordered via [[NumberDescendingT]].
 * 
 * ## Data Structures
 * The list of implemented data structures is short so far, but already useful:
 * * **Associative Arrays**: [[AssocArrayT]]
 * * **Hash Maps**: [[HashMapT]]
 * * Support for JavaScript's built-in data types: [[Anything]], [[NumberT]], [[IntT]], [[NatT]], [[StringT]], [[ArrayT]], [[MapT]].
 * @module
 */ 

export {Thing} from "./thing.mjs";
export {MapThing} from "./map_thing.mjs";
export {Anything} from "./anything.mjs";
export {ArrayT} from "./array.mjs";
export {AssocArray, AssocArrayT} from "./assoc_array.mjs";
export {HashMap, HashMapT} from "./hash_map.mjs";
export {MapT} from "./map.mjs";
export * as utils from "./utils.mjs";
export * as map_utils from "./map_utils.mjs";
export {Sealed, Seal} from "./seal.mjs";
export {testMapThing} from "./test_map_thing.mjs";
export {int, nat, primitive, NumberT, NatT, IntT, StringT} from "./primitives.mjs";
export {NumberDescendingT, ReverseOrderT} from "./reverse_order.mjs";
