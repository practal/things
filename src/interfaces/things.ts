import { Cloneable, Cloning } from "./cloneable";
import { Comparable, PartialOrder } from "./comparable";
import { Equatable } from "./equatable";
import { Hash, Hashable } from "./hashable";

/** 
 * The Something interface collects the minimum requirements that a thing should fulfill:
 * * It should be [[Comparable | comparable]] to other things. In particular, one should be able to tell whether it is [[Equatable | equal]] to another thing or not.
 * * It should be possible to form its [[Hashable | hash]].
 * * It should be possible to [[Cloneable | copy]] it.
 * * It should have a [[Something.toString | human-readable description]].
 */
export interface Something extends Equatable, Cloneable, Comparable, Hashable {

    /** Returns a human-readable description of this thing. */
    toString() : string

} 

/** 
 * The Things interface implements for type T the functionality of [[Something]] without T actually needing to extend Something.
 * It also allows to let type T which might already be Something, to be a different Something. 
 */
export interface Things<T> extends Hash<T>, PartialOrder<T>, Cloning<T> {}