document.addEventListener("DOMContentLoaded", () => {
    const btnRetroceder = document.getElementById("btnRetroceder");
    const btnCrear = document.getElementById("btnCrear");
    const peso_inicial_M411 = document.getElementById("peso_inicial_M411");
    const peso_agua_M411 = document.getElementById("peso_agua_M411");
    const divMezcladorM411 = document.getElementById("mezclador_M411");
    const parDisplayProduccion = document.getElementById("displayProduccion");
    const modo = localStorage.getItem("modo");

    // ===== VARIABLES GLOBALES =====

    let producto = localStorage.getItem("producto");            //hb10
    datosEdicion = JSON.parse(localStorage.getItem("datosEditables"));
    datosTransferencia = JSON.parse(localStorage.getItem("datosTransferencia"));

    divMezcladorM411.style.display = "none";

    btnRetroceder.addEventListener("click", () => {
        window.location.href = "index.php?c=Formulario&a=home";
    })


    // ===== FUNCIONES =====

    function inicializarFormulario(modo, producto, datosEdicion) {
        console.log("Inicializando formulario....");
        console.log(modo, producto, datosEdicion);
        
    }

    // === MODO CREAR ===
    if (modo === "crear") {
        console.log("Modo crear...");

        const datos = new FormData();
        datos.append("producto", producto);
        datos.append("modo", modo);

        return fetch("index.php?c=Leer&a=leerHB10", {
            method: "POST",
            body: datos
        })
            .then(response => response.json())
            .then(json => {
                datosEdicion = json;
                console.log(datosEdicion);                   //equipos (2), notas[], recetas[{..}], ultimaAcabada: 1009, ultimaEnCurso: false                

                if (datosEdicion.ok) {
                    console.log("datosEdicion.ok");
                } else {
                    alert("Error: " + datosEdicion.error);
                }

                return inicializarFormulario(modo, producto, datosEdicion);
            })
            .catch(error => console.log("Error: ", error));
    }

    // === MODO EDITAR ===



})