import { auth, db } from "./config.js";
import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";



onAuthStateChanged(auth, async (user) => {
    
    if (user) {
        const q = query(
            collection(db, "consultas"),
            where("uid", "==", user.uid),
            orderBy("fecha", "desc")
        );
        const querySnapshot = await getDocs(q);

        const contenedor = document.getElementById("totalConsultas");
        contenedor.innerHTML = "";

        if (querySnapshot.empty) {
            contenedor.classList.add("sin-datos");
        } else {
           contenedor.classList.remove("sin-datos");

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    
    let resultadoFormateado = "";

    if (data.algoritmo === "Bellman_Ford") {
        let resultado = data.resultado;

        resultado = resultado.replace("📍 Caminos mínimos desde el nodo origen:", "").trim();

        const partes = resultado.split("Longitud total:");

        resultadoFormateado = "<h4>📍 Caminos mínimos:</h4><ul>";

        for (let i = 0; i < partes.length - 1; i++) {
            const camino = partes[i].trim();
            const longitudPartes = partes[i + 1].trim().split(/\s+/);
            const longitud = longitudPartes[0];

            resultadoFormateado += `<li>${camino} <br><strong>Longitud total:</strong> ${longitud}</li>`;
        }

        resultadoFormateado += "</ul>";
    } else {
        // Dijkstra o A*
        const partes = data.resultado.split("Longitud total:");
        const cultivos = partes[0].replace("Cultivos a recoger:", "").trim();
        const longitud = partes[1] ? partes[1].trim() : "N/A";

        resultadoFormateado = `
            <p><strong>Cultivos a recoger:</strong> ${cultivos}</p>
            <p><strong>Longitud total:</strong> ${longitud}</p>
        `;
    }

    contenedor.innerHTML += `
      <div class="consulta-card">
        <p><strong>Origen:</strong> ${data.origen}</p>
        <p><strong>Destino:</strong> ${data.destino}</p>
        <p><strong>Algoritmo:</strong> ${data.algoritmo}</p>
        <div><strong>Resultado:</strong> ${resultadoFormateado}</div>
        <p><strong>Fecha:</strong> ${new Date(data.fecha.toDate()).toLocaleString()}</p>
      </div>
    `;
    });

    }
    }
});

