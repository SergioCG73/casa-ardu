document.addEventListener("DOMContentLoaded", () => {
    const btnRetroceder = document.getElementById("btnRetroceder");
    const btnCrear = document.getElementById("btnCrear");
    const btnTransferir = document.getElementById("btnTransferir");
    const displayProduccion = document.getElementById("displayProduccion");
    const peso_inicial_mezclador = document.getElementById("peso_inicial_mezclador");
    const peso_final_mezclador = document.getElementById("peso_final_mezclador");
    const txtNotas = document.getElementById("txtnotas"); //<textarea>    
    let sacas = document.querySelector(".sacas");

    let recetaSeleccionada;
    let numeroProduccion;
    let fechaHoraInicio;
    let mezcladorSeleccionado;
    let modo = localStorage.getItem("modo");
    let datosEdicion;
    let valNotas;

    producto = "Ferrico";

    // ===== INICIO ZONA DE FUNCIONES ======

    function desactivarValidaciones() {
        peso_inicial_mezclador.required = false;
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
        window.location.href = "index.php";
    }

    document.getElementById("btnAceptar").addEventListener("click", cerrarModal);

    function generarRadiosMezcladores(listaMezcladores, contenedorMezcladores, modo) {
        //console.log(listaMezcladores); debugger
        listaMezcladores.forEach(mezclador => {
            const id = "mezclador_" + mezclador.Equipo_id;

            const label = document.createElement("label");
            label.className = "radio-label";
            label.htmlFor = id;

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "mezclador";
            input.id = id;
            input.value = mezclador.Equipo_id;

            //console.log(listaMezcladores); debugger

            if (mezclador.Estado === "En uso") {
                input.checked = true;
                mezcladorSeleccionado = mezclador.Equipo_id;
            }

            label.appendChild(input);
            label.appendChild(document.createTextNode(mezclador.Equipo_id));

            contenedorMezcladores.appendChild(label);
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

            if ((modo === "editar" || modo === "transferir") && datosEdicion.Receta == receta.NombreReceta) {
                input.checked = true;
                recetaSeleccionada = receta.NombreReceta;
            }

            label.appendChild(input);
            label.appendChild(document.createTextNode(receta.NombreReceta));

            contenedorRecetas.appendChild(label);
        });
    }

    function inicializarFormulario(modo, producto, datosEdicion = null) {
        const datos = new FormData();
        datos.append("modo", modo);
        datos.append("producto", producto);

        return fetch("index.php?c=Leer&a=leerferrico", {
            method: "POST",
            body: datos
        })
            .then(response => response.json())
            .then(data => { 

                if (modo === "editar") {
                    data.notas = datosEdicion.Notas;
                }

                //console.log(datosEdicion); debugger
                
                numeroProduccion = (modo === "editar" || modo === "transferir")
                    ? data.ultimaAcabada
                    : data.siguienteFabricacion;

                //data.ultimaEnCurso = Number(data.ultimaEnCurso);

                // ==== VALOR INICIAL DEL CHECKBOX ====
                if (data.sacas && data.sacas.Sacas == 1) {
                    sacas.checked = true;
                } else {
                    sacas.checked = false;
                }

                if (modo === "crear") {
                    numeroProduccion = Math.max(data.ultimaAcabada, data.ultimaEnCurso) + 1;
                }

                displayProduccion.textContent = numeroProduccion;
                numeroProduccionActual = numeroProduccion + 1;

                //==== MEZCLADORES ====
                const contenedorMezcladores = document.querySelector("#mezcladores .radio-group");
                const contenedorPesoFinal = document.querySelector("#mezcladores .peso-final");

                //[contenedorMezcladores, contenedorPesoFinal].forEach(c => c.innerHTML = "");

                contenedorMezcladores.innerHTML = "";

                if (modo !== "transferir") {
                    contenedorPesoFinal.innerHTML = "";
                }

                //console.log(data); debugger

                generarRadiosMezcladores(data.mezcladores, contenedorMezcladores, modo);

                //==== RECETAS ====                
                const contenedorRecetas = document.querySelector("#recetas .radio-group");
                contenedorRecetas.innerHTML = "";                

                generarRadiosRecetas(data.recetas, contenedorRecetas, modo, datosEdicion);

                //==== LISTENERS ====
                document.addEventListener("change", function (e) {
                    if (e.target.name === "mezclador") mezcladorSeleccionado = e.target.value;
                    if (e.target.name === "receta") recetaSeleccionada = e.target.value;
                    if (e.target.name === "sacas") sacas.value = e.target.checked ? 1 : 0;
                });

                //==== VALORES INICIALES EN EDITAR ====

                if (modo === "editar" && datosEdicion) {
                    peso_inicial_mezclador.value = datosEdicion.PesoInicialMezclador;
                    formatearNumero(peso_inicial_mezclador);
                }

                if (modo === "transferir" && datosTransferir) {
                    peso_inicial_mezclador.value = datosTransferir.PesoInicialMezclador; // ✔️ CORRECTO
                    formatearNumero(peso_inicial_mezclador);
                }

                valNotas = txtNotas.textContent;                                

                if (data.notas !== null || data.notas !== "") {
                    txtNotas.textContent = data.notas;
                } 

                if (modo === "transferir") {                    
                    txtNotas.textContent = datosTransferir.Notas;                    
                }

                return data;
            });
    }

    function formatearNumero(input) {
        let valor = input.value.replace(/\D/g, "");
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        input.value = valor;
    }

    // ===== FIN ZONA DE FUNCIONES ======

    [peso_inicial_mezclador, peso_final_mezclador].forEach(input => {
        input.addEventListener("input", () => formatearNumero(input));
    });

    // ==== BOTÓN RETROCEDER ====

    btnRetroceder.addEventListener("click", () => {
        window.location.href = "index.php";
    });

    // ==== MODO CREAR ====
    if (modo === "crear") {
        console.log("Estamos en modo creación");
        const contenedorPesoFinal = document.getElementById("peso_final_mezclador");
        contenedorPesoFinal.style.display = "none";

        inicializarFormulario(modo, producto)
            .then(data => {                
                //console.log(data); debugger  

                btnCrear.addEventListener("click", () => {

                    console.log("click en crear");
                    const PesoInicialMezclador = peso_inicial_mezclador.value.replace(/\./g, "");

                    if (PesoInicialMezclador === "") {
                        alert("Introduzca un peso inicial para el mezclador");
                        return;
                    }

                    const ahora = new Date();

                    const fechaHoraInicio =
                        ahora.getFullYear() + "-" +
                        String(ahora.getMonth() + 1).padStart(2, '0') + "-" +
                        String(ahora.getDate()).padStart(2, '0') + " " +
                        String(ahora.getHours()).padStart(2, '0') + ":" +
                        String(ahora.getMinutes()).padStart(2, '0') + ":" +
                        String(ahora.getSeconds()).padStart(2, '0');

                    const mezcladorMarcado = document.querySelector("input[name='mezclador']:checked");
                    if (mezcladorMarcado) mezcladorSeleccionado = mezcladorMarcado.value;

                    if (!mezcladorSeleccionado) {
                        alert("Por favor, selecciona un mezclador");
                        return;
                    }

                    const recetaMarcada = document.querySelector("input[name='receta']:checked");
                    if (recetaMarcada) recetaSeleccionada = recetaMarcada.value;

                    if (!recetaSeleccionada) {
                        alert("Por favor, selecciona una receta");
                        return;
                    }

                    const pesoLimpio = peso_inicial_mezclador.value.replace(/\./g, "");

                    //console.log(sacas.value); debugger                    

                    const datosEnviar = new FormData();
                    datosEnviar.append("numeroProduccion", numeroProduccion);
                    datosEnviar.append("fechaHoraInicio", fechaHoraInicio);
                    datosEnviar.append("mezclador", mezcladorSeleccionado);
                    datosEnviar.append("receta", recetaMarcada.value);
                    datosEnviar.append("pesoInicialMezclador", pesoLimpio);
                    datosEnviar.append("notas", txtNotas.value);
                    datosEnviar.append("sacas", sacas.checked ? 1 : 0);

                    /*const objeto = Object.fromEntries(datosEnviar.entries());
                    console.log(objeto); debugger*/

                    fetch("index.php?c=Crear&a=fabricacionFerrico", {
                        method: "POST",
                        body: datosEnviar
                    })
                        .then(response => response.json())
                        .then(json => {
                            console.log(json); debugger
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
        //console.log(datosEdicion); debugger  datosEdicion.Notas
        btnCrear.textContent = "Editar";
        const contenedorPesoFinal = document.querySelector(".peso-final");
        contenedorPesoFinal.innerHTML = "";

        inicializarFormulario(modo, producto, datosEdicion)
            .then(() => {
                btnCrear.addEventListener("click", (e) => {
                    e.preventDefault();
                    const pesoMezcladorEditado = parseInt(peso_inicial_mezclador.value.replace(/\./g, ""), 10);
                    const pesoMezcladorFinal = parseInt(peso_final_mezclador.value.replace(/\./g, ""), 10);

                    const data = new FormData();
                    data.append("numeroProduccion", datosEdicion.NumeroFabricacion);
                    data.append("mezclador", mezcladorSeleccionado);
                    data.append("receta", recetaSeleccionada);
                    data.append("pesoInicialMezclador", pesoMezcladorEditado);
                    data.append("pesoFinalMezclador", pesoMezcladorFinal);
                    data.append("producto", producto);
                    data.append("notas", txtNotas.value);
                    data.append("sacas", sacas.checked ? 1 : 0);
                    data.append("modo", modo);

                    const objeto = Object.fromEntries(data.entries());
                    console.log(objeto); debugger

                    fetch("index.php?c=Editar&a=fabCurso", {
                        method: "POST",
                        body: data
                    })
                        .then(response => response.json())
                        .then(json => {
                            //console.log(json); debugger
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
        //console.log(datosTransferir); debugger        
        const contenedorPesoFinal = document.querySelector("#mezcladores .peso-final");

        btnCrear.textContent = "Transferir";

        inicializarFormulario(modo, producto, datosTransferir)
            .then(() => {
                contenedorPesoFinal.style.display = "block";
                btnCrear.addEventListener("click", (e) => {
                    e.preventDefault();

                    const PesoInicialEditado = parseInt(peso_inicial_mezclador.value.replace(/\./g, ""), 10);
                    const PesoFinalEditado = parseInt(peso_final_mezclador.value.replace(/\./g, ""), 10);

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
                    data.append("mezclador", mezcladorSeleccionado);
                    data.append("receta", recetaSeleccionada);
                    data.append("fechaHoraInicio", fechaHoraInicio);
                    data.append("fechaHoraFinal", fechaHoraFinal);
                    data.append("pesoInicialMezclador", PesoInicialEditado);
                    data.append("pesoFinalMezclador", PesoFinalEditado);
                    data.append("notas", txtNotas.value);
                    data.append("producto", producto);
                    data.append("modo", modo);

                    const objeto = Object.fromEntries(data.entries());
                    console.log(objeto); debugger

                    fetch("index.php?c=Transferir&a=transferirFerrico", {
                        method: "POST",
                        body: data
                    })
                        .then(response => response.json())
                        .then(json => {
                            console.log(json); debugger
                            if (json.ok) mostrarModal("Producción guardada en acabadas correctamente");
                            else alert("Error: " + json.error);
                        })
                        .catch(error => console.log("ERROR", error));
                });
            });
    }

});