import { freeze, privateConstructor } from "./utils.js";

class ListIterator<V> implements Iterator<V> {
    #list : List<V>
    constructor(list : List<V>) {
        this.#list = list;
        freeze(this);
    }
    next(): IteratorResult<V> {
        if (this.#list.isEmpty) return { done : true, value : undefined };
        else {
            const value = this.#list.head!;
            this.#list = this.#list.tail!;
            return {
                done : false,
                value : value
            }
        }
    }
}
freeze(ListIterator);

/** An immutable list. */
export class List<V> implements Iterable<V> {
    static #internal = false;

    #tail : List<V> | undefined;
    #head : V | undefined;
    #length : number;
    
    private constructor(head : V | undefined, tail : List<V> | undefined) {
        if (!List.#internal) privateConstructor("List");
        this.#tail = tail;
        this.#head = head;
        this.#length = tail === undefined ? 0 : tail.#length + 1;
        freeze(this);
    }

    static empty : List<any> = (() => {
        List.#internal = true;
        const list = new List(undefined, undefined);
        List.#internal = false;
        return list;
    })();

    static is(value : any) : value is List<unknown> {
        if (value instanceof List) return true;
        else return false;
    }

    static from<V>(...values : V[]) : List<V> {
        let l : List<V> = List.empty;
        for (let i = values.length-1; i >= 0; i--) {
            l = l.cons(values[i]);
        }
        return l;
    }

    get isEmpty() : boolean {
        return this.#tail === undefined;
    }

    get head() : V | undefined {
        return this.#head;
    }

    get tail() : List<V> | undefined {
        return this.#tail;
    }

    get length() : number {
        return this.#length;
    }

    cons(head : V) : List<V> {
        List.#internal = true;
        const list = new List(head, this);
        List.#internal = false;
        return list;
    }

    [Symbol.iterator]():Iterator<V> { return new ListIterator(this); }

}
freeze(List);
