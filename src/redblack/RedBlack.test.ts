import { Compare, Relation, Test, assertCrashT, assertFalseT, assertIsDefinedT, assertT, nat } from "../index.js";
import * as RB from "./RedBlackTree.js";
import {RedBlackSet} from "./RedBlackSet.js";
import { RedBlackMap } from "./RedBlackMap.js";

function assertRB<E>(tree : RB.RedBlackTree<E>) {

    function height(tree : RB.RedBlackTree<E>) : nat {
        if (RB.isEmpty(tree)) return 1;
        const lh = height(tree.left);
        const rh = height(tree.right);
        assertT(lh === rh);
        if (RB.isRed(tree)) {
            assertFalseT(RB.isRed(tree.left));
            assertFalseT(RB.isRed(tree.right));
            return lh;
        } else {
            return lh + 1;
        }
    }

    assertFalseT(RB.isRed(tree));
    height(tree);
}

function assertEqualSetTree(A : Set<nat>, B : RB.RedBlackTree<nat>) {
    const sorted = [...RB.iterateElements(B)];
    assertT(A.size === sorted.length);
    let last = -1;
    for (const e of sorted) {
        assertT(last < e);
        last = e;
        assertT(A.has(e));    
    }
    for (const e of A) {
        assertT(RB.isElementOf(nat, e, B));
    }
    assertRB(B);
}

function insertAndDeleteTree(N : nat, MAX : nat) {
    let numbers : number[] = [];
    let t = RB.empty<nat>();
    for (let i = 0; i < N; i++) {
        const x = Math.round(Math.random() * MAX);
        numbers.push(x);
        t = RB.insertElement(nat, x, t).result;
    }
    let s = t;
    let deleted = new Set(numbers);
    assertEqualSetTree(deleted, s);
    for (let i = 0; i < numbers.length; i++) {
        const pos = Math.round(Math.random() * (numbers.length - 1));
        const x = numbers[pos];
        deleted.delete(x);
        s = RB.deleteElement(nat, x, s).result;
    }
    assertEqualSetTree(deleted, s);
}

Test(() => {
    insertAndDeleteTree(10000, 100000);
    insertAndDeleteTree(20000, 10000);
}, "RedBlackTree Insert/Delete");

function assertEqualSets(A : Set<nat>, B : RedBlackSet<nat>) {
    //console.log("number of elements: " + A.size);
    assertT(A.size === B.size);
    let last = -1;
    for (const e of B) {
        assertT(last < e);
        last = e;
        assertT(A.has(e));    
    }
    for (const e of A) {
        assertT(B.has(e));
    }
}

function insertAndDeleteSet(N : nat, MAX : nat) {
    let numbers : number[] = [];
    let t = RedBlackSet(nat);
    for (let i = 0; i < N; i++) {
        const x = Math.round(Math.random() * MAX);
        numbers.push(x);
        t = t.insert(x);
    }
    let s = t;
    let deleted = new Set(numbers);
    assertEqualSets(deleted, s);
    for (let i = 0; i < numbers.length; i++) {
        const pos = Math.round(Math.random() * (numbers.length - 1));
        const x = numbers[pos];
        deleted.delete(x);
        s = s.delete(x);
    }
    assertEqualSets(deleted, s);
}

Test(() => {
    insertAndDeleteSet(10000, 100000);
    insertAndDeleteSet(20000, 10000);
}, "RedBlackSet Insert/Delete");

function assertEqualMaps(A : Map<nat, string>, B : RedBlackMap<nat, string>) {
    //console.log("number of elements: " + A.size);
    assertT(A.size === B.size);
    let last = -1;
    for (const [k, v] of B) {
        assertT(last < k);
        last = k;
        assertT(A.has(k));
        assertT(A.get(k) === B.get(k));    
    }
    for (const [k, v] of A) {
        assertT(B.has(k));
        assertT(B.get(k) === A.get(k));
    }
}

function insertAndDeleteMap(N : nat, MAX : nat) {
    let numbers : number[] = [];
    let t = RedBlackMap<nat, string>(nat);
    for (let i = 0; i < N; i++) {
        const x = Math.round(Math.random() * MAX);
        numbers.push(x);
        t = t.set(x, "" + x);
    }
    let s = t;
    let deleted = new Map(numbers.map(k => [k, "" + k]));
    assertEqualMaps(deleted, s);
    for (let i = 0; i < numbers.length; i++) {
        const pos = Math.round(Math.random() * (numbers.length - 1));
        const x = numbers[pos];
        deleted.delete(x);
        s = s.delete(x);
    }
    assertEqualMaps(deleted, s);
}

Test(() => {
    insertAndDeleteMap(10000, 100000);
    insertAndDeleteMap(20000, 10000);
}, "RedBlackMap Insert/Delete");

type Entry = { key: nat, value: string };

const entryOrder : Compare<Entry> = {
    compare: (a, b) => nat.compare(a.key, b.key)
};

function entry(key : nat, value : string) : Entry {
    return Object.freeze({ key, value });
}

