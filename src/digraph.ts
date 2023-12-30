import { Relation } from "./index.js";
import { int, nat } from "./primitives.js";
import { force, freeze } from "./utils.js";

export type Vertex = int

/** 
 * This class implements directed graphs:
 * * Vertices are represented as integers.
 * * All edges are directed, and there are no multi-edges.
 */
export class Digraph {

    #edges : Map<Vertex, Set<Vertex>>
    #edge_count : nat

    constructor() {
        this.#edges = new Map();
        this.#edge_count = 0;
        freeze(this);
    }

    clone() : Digraph {
        const g = new Digraph();
        for (const [vertex, succs] of this.#edges) {
            g.#edges.set(vertex, new Set(succs));
        }
        g.#edge_count = this.#edge_count;
        return g;
    }

    insert(vertex : Vertex) : boolean {
        int.assert(vertex);
        const succs = this.#edges.get(vertex);
        if (succs === undefined) {
            this.#edges.set(vertex, new Set());
            return true;
        } else {
            return false;
        }
    }

    delete(vertex : Vertex) : boolean {
        int.assert(vertex);
        const succs = this.#edges.get(vertex);
        if (succs === undefined) return false;
        this.#edge_count -= succs.size;
        this.#edges.delete(vertex);
        return true;
    }

    hasVertex(vertex : Vertex) : boolean {
        return this.#edges.has(vertex);
    }

    hasEdge(from : Vertex, to : Vertex) : boolean {
        const edges = this.#edges.get(from);
        if (edges === undefined) return false;
        return edges.has(to);
    }

    connect(from : Vertex, to : Vertex) : boolean {
        int.assert(from);
        int.assert(to);
        let changed : boolean;
        const succs = this.#edges.get(from);
        if (succs === undefined) {
            changed = true;
            this.#edges.set(from, new Set([to]));            
        } else {
            changed = !succs.has(to);
            if (changed) succs.add(to);
        }
        if (changed) {
            this.#edge_count++;  
            if (this.#edges.get(to) === undefined) {
                this.#edges.set(to, new Set());  
            }        
        }
        return changed;
    }

    disconnect(from : Vertex, to : Vertex) : boolean {
        int.assert(from);
        int.assert(to);
        let succs = this.#edges.get(from);
        if (succs === undefined || !succs.has(to)) return false;
        succs.delete(to);
        this.#edge_count -= 1;
        return true;
    }

    get vertices() : Iterable<Vertex> {
        const edges = this.#edges;
        function *it() { yield* edges.keys(); };
        return it();
    }

    outgoing(vertex : Vertex) : Iterable<Vertex> {
        const succs = this.#edges.get(vertex);
        if (succs === undefined) return [];
        const out = succs
        function *it() { yield* out; }
        return it();
    }

    countOutgoing(vertex : Vertex) : nat {
        const succs = this.#edges.get(vertex);
        if (succs === undefined) return 0;
        return succs.size;        
    }

    get isEmpty() : boolean {
        return this.vertexCount === 0;
    }

    /** The number of vertices of this graph */
    get vertexCount() : nat {
        return this.#edges.size;
    }

    /** The number of edges of this graph */
    get edgeCount() : nat {
        return this.#edge_count;
    }

    /** The number of edges and vertices of this graph */
    get size() : nat {
        return this.vertexCount + this.edgeCount;
    }

}
freeze(Digraph);

export function printGraph(graph : Digraph, 
    label : (v : Vertex) => string = v => v.toString(), 
    println : (s : string) => void = console.log) 
{
    println("Graph has " + graph.vertexCount + " vertices and " + graph.edgeCount + " edges:");
    for (const vertex of graph.vertices) {
        const succs = [...graph.outgoing(vertex)].map(label).join(", ");
        println("  Vertex " + label(vertex) + ": " + succs);
    }
    println("  □");
}

export type DFSNode = {
    parent : Vertex | null,
    discovered : nat,
    finished : nat
}

export function depthFirstSearch(graph : Digraph, vertices : Iterable<Vertex> = graph.vertices) : Map<Vertex, DFSNode> {
    let nodes : Map<Vertex, DFSNode> = new Map();
    let timestamp = 0;

    function visit(parent : Vertex | null, vertex : Vertex) {
        let node = nodes.get(vertex);
        if (node !== undefined) return;
        node = { parent : parent, discovered : ++timestamp, finished : 0 };
        nodes.set(vertex, node);
        for (const succ of graph.outgoing(vertex)) {
            visit(vertex, succ);
        }
        node.finished = ++timestamp;
    }

    for (const vertex of vertices) visit(null, vertex);

    return nodes;
}
freeze(depthFirstSearch);

export function forestOfDFS(dfs : Map<Vertex, DFSNode>) : Digraph {
    let graph : Digraph = new Digraph();
    for (const [vertex, node] of dfs) {
        graph.insert(vertex);
        if (node.parent !== null) {
            graph.connect(node.parent, vertex);
        }
    }
    return graph;
}
freeze(forestOfDFS);

