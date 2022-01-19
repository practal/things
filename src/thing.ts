import { Equatable } from "./equatable";

export class Thing implements Equatable {
 
    static {
        Object.setPrototypeOf(Thing.prototype, null);
        Object.freeze(Thing.prototype);
        Object.freeze(Thing);
    }

    equals(other: this): boolean {
        return this === other;
    }

}

export function finalClass(name : string) : never {
    throw new Error(`Cannot subclass final class ${name}.`);
}
