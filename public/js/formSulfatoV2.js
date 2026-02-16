document.addEventListener("DOMContentLoaded", () => {

    const btnRetroceder = document.getElementById("btnRetroceder");
    const btnCrear = document.getElementById("btnValidar");
    const btnTransferir = document.getElementById("btnTransferir");
    const displayProduccion = document.getElementById("displayProduccion");
    const divReactores = document.getElementById("reactores");
    const peso_inicial_reactor = document.getElementById("peso_inicial_reactor");
    const peso_final_reactor = document.getElementById("peso_final_reactor");

    let reactorSeleccionado;
    let recetaSeleccionada;
    let numeroProduccion;
    let fechaHoraInicio;

    let modo = localStorage.getItem("modo");    
    producto = "Sulfato";
    let datosEdicion;    

    //btnTransferir.style.display = "none";

    // ===== INICIO ZONA DE FUNCIONES ======

    function desactivarValidaciones() {
        peso_inicial_reactor.required = false;
    }

    function mostrarModal(mensaje) {
        const modal = document.getElementById("modal");
        document.getElementById("modalMsg").textContent = mensaje;
        modal.hidden = false;
        modal.style.display = "flex";
    }

    function cerrarModal() {
        const modal = document.getElementById("modal");
        modal.hidden = true;
        modal.style.display = "none";
        window.location.href = "/HTML/public/index.php";
    }

    document.getElementById("btnAceptar").addEventListener("click", cerrarModal);

    function inicializarFormulario(modo, producto, datosEdicion = null) {
        const datos = new FormData();

        datos.append("modo", modo);
        datos.append("producto", producto);

        return fetch("/HTML/app/models/leerdatos.php", {
            method: "POST",
            body: datos
        })
        .then(response => response.json())
        .then(data => {            

            //==== Nº FABRICACION ====
            if(modo === "editar" || modo ==="transferir") {
                numeroProduccion = data.ultimaEnCurso;
                displayProduccion.innerHTML = numeroProduccion;
            } else {
                numeroProduccion = data.siguienteFabricacion;
                displayProduccion.innerHTML = numeroProduccion;
            }

            //==== REACTORES ====
            const contenedorReactores = document.querySelector("#reactores fieldset");
            contenedorReactores.innerHTML = "";
            generarRadiosReactores(data.equipos, contenedorReactores, modo, datosEdicion);

            //==== RECETAS ====
            const contenedorRecetas = document.querySelector("#recetas fieldset");
            contenedorRecetas.innerHTML = "";
            generarRadiosRecetas(data.recetas, contenedorRecetas, modo, datosEdicion);

            //==== LISTENERS ====
            document.addEventListener("change", function (e) {
                if (e.target.name === "reactor") reactorSeleccionado = e.target.value;
                if (e.target.name === "receta") recetaSeleccionada = e.target.value;
            });

            //==== VALORES INICIALES EN EDITAR ====
            if ((modo === "editar" || modo === "transferir") && datosEdicion) {
                peso_inicial_reactor.value = datosEdicion.PesoInicialReactor;
                formatearNumero(peso_inicial_reactor);
            }

            return data;
        });
    }

    function generarRadiosReactores(listaEquipos, contenedorReactores, modo, datosEdicion) {
        listaEquipos.forEach(reactor => {
            const id = "reactor_" + reactor.Equipo_id;

            const label = document.createElement("label");
            label.className = "radio-label";
            label.htmlFor = id;

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "reactor";
            input.id = id;
            input.value = reactor.Equipo_id;

            if ((modo === "editar" || modo === "transferir") && datosEdicion.Reactor == reactor.Equipo_id) {
                input.checked = true;
                reactorSeleccionado = reactor.Equipo_id;
            }

            label.appendChild(input);
            label.appendChild(document.createTextNode(reactor.Equipo_id));

            contenedorReactores.appendChild(label);
        });
    }

    function generarRadiosRecetas(listaRecetas, contenedorRecetas, modo, datosEdicion) {
        listaRecetas.forEach((receta, index) => {
            const id = `R${index + 1}_p18`;

            const label = document.createElement("label");
            label.className = "radio-label";
            label.htmlFor = id;

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "receta";
            input.id = id;
            input.value = receta.NombreReceta;

            if ((modo === "editar" || modo === "transferir" ) && datosEdicion.Receta == receta.NombreReceta) {
                input.checked = true;
                recetaSeleccionada = receta.NombreReceta;
            }

            label.appendChild(input);
            label.appendChild(document.createTextNode(receta.NombreReceta));

            contenedorRecetas.appendChild(label);
        });
    }

    function formatearNumero(input) {
        let valor = input.value.replace(/\D/g, "");
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        input.value = valor;
    }

    // ===== FIN ZONA DE FUNCIONES ======

    [peso_inicial_reactor, peso_final_reactor].forEach(input => {
        input.addEventListener("input", () => formatearNumero(input));
    });

    // ==== BOTÓN RETROCEDER ====

    btnRetroceder.addEventListener("click", () => {
        window.location.href = "/HTML/public/";
    });

    // ==== MODO CREAR ====

    if (modo === "crear") {

        console.log("Estamos en modo creación");
        const contenedorPesoFinal = document.getElementById("contenedor_peso_final");        
        contenedorPesoFinal.style.display = "none"; 

        inicializarFormulario(modo, producto)
            .then(data => {

                if (data.equipos.length > 0 && data.equipos[0].Estado === "En uso") {
                    alert("No se puede fabricar Sulfato R202 ocupado");
                    window.location.href = "/HTML/public/index.php";
                    return;
                }

                btnCrear.addEventListener("click", () => {

                    const ahora = new Date();

                    const fechaHoraInicio =
                        ahora.getFullYear() + "-" +
                        String(ahora.getMonth() + 1).padStart(2, '0') + "-" +
                        String(ahora.getDate()).padStart(2, '0') + " " +
                        String(ahora.getHours()).padStart(2, '0') + ":" +
                        String(ahora.getMinutes()).padStart(2, '0') + ":" +
                        String(ahora.getSeconds()).padStart(2, '0');

                    const reactorMarcado = document.querySelector("input[name='reactor']:checked");
                    if (reactorMarcado) reactorSeleccionado = reactorMarcado.value;

                    if (!reactorSeleccionado) {
                        alert("Por favor, selecciona un reactor");
                        return;
                    }

                    const recetaMarcada = document.querySelector("input[name='receta']:checked");
                    if (recetaMarcada) recetaSeleccionada = recetaMarcada.value;

                    if (!recetaSeleccionada) {
                        alert("Por favor, selecciona una receta");
                        return;
                    }                    

                    const pesoLimpio = peso_inicial_reactor.value.replace(/\./g, "");

                    const datosEnviar = new FormData();
                    datosEnviar.append("numeroProduccion", numeroProduccion);
                    datosEnviar.append("fechaHoraInicio", fechaHoraInicio);
                    datosEnviar.append("reactor", reactorSeleccionado);
                    datosEnviar.append("receta", recetaMarcada.value);
                    datosEnviar.append("pesoInicialReactor", pesoLimpio);

                    fetch("/HTML/app/models/insertarSulfato.php", {
                        method: "POST",
                        body: datosEnviar
                    })
                    .then(response => response.json())
                    .then(json => {                        
                        if (json.ok) mostrarModal(json.message);
                        else alert("Error: " + (json.error || "Error desconocido"));
                    });
                });
            })
            .catch(error => console.log("ERROR", error));
    }

    // ==== MODO EDITAR ====

    if (modo === "editar") {
        datosEdicion = JSON.parse(localStorage.getItem("datosEditables"));
        btnCrear.textContent = "Editar";
        const contenedorPesoFinal = document.getElementById("contenedor_peso_final");
        contenedorPesoFinal.style.display = "none"; 

        inicializarFormulario(modo, producto, datosEdicion)
            .then(() => {

                btnCrear.addEventListener("click", (e) => {                    
                    e.preventDefault();

                    const pesoReactorEditado = parseInt(peso_inicial_reactor.value.replace(/\./g, ""), 10);
                    const pesoReactorFinal = parseInt(peso_final_reactor.value.replace(/\./g, ""), 10);

                    const data = new FormData();
                    data.append("numeroProduccion", datosEdicion.NumeroFabricacion);
                    data.append("reactor", reactorSeleccionado);
                    data.append("receta", recetaSeleccionada);
                    data.append("pesoInicialReactor", pesoReactorEditado);
                    data.append("pesoFinalReactor", pesoReactorFinal);
                    data.append("producto", producto);
                    data.append("modo", modo);                    

                    fetch("../../app/models/editarFabCurso.php", {
                        method: "POST",
                        body: data
                    })
                    .then(response => response.json())
                    .then(json => {                        
                        if (json.ok) mostrarModal("Producción actualizada correctamente");
                        else alert("Error: " + json.error);                        
                    })
                    .catch(error => console.log("ERROR", error));
                });
            });
    }

    // ==== MODO TRANSFERIR ====

    if (modo === "transferir") {
    console.log("Estamos en modo transferir...");
    datosTransferir = JSON.parse(localStorage.getItem("datosEditables"));
                                console.log(datosTransferir);
    btnCrear.textContent = "Transferir";        

    inicializarFormulario(modo, producto, datosTransferir)
        .then(() => {

            btnCrear.addEventListener("click", (e) => {
                e.preventDefault();

                const PesoInicialEditado = parseInt(peso_inicial_reactor.value.replace(/\./g,""), 10);
                const PesoFinalEditado = parseInt(peso_final_reactor.value.replace(/\./g,""), 10);
                
                // === Fechas de Inicio y Final producción
                const fechaHoraInicio = datosTransferir.FechaInicio;
                
                const ahora = new Date();
                const fechaHoraFinal = ahora.getFullYear() + "-" +
                        String(ahora.getMonth() + 1).padStart(2, '0') + "-" +
                        String(ahora.getDate()).padStart(2, '0') + " " +
                        String(ahora.getHours()).padStart(2, '0') + ":" +
                        String(ahora.getMinutes()).padStart(2, '0') + ":" +
                        String(ahora.getSeconds()).padStart(2, '0');

                const data = new FormData();
                data.append("numeroProduccion", datosTransferir.NumeroFabricacion);
                data.append("reactor", reactorSeleccionado);
                data.append("receta", recetaSeleccionada);
                data.append("fechaHoraInicio", fechaHoraInicio);
                data.append("fechaHoraFinal", fechaHoraFinal);
                data.append("pesoInicialReactor", PesoInicialEditado);
                data.append("pesoFinalReactor", PesoFinalEditado);
                data.append("producto", producto);
                data.append("modo", modo);

                fetch("../../app/models/transferirFabCurso.php", {
                    method: "POST",
                    body: data
                })
                .then(response => response.json())
                .then(json => {
                    console.log(json); return;
                    if (json.ok) mostrarModal("Producción guardada en acabadas correctamente");
                    else alert("Error: " + json.error);                    
                })
                .catch(error => console.log("ERROR", error));
            });
        });
}

});