import { Cloneable, Cloning } from "./cloneable";
import { Comparable, PartialOrder } from "./comparable";
import { Equatable } from "./equatable";
import { Hash, Hashable } from "./hashable";

export interface Something extends Equatable, Cloneable, Comparable, Hashable {} 

export interface Things<T> extends Hash<T>, PartialOrder<T>, Cloning<T> {}