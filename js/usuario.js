import { registerUser, loginUser } from "./config.js";

document.addEventListener('DOMContentLoaded', function() {
    //botones y formularios
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    //inputs de contraseñas
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    const loginPassword = document.getElementById('loginPassword');
    const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
    const registerPassword = document.getElementById('registerPassword');

    //mostrar login por defecto
    loginForm.style.display = "flex";

    //cambio entre formularios
    loginBtn.addEventListener('click', () => {
        loginForm.style.display = "flex";
        registerForm.style.display = "none";
        loginBtn.classList.add('btn-inactive');
        registerBtn.classList.remove('btn-inactive');
    });

    registerBtn.addEventListener('click', () => {
        loginForm.style.display = "none";
        registerForm.style.display = "flex";
        registerBtn.classList.add('btn-inactive');
        loginBtn.classList.remove('btn-inactive');
    });

    //mostrar/Ocultar contraseña - Login
    toggleLoginPassword.addEventListener('click', () => {
        const type = loginPassword.type === 'password' ? 'text' : 'password';
        loginPassword.type = type;
        toggleLoginPassword.classList.toggle('bi-eye');
        toggleLoginPassword.classList.toggle('bi-eye-slash-fill');
    });

    //mostrar/Ocultar contraseña - Registro
    toggleRegisterPassword.addEventListener('click', () => {
        const type = registerPassword.type === 'password' ? 'text' : 'password';
        registerPassword.type = type;
        toggleRegisterPassword.classList.toggle('bi-eye');
        toggleRegisterPassword.classList.toggle('bi-eye-slash-fill');
    });

    //enviar formulario de registro
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        if (email && password) {
            registerUser(email, password)
                .then(() => {
                    registerForm.reset();
                    console.log("Registro exitoso. ¡Bienvenido!");
                    window.location.href = '../html/consultas.html';
                })
                .catch((error) => {
                    console.error(error);
                    alert(`Error: ${error.message}`);
                });
        } else {
            alert('Por favor, completa todos los campos.');
        }
    });

    //enviar formulario de inicio de sesion
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (email && password) {
            loginUser(email, password)
                .then(() => {
                    loginForm.reset();
                    console.log("Inicio de sesión exitoso");
                })
                .catch((error) => {
                    alert(`Error: ${error.message}`);
                });
        } else {
            alert('Por favor, completa todos los campos.');
        }
    });

    document.body.classList.add('fade-in-active');
});
