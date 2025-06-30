import { auth } from "./config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    const consultasCambio = document.getElementById("consultas_Cambio");

    if (user) {
        document.getElementById("nav-historial").style.display = "block";
        document.getElementById("nav-cerrar").style.display = "block";
        document.getElementById("nav-sesion").style.display = "none";
        
        if (consultasCambio) {
            consultasCambio.parentElement.style.display = "block";
        }
    } else {
        document.getElementById("nav-historial").style.display = "none";
        document.getElementById("nav-cerrar").style.display = "none";
        document.getElementById("nav-sesion").style.display = "block";

        if (consultasCambio) {
            consultasCambio.parentElement.style.display = "none";
        }
    }
});

// Cerrar sesión
document.getElementById("nav-cerrar").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "/Llamaysuna/index.html";
    }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
    });
});

//Toggle menu
const btnToggle = document.getElementById("menu-toggle");
if (btnToggle) {
    btnToggle.addEventListener("click", () => {
        document.getElementById("menu").classList.toggle("open");
    });
}
