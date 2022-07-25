import { Numbers } from "./primitives.mjs";
import { Things } from "./things.mjs";
import { freeze } from "./utils.mjs";

export function ReverseOrder<T>(thing : Things<T>) : Things<T> {
    const reversed : Things<T> = {
        inDomain(x: T): boolean {
            return thing.inDomain(x);
        },
        equals(x: T, y: T): boolean {
            return thing.equals(x, y);
        },
        compare(x: T, y: T): number {
            return -thing.compare(x, y);
        },
        hashOf(x: T): number {
            return thing.hashOf(x);
        },
        clone(x: T): T {
            return thing.clone(x);
        },
        immutable: thing.immutable,
        print(x: T): string {
            return thing.print(x);
        }
    }
    freeze(reversed);
    return reversed;
}
freeze(ReverseOrder);

export const NumbersDescending = ReverseOrder(Numbers);