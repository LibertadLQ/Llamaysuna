import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCK9BxF_ylrO_lXJfshI0UmQx2b4h4enjo",
  authDomain: "llamaysuna-e5dd9.firebaseapp.com",
  projectId: "llamaysuna-e5dd9",
  storageBucket: "llamaysuna-e5dd9.firebaseapp.com",
  messagingSenderId: "103128378294",
  appId: "1:103128378294:web:4e860c7d9f1a13a82daf17"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function registerUser(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("Registro exitoso. ¡Bienvenido!");
            return userCredential.user;
        })
        .catch((error) => {
            console.error("Error al registrar:", error.code, error.message);
            alert("Error al registrar: " + error.message);
            throw error;
        });
}

export function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            console.log("Inicio de sesión exitoso. ¡Bienvenido!");
            window.location.href = "../html/consultas.html";
        })
        .catch((error) => {
            console.error("Error al iniciar sesión:", error.code, error.message);
            alert("Error al iniciar sesión: " + error.message);
        });
}
