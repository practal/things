import {int} from "./primitives";
import {Hashables} from "./hashable";

export enum sign {
    Positive,
    Negative,
    Zero
}

export function signOf(x : number) : sign {
    if (x < 0) { return sign.Negative; }
    else if (x > 0) { return sign.Positive; }
    else { return sign.Zero }
}

export function signAsInt(s : sign) : int {
    switch (s) {
        case sign.Negative: return -1;
        case sign.Positive: return 1;
        case sign.Zero: return 0;
        default: throw new Error(`not a sign: ${s}`);
    }
}

export const signs : Hashables<sign> = {

    hash(s: sign): int {
        return signAsInt(s);
    },

    equals(lhs: sign, rhs: sign): boolean {
        return lhs === rhs;
    }

}