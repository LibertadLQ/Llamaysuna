import { db, auth } from "./config.js";
import { collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

let conjuntoAristasVis, red, grafo = {};

// Mostrar u ocultar botón de guardar según estado de autenticación
onAuthStateChanged(auth, (usuario) => {
  const btnGuardar = document.getElementById("consultas_Cambio");
  if (btnGuardar) {
    btnGuardar.style.display = usuario ? "inline-block" : "none";
  }
});

// Guardar consulta en Firebase
document.getElementById("consultas_Cambio").addEventListener("click", async () => {
  const origen = document.getElementById("origen").value;
  const destino = document.getElementById("destino").value;
  const algoritmo = document.getElementById("algoritmo").value;
  const resultadoTexto = document.getElementById("resultado").innerText;

  if (!origen || (algoritmo !== "Bellman_Ford" && !destino) || !resultadoTexto) {
    alert("⚠️ Primero debes calcular un camino.");
    return;
  }

  const usuario = auth.currentUser;
  if (usuario) {
    try {
      await addDoc(collection(db, "consultas"), {
        uid: usuario.uid,
        origen,
        destino: algoritmo === "Bellman_Ford" ? "No requerido" : destino,
        algoritmo,
        resultado: resultadoTexto,
        fecha: Timestamp.now()
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
  const contenedor = document.getElementById("grafo-container");

  fetch("json/compacto_graph.json")
    .then(res => res.json())
    .then(data => {
      const nodos = new vis.DataSet(
        data.nodes.map(n => ({
          id: n.id,
          label: `Nodo ${n.id}`,
          x: n.attributes.x * 5,
          y: -n.attributes.y * 5,
          fixed: true,
          size: 10
        }))
      );

      conjuntoAristasVis = new vis.DataSet(
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

      const opciones = {
        physics: false,
        nodes: { shape: "dot" },
        edges: { smooth: false }
      };

      red = new vis.Network(contenedor, { nodes: nodos, edges: conjuntoAristasVis }, opciones);
      red.fit();

      data.edges.forEach(e => {
        if (!grafo[e.source]) grafo[e.source] = [];
        grafo[e.source].push({ nodo: e.target, peso: e.weight });

        if (!grafo[e.target]) grafo[e.target] = [];
        grafo[e.target].push({ nodo: e.source, peso: e.weight });
      });
    });

  document.getElementById("algoritmo").addEventListener("change", () => {
    const algoritmo = document.getElementById("algoritmo").value;
    const inputDestino = document.getElementById("destino");

    if (algoritmo === "Bellman_Ford") {
      inputDestino.disabled = true;
      inputDestino.placeholder = "No requerido";
      inputDestino.value = "";
    } else {
      inputDestino.disabled = false;
      inputDestino.placeholder = "Ej: 5";
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
    const listaAristas = [];

    for (const desde in grafo) {
      for (const { nodo, peso } of grafo[desde]) {
        listaAristas.push({ from: desde, to: nodo, weight: peso });
      }
    }

    worker.postMessage({ algoritmo, listaAristas, origen, destino });

    worker.onmessage = (e) => {
      const resultado = e.data;
      const algoritmoSeleccionado = document.getElementById("algoritmo").value;
      const resultadoDiv = document.getElementById("resultado");
      resultadoDiv.innerHTML = "";

      conjuntoAristasVis.forEach(arista => {
        conjuntoAristasVis.update({ id: arista.id, color: "#aaa", width: 1 });
      });

      if (!resultado || (algoritmoSeleccionado !== "Bellman_Ford" && resultado.camino === null)) {
        alert("🚫 No se encontró camino.");
        return;
      }

      if (algoritmoSeleccionado === "Bellman_Ford") {
        let contenido = "<h3>📍 Caminos mínimos desde el nodo origen:</h3><ul>";

        for (const destino in resultado) {
          const { camino, longitudTotal } = resultado[destino];
          contenido += `<li><strong>${camino.join(" ➜ ")}</strong> <br> Longitud total: ${longitudTotal.toFixed(2)}</li>`;

          for (let i = 0; i < camino.length - 1; i++) {
            const desde = String(camino[i]);
            const hasta = String(camino[i + 1]);
            const arista = conjuntoAristasVis.get({
              filter: e => (String(e.from) === desde && String(e.to) === hasta) ||
                           (String(e.from) === hasta && String(e.to) === desde)
            })[0];

            if (arista) {
              conjuntoAristasVis.update({ id: arista.id, color: "#8634d9", width: 3 });
            }
          }
        }

        contenido += "</ul>";
        resultadoDiv.innerHTML = contenido;

      } else {
        const { camino, longitudTotal } = resultado;

        for (let i = 0; i < camino.length - 1; i++) {
          const desde = camino[i];
          const hasta = camino[i + 1];
          const arista = conjuntoAristasVis.get({
            filter: e => (String(e.from) === String(desde) && String(e.to) === String(hasta)) ||
                         (String(e.from) === String(hasta) && String(e.to) === String(desde))
          })[0];

          if (arista) {
            conjuntoAristasVis.update({ id: arista.id, color: "#51e891", width: 4 });
          }
        }

        resultadoDiv.innerHTML = `
          <p><strong>Cultivos a recoger:</strong> ${camino.join(" ➜ ")}</p>
          <p><strong>Longitud total:</strong> ${longitudTotal.toFixed(2)}</p>
        `;
      }
    };
  });
});
