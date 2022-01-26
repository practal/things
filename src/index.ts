/**
 * # *things* — Data Structures for TypeScript
 * 
 * *This is an experimental package. It is subject to rapid change, experimentation, and bugs.*
 * 
 * ## Installation
 * 
 * To add *things* to your project:
 * ```shell
 * npm install --save things
 * ```
 * 
 * ## Example
 * 
 * Try out the following code example to get started:
 * ```typescript
 * import { HashMap, LESS } from "things";
 * 
 * const h = HashMap([[1, 7], [3, 2], [3, 1]]);
 * console.log(`h = ${h}`);
 * console.log(`h.size = ${h.size}`);
 * console.log(`h.get(3) = ${h.get(3)}`);
 * const g = HashMap([[1, 7], [3, 5]]);
 * console.log(`g = ${g}`);
 * console.log(`(h.compareTo(g) == LESS) = ${h.compareTo(g) == LESS}`);
 * h.put(3, 5);
 * console.log(`h = ${h}`);
 * console.log(`h.isEqualTo(g) = ${h.isEqualTo(g)}`);
 * ```
 * This will generate the following output
 * ```text
 * h = HashMap(1 -> 7, 3 -> 1)
 * h.size = 2
 * h.get(3) = 1
 * g = HashMap(1 -> 7, 3 -> 5)
 * (h.compareTo(g) == LESS) = true
 * h = HashMap(1 -> 7, 3 -> 5)
 * h.isEqualTo(g) = true
 * ```
 * 
 * ## Features
 * * Data structure package specifically designed for TypeScript.
 * * Provides a robust, tamper-proof API surface with the help of excessive use of `Object.freeze`.
 * * Supports mutable and immutable data structures equally well. 
 * * Specifies [[Something | basic functionality]] that any data structure should support, e.g. cloning with [[CopyOnWrite | copy-on-write]] semantics.
 * * All implemented data structures derive from [[Thing]]. Mutable data structures derive from [[MutableThing]]. 
 * * Plays nicely with TypeScript's built-in data structures like [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map):
 *   ```typescript
 *   const h = HashMap([[1, 7], [3, 2]]);
 *   const g = new Map([[1, 7], [3, 2]]); 
 *   console.log(h.isEqualTo(g)); // outputs "true"
 *   ```
 * * Highly flexible as objects and primitive types don't need to extend [[Thing]] to work with *things*. 
 *   Instead, the required functionality can be made available and adapted to the context via [[Things]].
 * * [[Anything]] is the default implementation of [[Things]]. [[SameValueZero]] can be used to emulate the equality used by JavaScript's built-in data structures.
 * 
 * ## Data Structures
 * The list of implemented data structures is short, as the main focus has been on the conceptual design of the package. More data structures will follow.
 * So far, the following data structures are available:
 * * **Hash Maps**: [[HashMap]], [[HashMapFor]]
 * * **Associative Arrays**: [[AssocArray]], [[AssocArrayFor]]
 * * **Numbers**: [[Num]], [[MutableNum]], [[Int]], [[MutableInt]], [[Nat]], [[MutableNat]]
 * @module
 */ 

export * from "./interfaces/equatable";
export * from "./interfaces/hashable";
export * from "./interfaces/map";
export * from "./interfaces/comparable";
export * from "./interfaces/cloneable";
export * from "./interfaces/things";
export * from "./interfaces/primitives"

export * as utils from "./implementations/utils"
export * from "./implementations/primitives"
export * from "./implementations/thing"
export * from "./implementations/numberthing"
export * from "./implementations/anything"
export * from "./implementations/canonical"
export * from "./implementations/map"
export * from "./implementations/copyonwrite"
export * from "./implementations/assoc_array"
export * from "./implementations/hashmap"