export function depthFirstSearchForest(graph : Digraph, vertices : Iterable<Vertex> = graph.vertices) : Digraph {
    const dfs = depthFirstSearch(graph, vertices);
    return forestOfDFS(dfs);
}
freeze(depthFirstSearchForest);

export function transposeDigraph(graph : Digraph) : Digraph {
    let transposed : Digraph = new Digraph();
    for (const from of graph.vertices) {
        transposed.insert(from);
        for (const to of graph.outgoing(from)) {
            transposed.connect(to, from);
        }
    }
    return transposed;
}
freeze(transposeDigraph);

export function symmetricClosure(graph : Digraph) : Digraph {
    let symmetric : Digraph = new Digraph();
    for (const from of graph.vertices) {
        symmetric.insert(from);
        for (const to of graph.outgoing(from)) {
            symmetric.connect(from, to);
            symmetric.connect(to, from);
        }
    }
    return symmetric;
}
freeze(symmetricClosure);

export function reachableFrom(graph : Digraph, start : Iterable<Vertex>) : Set<Vertex> {
    let processing = [...start];
    let hull : Set<Vertex> = new Set();
    while (processing.length > 0) {
        const vertex = processing.pop()!;
        for (const succ of graph.outgoing(vertex)) {
            if (!hull.has(succ)) {
                processing.push(succ);
                hull.add(succ);
            }
        }
    }
    return hull;
}
freeze(reachableFrom);

export function closureFrom(graph : Digraph, start : Iterable<Vertex>) : Set<Vertex> {
    let processing = [...start];
    let hull = new Set(processing);
    while (processing.length > 0) {
        const vertex = processing.pop()!;
        for (const succ of graph.outgoing(vertex)) {
            if (!hull.has(succ)) {
                processing.push(succ);
                hull.add(succ);
            }
        }
    }
    return hull;    
}
freeze(closureFrom);

export function transitiveClosure(graph : Digraph) : Digraph {
    const closure = graph.clone();
    while (true) {
        const oldsize = closure.size;
        for (const vertex of closure.vertices) {
            for (const succ of closure.outgoing(vertex)) {
                for (const succ_succ of closure.outgoing(succ)) {
                    closure.connect(vertex, succ_succ);
                }
            }
        }
        if (closure.size === oldsize) return closure;
    }
}

/** 
 * Assigns to each vertex V of the graph a unique index S(V) such that 0 ≤ S(V) < graph.vertexCount.
 * If the graph is acyclic, and if there is an edge from A to B in the graph with A ≠ B, then S(A) < S(B). 
 */
export function topologicalSort(graph : Digraph, vertices : Iterable<Vertex> = graph.vertices) : Map<Vertex, nat> {
    let sorted : Map<Vertex, nat> = new Map();
    let visited : Set<Vertex> = new Set();

    const count = graph.vertexCount;

    function visit(vertex : Vertex) {
        if (visited.has(vertex)) return;
        visited.add(vertex);
        for (const succ of graph.outgoing(vertex)) {
            visit(succ);
        }
        sorted.set(vertex, count - sorted.size - 1);
    }

    for (const vertex of vertices) visit(vertex);

    return sorted;
}
freeze(topologicalSort);

export function backEdgesOfTopologicalSort(graph : Digraph, topsort : Map<Vertex, nat>) : Digraph {
    const g = new Digraph();
    for (const from of graph.vertices) {
        const rank_from = topsort.get(from)!;
        for (const to of graph.outgoing(from)) {
            const rank_to = topsort.get(to)!;
            if (rank_from >= rank_to) g.connect(from, to);
        }
    }
    return g;
}
freeze(backEdgesOfTopologicalSort);

/** 
 * Orders the vertices of a directed graph by finishing times, later times appear at higher array indices.
 */
 export function topologicalSortByFinish(
    graph : Digraph, vertices : Iterable<Vertex> = graph.vertices) : Vertex[] 
{
    let sorted : Vertex[] = [];
    let visited : Set<Vertex> = new Set();

    function visit(vertex : Vertex) {
        if (visited.has(vertex)) return;
        visited.add(vertex);
        for (const succ of graph.outgoing(vertex)) {
            visit(succ);
        }
        sorted.push(vertex);
    }

    for (const vertex of vertices) visit(vertex);

    return sorted;
}
freeze(topologicalSortByFinish);

export function weaklyConnectedComponents(graph : Digraph) : Set<Vertex>[] {
    let components : Set<Vertex>[] = [];
    let processed : Set<Vertex> = new Set();
    
    graph = symmetricClosure(graph);

    function visit(vertex : Vertex) {
        if (processed.has(vertex)) return;
        const component = closureFrom(graph, [vertex]);
        components.push(component);
        for (const vertex of component) {
            processed.add(vertex);
        }
    }
    
    for (const vertex of graph.vertices) visit(vertex);

    return components;
}
freeze(weaklyConnectedComponents);

