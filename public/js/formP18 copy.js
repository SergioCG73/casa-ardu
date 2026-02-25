document.addEventListener("DOMContentLoaded", () => {
    // ===== ELEMENTOS DEL DOM =====
    const btnRetroceder = document.getElementById("btnRetroceder");
    const btnCrear = document.getElementById("btnCrear");
    const displayProduccion = document.getElementById("displayProduccion");
    const contenedorMezcladores = document.querySelector("#mezcladores fieldset");
    const contenedorPesoFinalMezclador = document.getElementById("peso_final_mezcla");
    const peso_inicial_mezclador = document.getElementById("peso_inicial_mezclador");
    const peso_final_mezclador = document.getElementById("peso_final_mezclador");
    const peso_inicial_reactor = document.getElementById("peso_inicial_reactor");
    const peso_final_reactor = document.getElementById("peso_final_reactor");

    // ===== VARIABLES GLOBALES =====
    let datosEdicion;
    let datosTransferencia;
    let mezcladorSeleccionado;
    let recetaSeleccionada;
    let reactorSeleccionado;
    let numeroProduccion;

    const modo = localStorage.getItem("modo");
    //const producto = "PP18";
    let producto = localStorage.getItem("producto");

    /*if ((modo === "crear" || modo === "editar") && producto === "P18") {
        producto = "PP18";
    } */

    //producto = "PP18";

    //contenedorPesoFinalMezclador.disabled = true;

    //¿CUÁNDO LLEGA ESTO?
    datosTransferencia = JSON.parse(localStorage.getItem("datosTransferencia"));
    datosEdicion = JSON.parse(localStorage.getItem("datosEditables"));
    //¿?

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
        window.location.href = "/HTML/public/index.php";
    }

    document.getElementById("btnAceptar").addEventListener("click", cerrarModal);

    function formatearNumero(input) {
        let valor = input.value;
        if (valor == null) return;
        valor = String(valor).replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        input.value = valor;
        return valor;
    }

    function generarRadiosMezcladores(mezcladores, datosEdicion) {
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

            // Marcar automáticamente en editar
            if (datosEdicion && datosEdicion.Mezclador == mezclador.Equipo_id) {
                input.checked = true;
                mezcladorSeleccionado = mezclador.Equipo_id;
            }
            // NUEVO

            if (datosEdicion && datosEdicion.Mezclador !== "") {
                if (mezclador.NombreEquipo === datosEdicion.Mezclador) {
                    input.checked = true;
                } else {
                    input.disabled = true;
                }
            }

            // fin nuevo

            input.addEventListener("change", () => {
                mezcladorSeleccionado = input.value;
            });

            label.appendChild(input);
            label.appendChild(document.createTextNode(mezclador.Equipo_id));
            contenedorMezcladores.appendChild(label);
        });
    }

    function generarRadiosRecetas(recetas, datosEdicion) {
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

                // 🔥 1) Si es el reactor anterior → seleccionado + deshabilitado
                if (datosEdicion && datosEdicion.Reactor == reactor.Equipo_id) {
                    input.checked = true;
                    input.disabled = true;
                    label.classList.add("reactor-disabled");
                }

                // 🔥 2) Si está en uso → deshabilitado SIEMPRE
                if (estado === "en uso") {
                    input.disabled = true;
                    label.classList.add("reactor-disabled");
                }

                // NUEVO

                /*if (datosEdicion && datosEdicion.Reactor !== "") {
                    if (reactor.NombreEquipo === datosEdicion.Reactor) {                    
                        input.checked = true;
                        //reactorSeleccionado = reactor.NombreEquipo;
                        reactorSeleccionado = reactor.Equipo_id;
                    } else {
                        input.disabled = true;
                    }
                }*/

                if (
                    reactor.Equipo_id == datosEdicion.Reactor ||
                    reactor.NombreEquipo == datosEdicion.Reactor
                ) {
                    input.checked = true;
                    reactorSeleccionado = reactor.Equipo_id;
                } else {
                    input.disabled = true;
                }

                // fin nuevo

                input.addEventListener("change", () => {
                    reactorSeleccionado = input.value;
                    console.log(reactorSeleccionado);
                });



                label.appendChild(input);
                label.appendChild(document.createTextNode(reactor.Equipo_id));

                contenedorReactores.appendChild(label);
            });
    }


    function inicializarFormulario(modo, producto, datosEdicion = null) {
        const formData = new FormData();
        formData.append("modo", modo);
        formData.append("producto", producto);

        /*const objeto = Object.fromEntries(formData.entries());  
        console.log(objeto);  debugger */
        //1console.log(datosEdicion); debugger

        //return fetch("/HTML/app/models/leerdatos.php", { method: "POST", body: formData })
        return fetch("/HTML/app/models/leerV2.php", { method: "POST", body: formData })
            .then(res => res.json())
            .then(data => { //console.log(data); return;                
                numeroProduccion = ((modo === "editar" || modo === "transferir") && datosEdicion)
                    ? data.ultimaEnCurso
                    : data.siguienteFabricacion;

                displayProduccion.textContent = numeroProduccion;

                let reactoresDisponibles = [];

                if (modo === "crear") {
                    mezcladoresDisponibles = data.equipos.filter(e => e.Tipo === "Mezclador" && e.Estado === "Vacio");
                    mezcladoresEnUso = data.equipos.filter(e => e.Tipo === "Mezclador" && e.Estado === "En uso");

                    /*console.log("MD", mezcladoresDisponibles.length); 
                    console.log("EU", mezcladoresEnUso.length);*/

                    if (mezcladoresDisponibles.length > 0 && mezcladoresEnUso <= 0) {
                        console.log("Puedes crear producción");
                    } else {
                        alert("No se puede crear producción con los equipos disponibles");
                        window.location.href = "/HTML/app/views/home.php";
                    }
                }

                generarRadiosMezcladores(
                    data.equipos.filter(e => e.Tipo === "Mezclador"),
                    datosEdicion
                );

                //console.log(datosEdicion.PesoFinalMezclador);

                /*if (modo === "transferir" && datosEdicion.PesoFinalMezclador ==="") {
                    reactoresDisponibles = data.reactores.filter(e => e.Tipo === "Reactor" && e.Estado === "Vacio");
                } else if (modo === "transferir" && datosEdicion.PesoFinalMezclador !="") {                    
                    reactoresDisponibles = data.reactores;                    
                    console.log("peso", datosEdicion.PesoFinalMezclador);
                }*/

                /*if (modo === "transferir") {
                    console.log("reactores transferencia", data);
                    generarRadiosReactores(data.reactores, datosEdicion);
                } else {
                    generarRadiosReactores(data.reactores, datosEdicion);
                }*/

                const reactoresFiltrados = data.reactores.filter(r => r.Estado !== "Averiado");
                generarRadiosReactores(reactoresFiltrados, datosEdicion);

                generarRadiosRecetas(data.recetas, datosEdicion);

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


    btnRetroceder.addEventListener("click", () => window.location.href = "/HTML/public/");

    // ===== MODO CREAR =====
    if (modo === "crear") {
        //contenedorPesoFinalMezclador.style.display = "none";
        //const contenedorMezcladores = document.getElementById("mezcladores");
        //const contenedorReactores = document.getElementById("reactores");
        //contenedorMezcladores.disabled = false;
        //contenedorReactores.style.display = "none";
        //contenedorReactores.disabled = true;        

        inicializarFormulario(modo, producto).then(() => {  //Aquí hace la llamada a la función y esta a leerV2.php            
            document.querySelector('#peso_final_mezclador').disabled = true;

            const reactores = document.querySelector('#reactores');
            reactores
                .querySelectorAll("input, select, textarea, button")
                .forEach(el => el.disabled = true);

            btnCrear.addEventListener("click", () => {
                if (!mezcladorSeleccionado) return alert("Selecciona un mezclador");
                if (!peso_inicial_mezclador.value) return alert("Selecciona un peso inicial");
                if (!recetaSeleccionada) return alert("Selecciona una receta");

                const ahora = new Date();
                const fechaHoraInicio = ahora.getFullYear() + "-" +
                    String(ahora.getMonth() + 1).padStart(2, '0') + "-" +
                    String(ahora.getDate()).padStart(2, '0') + " " +
                    String(ahora.getHours()).padStart(2, '0') + ":" +
                    String(ahora.getMinutes()).padStart(2, '0') + ":" +
                    String(ahora.getSeconds()).padStart(2, '0');

                const datosEnviar = new FormData();
                /*datosEnviar.append("numeroProduccion", numeroProduccion);
                datosEnviar.append("fechaHoraInicio", fechaHoraInicio);
                datosEnviar.append("mezclador", mezcladorSeleccionado);
                datosEnviar.append("pesoInicialMezclador", peso_inicial_mezclador.value.replace(/\./g, ""));
                datosEnviar.append("receta", recetaSeleccionada);
                datosEnviar.append("producto", producto);*/

                datosEnviar.append("fechaHoraInicio", fechaHoraInicio);
                datosEnviar.append("numeroProduccion", datosEdicion.NumeroFabricacion);
                datosEnviar.append("mezclador", mezcladorSeleccionado);
                datosEnviar.append("receta", recetaSeleccionada);
                datosEnviar.append("pesoInicialMezclador", peso_inicial_mezclador.value.replace(/\./g, ""));
                datosEnviar.append("pesoFinalMezclador", peso_final_mezclador.value.replace(/\./g, ""));
                //datosEnviar.append("reactor", reactorSeleccionado);
                //datosEnviar.append("pesoInicialReactor", peso_inicial_reactor.value.replace(/\./g, ""));
                datosEnviar.append("producto", producto);
                datosEnviar.append("modo", modo);

                /*const objeto = Object.fromEntries(datosEnviar.entries()); 
                console.log("objeto", objeto); return;*/ //producto = PP18                

                fetch("/HTML/app/models/crearP18.php", { method: "POST", body: datosEnviar })
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
        console.log("Modo edición");
        datosEdicion = JSON.parse(localStorage.getItem("datosEditables"));
        //console.log("datosEdicion", datosEdicion);

        btnCrear.textContent = "Editar";

        //console.log(modo, producto, datosEdicion); debugger

        inicializarFormulario(modo, producto, datosEdicion)
            .then(() => {

                //console.log(modo, producto, datosEdicion); debugger
                const pesoMF = datosEdicion.PesoFinalMezclador;

                /*document.querySelector('#peso_final_mezclador').disabled = true;
     
                 const reactores = document.querySelector('#reactores');
                 reactores
                     .querySelectorAll("input, select, textarea, button")
                     .forEach(el => el.disabled = true); */


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

                        const objeto = Object.fromEntries(data.entries());
                        console.log(objeto); debugger
                    }

                    fetch("../../app/models/editarFabCurso.php", { method: "POST", body: data })
                        .then(res => res.json())
                        .then(json => {
                            console.log(json);
                            if (json.ok) mostrarModal("Producción actualizada correctamente");
                            else alert(json.error);
                        });
                });
            });
    }

    // ==== MODO TRANSFERIR ====
    if (modo === "transferir") {
        console.log("Modo transferencia ...");

        //console.log(modo, producto, datosEdicion); return;    
        btnCrear.textContent = "Transferir";

        // 1) Inicializar el formulario y ESPERAR a que termine

        //console.log(datosEdicion); return;

        inicializarFormulario(modo, producto, datosEdicion)
            .then(() => {
                document.querySelector('#peso_final_mezclador').disabled = false;
                document.querySelector('#peso_final_reactor').disabled = true;
                const reactores = document.querySelector('#peso_inicial_reactor').disabled = false;

                if (datosEdicion.Reactor != "") {
                    peso_final_reactor.disabled = false;
                }

                btnCrear.addEventListener("click", (e) => {
                    datosEdicion.PesoFinalReactor = Number(peso_final_reactor.value.replace(/\./g, ""));

                    e.preventDefault();

                    let fechaInicioReaccion = datosEdicion.FechaInicioReaccion || null;  //Nueva

                    if (!fechaInicioReaccion) {
                        const ahora = new Date();
                        fechaInicioReaccion = ahora.getFullYear() + "-" +
                            String(ahora.getMonth() + 1).padStart(2, '0') + "-" +
                            String(ahora.getDate()).padStart(2, '0') + " " +
                            String(ahora.getHours()).padStart(2, '0') + ":" +
                            String(ahora.getMinutes()).padStart(2, '0') + ":" +
                            String(ahora.getSeconds()).padStart(2, '0');
                    }

                    //console.log(fechaInicioReaccion); debugger

                    if (peso_final_mezclador.value === "") {
                        alert("Debe introducir un peso final de mezclador antes de transferir");
                        return;
                    }

                    console.log(fechaInicioReaccion);
                    //reactorSeleccionado = datosEdicion.Reactor;
                    //console.log(datosEdicion); debugger

                    if (!reactorSeleccionado) {
                        alert("Debe elegir un reactor antes de transferir");
                        return;
                    }

                    if (peso_inicial_reactor.value === "") {
                        alert("Debe introducir un peso inicial de reactor antes de transferir");
                        return;
                    }

                    if (peso_final_reactor.value === "" && peso_final_mezclador.value === "") {
                        alert("Debe introducir un peso final de reactor antes de transferir");
                        return;
                    }

                    const data = new FormData();

                    data.append("numeroProduccion", datosEdicion.NumeroFabricacion);
                    data.append("producto", producto);
                    data.append("modo", modo);
                    data.append("mezclador", mezcladorSeleccionado);
                    data.append("fechaInicioReaccion", fechaInicioReaccion);
                    data.append("pesoFinalMezclador", peso_final_mezclador.value.replace(/\./g, ""));
                    data.append("reactor", reactorSeleccionado);
                    data.append("pesoInicialReactor", peso_inicial_reactor.value.replace(/\./g, ""));
                    data.append("pesoFinalReactor", peso_final_reactor.value.replace(/\./g, ""));

                    //data.append("pesoInicialMezclador", datosEdicion.PesoInicialMezclador);
                    data.append("pesoFinalReactor", peso_final_reactor.value.replace(/\./g, ""));
                    //data.append("receta", recetaSeleccionada);


                    const objeto = Object.fromEntries(data.entries());
                    console.log(objeto); debugger

                    fetch("../../app/models/transferirFabCurso.php", { method: "POST", body: data })
                        .then(res => res.json())
                        .then(json => { //console.log(json); debugger                            
                            if (json.ok) mostrarModal("Producción transferida correctamente");
                            else alert(json.error);
                        });
                });

            });
    }


});
