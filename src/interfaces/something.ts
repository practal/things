import { Cloneable } from "./cloneable";
import { Comparable } from "./comparable";
import { Equatable } from "./equatable";
import { Hashable } from "./hashable";

export interface Something extends Equatable, Cloneable, Comparable, Hashable {} 