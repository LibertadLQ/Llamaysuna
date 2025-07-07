// Algoritmo de Dijkstra
function dijkstra(grafo, inicio, fin) {
  const distancias = {};
  const anteriores = {};
  const nodosPendientes = new Set(Object.keys(grafo));

  //inicializar distancias
  nodosPendientes.forEach(nodo => distancias[nodo] = Infinity);
  distancias[inicio] = 0;

  while (nodosPendientes.size) {
    //nodo con la distancia mas corta
    const actual = [...nodosPendientes].reduce((a, b) =>
      distancias[a] < distancias[b] ? a : b
    );
    nodosPendientes.delete(actual);

    if (actual === fin) break;
    if (!grafo[actual]) continue;

    for (const vecino of grafo[actual]) {
      const posibleDistancia = distancias[actual] + vecino.peso;
      if (posibleDistancia < distancias[vecino.nodo]) {
        distancias[vecino.nodo] = posibleDistancia;
        anteriores[vecino.nodo] = actual;
      }
    }
  }

   //reconstruir el camino
  const camino = [];
  let actual = fin;
  while (actual) {
    camino.unshift(actual);
    actual = anteriores[actual];
  }

  if (camino.length < 2 || camino[0] !== inicio) return null;

  //longitud total del camino
  let longitudTotal = 0;
  for (let i = 0; i < camino.length - 1; i++) {
    const desde = camino[i];
    const hasta = camino[i + 1];
    const arista = grafo[desde].find(e => String(e.nodo) === String(hasta));
    if (arista)  longitudTotal += arista.peso;
  }

  return { camino,  longitudTotal };
}

// Algoritmo A*
function astar(grafo, inicio, fin) {
  const abiertos = new Set([inicio]);
  const desde = {};
  const costoG = {};
  const costoF = {};

//inicializar nodos 
  for (const nodo in grafo) {
    costoG[nodo] = Infinity;
    costoF[nodo] = Infinity;
  }
  costoG[inicio] = 0;
  costoF[inicio] = 0;  

  while (abiertos.size) {
    //nodo con menor distancia
    const actual = [...abiertos].reduce((a, b) =>
      costoF[a] < costoF[b] ? a : b
    );

    if (actual === fin) {
      const camino = [];
      let nodoActual = fin;
      while (nodoActual !== undefined) {
        camino.unshift(nodoActual);
        nodoActual = desde[nodoActual];
      }

      if (camino[0] !== inicio) return null;

       // longitud del camino
      let longitudTotal = 0;
      for (let i = 0; i < camino.length - 1; i++) {
        const desdeNodo = camino[i], hastaNodo = camino[i + 1];
        const arista = grafo[desdeNodo].find(e => String(e.nodo) === String(hastaNodo));
        if (arista) longitudTotal += arista.peso;
      }

      return { camino, longitudTotal };
    }

    abiertos.delete(actual);

    for (const vecino of grafo[actual] || []) {
      const posibleCostoG = costoG[actual] + vecino.peso;
      if (posibleCostoG < costoG[vecino.nodo]) {
        desde[vecino.nodo] = actual;
        costoG[vecino.nodo] = posibleCostoG;
        costoF[vecino.nodo] = posibleCostoG;
        abiertos.add(vecino.nodo);
      }
    }
  }

  return null;  // No hay camino
}

// Algoritmo Bellman-Ford
function bellmanFord(grafo, inicio) {
  const distancias = {};
  const anteriores = {};

  //inicializar distancias a infinito
  Object.keys(grafo).forEach(nodo => {
    distancias[nodo] = Infinity;
  });
  distancias[inicio] = 0;

   //lista de aristas
  const aristas = [];
  for (const desde in grafo) {
    for (const { nodo: hasta, peso } of grafo[desde]) {
      aristas.push({ desde, hasta, peso });
    }
  }

  const numNodos = Object.keys(grafo).length;
//hasta aristas (n - 1) veces
  for (let i = 0; i < numNodos - 1; i++) {
    for (const { desde, hasta, peso } of aristas) {
      if (distancias[desde] + peso < distancias[hasta]) {
        distancias[hasta] = distancias[desde] + peso;
        anteriores[hasta] = desde;
      }
    }
  }

  for (const { desde, hasta, peso } of aristas) {
    if (distancias[desde] + peso < distancias[hasta]) {
      return null; // ciclo negativo
    }
  }

  //reconstruir caminos minimos
  const caminos = {};
  for (const nodo in distancias) {
    if (nodo === inicio || distancias[nodo] === Infinity) continue;

    const camino = [];
    let actual = nodo;
    while (actual !== undefined) {
      camino.unshift(actual);
      actual = anteriores[actual];
    }

    if (camino[0] === inicio) {
      caminos[nodo] = { camino, longitudTotal: distancias[nodo] };
    }
  }

  return caminos;
}

///mensaje desde el hilo principal
onmessage = function (e) {
  const { algoritmo, listaAristas, origen, destino } = e.data;

  const grafo = {};
   //reconstruir el grafo a partir de la lista de aristas
  for (const { from, to, weight } of listaAristas) {
    const desde = String(from);
    const hasta = String(to);

    if (!grafo[desde]) grafo[desde] = [];
    grafo[desde].push({ nodo: String(hasta), peso: weight });

    if (!grafo[hasta]) grafo[hasta] = [];
    grafo[hasta].push({ nodo: String(desde), peso: weight });
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
//resultado al hilo principal
  postMessage(resultado || { camino: null });
};
