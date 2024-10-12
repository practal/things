import { nat } from "./primitives.js";

export function insertBetween<T>(array : T[], element : T) : T[] {
    return array.flatMap((item, index) => 
      index === 0 ? [item] : [element, item]
    );
}

export function insert<E>(arr : E[], at : nat, elems : E[]) : E[] {
    return [
        ...arr.slice(0, at),
        ...elems,
        ...arr.slice(at)
    ];
} 

export function splice<E>(arr : E[], at : nat, deleteCount : nat, elems : E[]) : E[] {
    return [
        ...arr.slice(0, at),
        ...elems,
        ...arr.slice(at + deleteCount)
    ];
}

export function last<E>(arr : E[]) : E {
    return arr[arr.length - 1];
}