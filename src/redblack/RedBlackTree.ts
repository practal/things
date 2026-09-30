import { Compare, Relation, assertNever, freeze, nat } from "../index.js";

/**
 * Persistent ordered tree storage; `null` is the empty tree. Nodes are frozen,
 * but their elements are not deep-frozen. Updates share unaffected subtrees.
 * Search/update operations must use a stable comparator consistent with the
 * tree's ordering. Comparator equality identifies one stored representative;
 * it need not mean that two elements are identical JavaScript values.
 * Comparisons returning `Relation.UNRELATED` cause search/update operations
 * to throw. The tree itself stores neither its comparator nor its size.
 * If `E` includes undefined, an undefined lookup/previous/deleted value alone
 * cannot distinguish a stored undefined from absence; use `isElementOf`.
 */
export type RedBlackTree<E> = Red<E> | Black<E> | null;

/** Frozen red node. Constructing a node does not validate tree invariants. */
export class Red<E> {
    elem : E
    left : RedBlackTree<E>
    right : RedBlackTree<E>
    constructor(elem : E, left : RedBlackTree<E>, right : RedBlackTree<E>) {
        this.elem = elem;
        this.left = left;
        this.right = right;
        freeze(this);
    }
}
freeze(Red);

/** Frozen black node. Constructing a node does not validate tree invariants. */
export class Black<E> {
    elem : E
    left : RedBlackTree<E>
    right : RedBlackTree<E>
    constructor(elem : E, left : RedBlackTree<E>, right : RedBlackTree<E>) {
        this.elem = elem;
        this.left = left;
        this.right = right;
        freeze(this);
    }
}
freeze(Black);

/** Whether the root is a red node; false for the empty tree. */
export function isRed<E>(tree : RedBlackTree<E>) : tree is Red<E> {
    return tree instanceof Red;
}

function isBlack<E>(tree : RedBlackTree<E>) : tree is Black<E> {
    return tree instanceof Black;
}

/** Whether the tree is empty. */
export function isEmpty<E>(tree : RedBlackTree<E>) : tree is null {
    return tree === null;
}

/** Returns the empty tree (`null`). */
export function empty<E>() : RedBlackTree<E> {
    return null;
}

/** Whether the tree contains an element comparing equal to `x`. */
export function isElementOf<E>(order : Compare<E>, x : E, tree : RedBlackTree<E>) : boolean {

    function member(tree : RedBlackTree<E>) : boolean {
        if (isEmpty(tree)) return false;
        const c = order.compare(x, tree.elem);
        switch(c) {
            case Relation.UNRELATED: throw new Error("RedBlackTree: Cannot compare '" + x + "' with '" + tree.elem + "'.");
            case Relation.EQUAL: return true;
            case Relation.LESS: return member(tree.left);
            case Relation.GREATER: return member(tree.right);
            default: assertNever(c);
        }
    }

    return member(tree);
}

/** Returns the stored representative comparing equal to `x`, or undefined. */
export function findEqualElement<E>(order : Compare<E>, x : E, tree : RedBlackTree<E>) : E | undefined {

    function find(tree : RedBlackTree<E>) : E | undefined {
        if (isEmpty(tree)) return undefined;
        const c = order.compare(x, tree.elem);
        switch(c) {
            case Relation.UNRELATED: throw new Error("RedBlackTree: Cannot compare '" + x + "' with '" + tree.elem + "'.");
            case Relation.EQUAL: return tree.elem;
            case Relation.LESS: return find(tree.left);
            case Relation.GREATER: return find(tree.right);
            default: assertNever(c);
        }
    }

    return find(tree);

}

function mkRed<E>(left : RedBlackTree<E>, elem : E, right : RedBlackTree<E>) : RedBlackTree<E> {
    return new Red(elem, left, right);
}

function mkBlack<E>(left : RedBlackTree<E>, elem : E, right : RedBlackTree<E>) : RedBlackTree<E> {
    return new Black(elem, left, right);
}

function forceBlack<E>(tree : RedBlackTree<E>) : RedBlackTree<E> {
    if (isRed(tree)) return mkBlack(tree.left, tree.elem, tree.right);
    else return tree;
}

function splitRed<E>(tree : Red<E>) : [RedBlackTree<E>, E, RedBlackTree<E>] {
    if (!isRed(tree)) throw new Error("splitRed");
    return [tree.left, tree.elem, tree.right];
}

function splitBlack<E>(tree : Black<E>) : [RedBlackTree<E>, E, RedBlackTree<E>] {
    if (!isBlack(tree)) throw new Error("splitBlack");
    return [tree.left, tree.elem, tree.right];
}

