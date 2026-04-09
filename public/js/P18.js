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
    }

    function generarRadiosMezcladores(mezcladores, datosEdicion, modo) {
        if (modo === "crear" || modo === "editar" || modo === "transferir") {
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
        if (modo === "transferir" && datosEdicion.Reactor === "") {
            const receta = datosEdicion.Receta;
            recetas = [{ NombreReceta: receta }];
        }

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
        switch (modo) {
            case "crear":
                formData.append("producto", producto);
                break;
            case "editar":
                formData.append("producto", datosEdicion.Producto_id);
                break;
            case "transferir":
                formData.append("producto", datosTransferencia.Producto_id);
                break;
        }

        formData.append("modo", modo);

        if (modo != "crear") {
            formData.append("numeroProduccion", datosEdicion.NumeroFabricacion);
        }

        /*const objeto = Object.fromEntries(formData.entries());
        console.log(objeto);  debugger */

        return fetch("index.php?c=Leer&a=lectura", { method: "POST", body: formData })
            .then(res => res.json())
            .then(data => {
                //console.log(data); debugger;                
                numeroProduccion = (modo === "editar" || modo === "transferir")
                    ? datosEdicion.NumeroFabricacion
                    : data.siguienteFabricacion;

                parDisplayProduccion.textContent = numeroProduccion;
                numeroProduccionActual = numeroProduccion;

                if (modo === "crear") {
                    datosEdicion = datosEdicion || {};
                    datosEdicion.NumeroFabricacion = data.siguienteFabricacion;
                }

                let reactoresDisponibles = [];

                mezcladoresDisponibles = data.equipos.filter(
                    e => e.Tipo === "Mezclador" &&
                        e.Estado === "Vacio" &&
                        e.Equipo_id !== "M216"
                );

                mezcladoresEnUso = data.equipos.filter(e => e.Tipo === "Mezclador" && e.Estado === "En uso");
                mezcladoresAveriados = data.equipos.filter(e => e.Tipo === "Mezclador" && e.Estado === "Averiado");
                mezcladoresEditar = data.equipos.filter(e => e.Tipo === "Mezclador" && e.Equipo_id !== "M216");

                if (modo === "crear") {
                    if (mezcladoresDisponibles.length > 0 && mezcladoresEnUso.length <= 0) {
                        generarRadiosMezcladores(mezcladoresDisponibles, datosEdicion, modo);
                    } else {
                        alert("No se puede crear producción con los equipos disponibles");
                        //window.location.href = "index.php?c=Home&a=home";
                        alert("No se puede crear otra producción");
                        window.location.replace("index.php?c=Formulario&a=home");
                    }
                }

                if (modo === "editar") {
                    generarRadiosMezcladores(mezcladoresEditar, datosEdicion, modo);
                }

                if (modo === "transferir") {
                    datosEdicion = datosTransferencia;
                    generarRadiosMezcladores(mezcladoresEditar, datosEdicion, modo);
                }

                const reactoresFiltrados = data.reactores.filter(r => r.Estado !== "Averiado");
                generarRadiosReactores(reactoresFiltrados, datosEdicion);
                generarRadiosRecetas(data.recetas, datosEdicion, modo);

                // Rellenar pesos si hay datos de edición
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
                datosEnviar.append("numeroProduccion", numeroProduccionActual); //Añadido y cambiado
                datosEnviar.append("mezclador", mezcladorSeleccionado);
                datosEnviar.append("receta", recetaSeleccionada);
                datosEnviar.append("pesoInicialMezclador", peso_inicial_mezclador.value.replace(/\./g, ""));
                datosEnviar.append("pesoFinalMezclador", peso_final_mezclador.value.replace(/\./g, ""));
                datosEnviar.append("producto", producto);
                datosEnviar.append("modo", modo);
                datosEnviar.append("notas", valNotas);

                /*const objeto = Object.fromEntries(datosEnviar.entries()); 
                console.log("objeto", objeto); return; */

                fetch("index.php?c=Crear&a=fabricacionP18", { method: "POST", body: datosEnviar })
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
                const pesoMF = datosEdicion.PesoFinalMezclador;

                // Selecciones
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
                    console.log("datosEdicion", datosEdicion);
                    console.log("reactorSeleccionado", reactorSeleccionado);
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

        //console.log(datosTransferencia); debugger
        //console.log("reactor", reactor);

        if (datosTransferencia.Mezclador !== null && (reactor === "" || reactor === null)) {


            console.log("Modo transferencia M a R...");
            btnCrear.textContent = "Transferir ";

            // Creamos el formulario y ESPERAMOS a que termine
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

                        //console.log(datosEdicion.PesoInicialReactor); debugger

                        //let horaTransferenciaMezcladoraReactor = null;

                        /*const ahora = new Date();
                        horaTransferenciaMezcladoraReactor = ahora.getFullYear() + "-" +
                            String(ahora.getMonth() + 1).padStart(2, '0') + "-" +
                            String(ahora.getDate()).padStart(2, '0') + " " +
                            String(ahora.getHours()).padStart(2, '0') + ":" +
                            String(ahora.getMinutes()).padStart(2, '0') + ":" +
                            String(ahora.getSeconds()).padStart(2, '0');                        */

                        //console.log(horaTransferenciaMezcladoraReactor); debugger

                        const valNotas = txtNotas.value;

                        const datosTransferenciaMezcladoraReactor = new FormData();
                        //datosTransferenciaMezcladoraReactor.append("fechaInicioReaccion", horaTransferenciaMezcladoraReactor);
                        datosTransferenciaMezcladoraReactor.append("mezclador", datosTransferencia.Mezclador);
                        datosTransferenciaMezcladoraReactor.append("modo", modo);
                        datosTransferenciaMezcladoraReactor.append("numeroProduccion", datosTransferencia.NumeroFabricacion);
                        datosTransferenciaMezcladoraReactor.append("pesoFinalMezclador", pesoMF);
                        datosTransferenciaMezcladoraReactor.append("pesoInicialReactor", pesoR);
                        datosTransferenciaMezcladoraReactor.append("producto", datosTransferencia.Producto_id);
                        datosTransferenciaMezcladoraReactor.append("reactor", reactorSeleccionado);
                        datosTransferenciaMezcladoraReactor.append("notas", valNotas);

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
        }  //Fin Transferencia M a R
    }

    // ============================================== INICIO TRANSFERENCIA DE REACTOR A M216 *****************************    
    if (modo === "transferir" && datosTransferencia.PesoInicialReactor !== null && datosTransferencia.Reactor !== null) {
        console.log("Transferencia Reactor a M216..."); //debugger
        btnCrear.textContent = "Finalizar";

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

                    /*const ahora = new Date();

                    fechaHoraFinal = ahora.getFullYear() + "-" +
                        String(ahora.getMonth() + 1).padStart(2, '0') + "-" +
                        String(ahora.getDate()).padStart(2, '0') + " " +
                        String(ahora.getHours()).padStart(2, '0') + ":" +
                        String(ahora.getMinutes()).padStart(2, '0') + ":" +
                        String(ahora.getSeconds()).padStart(2, '0');*/

                    const valNotas = txtNotas.value;
                    const datosTransferenciaFinal = new FormData();

                    datosTransferenciaFinal.append("fechaHoraInicio", datosTransferencia.FechaInicio);
                    datosTransferenciaFinal.append("fechaInicioReaccion", datosTransferencia.FechaInicioReaccion);
                    //datosTransferenciaFinal.append("fechaHoraFinal", fechaHoraFinal);                    
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
                            console.log("data final", data);
                            alert("Producción transferida a M216");
                            //window.location.href = "index.php";
                            window.location.href = "index.php?c=Formulario&a=home";
                        })
                        .catch(err => console.error("Error en fetch:", err));
                })
            })
    }
});