Test(() => {
    const old = entry(2, "old");
    const replacement = entry(2, "replacement");
    const root = new RB.Black(old,
        new RB.Black(entry(1, "left"), null, null),
        new RB.Black(entry(3, "right"), null, null));

    for (const stored of RB.iterateElements(root)) {
        const skipped = RB.insertElementIfAbsent(entryOrder, entry(stored.key, "ignored"), root);
        assertT(skipped.previous === stored);
        assertT(skipped.result === root);
        assertT(RB.insertElement(entryOrder, stored, root).result === root);
    }

    const replaced = RB.insertElement(entryOrder, replacement, root);
    assertT(replaced.previous === old);
    assertIsDefinedT(replaced.result);
    assertT(replaced.result.elem === replacement);
    assertT(replaced.result.left === root.left);
    assertT(replaced.result.right === root.right);
    assertT(RB.findEqualElement(entryOrder, replacement, root) === old);
    assertRB(replaced.result);

    const added = entry(0, "new");
    const extended = RB.insertElementIfAbsent(entryOrder, added, root);
    assertT(extended.previous === undefined);
    assertIsDefinedT(extended.result);
    assertT(extended.result.right === root.right);
    assertT(RB.findEqualElement(entryOrder, added, extended.result) === added);
    assertFalseT(RB.isElementOf(entryOrder, added, root));
    assertRB(extended.result);
    assertRB(root);
}, "RedBlackTree insertion policies preserve representatives, snapshots, and shared subtrees");

Test(() => {
    let tree = RB.empty<nat>();
    const expected = new Set<nat>();
    for (let i = 0; i < 600; i++) {
        const x = (i * 37) % 257;
        const before = tree;
        const alreadyPresent = expected.has(x);
        const inserted = i % 2 === 0
            ? RB.insertElementIfAbsent(nat, x, tree)
            : RB.insertElement(nat, x, tree);
        assertT(inserted.previous === (alreadyPresent ? x : undefined));
        if (alreadyPresent) assertT(inserted.result === before);
        assertEqualSetTree(expected, before);
        tree = inserted.result;
        expected.add(x);
        assertEqualSetTree(expected, tree);
    }
    for (let i = 0; i < 257; i++) {
        const x = (i * 53) % 257;
        const removed = RB.deleteElement(nat, x, tree);
        assertT(removed.deleted === x);
        expected.delete(x);
        tree = removed.result;
        assertEqualSetTree(expected, tree);
    }
    const absent = RB.deleteElement(nat, 42, tree);
    assertT(absent.deleted === undefined);
    assertT(absent.result === null);
}, "RedBlackTree both insertion policies preserve ordering and balance through deletion");

Test(() => {
    const first = entry(1, "first");
    const second = entry(1, "second");
    const third = entry(1, "third");
    const set = RedBlackSet(entryOrder, [first, second]);
    assertT(set.size === 1);
    assertT(set.findEqual(first) === second);
    assertT(set.insert(first, third).findEqual(first) === third);
    assertT(set.insertMultiple([third, first]).findEqual(first) === first);
    assertT(set.findEqual(first) === second);
    assertT(set.insert(second) === set);
    assertT(set.insert() === set);
    assertT(set.insertMultiple([]) === set);
}, "RedBlackSet existing insertion and construction retain last-representative-wins semantics");

Test(() => {
    const old = entry(2, "old");
    const set = RedBlackSet(entryOrder, [old]);
    const first = entry(1, "first");
    const duplicate = entry(1, "ignored");
    const third = entry(3, "third");
    const extended = set.insertIfAbsent(entry(2, "ignored"), first, duplicate, third);
    assertT(extended.size === 3);
    assertT(extended.findEqual(old) === old);
    assertT(extended.findEqual(duplicate) === first);
    assertT(extended.findEqual(third) === third);
    assertT(set.size === 1);
    assertFalseT(set.has(first));
    assertT(extended.insertIfAbsent(duplicate, entry(2, "ignored")) === extended);
    assertT(extended.insertIfAbsent() === extended);
    assertT(extended.insertMultipleIfAbsent([]) === extended);

    function* additions() {
        yield duplicate;
        yield first;
        yield old;
        yield entry(2, "ignored");
    }
    const fromIterable = RedBlackSet(entryOrder).insertMultipleIfAbsent(additions());
    assertT(fromIterable.size === 2);
    assertT(fromIterable.findEqual(first) === duplicate);
    assertT(fromIterable.findEqual(old) === old);
    assertT(fromIterable.insertMultipleIfAbsent(additions()) === fromIterable);
    assertRB(extended.tree);
    assertRB(fromIterable.tree);
}, "RedBlackSet insert-if-absent keeps existing or first representatives and reuses unchanged sets");

Test(() => {
    const order : Compare<number> = { compare: () => Relation.EQUAL };
    const negative = RedBlackSet(order, [-0]);
    const positive = negative.insert(0);
    assertT(Object.is(negative.findEqual(0), -0));
    assertT(Object.is(positive.findEqual(0), 0));
    assertT(negative.insertIfAbsent(0) === negative);
    assertT(positive.insert(-0) !== positive);
    assertT(Object.is(positive.union(negative).findEqual(0), -0));
}, "RedBlackSet identical-value optimization preserves observable signed-zero replacements");

