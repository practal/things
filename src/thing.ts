import { Equatable } from "./equatable";
import { Hashable } from "./hashable";
import { Comparable } from "./comparable";
import { int } from "./primitives";

export class Thing implements Equatable, Hashable, Comparable {
 
    static {
        Object.setPrototypeOf(Thing.prototype, null);
        Object.freeze(Thing.prototype);
        Object.freeze(Thing);
    }

    equals(other: this): boolean {
        return this === other;
    }

    get hash(): int {
        return 0;
    }

    compare(other: any): number {
        if (this.equals(other)) { return 0; } else { return Number.NaN; }
    }   
    
    public toString(): string {
        return "something";
    }

}

export function finalClass(finalClass : string) : never {
    throw new Error(`Cannot subclass final class ${finalClass}.`);
}
