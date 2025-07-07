import { db, auth } from "./config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

let visEdges, network, grafo = {};

//mostrar/ocultar el boton de guardar segun estado de autenticación
onAuthStateChanged(auth, (user) => {
  const btnGuardar = document.getElementById("consultas_Cambio");
  if (btnGuardar) {
    btnGuardar.style.display = user ? "inline-block" : "none";
  }
});


//guardar consulta en Firebase
document.getElementById("consultas_Cambio").addEventListener("click", async () => {
  const origen = document.getElementById("origen").value;
  const destino = document.getElementById("destino").value;
  const algoritmo = document.getElementById("algoritmo").value;
  const resultadoTexto = document.getElementById("resultado").innerText;

  if (!origen || (algoritmo !== "Bellman_Ford" && !destino) || !resultadoTexto) {
    alert("⚠️ Primero debes calcular un camino.");
    return;
  }

  const user = auth.currentUser;
  if (user) {
    try {
      await addDoc(collection(db, "consultas"), {
        uid: user.uid,
        origen,
        destino: algoritmo === "Bellman_Ford" ? "No requerido" : destino,
        algoritmo,
        resultado: resultadoTexto,
        fecha: new Date()
      });
      alert("✅ Consulta guardada exitosamente.");
    } catch (error) {
      console.error("Error al guardar consulta:", error);
      alert("❌ Error al guardar.");
    }
  } else {
    alert("⚠️ Debes iniciar sesión para guardar.");
  }
});


window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("grafo-container");

  fetch("json/compacto_graph.json")
    .then(res => res.json())
    .then(data => {
      const nodes = new vis.DataSet(
        data.nodes.map(n => ({
          id: n.id,
          label: `Nodo ${n.id}`,
          x: n.attributes.x * 5,
          y: -n.attributes.y * 5,
          fixed: true,
          size: 10
        }))
      );

      visEdges = new vis.DataSet(
        data.edges.map((e, i) => ({
          id: `${e.source}-${e.target}-${i}`,
          from: e.source,
          to: e.target,
          label: `${e.weight}`,
          font: { align: "top", size: 10 },
          color: { color: "#aaa" },
          width: 1
        }))
      );

      const options = {
        physics: false,
        nodes: { shape: "dot" },
        edges: { smooth: false }
      };

      network = new vis.Network(container, { nodes, edges: visEdges }, options);
      network.fit();

      data.edges.forEach(e => {
    if (!grafo[e.source]) grafo[e.source] = [];
    grafo[e.source].push({ node: e.target, weight: e.weight });

    if (!grafo[e.target]) grafo[e.target] = [];
    grafo[e.target].push({ node: e.source, weight: e.weight });
    });

    });

    document.getElementById("algoritmo").addEventListener("change", () => {
  const algoritmo = document.getElementById("algoritmo").value;
  const destinoInput = document.getElementById("destino");

  if (algoritmo === "Bellman_Ford") {
    destinoInput.disabled = true;
    destinoInput.placeholder = "No requerido";
    destinoInput.value = ""; 
  } else {
    destinoInput.disabled = false;
    destinoInput.placeholder = "Ej: 5";
  }
});


    

  document.getElementById("btn-calcular").addEventListener("click", () => {
    const origen = document.getElementById("origen").value;
    const destino = document.getElementById("destino").value;
    const algoritmo = document.getElementById("algoritmo").value;

    if (!origen || !grafo[origen]) {
    alert("⚠️ Verifica el nodo de origen.");
    return;
  }

  if (algoritmo !== "Bellman_Ford" && !destino) {
    alert("⚠️ Verifica el nodo destino.");
    return;
  }
  

    document.getElementById("resultado").innerText = "⏳ Calculando...";

    const worker = new Worker("js/algoritmos.js");
   // Extraer lista de aristas planas
const edgesList = [];
for (const from in grafo) {
  for (const { node, weight } of grafo[from]) {
    edgesList.push({ from, to: node, weight });
  }
}

worker.postMessage({ algoritmo, edgesList, origen, destino });


    worker.onmessage = (e) => {
  const resultado = e.data;
  const algoritmoSeleccionado = document.getElementById("algoritmo").value;
  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerHTML = "";

  // Resetear estilos del grafo
  visEdges.forEach(edge => {
    visEdges.update({ id: edge.id, color: "#aaa", width: 1 });
  });

  if (!resultado || (algoritmoSeleccionado !== "Bellman_Ford" && resultado.path === null)) {
    alert("🚫 No se encontró camino.");
    return;
  }


  if (algoritmoSeleccionado === "Bellman_Ford") {
  // TODOS los caminos desde el origen
  let contenido = "<h3>📍 Caminos mínimos desde el nodo origen:</h3><ul>";
  let contenido2 = "";  

  for (const destino in resultado) {
    const { path, cost } = resultado[destino];
    contenido2 += `<li><strong>${path.join(" ➜ ")}</strong> <br> Longitud total: ${cost.toFixed(2)}</li>`;

    // 🔷 Resaltar en el grafo
    for (let i = 0; i < path.length - 1; i++) {
      const from = String(path[i]);
      const to = String(path[i + 1]);
      const edge = visEdges.get({
        filter: (e) =>
          (String(e.from) === from && String(e.to) === to) ||
          (String(e.from) === to && String(e.to) === from)
      })[0];

      if (edge) {
        visEdges.update({ id: edge.id, color: "#8634d9", width: 3 }); //morado
      }
    }
  }

  contenido += "</ul>";
  resultadoDiv.innerHTML = contenido;
} else {
    // ✅ Dijkstra o A*
    const { path, cost: costoTotal } = resultado;

    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      const edge = visEdges.get({
  filter: (e) =>
    (String(e.from) === String(from) && String(e.to) === String(to)) ||
    (String(e.from) === String(to) && String(e.to) === String(from))
})[0];


      if (edge) {
        visEdges.update({ id: edge.id, color: "#51e891", width: 4 }); //verde
      }
    }

    resultadoDiv.innerHTML = `
      <p><strong>Cultivos a recoger:</strong> ${path.join(" ➜ ")}</p>
      <p><strong>Longitud total:</strong> ${costoTotal.toFixed(2)}</p>
    `;
  }
};

  });
});