function balance<E>(left : RedBlackTree<E>, elem : E, right : RedBlackTree<E>) : RedBlackTree<E> {
    const leftR = isRed(left);
    const rightR = isRed(right);
    let x : E
    let y : E
    let z : E
    let a : RedBlackTree<E> 
    let b : RedBlackTree<E> 
    let c : RedBlackTree<E> 
    let d : RedBlackTree<E> 
    if (leftR && rightR) { // (T R a x b) y (T R c z d) 
        [a, x, b] = splitRed(left);
        y = elem;
        [c, z, d] = splitRed(right);
    } else if (leftR && isRed(left.left)) { // (T R (T R a x b) y c) z d
        [a, x, b] = splitRed(left.left);
        y = left.elem;
        c = left.right;
        z = elem;
        d = right;
    } else if (leftR && isRed(left.right)) { // (T R a x (T R b y c)) z d
        a = left.left;
        x = left.elem;
        [b, y, c] = splitRed(left.right);
        z = elem;
        d = right;
    } else if (rightR && isRed(right.right)) { // a x (T R b y (T R c z d))
        a = left;
        x = elem;
        b = right.left;
        y = right.elem;
        [c, z, d] = splitRed(right.right);
    } else if (rightR && isRed(right.left)) { // a x (T R (T R b y c) z d)
        a = left;
        x = elem;
        [b, y, c] = splitRed(right.left);
        z = right.elem;
        d = right.right;        
    } else {
        return mkBlack(left, elem, right);
    }
    return mkRed(mkBlack(a, x, b), y, mkBlack(c, z, d));
}

/**
 * Inserts `x`, replacing the stored representative if one compares equal.
 * Returns `{ result, previous }`, where `previous` is the old representative
 * or undefined when none existed. The input tree is unchanged. Reinserting an
 * identical value (`Object.is`) may reuse the input tree.
 */
export function insertElement<E>(order : Compare<E>, x : E, tree : RedBlackTree<E>) : { result : RedBlackTree<E>, previous : E | undefined } {
    return insertElementWithPolicy(order, x, tree, true);
}

/**
 * Inserts `x` only if no stored element compares equal. When one exists, returns
 * the original tree and that element as `previous`, without replacing it or
 * allocating tree nodes. Otherwise returns the extended tree and undefined as
 * `previous`. The input tree is unchanged in either case.
 */
export function insertElementIfAbsent<E>(order : Compare<E>, x : E, tree : RedBlackTree<E>) : { result : RedBlackTree<E>, previous : E | undefined } {
    return insertElementWithPolicy(order, x, tree, false);
}

function insertElementWithPolicy<E>(order : Compare<E>, x : E, tree : RedBlackTree<E>, replaceExisting : boolean) : { result : RedBlackTree<E>, previous : E | undefined } {

    let previous : E | undefined = undefined;

    function insert(tree : RedBlackTree<E>) : RedBlackTree<E>  {
        if (isEmpty(tree)) return mkRed(empty(), x, empty()); 
        const c = order.compare(x, tree.elem);
        switch(c) {
            case Relation.UNRELATED: throw new Error("RedBlackTree: Cannot compare '" + x + "' with '" + tree.elem + "'.");
            case Relation.EQUAL: {
                previous = tree.elem;
                if (!replaceExisting || Object.is(x, tree.elem)) return tree;
                if (isRed(tree)) return mkRed(tree.left, x, tree.right);
                // @ts-ignore
                else return mkBlack(tree.left, x, tree.right);
            }
            case Relation.LESS: {
                const left = insert(tree.left);
                if (left === tree.left) return tree;
                if (isRed(tree)) return mkRed(left, tree.elem, tree.right); 
                tree = tree as Black<E>;
                return balance(left, tree.elem, tree.right);
            }
            case Relation.GREATER: {
                const right = insert(tree.right);
                if (right === tree.right) return tree;
                if (isRed(tree)) return mkRed(tree.left, tree.elem, right);
                tree = tree as Black<E>;                
                return balance(tree.left, tree.elem, right);
            }
            default: assertNever(c);
        }
    }

    const result = insert(tree);
    return { result: !replaceExisting && result === tree ? tree : forceBlack(result), previous };
}

/**
 * Removes the stored representative comparing equal to `x`. Returns
 * `{ result, deleted }`, where `deleted` is the removed element or undefined
 * when none existed. The input tree is unchanged; an absent deletion need not
 * reuse it.
 */
