document.addEventListener("DOMContentLoaded", () => {
    const btnRetroceder = document.getElementById("btnRetroceder");
    const btnCrear = document.getElementById("btnCrear");
    const peso_inicial_M411 = document.getElementById("peso_inicial_M411");
    const peso_agua_M411 = document.getElementById("peso_agua_M411");
    const divMezcladorM411 = document.getElementById("mezclador_M411");
    const parDisplayProduccion = document.getElementById("displayProduccion");

    // ===== VARIABLES GLOBALES =====

    const modo = localStorage.getItem("modo");
    let producto = localStorage.getItem("producto");
    datosEdicion = JSON.parse(localStorage.getItem("datosEditables"));
    datosTransferencia = JSON.parse(localStorage.getItem("datosTransferencia"));
    divMezcladorM411.style.display = "none";

    btnRetroceder.addEventListener("click", () => {
        window.location.href = "index.php?c=Formulario&a=home";
    })


    // ===== FUNCIONES =====

    function inicializarFormulario(modo, producto) {
        console.log("Inicializando formulario....");
        console.log(modo, producto);

        const formData = new FormData();
        formData.append("producto", "hb10");
        formData.append("modo", modo);

        return fetch("index.php?c=Leer&a=leerHB10", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                numeroProduccion = Math.max(...Object.values(data).filter(v => typeof v === "number"));
                console.log("Fabricacion nº", numeroProduccion);
                console.log("Equipos", data.equipos);
                return data;
            }
            )

        
    }
    

    if (modo === "crear") {
        console.log("Modo crear...");
        inicializarFormulario(modo, producto)
            .then(() => {
                // === NUMERO PRODUCCION === //
                parDisplayProduccion.textContent = numeroProduccion;

                // === ESTADO EQUIPOS === //
                if (data.equipos.M512 === "vacio") {
                    console.log("M512 Vacio");
                }

            })
    }



})