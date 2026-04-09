document.addEventListener("DOMContentLoaded", () => {

    const inputUsuario = document.getElementById("usuario");
    const inputPassword = document.getElementById("password");
    const btnIngresar = document.getElementById("btnIngresar");

    inputPassword.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            btnIngresar.click();
        }
    });

    inputUsuario.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            btnIngresar.click();
        }
    });


    btnIngresar.addEventListener("click", () => {
        const usuario = inputUsuario.value;
        const password = inputPassword.value;

        const datos = new FormData();
        datos.append("usuario", usuario);
        datos.append("clave", password);

        fetch("index.php?c=Crear&a=login", {
            method: "POST",
            body: datos
        })
            .then(res => res.json())
            .then(data => {
                //console.log("Respuesta del servidor:", data); debugger
                if (data.ok) {
                    console.log("Correcto");
                    //localStorage.setItem("rol", data.rol);
                    window.location.href = "index.php?c=Formulario&a=home";
                } else {
                    alert("Usuario o contraseña incorrectos");
                }
            })
            .catch(err => console.error("Error:", err));
    });

});
