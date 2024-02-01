import { configureDebugging, runTests } from "./index.js";
import "./redblack/RedBlack.test.js";
import "./digraph.test.js";
import "./list.test.js";

configureDebugging(console.log);
runTests();