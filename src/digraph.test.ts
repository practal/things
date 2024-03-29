import { Digraph, Relation, Test, assertT, compareGraphs, transitiveReductionAndClosureOfDAG } from "./index.js";

function testTransitiveReduction1() {
    const g = new Digraph();
    const A = 1;
    const B = 2;
    const C = 3;
    g.connect(A, B);
    g.connect(A, C);
    g.connect(C, B);
    const r = new Digraph();
    r.connect(A, C);
    r.connect(C, B);
    const {reduction, closure} = transitiveReductionAndClosureOfDAG(g);  
    assertT(compareGraphs(closure, g) === Relation.EQUAL);
    assertT(compareGraphs(reduction, r) === Relation.EQUAL);
}

function testTransitiveReduction2() {
    const g = new Digraph();
    const A = 1;
    const B = 2;
    const C = 3;
    const D = 4;
    const E = 5;
    g.connect(A, B);
    g.connect(A, C);
    g.connect(A, D);
    g.connect(A, E);
    g.connect(B, D);
    g.connect(C, D);
    g.connect(C, E);
    g.connect(D, E);
    const r = new Digraph();
    r.connect(A, B);
    r.connect(A, C);
    r.connect(B, D);
    r.connect(C, D);
    r.connect(D, E);
    const {reduction, closure} = transitiveReductionAndClosureOfDAG(g);  
    assertT(compareGraphs(closure, g) === Relation.GREATER);
    assertT(compareGraphs(reduction, r) === Relation.EQUAL);
}

function testTransitiveReduction3() {
    const g = new Digraph();
    const A = 1;
    const B = 2;
    g.insert(A);
    g.insert(B);
    const {reduction, closure} = transitiveReductionAndClosureOfDAG(g);
    assertT(reduction.vertexCount === 2 && reduction.edgeCount === 0);
    assertT(closure.vertexCount === 2 && reduction.edgeCount === 0);
}

Test(() => {
    testTransitiveReduction1();
    testTransitiveReduction2();
    testTransitiveReduction3();
}, "Transitive Reduction and Closure of DAG");
