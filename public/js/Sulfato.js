document.addEventListener("DOMContentLoaded", () => {
    const btnRetroceder = document.getElementById("btnRetroceder");
    const btnCrear = document.getElementById("btnCrear");
    const btnTransferir = document.getElementById("btnTransferir");
    const displayProduccion = document.getElementById("displayProduccion");
    const divReactores = document.getElementById("reactores");
    const peso_inicial_reactor = document.getElementById("peso_inicial_reactor");
    const peso_final_reactor = document.getElementById("peso_final_reactor");
    const txtNotas = document.getElementById("txtnotas"); //<textarea>    

    let reactorSeleccionado;
    let recetaSeleccionada;
    let numeroProduccion;
    let fechaHoraInicio;
    let valNotas = null;

    let modo = localStorage.getItem("modo");
    producto = "Sulfato";
    let datosEdicion;

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
        //window.location.href = "index.php";
        window.location.href = "index.php?c=Formulario&a=home";
    }

    document.getElementById("btnAceptar").addEventListener("click", cerrarModal);

    function generarRadiosReactores(listaEquipos, contenedorReactores, modo, datosEdicion) {

        //console.log(listaEquipos); debugger

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

        if (modo !="crear") {
            datos.append("numeroProduccion", datosEdicion.NumeroFabricacion);
        }

       /*const objeto = Object.fromEntries(datos.entries());
       console.log(objeto); debugger*/

        return fetch("index.php?c=Leer&a=lectura", {   //Hay que quitar el método de LeerController cuando funcione
            method: "POST",
            body: datos
        })
            .then(response => response.json())
            .then(data => { //console.log (data); debugger
                numeroProduccion = (modo === "editar" || modo === "transferir")
                    ? datosEdicion.NumeroFabricacion
                    : data.siguienteFabricacion;

                displayProduccion.textContent = numeroProduccion;
                numeroProduccionActual = numeroProduccion;

                //console.log(data); 
                //console.log(numeroProduccion); debugger            

                //==== REACTORES ====
                const contenedorReactores = document.querySelector("#reactores fieldset");

                //console.log(data.equipos); debugger
                //console.log(datosEdicion); debugger
                generarRadiosReactores(data.equipos, contenedorReactores, modo, datosEdicion);

                //==== RECETAS ====
                const contenedorRecetas = document.querySelector("#recetas fieldset");                

                //console.log(data.recetas); debugger
                generarRadiosRecetas(data.recetas, contenedorRecetas, modo, datosEdicion);

                //==== LISTENERS ====
                document.addEventListener("change", function (e) {
                    if (e.target.name === "reactor") reactorSeleccionado = e.target.value;
                    if (e.target.name === "receta") recetaSeleccionada = e.target.value;
                });

                //==== VALORES INICIALES EN EDITAR ====
                //console.log(datosEdicion.Notas); debugger
                if (modo === "editar" && datosEdicion) {
                    peso_inicial_reactor.value = datosEdicion.PesoInicialReactor;
                    txtNotas.textContent = datosEdicion.Notas;
                    formatearNumero(peso_inicial_reactor);
                }

                if (modo === "transferir" && datosTransferir) {
                    peso_inicial_reactor.value = datosTransferir.PesoInicialReactor;
                    txtNotas.textContent = datosEdicion.Notas;
                    formatearNumero(peso_inicial_reactor);
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

    [peso_inicial_reactor, peso_final_reactor].forEach(input => {
        input.addEventListener("input", () => formatearNumero(input));
    });

    // ==== BOTÓN RETROCEDER ====

    btnRetroceder.addEventListener("click", () => {
        window.location.href = "index.php?c=Formulario&a=home";
    });

    // ==== MODO CREAR ====
    if (modo === "crear") {
        //console.log("Estamos en modo creación");
        const contenedorPesoFinal = document.getElementById("contenedor_peso_final");
        contenedorPesoFinal.style.display = "none";

        inicializarFormulario(modo, producto)
            .then(data => {
                //console.log(data); debugger
                if (data.equipos.length > 0 && data.equipos[0].Estado === "En uso") {
                    alert("No se puede fabricar Sulfato R202 ocupado");
                    window.location.href = "index.php?c=Formulario&a=home";
                    return;
                }

                btnCrear.addEventListener("click", () => {

                    const PesoInicialReactor = peso_inicial_reactor.value.replace(/\./g, "");

                    //console.log("peso", PesoInicialReactor); debugger

                    if (PesoInicialReactor === "") {
                        alert("Introduzca un peso inicial para el reactor");
                        return;
                    }

                    /*const ahora = new Date();

                    const fechaHoraInicio =
                        ahora.getFullYear() + "-" +
                        String(ahora.getMonth() + 1).padStart(2, '0') + "-" +
                        String(ahora.getDate()).padStart(2, '0') + " " +
                        String(ahora.getHours()).padStart(2, '0') + ":" +
                        String(ahora.getMinutes()).padStart(2, '0') + ":" +
                        String(ahora.getSeconds()).padStart(2, '0');*/

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

                    valNotas = txtNotas.value;

                    const datosEnviar = new FormData();
                    datosEnviar.append("numeroProduccion", numeroProduccion);
                    datosEnviar.append("fechaHoraInicio", fechaHoraInicio);
                    datosEnviar.append("reactor", reactorSeleccionado);
                    datosEnviar.append("receta", recetaMarcada.value);
                    datosEnviar.append("pesoInicialReactor", pesoLimpio);
                    datosEnviar.append("notas", valNotas);

                    /*const objeto = Object.fromEntries(datosEnviar.entries());
                    console.log(objeto); debugger*/

                    fetch("index.php?c=Crear&a=fabricacionSulfato", {
                        method: "POST",
                        body: datosEnviar
                    })
                        .then(response => response.json())
                        .then(json => {
                            //console.log(json); debugger
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
        //console.log(datosEdicion); debugger
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
                    data.append("notas", txtNotas.value);

                    /*const objeto = Object.fromEntries(data.entries());
                    console.log(objeto); debugger*/

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
        datosTransferir = JSON.parse(localStorage.getItem("datosTransferencia"));
        //console.log(datosTransferir); debugger
        btnCrear.textContent = "Transferir";

        inicializarFormulario(modo, producto, datosTransferir)
            .then(() => {

                btnCrear.addEventListener("click", (e) => {
                    e.preventDefault();

                    const PesoInicialEditado = parseInt(peso_inicial_reactor.value.replace(/\./g, ""), 10);
                    const PesoFinalEditado = parseInt(peso_final_reactor.value.replace(/\./g, ""), 10);

                    // === Fechas de Inicio y Final producción
                    const fechaHoraInicio = datosTransferir.FechaInicio;

                    /*const ahora = new Date();
                    const fechaHoraFinal = ahora.getFullYear() + "-" +
                        String(ahora.getMonth() + 1).padStart(2, '0') + "-" +
                        String(ahora.getDate()).padStart(2, '0') + " " +
                        String(ahora.getHours()).padStart(2, '0') + ":" +
                        String(ahora.getMinutes()).padStart(2, '0') + ":" +
                        String(ahora.getSeconds()).padStart(2, '0');*/

                    const data = new FormData();
                    data.append("numeroProduccion", datosTransferir.NumeroFabricacion);
                    data.append("reactor", reactorSeleccionado);
                    data.append("receta", recetaSeleccionada);
                    data.append("fechaHoraInicio", fechaHoraInicio);
                    //data.append("fechaHoraFinal", fechaHoraFinal);
                    data.append("pesoInicialReactor", PesoInicialEditado);
                    data.append("pesoFinalReactor", PesoFinalEditado);
                    //data.append("producto", producto);
                    data.append("notas", txtNotas.value);
                    //data.append("modo", modo);

                    /*const objeto = Object.fromEntries(data.entries());
                    console.log(objeto); debugger*/
                    
                    fetch("index.php?c=Transferir&a=transferirSulfato", {
                        method: "POST",
                        body: data
                    })
                        .then(response => response.json())
                        .then(json => {
                            console.log(json); debugger;
                            if (json.ok) mostrarModal("Producción guardada en acabadas correctamente");
                            else alert("Error: " + json.error);
                        })
                        .catch(error => console.log("ERROR", error));
                });
            });
    }

});
