import { Equatable, Equatables } from "./equatable";
import { int } from "./primitives";

export interface Hashable extends Equatable {

    get hash() : int

}

export interface Hashables<T> extends Equatables<T> {

    hash(t : T) : int

}

export function defaultHashables<T extends Hashable>() : Hashables<T> {
    return new class {
        equals(lhs : T, rhs : T) : boolean {
            return lhs.equals(rhs);
        }        
        hash(t : T) : int {
            return t.hash;
        }
    };
}

export function combineHashCodes(codes : Iterable<int>) : int {
    var sum = 1;
    for (let code of codes) {
        sum = 31 * sum + code;
        sum = sum & sum;
    }
    return sum;
}




