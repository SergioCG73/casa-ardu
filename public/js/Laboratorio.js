document.addEventListener("DOMContentLoaded", () => {
    const divFormulario = document.getElementById("formulario");
    const btnFiltrado = document.getElementById("btnFiltrado");
    const lblFabricaciones = document.querySelector("label");
    const btnIngresar = document.getElementById("btnIngresar");
    const btnAceptar = document.getElementById("btnAceptar");
    const inputDensidad = document.getElementById("densidad");
    const inputRiqueza = document.getElementById("riqueza");
    const inputModal = document.getElementById("modal");
    let filtradas = "";
    let registros = [];
    let indice = 0;
    let hayFabricaciones = false;

    divFormulario.style.visibility = "hidden";
    inputModal.style.display = "none";
    lblFabricaciones.style.visibility = "hidden";

    // ===== FUNCIONES =====
    /*function mostrarModal(mensaje) {
        modalMsg.textContent = mensaje;
        inputModal.style.display = "flex";
    }

    function cerrarModal() {
        inputModal.style.display = "none";
        window.location.href = "index.php?c=Formulario&a=home";
    }*/

    function mostrarRegistros() {
        if (registros.length === 0) return;

        const r = registros[indice];

        inputDensidad.value = r.Densidad ?? "";
        inputRiqueza.value = r.Riqueza ?? "";

        // Si el registro no tiene Fabricaciones, usar las del primer fetch
        const fab = r.Fabricaciones ?? filtradas;

        lblFabricaciones.innerHTML = "Fabricaciones: " + fab;
    }

    function limpiarFormulario() {
        inputDensidad.value = "";
        inputRiqueza.value = "";
    }

    btnAceptar.addEventListener("click", cerrarModal);

    btnAnterior.addEventListener("click", () => {

        // Si estamos en formulario vacío → ir al último registro
        if (indice === registros.length) {
            indice = registros.length - 1;
            mostrarRegistros();
            return;
        }

        // Si estamos en el primer registro → no hacer nada
        if (indice === 0) return;

        // Retroceder normalmente
        indice--;
        mostrarRegistros();
    });


    btnSiguiente.addEventListener("click", () => {

        // Si estamos en el último registro → pasar a formulario vacío
        if (indice === registros.length - 1) {
            indice = registros.length;   // posición "nuevo registro"
            limpiarFormulario();
            lblFabricaciones.innerHTML = "Fabricaciones: " + filtradas;
            return;
        }

        // Si estamos en el formulario vacío → NO hacer nada
        if (indice === registros.length) {
            return;
        }

        // Si estamos en un registro normal → avanzar
        indice++;
        mostrarRegistros();
    });

    btnFiltrado.addEventListener("click", () => {
        divFormulario.style.visibility = "visible";
        lblFabricaciones.style.visibility = "visible";

        fetch("index.php?c=Leer&a=leerFiltrado", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "modo=inicial"
        })
            .then(response => response.json())
            .then(json => {
                console.log(json.M216); debugger
                // Si no hay fabricaciones 
                if (!Array.isArray(json.M216) || json.M216 === "Nada que filtrar" || json.M216.length === 0) {
                    hayFabricaciones = false;
                    filtradas = "";
                    lblFabricaciones.innerHTML = "Fabricaciones: ";
                    return fetch("index.php?c=Leer&a=leerfiltradas");
                }

                // Sí hay fabricaciones
                hayFabricaciones = true;

                let fabricaciones = json.M216
                    .filter(f => f.NumeroFabricacion !== "0000")
                    .map(f => f.NumeroFabricacion)
                    .sort((a, b) => Number(a) - Number(b));

                if (json.M216.some(f => f.NumeroFabricacion === "0000")) {
                    fabricaciones.push("Restos");
                }

                filtradas = fabricaciones.join(" + ");
                lblFabricaciones.innerHTML = "Fabricaciones: " + filtradas;

                return fetch("index.php?c=Leer&a=leerfiltradas");
            })
            .then(r => r.json())
            .then(json => {

                registros = json.filtradas;

                if (json.activa) registros.push(json.activa);

                indice = registros.length - 1;

                limpiarFormulario();

                if (registros.length > 0) {
                    mostrarRegistros();
                }
            });
    });

    btnIngresar.addEventListener("click", () => {

        if (!hayFabricaciones) {
            alert("No hay fabricaciones pendientes. No se puede ingresar.");
            return;
        }
        
        const datos = new FormData();

        datos.append("densidad", Number(inputDensidad.value));
        datos.append("riqueza", Number(inputRiqueza.value));
        datos.append("filtradas", filtradas);
        datos.append("modo", "laboratorio");

        const objeto = Object.fromEntries(datos.entries());
        objeto.densidad = Number(objeto.densidad);
        objeto.riqueza = Number(objeto.riqueza);

        //console.log(objeto); debugger
        //console.log("densidad:", objeto.densidad, "tipo:", typeof objeto.densidad);
        //console.log("riqueza:", objeto.riqueza, "tipo:", typeof objeto.riqueza);

        fetch("index.php?c=Crear&a=filtrado", {
            method: "POST",
            body: datos
        })
            .then(response => response.json())
            .then(json => {
                console.log(json);
                if (json.ok) mostrarModal(json.message);
                else alert(json.error);

            })
    })
});