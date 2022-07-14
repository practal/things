import {Thing} from "./thing.mjs";
import {combineHashes, freeze} from "./utils.mjs";
import {int} from "./primitives.mjs";
import { MapThing } from "./map_thing.mjs";

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
            }
            return undefined;
        },
        has: function (map: [Key, Value][], key: Key): boolean {
            for (const [k, v] of map) {
                const c = keyT.compare(k, key);
                if (c === 0) return true; 
                else if (c > 0) return false; 
            }
            return false;
        },
        put: function (map: [Key, Value][], key: Key, value: Value): { old: Value | undefined; result: [Key, Value][]; } {
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
        putIfUndefined: function (map: [Key, Value][], key: Key, value: Value): { old: Value | undefined; result: [Key, Value][]; } {
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
        remove: function (map: [Key, Value][], key: Key): { old: Value | undefined; result: [Key, Value][]; } {
            throw new Error("Function not implemented.");
        },
        immutable: false,
        inDomain: function (x: [Key, Value][]): boolean {
            throw new Error("Function not implemented.");
        },
        equals: function (x: [Key, Value][], y: [Key, Value][]): boolean {
            throw new Error("Function not implemented.");
        },
        compare: function (x: [Key, Value][], y: [Key, Value][]): number {
            throw new Error("Function not implemented.");
        },
        hashOf: function (x: [Key, Value][]): number {
            throw new Error("Function not implemented.");
        },
        clone: function (x: [Key, Value][]): [Key, Value][] {
            throw new Error("Function not implemented.");
        }
    };
    freeze(thing);
    return thing;   
}
freeze(AssocArrayT);
