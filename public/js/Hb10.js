document.addEventListener("DOMContentLoaded", () => {
    //const btnRetroceder = document.getElementById("btnRetroceder");
    const btnRetroceder = document.querySelector(".btn-back");
    const btnCrear = document.getElementById("btnCrear");
    const peso_inicial_M511 = document.getElementById("peso_inicial_M511");
    const peso_agua_M512 = document.getElementById("peso_agua_M512");
    //const divMezcladorM511 = document.getElementById("mezclador_M511");    
    const lote = document.querySelector("div.form-group input[name='lote']");
    const fecha = document.getElementById("fecha");

    //const parDisplayProduccion = document.getElementById("displayProduccion");
    const radioMezcladorM511 = document.querySelectorAll("input[name='chk_mezclador_ok']");
    const modo = localStorage.getItem("modo");
    const radiosMezclador = document.querySelectorAll("input[name='chk_mezclador_ok']");

    // ===== VARIABLES GLOBALES =====
    let producto = localStorage.getItem("producto");                                    //hb10
    datosEdicion = JSON.parse(localStorage.getItem("datosEditables"));
    //datosTransferencia = JSON.parse(localStorage.getItem("datosTransferencia"));   

    btnRetroceder.addEventListener("click", () => {
        window.location.href = "index.php?c=Formulario&a=home";
    })

    // ===== FUNCIONES =====
    function inicializarFormulario(modo, producto, datosEdicion) {
        console.log("Inicializando formulario....");
        console.log(modo, producto, datosEdicion);                         //crear. hb10, datosEdicion

        let hoy = new Date();

        if (modo === "crear") {
            //divMezcladorM511.style.display = "block";
            let siguienteFabricacion = Math.max(datosEdicion.ultimaAcabada, datosEdicion.ultimaEnCurso) + 1;
            siguienteFabricacion = formatearMiles(siguienteFabricacion);
            lote.value = siguienteFabricacion;

            // Fecha actual en formato YYYY-MM-DD
            fecha.value = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

            onCambioAguaDosificada();
        }
    }

    function aguaDosificada() {
        return document.querySelector("input[name='chk_mezclador_ok']:checked")?.value === "1";
    }

    function onCambioAguaDosificada() {
        if (aguaDosificada()) {
            console.log("Sí");
            // Aquí tu lógica para "Sí"
        } else {
            console.log("No");
            // Aquí tu lógica para "No"
        }
    }

    radiosMezclador.forEach(radio => radio.addEventListener("change", onCambioAguaDosificada));

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
                console.log(datosEdicion);                                   //equipos (2), notas[], recetas[{..}], ultimaAcabada: 1009, ultimaEnCurso: false                

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