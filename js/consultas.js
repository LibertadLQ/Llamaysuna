import { auth, db } from "./config.js";
import { onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";



onAuthStateChanged(auth, async (user) => {
    if (user) {
        const q = query(collection(db, "consultas"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const contenedor = document.getElementById("totalConsultas");
        contenedor.innerHTML = "";

        if (querySnapshot.empty) {
  contenedor.classList.add("sin-datos");
} else {
  contenedor.classList.remove("sin-datos");

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    contenedor.innerHTML += `
      <div class="consulta-card">
        <p><strong>Origen:</strong> ${data.origen}</p>
        <p><strong>Destino:</strong> ${data.destino}</p>
        <p><strong>Algoritmo:</strong> ${data.algoritmo}</p>
        <p><strong>Resultado:</strong> ${data.resultado}</p>
        <p><strong>Fecha:</strong> ${new Date(data.fecha.toDate()).toLocaleString()}</p>
      </div>
    `;
  });
}
    }
});

