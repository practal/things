import { NumberT } from "./primitives.mjs";
import { Thing } from "./thing.mjs";
import { freeze } from "./utils.mjs";

export function ReverseOrderT<T>(thing : Thing<T>) : Thing<T> {
    const reversed : Thing<T> = {
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
freeze(ReverseOrderT);

export const NumberDescendingT = ReverseOrderT(NumberT);