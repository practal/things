import { freeze } from "./utils.mjs";

declare const tag : unique symbol

export type Sealed<T> = { readonly [tag] : T };

export type Seal<T, M> = { make : (m : M) => Sealed<T>, content : (m : Sealed<T>) => M }

export function Seal<T, M>() : Seal<T, M> {
    const secret = Symbol("seal");
    class SealedC<M> {
        #content : M
        constructor(_secret : symbol, content : M) {
            if (secret !== _secret) throw new Error("Cannot create sealed object directly.");
            this.#content = content;
            freeze(this);
        }
        content(_secret : symbol) : M {
            if (secret !== _secret) throw new Error("Cannot access sealed content directly.");
            return this.#content;
        }
    }    
    freeze(SealedC);
    return {
        make(m : M): Sealed<T> {
            return new SealedC(secret, m) as any;
        },
        content(sealed : Sealed<T>): M {
            const m = (sealed as unknown) as SealedC<M>;
            return m.content(secret);
        }
    };
}