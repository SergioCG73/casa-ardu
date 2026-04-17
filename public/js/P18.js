document.addEventListener("DOMContentLoaded", () => {
    // ===== ELEMENTOS DEL DOM =====
    const btnRetroceder = document.getElementById("btnRetroceder");
    const btnCrear = document.getElementById("btnCrear");
    const parDisplayProduccion = document.getElementById("displayProduccion");
    const peso_inicial_mezclador = document.getElementById("peso_inicial_mezclador"); //<input>  9/283/296/306/327/345/421/430/568
    const peso_final_mezclador = document.getElementById("peso_final_mezclador"); //<input>
    const peso_inicial_reactor = document.getElementById("peso_inicial_reactor"); //<input>
    const peso_final_reactor = document.getElementById("peso_final_reactor"); //<input>
    const txtNotas = document.getElementById("txtnotas"); //<textarea>

    // ===== VARIABLES GLOBALES =====
    let datosEdicion;
    let datosTransferencia;
    let mezcladorSeleccionado;
    let recetaSeleccionada;
    let reactorSeleccionado;
    let numeroProduccion;
    let numeroProduccionActual = null;
    let fechaHoraFinal;

    const modo = localStorage.getItem("modo");
    let producto = localStorage.getItem("producto");
    datosEdicion = JSON.parse(localStorage.getItem("datosEditables"));
    datosTransferencia = JSON.parse(localStorage.getItem("datosTransferencia"));

    // ===== FUNCIONES =====
    /* function mostrarModal(mensaje) {
         const modal = document.getElementById("modal");
         document.getElementById("modalMsg").textContent = mensaje;
         modal.hidden = false;
         modal.style.display = "flex";
     }
 
     function cerrarModal() {
         const modal = document.getElementById("modal");
         modal.hidden = true;
         modal.style.display = "none";
         //window.location.href = "index.php";
         window.location.href = "index.php?c=Formulario&a=home";
     }    
 
     document.getElementById("btnAceptar").addEventListener("click", cerrarModal);
 
     function formatearNumero(input) {
         let valor = input.value;
         if (valor == null) return;
         valor = String(valor).replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
         input.value = valor;
         return valor;
     }*/

    document.getElementById("btnAceptar").addEventListener("click", cerrarModal);

    function generarRadiosMezcladores(mezcladores, datosEdicion, modo) {
        mezcladores = mezcladores.filter(m => m.Tipo === "Mezclador");

        const contenedorMezcladores = document.querySelector("#mezcladores .radio-group");
        contenedorMezcladores.innerHTML = "";

        mezcladores.forEach(mezclador => {
            const id = "mezclador_" + mezclador.Equipo_id;
            const label = document.createElement("label");
            label.className = "radio-label";
            label.htmlFor = id;

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "mezclador";
            input.id = id;
            input.value = mezclador.Equipo_id;

            // 1) Si es el reactor anterior → seleccionado + deshabilitado
            if (datosEdicion && datosEdicion.Mezclador == mezclador.Equipo_id) {
                input.checked = true;
                input.disabled = true;
                mezcladorSeleccionado = mezclador.Equipo_id;
                label.classList.add("mezclador-disabled");
            }

            input.addEventListener("change", () => {
                mezcladorSeleccionado = input.value;
                console.log(mezcladorSeleccionado);
            });

            label.appendChild(input);
            label.appendChild(document.createTextNode(mezclador.Equipo_id));
            contenedorMezcladores.appendChild(label);
        });
    }

    function generarRadiosReactores(reactores, datosEdicion) {
        const contenedorReactores = document.querySelector("#reactores .radio-group");
        contenedorReactores.innerHTML = "";

        reactores
            .filter(r => r.Estado.trim().toLowerCase() !== "averiado")
            .forEach(reactor => {

                const estado = reactor.Estado.trim().toLowerCase();
                const id = "reactor_" + reactor.Equipo_id;

                const label = document.createElement("label");
                label.className = "radio-label";
                label.htmlFor = id;

                const input = document.createElement("input");
                input.type = "radio";
                input.name = "reactor";
                input.id = id;
                input.value = reactor.Equipo_id;

                // 1) Si es el reactor anterior → seleccionado + deshabilitado
                if (datosEdicion && datosEdicion.Reactor == reactor.Equipo_id) {
                    input.checked = true;
                    input.disabled = true;
                    reactorSeleccionado = reactor.Equipo_id;
                    label.classList.add("reactor-disabled");
                }

                // 2) Si está en uso → deshabilitado SIEMPRE
                if (estado === "En uso") { //"en uso"
                    input.disabled = true;
                    label.classList.add("reactor-disabled");
                }

                input.addEventListener("change", () => {
                    reactorSeleccionado = input.value;
                    console.log(reactorSeleccionado);
                });

                label.appendChild(input);
                label.appendChild(document.createTextNode(reactor.Equipo_id));

                contenedorReactores.appendChild(label);
            });
    }

    function generarRadiosRecetas(recetas, datosEdicion, modo) {    
        console.log(recetas);
        const contenedorRecetas = document.querySelector("#recetas .radio-group");
        contenedorRecetas.innerHTML = "";

        recetas.forEach((receta, index) => {
            const id = `R${index + 1}_p18`;
            const label = document.createElement("label");
            label.className = "radio-label";
            label.htmlFor = id;

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "receta";
            input.id = id;
            input.value = receta.NombreReceta;

            if (datosEdicion && datosEdicion.Receta == receta.NombreReceta) {
                input.checked = true;
                recetaSeleccionada = receta.NombreReceta;
            }

            input.addEventListener("change", () => {
                recetaSeleccionada = input.value;
                console.log(recetaSeleccionada);
            });

            label.appendChild(input);
            label.appendChild(document.createTextNode(receta.NombreReceta));
            contenedorRecetas.appendChild(label);
        });
    }

    function inicializarFormulario(modo, producto, datosEdicion = null) {
        const formData = new FormData();
        formData.append("producto", "P18");
        formData.append("modo", modo);

        if (modo != "crear") {
            formData.append("numeroProduccion", datosEdicion.NumeroFabricacion);
        }

        /*const objeto = Object.fromEntries(formData.entries());
        console.log(objeto); debugger*/

        return fetch("index.php?c=Leer&a=leerP18", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                /// ==== NUMERO PRODUCCION ==== ////
                // Determinar número de producción final
                if (modo === "editar" || modo === "transferir" || modo === "terminar") {
                    numeroProduccion = datosEdicion.NumeroFabricacion;
                } else {
                    // modo === "crear"
                    numeroProduccion = data.siguienteFabricacion;
                    datosEdicion = datosEdicion || {};
                    datosEdicion.NumeroFabricacion = numeroProduccion;
                }

                // Mostrar siempre el número final
                parDisplayProduccion.textContent = numeroProduccion;

                // === MEZCLADORES =====
                                
                const mezcladoresDisponibles = data.equipos.filter(
                    e => e.Tipo === "Mezclador" &&
                        e.Estado === "Vacio" &&
                        e.Equipo_id !== "M216"
                );

                mezcladoresEnUso = data.equipos.filter(e => e.Tipo === "Mezclador" && e.Estado === "En uso");
                mezcladoresAveriados = data.equipos.filter(e => e.Tipo === "Mezclador" && e.Estado === "Averiado");
                mezcladoresEditar = data.equipos.filter(e => e.Tipo === "Mezclador" && e.Equipo_id !== "M216");

                if (modo === "crear") {
                    const ok = sePuedeFabricar(producto, data);

                    if (ok) {
                        generarRadiosMezcladores(mezcladoresDisponibles, datosEdicion, modo);
                    }
                    else {
                        alert("No se puede crear producción con los equipos disponibles");
                        window.location.replace("index.php?c=Formulario&a=home");
                    }
                }


                if (modo === "editar" || modo === "transferir" || modo === "terminar") {
                    generarRadiosMezcladores(mezcladoresEditar, datosEdicion, modo);
                }

                // ===== RECETAS ====

                /*if (modo === "terminar") {
                    console.log(data); debugger
                    data.recetas = data;
                }*/

                generarRadiosRecetas(data.recetas, datosEdicion, modo);

                if (modo === "transferir") {
                    generarRadiosRecetas(data.recetas, datosEdicion, modo);
                }

                // ===== REACTORES =====

                if (modo === "terminar") {
                        datosEdicion = data.produccionCurso;
                    }

                const reactoresFiltrados = data.reactores.filter(r => r.Estado !== "Averiado");
                generarRadiosReactores(reactoresFiltrados, datosEdicion);

                // === DATOS INICIALES FORMULARIO === 
                if (datosEdicion) {
                    if (datosEdicion.PesoInicialMezclador !== undefined)
                        peso_inicial_mezclador.value = datosEdicion.PesoInicialMezclador;

                    if (datosEdicion.PesoFinalMezclador !== undefined)
                        peso_final_mezclador.value = datosEdicion.PesoFinalMezclador;

                    if (datosEdicion.PesoInicialReactor !== undefined) {
                        peso_inicial_reactor.value = datosEdicion.PesoInicialReactor;
                    }

                    if (datosEdicion.PesoFinalReactor !== undefined) {
                        peso_final_reactor.value = datosEdicion.PesoFinalReactor;
                    }

                    if (datosEdicion.Notas !== undefined || datosEdicion !== null) {
                        txtNotas.textContent = datosEdicion.Notas;
                    }                    

                    if (modo === "terminar") {
                        console.log(data);
                        peso_inicial_mezclador.value = data.produccionCurso.PesoInicialMezclador;
                        peso_final_mezclador.value = data.produccionCurso.PesoFinalMezclador;
                        peso_inicial_reactor.value = data.produccionCurso.PesoInicialReactor;
                        txtNotas.textContent = data.produccionCurso.Notas
                        generarRadiosReactores(reactoresFiltrados, data.produccionCurso);
                    }

                    formatearNumero(peso_inicial_mezclador);
                    formatearNumero(peso_final_mezclador);
                    formatearNumero(peso_inicial_reactor);
                    formatearNumero(peso_final_reactor);
                }

                return data;
            });
    }

    [peso_inicial_mezclador, peso_final_mezclador, peso_inicial_reactor, peso_final_reactor].forEach(input => {
        input.addEventListener("input", () => formatearNumero(input));
    });

    btnRetroceder.addEventListener("click", () => window.location.href = "index.php?c=Formulario&a=home");

    // ===== MODO CREAR =====
    if (modo === "crear") {
        inicializarFormulario(modo, producto).then(() => {
            document.querySelector('#peso_final_mezclador').disabled = true;

            const reactores = document.querySelector('#reactores');
            reactores
                .querySelectorAll("input, select, textarea, button")
                .forEach(el => el.disabled = true);

            btnCrear.addEventListener("click", () => {
                if (!mezcladorSeleccionado) return alert("Selecciona un mezclador");
                if (!peso_inicial_mezclador.value) return alert("Selecciona un peso inicial");
                if (!recetaSeleccionada) return alert("Selecciona una receta");

                const valNotas = txtNotas.value;

                const datosEnviar = new FormData();
                //datosEnviar.append("numeroProduccion", numeroProduccionActual);
                datosEnviar.append("numeroProduccion", numeroProduccion);
                datosEnviar.append("mezclador", mezcladorSeleccionado);
                datosEnviar.append("receta", recetaSeleccionada);
                datosEnviar.append("pesoInicialMezclador", peso_inicial_mezclador.value.replace(/\./g, ""));
                datosEnviar.append("pesoFinalMezclador", peso_final_mezclador.value.replace(/\./g, ""));
                datosEnviar.append("producto", producto);
                datosEnviar.append("modo", modo);
                datosEnviar.append("notas", valNotas);

                /*const objeto = Object.fromEntries(datosEnviar.entries()); 
                console.log("objeto", objeto); return; */

                fetch("index.php?c=Crear&a=fabricacionP18", {
                    method: "POST",
                    body: datosEnviar
                })
                    .then(res => res.json())
                    .then(json => {
                        console.log(json);
                        if (json.ok) mostrarModal(json.message);
                        else alert(json.error);
                    });
            });
        });
    }

    // ===== MODO EDITAR =====
    if (modo === "editar") {
        datosEdicion = JSON.parse(localStorage.getItem("datosEditables"));

        btnCrear.textContent = "Editar";

        inicializarFormulario(modo, producto, datosEdicion)
            .then(() => {

                // ==== PESOS ====
                const pesoMF = datosEdicion.PesoFinalMezclador;
                const inputPesoFinalMezclador = document.querySelector('#peso_final_mezclador');
                const contenedorReactores = document.querySelector('#reactores');
                const inputPesoFinalReactor = document.querySelector('#peso_final_reactor');

                // Si pesoMF NO está vacío → activar campos del reactor excepto el peso final reactor
                if (pesoMF !== "" && pesoMF !== null && pesoMF !== undefined) {

                    // Activar peso final mezclador
                    inputPesoFinalMezclador.disabled = false;

                    // Activar todos los elementos dentro de #reactores
                    contenedorReactores
                        .querySelectorAll("input, select, textarea, button")
                        .forEach(el => el.disabled = false);

                    // PERO dejar deshabilitado el peso final del reactor
                    inputPesoFinalReactor.disabled = true;

                } else {
                    // Si está vacío → desactivar todo lo del reactor
                    contenedorReactores
                        .querySelectorAll("input, select, textarea, button")
                        .forEach(el => el.disabled = true);

                    // Y desactivar peso final mezclador
                    inputPesoFinalMezclador.disabled = true;
                }

                // === CLICK EDITAR ===                
                btnCrear.addEventListener("click", (e) => {
                    e.preventDefault();

                    const data = new FormData();

                    if (datosEdicion.Reactor === "") {
                        console.log("REACTOR = ''");

                        data.append("numeroProduccion", datosEdicion.NumeroFabricacion);
                        data.append("mezclador", mezcladorSeleccionado);
                        data.append("receta", recetaSeleccionada);
                        data.append("pesoInicialMezclador", peso_inicial_mezclador.value.replace(/\./g, ""));
                        data.append("producto", producto);
                        data.append("modo", modo);
                        data.append("notas", txtNotas.value);

                    } else if (datosEdicion.Reactor != "") {

                        data.append("numeroProduccion", datosEdicion.NumeroFabricacion);
                        data.append("mezclador", mezcladorSeleccionado);
                        data.append("receta", recetaSeleccionada);
                        data.append("pesoInicialMezclador", peso_inicial_mezclador.value.replace(/\./g, ""));
                        data.append("pesoFinalMezclador", peso_final_mezclador.value.replace(/\./g, ""));
                        data.append("reactor", reactorSeleccionado);
                        data.append("pesoInicialReactor", peso_inicial_reactor.value.replace(/\./g, ""));
                        data.append("producto", producto);
                        data.append("modo", modo);
                        data.append("notas", txtNotas.value);
                    }

                    /*const objeto = Object.fromEntries(data.entries());                    
                    console.log(objeto); debugger */

                    fetch("index.php?c=Editar&a=fabCurso", { method: "POST", body: data })
                        .then(res => res.json())
                        .then(json => {
                            //console.log(json); debugger
                            if (json.ok) mostrarModal("Producción actualizada correctamente");
                            else alert(json.error);
                        });
                });
            });
    }

    // ==== MODO TRANSFERIR ====
    if (modo === "transferir") {
        console.log("Modo transferir...");
        const reactor = (datosTransferencia.Reactor === "undefined" || datosTransferencia.Reactor === "null") ? "" : datosTransferencia.Reactor

        btnCrear.textContent = "Transferir ";

        inicializarFormulario(modo, producto, datosTransferencia)
            .then(() => {
                const inputPesoFinalMezclador = document.querySelector("#peso_final_mezclador");
                const inputPesoInicialReactor = document.querySelector("#peso_inicial_reactor");
                const inputPesoFinalReactor = document.querySelector("#peso_final_reactor");
                inputPesoFinalReactor.disabled = true;

                btnCrear.addEventListener("click", (e) => {
                    e.preventDefault();
                    const pesoMF = Number(inputPesoFinalMezclador.value.replace(/\./g, ""));
                    let pesoR = inputPesoInicialReactor.value;
                    pesoR = Number(inputPesoInicialReactor.value.replace(/\./g, ""));

                    if (!pesoMF) return alert("Introduzca peso inicial mezclador");
                    if (!reactorSeleccionado) return alert("Selecciona un reactor");
                    if (!pesoR) return alert("Introduzca peso inicial reactor");

                    let datosEdicion = {};
                    datosEdicion.PesoInicialReactor = Number(peso_inicial_reactor.value.replace(/\./g, ""));

                    const valNotas = txtNotas.value;
                    const datosTransferenciaMezcladoraReactor = new FormData();
                    datosTransferenciaMezcladoraReactor.append("mezclador", mezcladorSeleccionado);
                    datosTransferenciaMezcladoraReactor.append("modo", modo);
                    datosTransferenciaMezcladoraReactor.append("numeroProduccion", datosTransferencia.NumeroFabricacion);
                    datosTransferenciaMezcladoraReactor.append("pesoFinalMezclador", pesoMF);
                    datosTransferenciaMezcladoraReactor.append("pesoInicialReactor", pesoR);
                    datosTransferenciaMezcladoraReactor.append("producto", datosTransferencia.Producto_id);
                    datosTransferenciaMezcladoraReactor.append("reactor", reactorSeleccionado);
                    datosTransferenciaMezcladoraReactor.append("receta", recetaSeleccionada);
                    datosTransferenciaMezcladoraReactor.append("notas", valNotas);
                    datosTransferenciaMezcladoraReactor.append("pesoInicialMezclador", peso_inicial_mezclador.value.replace(/\./g, ""));

                    /*const objeto = Object.fromEntries(datosTransferenciaMezcladoraReactor.entries());
                     console.log(objeto); debugger*/

                    console.log("fetch");

                    fetch("index.php?c=Transferir&a=mezclaAReactor", {
                        method: "POST",
                        body: datosTransferenciaMezcladoraReactor
                    })
                        .then(res => res.json())
                        .then(json => {
                            console.log(json); debugger
                            if (json.ok) mostrarModal("Producción transferida correctamente");
                            else alert(json.error);
                        });

                });
            });
    }

    // ===== MODO TERMNAR ===== //
    if (modo === "terminar") {
        console.log("Modo terminar....");
        btnCrear.textContent = "Terminar";

        inicializarFormulario(modo, producto, datosEdicion)
            .then(() => {
                const inputPesoFinalMezclador = document.querySelector("#peso_final_mezclador");
                const inputPesoInicialReactor = document.querySelector("#peso_inicial_reactor");
                const inputPesoFinalReactor = document.querySelector("#peso_final_reactor");
                inputPesoFinalReactor.disabled = false;

                btnCrear.addEventListener("click", (e) => {
                    e.preventDefault();

                    if (inputPesoFinalReactor.value === "") {
                        alert("Debe introducir un peso final de reactor");
                    }

                    console.log(inputPesoFinalReactor.value);
                    pesoRF = inputPesoFinalReactor.value.replace(/\./g, "");

                    const valNotas = txtNotas.value;
                    const datosTransferenciaFinal = new FormData();
                    datosTransferenciaFinal.append("fechaHoraInicio", datosTransferencia.FechaInicio);
                    datosTransferenciaFinal.append("fechaInicioReaccion", datosTransferencia.FechaInicioReaccion);
                    datosTransferenciaFinal.append("mezclador", datosTransferencia.Mezclador);
                    datosTransferenciaFinal.append("numeroProduccion", datosTransferencia.NumeroFabricacion);
                    datosTransferenciaFinal.append("pesoFinalMezclador", peso_final_mezclador.value.replace(/\./g, ""));
                    datosTransferenciaFinal.append("pesoFinalReactor", peso_final_reactor.value.replace(/\./g, ""));
                    datosTransferenciaFinal.append("pesoInicialMezclador", peso_inicial_mezclador.value.replace(/\./g, ""));
                    datosTransferenciaFinal.append("pesoInicialReactor", datosTransferencia.PesoInicialReactor);
                    datosTransferenciaFinal.append("producto", datosTransferencia.Producto_id);
                    datosTransferenciaFinal.append("modo", modo);
                    datosTransferenciaFinal.append("reactor", reactorSeleccionado);
                    datosTransferenciaFinal.append("receta", recetaSeleccionada);
                    datosTransferenciaFinal.append("notas", valNotas);

                    /*const objeto = Object.fromEntries(datosTransferenciaFinal.entries());
                    console.log(objeto); debugger*/

                    fetch("index.php?c=Transferir&a=reactorAM216", {                    
                        method: "POST",
                        body: datosTransferenciaFinal
                    })
                        .then(response => response.json())
                        .then(data => {
                            console.log("data", data);
                            alert("Producción transferida a M216");
                            window.location.href = "index.php?c=Formulario&a=home";
                        })
                        .catch(err => console.error("Error en fetch:", err));
                })
            })
    }
});
