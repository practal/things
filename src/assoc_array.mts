import {Thing} from "./thing.mjs";
import {combineHashes, freeze} from "./utils.mjs";
import {int, IntThing, NumberThing} from "./primitives.mjs";
import { MapThing } from "./map_thing.mjs";
import * as insta from "instatest";
import { testMapThing } from "./test_map_thing.mjs";

insta.beginUnit("things", "assoc_array");

/** A [[MapThing]] for ordered association arrays. */
export function AssocArrayT<Key, Value>(keyT : Thing<Key>, valueT : Thing<Value>) : MapThing<[Key, Value][], Key, Value> {
    const thing : MapThing<[Key, Value][], Key, Value> = {
        keyT: keyT,
        valueT: valueT,
        empty(): [Key, Value][] {
            return [];
        },
        from(keyValues: Iterable<[Key, Value]>): [Key, Value][] {
            let m = thing.empty();
            for (const [k, v] of keyValues) {
                thing.put(m, k, v);
            }
            return m;
        },
        size(map: [Key, Value][]): number {
            return map.length;
        },
        entries(map: [Key, Value][]): IterableIterator<[Key, Value]> {
            return map.values();
        },
        get(map: [Key, Value][], key: Key): Value | undefined {
            for (const [k, v] of map) {
                const c = keyT.compare(k, key);
                if (c === 0) return v; 
                else if (c > 0) return undefined; 
                else if (!(c < 0)) throw new Error(`Incompatible key '${key}'.`); 
            }
            return undefined;
        },
        has(map: [Key, Value][], key: Key): boolean {
            for (const [k, v] of map) {
                const c = keyT.compare(k, key);
                if (c === 0) return true; 
                else if (c > 0) return false; 
                else if (!(c < 0)) throw new Error(`Incompatible key '${key}'.`); 
            }
            return false;
        },
        put(map: [Key, Value][], key: Key, value: Value): { old: Value | undefined; result: [Key, Value][]; } {
            for (const [i, [k, v]] of map.entries()) {
                const c = keyT.compare(k, key);
                if (c === 0) {
                    map[i] = [key, value];
                    return {old: v, result: map};                    
                } else if (c > 0) {
                    map.splice(i, 0, [key, value]);
                    return {old: undefined, result: map};
                } else if (!(c < 0)) throw new Error(`Incompatible key '${key}'.`); 
            }            
            map.push([key, value]);
            return {old: undefined, result: map};
        },
        putIfUndefined(map: [Key, Value][], key: Key, value: Value): { old: Value | undefined; result: [Key, Value][]; } {
            for (const [i, [k, v]] of map.entries()) {
                const c = keyT.compare(k, key);
                if (c === 0) {
                    return {old: v, result: map};                    
                } else if (c > 0) {
                    map.splice(i, 0, [key, value]);
                    return {old: undefined, result: map};
                } else if (!(c < 0)) throw new Error(`Incompatible key '${key}'.`); 
            }            
            map.push([key, value]);
            return {old: undefined, result: map};
        },
        remove(map: [Key, Value][], key: Key): { old: Value | undefined; result: [Key, Value][]; } {
            for (const [i, [k, v]] of map.entries()) {
                const c = keyT.compare(k, key);
                if (c === 0) {
                    map.splice(i, 1);
                    return {old: v, result: map};                    
                } else if (c > 0) {
                    return {old: undefined, result: map};
                } else if (!(c < 0)) throw new Error(`Incompatible key '${key}'.`); 
            }            
            return {old: undefined, result: map};            
        },
        immutable: false,
        inDomain(arr: [Key, Value][]): boolean {
            if (!(arr instanceof Array)) return false;
            try {
                for (const [k, v] of arr) {
                    if (!(keyT.inDomain(k) && valueT.inDomain(v))) return false;
                }
                return true;
            } catch {
                return false;
            } 
        },
        equals(arr1: [Key, Value][], arr2: [Key, Value][]): boolean {
            return thing.compare(arr1, arr2) === 0;
        },
        compare(arr1: [Key, Value][], arr2: [Key, Value][]): number {
            const len = arr1.length;
            let c = IntThing.compare(len, arr2.length);
            if (c !== 0) return c;
            for (let i = 0; i < len; i++) {
                const [k1, v1] = arr1[i];
                const [k2, v2] = arr2[i];
                c = keyT.compare(k1, k2);
                if (c !== 0) return c;
                c = valueT.compare(v1, v2);
                if (c !== 0) return c;          
            }
            return 0;
        },
        hashOf(arr: [Key, Value][]): number {
            return combineHashes(function*() {
                for (const [k, v] of arr) {
                    yield keyT.hashOf(k);
                    yield valueT.hashOf(v);
                }
            }());
        },
        clone(arr: [Key, Value][]): [Key, Value][] {
            if (keyT.immutable && valueT.immutable) return [...arr];
            let brr = thing.empty();
            for (const [k, v] of arr) {
                brr.push([keyT.clone(k), valueT.clone(v)]);
            }
            return brr;
        }
    };
    freeze(thing);
    return thing;   
}
freeze(AssocArrayT);

insta.test("test map thing", () => {
    const thing = AssocArrayT(NumberThing, NumberThing);
    testMapThing(thing);
});

insta.endUnit("things", "assoc_array");
