import { configureDebugging, runTests } from "./index.js";
import "./redblack/RedBlack.test.js";

configureDebugging(console.log);
runTests();