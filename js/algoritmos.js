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

  if (path[0] !== start) return null;

  let cost = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const edge = graph[from].find(e => e.node === to);
    if (edge) cost += edge.weight;
  }

  return { path, cost };
}

// Algoritmo A* (sin heurística real)
function astar(graph, start, end) {
  const openSet = new Set([start]);
  const cameFrom = {};
  const gScore = {}, fScore = {};

  for (const node in graph) {
    gScore[node] = Infinity;
    fScore[node] = Infinity;
  }
  gScore[start] = 0;
  fScore[start] = 0;

  while (openSet.size) {
    const current = [...openSet].reduce((a, b) =>
      fScore[a] < fScore[b] ? a : b
    );

    if (current === end) {
      const path = [];
      let curr = end;
      while (curr) {
        path.unshift(curr);
        curr = cameFrom[curr];
      }

      let cost = 0;
      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i], to = path[i + 1];
        const edge = graph[from].find(e => e.node === to);
        if (edge) cost += edge.weight;
      }

      return { path, cost };
    }

    openSet.delete(current);

    for (const neighbor of graph[current] || []) {
      const tentative = gScore[current] + neighbor.weight;
      if (tentative < gScore[neighbor.node]) {
        cameFrom[neighbor.node] = current;
        gScore[neighbor.node] = tentative;
        fScore[neighbor.node] = tentative;
        openSet.add(neighbor.node);
      }
    }
  }

  return null;
}

// Escuchar el mensaje del hilo principal
onmessage = function (e) {
  const { algoritmo, grafo, origen, destino } = e.data;

  const resultado = algoritmo === "a"
    ? astar(grafo, origen, destino)
    : dijkstra(grafo, origen, destino);

  postMessage(resultado || { path: null });
};
