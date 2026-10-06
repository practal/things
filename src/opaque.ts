import { freeze } from "./freeze.js";
import type { Thing } from "./things.js";

const setPrototypeOf = Object.setPrototypeOf;
const ownKeys = Reflect.ownKeys;
const ownDescriptor = Object.getOwnPropertyDescriptor;
const defineProperty = Object.defineProperty;
const InvalidValue = TypeError;

declare const opaqueBrand : unique symbol;

/** A nominal object type. Use a distinct unique-symbol type for each resource. */
export type Opaque<Tag extends symbol> = { readonly [opaqueBrand] : Tag };

/**
 * Construction and inspection authority for one opaque object family.
 * Publish `type` for recognition; keep `create` and `read` private to the owner.
 */
export interface OpaqueFactory<Tag extends symbol, State, Members extends object = object> {
    readonly type : Readonly<Thing<Opaque<Tag> & Members>>
    readonly create : (state : State) => Opaque<Tag> & Members
    readonly read : (value : unknown) => State
}

/**
 * Create a fresh runtime family, independent even of families with the same name.
 * Instances are frozen and their only state is a JavaScript private field.
 * State is retained by reference, not copied or deep-frozen: its owner must
 * protect any mutable state and must not expose the factory's authority.
 * `display` is trusted owner code and receives that private state.
 */
export function mkOpaque<Tag extends symbol, State>(
    name : string,
    display? : (state : State) => string
) : OpaqueFactory<Tag, State>;
/**
 * Add public methods and readonly getters, copied onto the shared prototype.
 * Only own properties are copied; data properties must be functions, setters
 * and a `constructor` member are rejected. Member functions are frozen as well.
 * Members are trusted owner code: use the factory's `read(this)` to validate
 * receivers before accessing state, and expose only suitably protected values.
 */
export function mkOpaque<Tag extends symbol, State, Members extends object>(
    name : string,
    display : ((state : State) => string) | undefined,
    members : Members
) : OpaqueFactory<Tag, State, Members>;
export function mkOpaque<Tag extends symbol, State, Members extends object = object>(
    name : string,
    display : (state : State) => string = () => name,
    members? : Members
) : OpaqueFactory<Tag, State, Members> {
    if (typeof name !== "string" || typeof display !== "function") {
        throw new InvalidValue("Expected an opaque type name and display function.");
    }
    const key = {};
    type Resource = Opaque<Tag> & Members;
    let is! : (value : unknown) => value is Resource;
    let read! : (value : unknown) => State;

    class Value {
        readonly #state : State;

        constructor(token : object, state : State) {
            if (token !== key || new.target !== Value) {
                throw new InvalidValue("Use the opaque factory to create " + name + ".");
            }
            this.#state = state;
            freeze(this);
        }

        // Private-state access stays in closures, never on the reflected class.
        static {
            is = (value : unknown) : value is Resource =>
                typeof value === "object" && value !== null && #state in value;
            read = (value : unknown) : State => {
                if (typeof value !== "object" || value === null || !(#state in value)) {
                    throw new InvalidValue("Expected a " + name + ".");
                }
                return value.#state;
            };
        }
    }
    setPrototypeOf(Value.prototype, null);
    if (members !== undefined) {
        for (const name of ownKeys(members)) {
            const descriptor = setPrototypeOf(ownDescriptor(members, name)!, null);
            if (name === "constructor" || ("value" in descriptor
                ? typeof descriptor.value !== "function"
                : descriptor.set !== undefined || typeof descriptor.get !== "function")) {
                throw new InvalidValue("Opaque members must be methods or readonly getters.");
            }
            freeze("value" in descriptor ? descriptor.value : descriptor.get);
            defineProperty(Value.prototype, name, descriptor);
        }
    }
    freeze(Value);
    freeze(is);
    freeze(read);

    const type : Readonly<Thing<Resource>> = freeze(setPrototypeOf({
        name,
        is,
        assert: freeze((value : unknown) : asserts value is Resource => {
            if (!is(value)) throw new InvalidValue("Expected a " + name + ".");
        }),
        display: freeze((value : Resource) : string => display(read(value)))
    }, null));

    return freeze(setPrototypeOf({
        type,
        create: freeze((state : State) : Resource =>
            new Value(key, state) as unknown as Resource),
        read
    }, null));
}
freeze(mkOpaque);
