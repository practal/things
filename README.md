# things

Data structures and utilities for TypeScript.

## Opaque objects

`mkOpaque<Tag, State>(name, display?)` creates an independent family of opaque,
frozen objects. It returns a frozen factory with three members:

- `type`: a frozen `Thing<Opaque<Tag>>` descriptor with `is`, `assert`, and `display`.
- `create(state)`: creates an object containing the private state.
- `read(value)`: validates an object and returns its private state.

Keep the factory private to the module that owns the resource. Export its type
descriptor and checked operations, rather than its construction and state-access
authority. Calling `mkOpaque` again, even with the same name or TypeScript tag,
creates a separate runtime family that cannot manufacture objects of the first.

```ts
import { mkOpaque, type Opaque, type Thing } from 'things';

declare const tokenTag: unique symbol;
export type Token = Opaque<typeof tokenTag>;

const tokens = mkOpaque<typeof tokenTag, string>('Token', text => text);
export const Token: Readonly<Thing<Token>> = tokens.type;

export function createToken(text: string): Token {
    if (typeof text !== 'string') throw new TypeError('Expected a string.');
    return tokens.create(text);
}
```

To give objects a public interface, use
`mkOpaque<Tag, State, Members>(name, display, members)`. The resulting type is
`Opaque<Tag> & Members`. Supply methods and readonly getters in `members`; they
are copied onto a shared, frozen prototype without invoking the getters.
The member functions themselves are also frozen. Setters, data properties other
than functions, and a `constructor` member are rejected. Changes to the supplied
`members` object do not change the copied prototype.

```ts
interface TokenMembers {
    readonly text: string;
}
const tokens = mkOpaque<typeof tokenTag, string, TokenMembers>('Token', undefined, {
    get text(): string { return tokens.read(this); }
});
tokens.create('hello').text; // 'hello'
```

Member implementations are trusted owner code. Use `read(this)` to authenticate
the receiver before acting on it; this also rejects borrowed methods or getters
applied to an imitation or a proxy. Returned objects must be suitably protected
by the owner. The helper does not interpret the interface's logical invariants.

A native JavaScript private field both carries the state and authenticates the
object. Reflection, copied properties, inherited prototypes, and proxies cannot
reproduce that field. Recognition does not invoke input getters, proxy traps,
or string coercion. Constructors are guarded, and the frozen instance prototype
has a null parent. Private-state readers remain in closures, never on the
reflected constructor. There is no global object registry.

The helper protects the exterior, not arbitrary state supplied by its owner.
State is retained by reference and is neither copied nor deep-frozen. The owner
must control mutable state and any `display` callback, and must validate inputs
to public operations. Shared built-ins must be intact when the helper loads;
the helper captures the operations it needs for later calls.

Both module builds preserve native private fields; the CommonJS build now
targets ES2022 rather than ES2015. Consumers need a runtime supporting those
features. The shared `freeze` helper also captures native freezing once, while
keeping its existing shallow-freezing API (including a function's own prototype).

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