export function deleteElement<E>(order : Compare<E>, x : E, tree : RedBlackTree<E>) : { result : RedBlackTree<E>, deleted : E | undefined }
{

    let deleted : E | undefined = undefined;

    function sub1(tree : RedBlackTree<E>) : RedBlackTree<E> {
        if (isBlack(tree)) return mkRed(tree.left, tree.elem, tree.right);
        else throw new Error("RedBlackTree: sub1 invariant failed.");
    }

    function balleft(left : RedBlackTree<E>, elem : E, right : RedBlackTree<E>) : RedBlackTree<E> {
        if (isRed(left)) return mkRed(mkBlack(left.left, left.elem, left.right), elem, right);
        if (isBlack(right)) return balance(left, elem, mkRed(right.left, right.elem, right.right));
        // @ts-ignore right should have type Red<E> | null
        const [T, z, c] = splitRed(right as Red<E>);
        const [a, y, b] = splitBlack(T as Black<E>);
        return mkRed(mkBlack(left, elem, a), y, balance(b, z, sub1(c)));
    }

    function balright(left : RedBlackTree<E>, elem : E, right : RedBlackTree<E>) : RedBlackTree<E> {
        if (isRed(right)) return mkRed(left, elem, mkBlack(right.left, right.elem, right.right));
        if (isBlack(left)) return balance(mkRed(left.left, left.elem, left.right), elem, right);
        // @ts-ignore left should have type Red<E> | null
        const [a, x, T] = splitRed(left as Red<E>);
        const [b, y, c] = splitBlack(T as Black<E>);
        return mkRed(balance(sub1(a), x, b), y, mkBlack(c, elem, right));
    }

    function delformLeft(left : RedBlackTree<E>, elem : E, right : RedBlackTree<E>) : RedBlackTree<E> {
        const l = del(left);
        if (isBlack(left)) return balleft(l, elem, right);
        else return mkRed(l, elem, right);
    }

    function delformRight(left : RedBlackTree<E>, elem : E, right : RedBlackTree<E>) : RedBlackTree<E> {
        const r = del(right);
        if (isBlack(right)) return balright(left, elem, r);
        else return mkRed(left, elem, r);
    }

    function app(left : RedBlackTree<E>, right : RedBlackTree<E>) : RedBlackTree<E>  {
        if (isEmpty(left)) return right;
        if (isEmpty(right)) return left;
        if (isRed(left) && isRed(right)) {
            const [a, x, b] = splitRed(left);
            const [c, y, d] = splitRed(right);
            const bc = app(b, c);
            if (isRed(bc)) {
                const [b, z, c] = splitRed(bc);
                return mkRed(mkRed(a, x, b), z, mkRed(c, y, d));
            } else return mkRed(a, x, mkRed(bc, y, d));
        }
        if (isBlack(left) && isBlack(right)) {
            const [a, x, b] = splitBlack(left);
            const [c, y, d] = splitBlack(right);
            const bc = app(b, c);
            if (isRed(bc)) {
                const [b, z, c] = splitRed(bc);
                return mkRed(mkBlack(a, x, b), z, mkBlack(c, y, d));
            } else return balleft(a, x, mkBlack(bc, y, d));
        }
        if (isRed(right)) {
            const [b, x, c] = splitRed(right);
            return mkRed(app(left, b), x, c);
        }
        if (isRed(left)) {
            const [a, x, b] = splitRed(left);
            return mkRed(a, x, app(b, right));
        }
        throw new Error("RedBlackTree.app: unreachable reached.");
    }

    function del(tree : RedBlackTree<E>) : RedBlackTree<E> {
        if (isEmpty(tree)) return empty();
        const c = order.compare(x, tree.elem);
        switch(c) {
            case Relation.UNRELATED: throw new Error("RedBlackTree: Cannot compare '" + x + "' with '" + tree.elem + "'.");
            case Relation.LESS: return delformLeft(tree.left, tree.elem, tree.right);       
            case Relation.GREATER: return delformRight(tree.left, tree.elem, tree.right);   
            case Relation.EQUAL: {
                deleted = tree.elem;
                return app(tree.left, tree.right);
            }
            default: assertNever(c);  
        }
    }

    return { result: forceBlack(del(tree)), deleted: deleted };
}

/** Iterates stored representatives in ascending order. */
export function* iterateElements<E>(tree : RedBlackTree<E>) : Generator<E, void, void> {
    if (tree !== null) {
        yield* iterateElements(tree.left);
        yield tree.elem;
        yield* iterateElements(tree.right);
    }
}

/** Counts black nodes down the leftmost path, including the empty leaf as one. */
export function blackHeight<E>(tree : RedBlackTree<E>) : nat {
    if (isEmpty(tree)) return 1;
    else if (isRed(tree)) return blackHeight(tree.left);
    else return blackHeight((tree as Black<E>).left) + 1;
}
