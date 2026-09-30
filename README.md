# things

Data structures and utilities for TypeScript.

## Persistent red-black collections

`RedBlackTree` provides the immutable tree nodes and balancing operations.
`RedBlackSet` adds a comparator, a stored size, and collection methods.
`RedBlackMap` uses a set of key/value pairs compared only by key.
Updates preserve the original collection and share unaffected tree structure.
Stored elements, keys, values, and entry pairs are not deep-frozen; callers must
not mutate stored entries or invalidate the ordering. Iteration is in ascending
element/key order.

Comparator equality determines membership. Distinct JavaScript objects may
compare equal, so the choice of stored representative is observable through
iteration, `findEqual`, and map entries.

| Collection | Insert or replace | Insert only if absent |
| --- | --- | --- |
| Tree | `insertElement(order, x, tree)` | `insertElementIfAbsent(order, x, tree)` |
| Set | `insert(...elems)`, `insertMultiple(elems)` | `insertIfAbsent(...elems)`, `insertMultipleIfAbsent(elems)` |
| Map | `set(key, value)`, `setMultiple(entries)` | `setIfAbsent(key, value)`, `setMultipleIfAbsent(entries)` |

Existing insertion methods and constructors keep the **last** supplied
representative of each comparator equality class. Map replacement updates both
the stored key representative and its value. The if-absent variants preserve
existing representatives; for new equality classes, the **first** supplied
representative wins. Bulk methods process their input in iteration order.
If-absent methods return the original tree/set/map when nothing is added.
Existing insertion methods may also reuse unchanged structure when replacing
an element with an identical value (`Object.is`).

Both tree insertion functions return `{ result, previous }`, where `previous`
is the element found before insertion, or undefined if absent. Deletion returns
`{ result, deleted }`. Set/map updates return the resulting collection.

```ts
import { RedBlackMap, RedBlackSet, nat } from "things";

const s = RedBlackSet(nat, [1, 2]);
s.insertIfAbsent(2) === s; // true
const extended = s.insertIfAbsent(3); // s still contains only 1 and 2

const m = RedBlackMap<number, string>(nat).set(1, "first");
m.set(1, "last").get(1); // "last"
m.setIfAbsent(1, "ignored") === m; // true
```

Set combination methods require comparators defining the same ordering and
equality. Their existing representative choices are preserved:

- `union` inserts the smaller set into the larger, so the smaller set's
  representatives win collisions. On a size tie, the argument's representatives
  win. The result uses the larger set's comparator, or the receiver's on a tie.
- `intersection` uses representatives and the comparator from the smaller set,
  or the receiver on a tie.
- `difference` and `filter` preserve surviving representatives from the receiver.

The source API documentation is in
[RedBlackTree.ts](src/redblack/RedBlackTree.ts),
[RedBlackSet.ts](src/redblack/RedBlackSet.ts), and
[RedBlackMap.ts](src/redblack/RedBlackMap.ts).
