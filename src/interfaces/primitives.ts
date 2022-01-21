/** The union of all [primitive types](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) of JavaScript. */
export type primitive = number | string | boolean | symbol | bigint | null | undefined 

/** 
 * The type of integers. 
 * 
 * Use of int is just for documentation purposes: 
 * As it is just an alias for number, the difference to number is not enforced by the type or runtime system. 
 */
export type int = number 

/** 
 * The type of natural numbers starting from 0. 
 * 
 * Use of int is just for documentation purposes: 
 * As it is just an alias for number, the difference to number is not enforced by the type or runtime system. 
 */
export type nat = number

