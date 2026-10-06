const freezeObject = Object.freeze;
const ownDescriptor = Object.getOwnPropertyDescriptor;

/** Shallow-freeze a value and, for a function, its own prototype if present. */
export function freeze<V>(value : V) : V {
    if (typeof value === "function") {
        const prototype = ownDescriptor(value, "prototype");
        if (prototype !== undefined && "value" in prototype) {
            freezeObject(prototype.value);
        }
    }
    freezeObject(value);
    return value;
}
freeze(freeze);
