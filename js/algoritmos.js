// Algoritmo de Dijkstra
function dijkstra(graph, start, end) {
  const visited = new Set();
  const distances = {};
  const previous = {};
  const queue = new Set(Object.keys(graph));

  queue.forEach((n) => distances[n] = Infinity);
  distances[start] = 0;

  while (queue.size) {
    const current = [...queue].reduce((a, b) =>
      distances[a] < distances[b] ? a : b
    );
    queue.delete(current);

    if (current === end) break;
    if (!graph[current]) continue;

    for (const neighbor of graph[current]) {
      const alt = distances[current] + neighbor.weight;
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        previous[neighbor.node] = current;
      }
    }
  }

 const path = [];
let curr = end;
while (curr) {
  path.unshift(curr);
  curr = previous[curr];
}

if (path.length < 2 || path[0] !== start) return null;


  let cost = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const edge = graph[from].find(e => String(e.node) === String(to));
    if (edge) cost += edge.weight;
  }

  return { path, cost };
}

// Algoritmo A* 
function astar(graph, start, end) {
  const openSet = new Set([start]);
  const cameFrom = {};
  const gScore = {};
  const fScore = {};

  for (const node in graph) {
    gScore[node] = Infinity;
    fScore[node] = Infinity;
  }
  gScore[start] = 0;
  fScore[start] = 0;  // Sin heurística, como Dijkstra

  while (openSet.size) {
    const current = [...openSet].reduce((a, b) =>
      fScore[a] < fScore[b] ? a : b
    );

    if (current === end) {
      // Reconstruir camino
      const path = [];
      let curr = end;
      while (curr !== undefined) {
        path.unshift(curr);
        curr = cameFrom[curr];
      }

      if (path[0] !== start) return null;

      let cost = 0;
      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i], to = path[i + 1];
        const edge = graph[from].find(e => String(e.node) === String(to));
        if (edge) cost += edge.weight;
      }

      return { path, cost };
    }

    openSet.delete(current);

    for (const neighbor of graph[String(current)] || []) {
  const tentativeGScore = gScore[current] + neighbor.weight;
  if (tentativeGScore < gScore[neighbor.node]) {
    cameFrom[neighbor.node] = current;
    gScore[neighbor.node] = tentativeGScore;
    fScore[neighbor.node] = tentativeGScore;
    openSet.add(neighbor.node);
  }
}

  }

  return null;  // No se encontró camino
}




// Algoritmo Bellman-Ford 
function bellmanFord(graph, start) {
  const distances = {};
  const predecessors = {};

  Object.keys(graph).forEach(node => {
    distances[node] = Infinity;
  });
  distances[start] = 0;

  const edges = [];
  for (const u in graph) {
    for (const { node: v, weight } of graph[u]) {
      edges.push({ u, v, weight });
    }
  }

  const numVertices = Object.keys(graph).length;

  for (let i = 0; i < numVertices - 1; i++) {
    for (const { u, v, weight } of edges) {
      if (distances[u] + weight < distances[v]) {
        distances[v] = distances[u] + weight;
        predecessors[v] = u;
      }
    }
  }

  for (const { u, v, weight } of edges) {
    if (distances[u] + weight < distances[v]) {
      return null; // ciclo negativo
    }
  }

  const paths = {};
  for (const node in distances) {
    if (node === start || distances[node] === Infinity) continue;

    const path = [];
    let current = node;
    while (current !== undefined) {
      path.unshift(current);
      current = predecessors[current];
    }

    if (path[0] === start) {
      paths[node] = { path, cost: distances[node] };
    }
  }

  return paths;
}

// mensaje del hilo principal (Web Worker)
onmessage = function (e) {
  const { algoritmo, edgesList, origen, destino } = e.data;

  const grafo = {};
  for (const { from, to, weight } of edgesList) {
    const f = String(from);
    const t = String(to);

    if (!grafo[f]) grafo[f] = [];
    grafo[f].push({ node: String(t), weight });

    if (!grafo[t]) grafo[t] = [];
    grafo[t].push({ node: String(f), weight });
  }

  console.log("Grafo reconstruido en worker:", grafo);

  let resultado;
  if (algoritmo === "a") {
    resultado = astar(grafo, String(origen), String(destino));
  } else if (algoritmo === "Bellman_Ford") {
    resultado = bellmanFord(grafo, String(origen));
  } else {
    resultado = dijkstra(grafo, String(origen), String(destino));
  }

  postMessage(resultado || { path: null });
};


