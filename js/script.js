import { db, auth } from "./config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

let visEdges, network, grafo = {};

// Mostrar/ocultar botón de guardar según estado de autenticación
onAuthStateChanged(auth, (user) => {
  const btnGuardar = document.getElementById("consultas_Cambio");
  if (btnGuardar && btnGuardar.parentElement) {
    btnGuardar.parentElement.style.display = user ? "block" : "none";
  }
});

// Guardar consulta en Firebase
document.getElementById("consultas_Cambio").addEventListener("click", async () => {
  const origen = document.getElementById("origen").value;
  const destino = document.getElementById("destino").value;
  const algoritmo = document.getElementById("algoritmo").value;
  const resultadoTexto = document.getElementById("resultado").innerText;

  if (!origen || !destino || !resultadoTexto) {
    alert("⚠️ Primero debes calcular un camino.");
    return;
  }

  const user = auth.currentUser;
  if (user) {
    try {
      await addDoc(collection(db, "consultas"), {
        uid: user.uid,
        origen,
        destino,
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

function recortarGrafo(grafo, origen) {
  const visitados = new Set();
  const cola = [origen];
  const subgrafo = {};

  while (cola.length) {
    const actual = cola.shift();
    if (visitados.has(actual)) continue;
    visitados.add(actual);

    const vecinos = grafo[actual] || [];
    subgrafo[actual] = vecinos;

    vecinos.forEach((v) => {
      if (!visitados.has(v.node)) cola.push(v.node);
    });
  }

  return subgrafo;
}

window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("grafo-container");

  fetch("json/grafo.json")
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

      // Preparar estructura de grafo
      data.edges.forEach(e => {
        if (!grafo[e.source]) grafo[e.source] = [];
        grafo[e.source].push({ node: e.target, weight: e.weight });
      });
    });

  document.getElementById("btn-calcular").addEventListener("click", () => {
    const origen = document.getElementById("origen").value;
    const destino = document.getElementById("destino").value;
    const algoritmo = document.getElementById("algoritmo").value;

    if (!origen || !destino || !grafo[origen]) {
      alert("⚠️ Verifica los nodos ingresados.");
      return;
    }

    document.getElementById("resultado").innerText = "⏳ Calculando...";
    const subgrafo = recortarGrafo(grafo, origen);

    const worker = new Worker("js/algoritmos.js");
    worker.postMessage({ algoritmo, grafo: subgrafo, origen, destino });

    worker.onmessage = (e) => {
      const resultado = e.data;
      if (!resultado || !resultado.path) {
        alert("🚫 No se encontró camino.");
        document.getElementById("resultado").innerText = "";
        return;
      }

      const { path, cost: costoTotal } = resultado;

      // Resetear estilos
      visEdges.forEach(edge => {
        visEdges.update({ id: edge.id, color: "#aaa", width: 1 });
      });

      // Pintar camino encontrado
      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];
        const edge = visEdges.get({
          filter: (e) =>
            (e.from === from && e.to === to) ||
            (e.from === to && e.to === from)
        })[0];

        if (edge) {
          visEdges.update({ id: edge.id, color: "#e91e63", width: 4 });
        }
      }

      document.getElementById("resultado").innerHTML = `
        <p><strong>🔗 Cultivos a recoger:</strong> ${path.join(" ➜ ")}</p><br>
        <p><strong> Longitud total:</strong> ${costoTotal}</p>
      `;
    };
  });
});
