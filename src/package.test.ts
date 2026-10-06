import { configureDebugging, runTests } from "./index.js";
import "./redblack/RedBlack.test.js";
import "./digraph.test.js";
import "./list.test.js";
import "./opaque.test.js";

configureDebugging(console.log);
runTests().then(results => {
    if (!results.ok) process.exitCode = 1;
});