Test(() => {
    const otherOrder : Compare<Entry> = { compare: entryOrder.compare };
    const left = entry(1, "left");
    const right = entry(1, "right");
    const large = RedBlackSet(entryOrder, [left, entry(2, "extra")]);
    const small = RedBlackSet(otherOrder, [right]);
    for (const united of [large.union(small), small.union(large)]) {
        assertT(united.size === 2);
        assertT(united.findEqual(left) === right);
        assertT(united.order === entryOrder);
    }
    const tied = RedBlackSet(entryOrder, [left]);
    assertT(tied.union(small).findEqual(left) === right);
    assertT(small.union(tied).findEqual(right) === left);
    assertT(tied.union(small).order === entryOrder);
    assertT(small.union(tied).order === otherOrder);
    assertT(large.findEqual(left) === left);

    for (const common of [large.intersection(small), small.intersection(large)]) {
        assertT(common.size === 1);
        assertT(common.findEqual(left) === right);
        assertT(common.order === otherOrder);
    }
    assertT(tied.intersection(small).findEqual(left) === left);
    assertT(small.intersection(tied).findEqual(left) === right);
    assertT(large.difference(small).size === 1);
    assertFalseT(large.difference(small).has(left));

    const empty = RedBlackSet(otherOrder);
    assertT(large.union(large) === large);
    assertT(large.union(empty) === large);
    assertT(empty.union(large) === large);
    const sameRepresentatives = RedBlackSet(otherOrder, [left]);
    assertT(large.union(sameRepresentatives) === large);
    assertT(sameRepresentatives.union(large) === large);
    const otherEmpty = RedBlackSet(entryOrder);
    assertT(empty.union(otherEmpty).order === otherOrder);
}, "RedBlackSet union and intersection preserve historical representative and comparator selection");

Test(() => {
    const oldKey = entry(1, "old key");
    const newKey = entry(1, "new key");
    const old = RedBlackMap<Entry, string>(entryOrder, [[oldKey, "first"], [newKey, "second"]]);
    assertT(old.size === 1);
    assertT(old.get(oldKey) === "second");
    assertT([...old][0][0] === newKey);

    const updated = old.set(oldKey, "third");
    assertT(updated.size === 1);
    assertT(updated.get(newKey) === "third");
    assertT([...updated][0][0] === oldKey);
    assertT(old.get(oldKey) === "second");
    assertT([...old][0][0] === newKey);
    const sameValue = updated.set(newKey, "third");
    assertT([...sameValue][0][0] === newKey);
    const multiple = old.setMultiple([[newKey, "fourth"], [oldKey, "fifth"]]);
    assertT(multiple.get(newKey) === "fifth");
    assertT([...multiple][0][0] === oldKey);
}, "RedBlackMap set still replaces both key representative and value, with last entry winning");

Test(() => {
    const oldKey = entry(1, "old key");
    const equalKey = entry(1, "equal key");
    const map = RedBlackMap<Entry, string | undefined>(entryOrder, [[oldKey, undefined]]);
    assertT(map.has(equalKey));
    assertT(map.get(equalKey) === undefined);
    assertT(map.setIfAbsent(equalKey, "ignored") === map);
    assertT([...map][0][0] === oldKey);
    const firstKey = entry(2, "first key");
    const laterKey = entry(2, "later key");
    const extended = map.setIfAbsent(firstKey, "first value");
    assertT(extended.size === 2);
    assertT(extended.get(laterKey) === "first value");
    assertT(extended.setIfAbsent(laterKey, "ignored") === extended);
    assertFalseT(map.has(firstKey));

    function* additions() : Generator<[Entry, string | undefined]> {
        yield [equalKey, "ignored"];
        yield [firstKey, "first value"];
        yield [laterKey, "ignored"];
    }
    const fromIterable = map.setMultipleIfAbsent(additions());
    assertT(fromIterable.size === 2);
    assertT(fromIterable.get(equalKey) === undefined);
    assertT(fromIterable.get(laterKey) === "first value");
    assertT([...fromIterable][0][0] === oldKey);
    assertT([...fromIterable][1][0] === firstKey);
    assertT(fromIterable.setMultipleIfAbsent(additions()) === fromIterable);
    assertT(map.setMultipleIfAbsent([]) === map);
}, "RedBlackMap set-if-absent preserves stored keys, first values, and present undefined values");

Test(() => {
    const unrelated : Compare<nat> = { compare: () => Relation.UNRELATED };
    const tree = RB.insertElement(unrelated, 1, RB.empty()).result;
    assertCrashT(() => RB.insertElementIfAbsent(unrelated, 2, tree));
    const set = RedBlackSet(unrelated, [1]);
    assertCrashT(() => set.insertIfAbsent(2));
    assertCrashT(() => set.insertMultipleIfAbsent([2]));
    const map = RedBlackMap(unrelated).set(1, "first");
    assertCrashT(() => map.setIfAbsent(2, "second"));
    assertCrashT(() => map.setMultipleIfAbsent([[2, "second"]]));
}, "RedBlack insert-if-absent operations reject unrelated comparisons");
