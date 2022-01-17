import {int, ints, createAssocArray, Map} from "../src/index";

test("AssocArray", () => {
    let a : Map<int, string | null> = createAssocArray(ints);
    a.set(1, "one");
    a.set(2, null);
    expect(a.get(1)).toBe("one");
    expect(a.get(2)).toBe(null);
    expect(a.get(3)).toBe(undefined);
});