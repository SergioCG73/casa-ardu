document.addEventListener("DOMContentLoaded", () => {
    
    const inputUsuario = document.getElementById("usuario");
    const inputPassword = document.getElementById("password");
    const btnIngresar = document.getElementById("btnIngresar");

    btnIngresar.addEventListener("click", () => {
        const usuario = inputUsuario.value;
        const password = inputPassword.value;

        const datos = new FormData();
        datos.append("usuario", usuario);
        datos.append("password", password);

        fetch("index.php?c=Crear&a=login", {
            method: "POST",
            body: datos
        })
        .then(res => res.text())
        .then(data => {
            console.log("Respuesta del servidor:", data);
        })
        .catch(err => console.error("Error:", err));
    });

});