export function stronglyConnectedComponents(graph : Digraph) : Set<Vertex>[] {
    const vertices = topologicalSortByFinish(graph);
    vertices.reverse();
    graph = transposeDigraph(graph);
    const forest = depthFirstSearchForest(graph, vertices);
    return weaklyConnectedComponents(forest);
}
freeze(stronglyConnectedComponents);

export function sourceVertices(graph : Digraph) : Set<Vertex> {
    const outgoing : Set<Vertex> = new Set();
    for (const vertex of graph.vertices) {
        for (const succ of graph.outgoing(vertex)) outgoing.add(succ);
    }
    const sources : Set<Vertex> = new Set();
    for (const vertex of graph.vertices) {
        if (!outgoing.has(vertex)) sources.add(vertex);
    }
    return sources;
}

export function sinkVertices(graph : Digraph) : Set<Vertex> {
    const sinks : Set<Vertex> = new Set();
    for (const vertex of graph.vertices) {
        let isSink = true;
        for (const _ of graph.outgoing(vertex)) {
            isSink = false;
            break;
        }
        if (isSink) sinks.add(vertex);
    }
    return sinks;
}

export function KahnTopologicalSortDepthFirstWithCompare(graph : Digraph, 
    compare : (x: Vertex, y: Vertex) => number) : 
    { sorted : Vertex[], remaining_transposed : Digraph }
{
    const transposed = transposeDigraph(graph);
    const sources = [...sinkVertices(transposed)];
    const sorted : Vertex[] = [];
    sources.sort((x, y) => -compare(x, y));  // first source to consider is at the end
    while (true) {
        const source = sources.pop();
        if (source === undefined) return { sorted : sorted, remaining_transposed : transposed };
        sorted.push(source);
        const succs : Vertex[] = [];
        for (const succ of graph.outgoing(source)) {
            transposed.disconnect(succ, source);
            if (transposed.countOutgoing(succ) === 0) succs.push(succ);
        }
        succs.sort((x, y) => -compare(x, y)); 
        sources.push(...succs);
    }
}

export function KahnTopologicalSortDepthFirst(graph : Digraph) : 
    { sorted : Vertex[], remaining_transposed : Digraph }
{
    const transposed = transposeDigraph(graph);
    const sources = [...sinkVertices(transposed)];
    const sorted : Vertex[] = [];
    while (true) {
        const source = sources.pop();
        if (source === undefined) {
            return { sorted : sorted, remaining_transposed : transposed };
        }
        sorted.push(source);
        for (const succ of graph.outgoing(source)) {
            transposed.disconnect(succ, source);
            if (transposed.countOutgoing(succ) === 0) sources.push(succ);
        }
    }
}

export function transitiveReductionAndClosureOfDAG(graph : Digraph) : { reduction : Digraph, closure : Digraph } {
    const closure = new Digraph();
    const reduction = new Digraph();
    const topsort = KahnTopologicalSortDepthFirst(graph);
    if (topsort.remaining_transposed.edgeCount > 0) throw new Error("graph has cycles");
    const sorted = topsort.sorted;
    const Index = new Map<number, number>();
    for (const [i, vertex] of sorted.entries()) {
        Index.set(vertex, i);
    }
    const N = sorted.length;
    for (let i = N-1; i >= 0; i--) {
        const vertex = sorted[i];
        closure.connect(vertex, vertex);
        const succs = [...graph.outgoing(vertex)];
        succs.sort((u, v) => force(Index.get(u)) - force(Index.get(v)));
        for (const succ of succs) {
            if (!closure.hasEdge(vertex, succ)) {
                const j = force(Index.get(succ));
                for (let l = j; l < N; l++) {
                    const w = sorted[l];
                    if (closure.hasEdge(succ, w)) closure.connect(vertex, w);
                }
                reduction.connect(vertex, succ);
            }
        }
    }
    for (const vertex of sorted) closure.disconnect(vertex, vertex);
    return { reduction : reduction, closure : closure };
}

export function isSubgraph(sub : Digraph, g : Digraph) : boolean {
    for (const vertex of sub.vertices) {
        if (!g.hasVertex(vertex)) return false;
        for (const succ of sub.outgoing(vertex)) {
            if (!g.hasEdge(vertex, succ)) return false;
        }
    }
    return true;
}

export function compareGraphs(g : Digraph, h : Digraph) : Relation {
    const sub = isSubgraph(g, h);
    const sup = isSubgraph(h, g);
    if (sub && sup) return Relation.EQUAL;
    if (sub) return Relation.LESS;
    if (sup) return Relation.GREATER;
    return Relation.UNRELATED;
}
