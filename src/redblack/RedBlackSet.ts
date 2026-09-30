import { Defined, Compare, freeze, nat } from "../index.js"
import { RedBlackTree, deleteElement, empty, findEqualElement,
    insertElement, insertElementIfAbsent, isElementOf, iterateElements } from "./RedBlackTree.js"

/**
 * Persistent ordered set with one stored representative per comparator equality
 * class. Iteration visits those representatives in ascending order. Operations
 * leave their inputs unchanged and may reuse existing collections/subtrees.
 * The wrapper and tree nodes are frozen; elements and the comparator are not
 * deep-frozen and must remain consistent with the ordering.
 * `insert` replaces an equal representative; `insertIfAbsent` preserves it.
 */
export interface RedBlackSet<E extends Defined> extends Iterable<E> {

    /** Stable comparator used for ordering and membership equality. */
    order : Compare<E>

    /** Underlying immutable tree; callers must not mutate stored elements. */
    tree : RedBlackTree<E>    

    /** Number of distinct comparator equality classes. */
    size : nat

    /** Whether a stored element compares equal to `elem`. */
    has(elem : E) : boolean 

    /** Returns the stored representative comparing equal to `elem`, or undefined. */
    findEqual(elem : E) : E | undefined 

    /**
     * Inserts or replaces elements from left to right. The last supplied
     * representative of each equality class wins, including over an existing
     * representative. Identical replacements may reuse this set.
     */
    insert(...elems : E[]) : RedBlackSet<E> 

    /** Like `insert`, processing elements in iteration order. */
    insertMultiple(elems : Iterable<E>) : RedBlackSet<E> 

    /**
     * Inserts only absent equality classes, from left to right. Existing
     * representatives win; otherwise the first supplied representative wins.
     * Returns this set if nothing is added.
     */
    insertIfAbsent(...elems : E[]) : RedBlackSet<E>

    /** Like `insertIfAbsent`, processing elements in iteration order. */
    insertMultipleIfAbsent(elems : Iterable<E>) : RedBlackSet<E>

    /** Removes elements comparing equal to the supplied elements. */
    delete(...elems : E[]) : RedBlackSet<E>

    /** Like `delete`, processing elements in iteration order. */
    deleteMultiple(elems : Iterable<E>) : RedBlackSet<E>

    /**
     * Unites two sets whose comparators must define the same ordering/equality.
     * Inserts the smaller set into the larger, keeping representatives from
     * the smaller set on collisions. On a size tie, `other` wins collisions.
     * Uses the larger set's comparator, or this set's comparator on a tie.
     */
    union(other : RedBlackSet<E>) : RedBlackSet<E>

    /**
     * Removes this set's representatives whose equality classes occur in
     * `other`. Both comparators must define the same ordering/equality.
     */
    difference(other : RedBlackSet<E>) : RedBlackSet<E> 

    /**
     * Keeps common equality classes. Uses representatives and the comparator
     * from the smaller set, or this set on a size tie. Both comparators must
     * define the same ordering/equality.
     */
    intersection(other : RedBlackSet<E>) : RedBlackSet<E> 

    /** Keeps representatives accepted by `predicate`, tested in ascending order. */
    filter(predicate : (elem : E) => boolean) : RedBlackSet<E>

}

class RedBlackSetImpl<E extends Defined> implements RedBlackSet<E> {

    order : Compare<E>
    tree : RedBlackTree<E>
    size : number

    constructor(order : Compare<E>, tree : RedBlackTree<E>, size : number) {
        this.order = order;
        this.tree = tree;
        this.size = size;
        freeze(this);
    }

    [Symbol.iterator]() {
        return iterateElements(this.tree);
    }

    has(elem : E) : boolean {
        return isElementOf(this.order, elem, this.tree); 
    }

    findEqual(elem : E) : E | undefined {
        return findEqualElement(this.order, elem, this.tree);
    }

    insert(...elems : E[]) : RedBlackSetImpl<E> {
        return this.insertMultiple(elems);
    }

    insertMultiple(elems : Iterable<E>) : RedBlackSetImpl<E> {
        let tree = this.tree;
        const order = this.order;
        let size = this.size;
        for (const elem of elems) {
            const t = insertElement(order, elem, tree);
            tree = t.result;
            if (t.previous === undefined) size += 1;
        }
        return tree === this.tree ? this : new RedBlackSetImpl(order, tree, size);
    }

    insertIfAbsent(...elems : E[]) : RedBlackSetImpl<E> {
        return this.insertMultipleIfAbsent(elems);
    }

    insertMultipleIfAbsent(elems : Iterable<E>) : RedBlackSetImpl<E> {
        let tree = this.tree;
        const order = this.order;
        let size = this.size;
        for (const elem of elems) {
            const t = insertElementIfAbsent(order, elem, tree);
            tree = t.result;
            if (t.previous === undefined) size += 1;
        }
        return tree === this.tree ? this : new RedBlackSetImpl(order, tree, size);
    }

    delete(...elems : E[]) : RedBlackSetImpl<E> {
        return this.deleteMultiple(elems);
    }

    deleteMultiple(elems : Iterable<E>) : RedBlackSetImpl<E> {
        let tree = this.tree;
        const order = this.order;
        let size = this.size;
        for (const elem of elems) {
            const t = deleteElement(order, elem, tree);
            tree = t.result;
            if (t.deleted !== undefined) size -= 1;
        }
        return new RedBlackSetImpl(order, tree, size);
    }

    union(other : RedBlackSet<E>) : RedBlackSet<E> {
        if (this === other || other.size === 0) return this;
        if (this.size === 0) return other;
        if (this.size >= other.size) return this.insertMultiple(other);
        else return other.insertMultiple(this);
    }

    difference(other : RedBlackSet<E>) : RedBlackSet<E> {
        return this.deleteMultiple(other);
    }

    filter(predicate : (elem : E) => boolean) : RedBlackSet<E> {
        const elements : E[] = [];
        for (const elem of this) {
            if (predicate(elem)) elements.push(elem);
        }
        return RedBlackSet(this.order, elements); 
    }

    intersection(other : RedBlackSet<E>) : RedBlackSet<E> {
        if (this.size <= other.size) return this.filter(e => other.has(e));
        else return other.filter(e => this.has(e));
    }

}
freeze(RedBlackSetImpl);

/**
 * Creates a persistent ordered set. Initial elements are inserted in iteration
 * order using insert-or-replace: the last comparator-equal representative wins.
 * The comparator must define a stable total ordering of the stored elements;
 * a comparison returning `Relation.UNRELATED` throws when encountered.
 */
export function RedBlackSet<E extends Defined>(order : Compare<E>, elems? : Iterable<E>) : RedBlackSet<E> {
    const rb = new RedBlackSetImpl(order, empty(), 0);
    if (elems === undefined) return rb;
    else return rb.insertMultiple(elems);
}
freeze(RedBlackSet);
