import { List, Test, assertEqT } from "./index.js";

Test(() => {
    const l = List.from(3, 42);
    assertEqT(l.get(0), 3);
    assertEqT(l.get(1), 42);
}, "List");
