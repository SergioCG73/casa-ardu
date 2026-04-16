document.addEventListener("DOMContentLoaded", () => {
    const btnRetroceder = document.getElementById("btnRetroceder");
    const btnCrear = document.getElementById("btnCrear");
    const btnTransferir = document.getElementById("btnTransferir");
    const displayProduccion = document.getElementById("displayProduccion");
    const peso_inicial_mezclador = document.getElementById("peso_inicial_mezclador");
    const divPesoFinalMezclador = document.getElementById("peso_final");
    const divCantidadTransferida = document.getElementById("contenedor_cantidad_transferida");
    const divDepositos = document.getElementById("depositos");
    const peso_final_mezclador = document.getElementById("peso_final_mezclador");
    const txtNotas = document.getElementById("txtnotas"); //<textarea>    
    const volumen_D111 = document.getElementById("volumen_D111");
    let sacas = document.querySelector(".sacas");

    let recetaSeleccionada;
    let depositoSeleccionado;
    let numeroProduccion;
    let fechaHoraInicio;
    let mezcladorSeleccionado;
    let modo = localStorage.getItem("modo");
    let datosEdicion;
    let sacasEstado = null;

    divCantidadTransferida.style.display = "none";
    divDepositos.style.display = "none";
    divPesoFinalMezclador.style.display = "none";
    producto = "Ferrico";

    //const datosTransferencia = localStorage.getItem("datosTransferencia"); 
    //console.log(datosTransferencia); debugger    

    // ===== INICIO ZONA DE FUNCIONES ======

    /*function desactivarValidaciones() {
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
        //window.location.href = "index.php";
        window.location.href = "index.php?c=Formulario&a=home";        

    }
        
    function formatearNumero(input) {
        let valor = input.value.replace(/\D/g, "");
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        input.value = valor;
    }*/

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

            if ((modo === "editar" || modo === "transferir" || modo === "terminar") && datosEdicion.Receta == receta.NombreReceta) {
                input.checked = true;
                recetaSeleccionada = receta.NombreReceta;
            }

            label.appendChild(input);
            label.appendChild(document.createTextNode(receta.NombreReceta));

            contenedorRecetas.appendChild(label);
        });
    }

    function generarRadiosDepositos(listaDepositos, divDepositos, modo, datosEdicion) {
        //console.log(listaDepositos); debugger
        const radioGroup = divDepositos.querySelector(".radio-group");
        radioGroup.innerHTML = "";

        listaDepositos.forEach((depositos, index) => {
            const id = `Dep${index + 1}_Ferrico`;

            const label = document.createElement("label");
            label.className = "radio-label";
            label.htmlFor = id;

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "deposito";
            input.id = id;
            input.value = depositos.Equipo_id;

            if (listaDepositos.length === 1) {
                input.checked = true;
                depositoSeleccionado = depositos.Equipo_id;  // ← SOLUCIÓN
            }

            label.appendChild(input);
            label.appendChild(document.createTextNode(depositos.Equipo_id));

            radioGroup.appendChild(label);
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
                //console.log(data); debugger
                sacasEstado = data.sacas ? Number(data.sacas.Sacas) : null;
                /*if (modo === "editar") {
                    data.notas = datosEdicion.Notas;
                } */


                /*if (modo === "crear") {
                    numeroProduccion = Math.max(data.ultimaAcabada, data.ultimaEnCurso) + 1;
                }

                numeroProduccion = (modo === "editar" || modo === "transferir" || modo === "terminar")
                    ? data.ultimaAcabada
                    : data.siguienteFabricacion;*/

                if (modo === "crear") {
                    numeroProduccion = Math.max(data.ultimaAcabada, data.ultimaEnCurso) + 1;
                }
                else if (modo === "editar" || modo === "transferir" || modo === "terminar") {
                    numeroProduccion = data.ultimaAcabada;
                }
                else {
                    numeroProduccion = data.siguienteFabricacion;
                }


                //data.ultimaEnCurso = Number(data.ultimaEnCurso);


                // ==== VALOR INICIAL DEL CHECKBOX ====
                if (data.sacas && data.sacas.Sacas == 1) {
                    sacas.checked = true;
                } else {
                    sacas.checked = false;
                }

                numeroProduccionActual = Number(numeroProduccion) + 1;
                displayProduccion.textContent = numeroProduccionActual;

                //==== MEZCLADORES ====
                const contenedorMezcladores = document.querySelector("#mezcladores .radio-group");
                const contenedorPesoFinal = document.querySelector("#mezcladores .peso-final");
                contenedorMezcladores.innerHTML = "";

                listaMezcladores = data.equipos.filter(m => m.Tipo === "Mezclador");
                listaDepositos = data.equipos.filter(d => d.Tipo === "Deposito");

                generarRadiosMezcladores(listaMezcladores, contenedorMezcladores, modo);
                //==== RECETAS ====                
                const contenedorRecetas = document.querySelector("#recetas .radio-group");
                contenedorRecetas.innerHTML = "";

                generarRadiosRecetas(data.recetas, contenedorRecetas, modo, datosEdicion);

                //==== LISTENERS ====
                document.addEventListener("change", function (e) {
                    if (e.target.name === "mezclador") mezcladorSeleccionado = e.target.value;
                    if (e.target.name === "receta") recetaSeleccionada = e.target.value;
                    if (e.target.name === "deposito") {
                        depositoSeleccionado = e.target.value;
                        console.log(depositoSeleccionado);
                    }
                    if (e.target.name === "sacas") {
                        sacasEstado = e.target.checked ? 1 : 0;
                        sacas.value = sacasEstado;
                    }
                });

                //==== VALORES INICIALES FORMULARIO ====
                if (modo === "editar" && datosEdicion.FechaFinal === null) {
                    console.log("editar SIN FechaFinal");
                    peso_inicial_mezclador.value = datosEdicion.PesoInicialMezclador;
                    txtNotas.textContent = datosEdicion.Notas;
                    formatearNumero(peso_inicial_mezclador);
                }

                if (modo === "editar" && datosEdicion.FechaFinal !== null) {
                    console.log("editar CON FechaFinal");
                    peso_inicial_mezclador.value = datosEdicion.PesoInicialMezclador;
                    peso_final_mezclador.value = datosEdicion.PesoFinalMezclador;
                    txtNotas.textContent = datosEdicion.Notas;
                    divPesoFinalMezclador.style.display = "block";
                    divDepositos.style.display = "block";
                    generarRadiosDepositos(listaDepositos, divDepositos, modo, datosEdicion);
                    formatearNumero(peso_inicial_mezclador);
                    formatearNumero(peso_final_mezclador);
                }

                if (modo === "transferir" && datosEdicion) {
                    console.log("transferir");
                    peso_inicial_mezclador.value = datosTransferir.PesoInicialMezclador;
                    peso_final_mezclador.value = datosTransferir.PesoFinalMezclador;
                    txtNotas.textContent = datosTransferir.Notas;
                    divDepositos.style.display = "block";
                    generarRadiosDepositos(listaDepositos, divDepositos, modo, datosEdicion);
                    formatearNumero(peso_inicial_mezclador);
                    formatearNumero(peso_final_mezclador);
                }

                if (modo === "terminar" && datosEdicion) {
                    console.log("terminar");
                    peso_inicial_mezclador.value = datosTransferir.PesoInicialMezclador;
                    peso_final_mezclador.value = datosTransferir.PesoFinalMezclador;
                    txtNotas.textContent = datosTransferir.Notas;
                    divDepositos.style.display = "block";
                    divPesoFinalMezclador.style.display = "block";
                    generarRadiosDepositos(listaDepositos, divDepositos, modo, datosEdicion);
                    formatearNumero(peso_inicial_mezclador);
                    formatearNumero(peso_final_mezclador);                    
                }

                return data;
            });
    }

    // ===== FIN ZONA DE FUNCIONES ======

    [peso_inicial_mezclador, peso_final_mezclador, volumen_D111].forEach(input => {
        input.addEventListener("input", () => formatearNumero(input));
    });

    // ==== BOTÓN RETROCEDER ====

    btnRetroceder.addEventListener("click", () => {
        //window.location.href = "index.php";
        window.location.href = "index.php?c=Formulario&a=home";
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

                    /*const ahora = new Date();

                    const fechaHoraInicio =
                        ahora.getFullYear() + "-" +
                        String(ahora.getMonth() + 1).padStart(2, '0') + "-" +
                        String(ahora.getDate()).padStart(2, '0') + " " +
                        String(ahora.getHours()).padStart(2, '0') + ":" +
                        String(ahora.getMinutes()).padStart(2, '0') + ":" +
                        String(ahora.getSeconds()).padStart(2, '0');*/

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
                    //datosEnviar.append("fechaHoraInicio", fechaHoraInicio);
                    datosEnviar.append("mezclador", mezcladorSeleccionado);
                    datosEnviar.append("receta", recetaMarcada.value);
                    datosEnviar.append("pesoInicialMezclador", pesoLimpio);
                    datosEnviar.append("notas", txtNotas.value);
                    datosEnviar.append("sacas", sacas.checked ? 1 : 0);

                    /*const objeto = Object.fromEntries(datosEnviar.entries());
                    console.log(objeto); debugger*/

                    fetch("index.php?c=Crear&a=ferrico", {
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
        const contenedorPesoFinal = document.querySelector(".peso-final");
        //contenedorPesoFinal.innerHTML = "";

        inicializarFormulario(modo, producto, datosEdicion)
            .then(() => {
                btnCrear.addEventListener("click", (e) => {
                    e.preventDefault();
                    const pesoMezcladorEditado = parseInt(peso_inicial_mezclador.value.replace(/\./g, ""), 10);
                    const pesoMezcladorFinal = parseInt(peso_final_mezclador.value.replace(/\./g, ""), 10);
                    const VolumenD111Editado = parseInt(volumen_D111.value.replace(/\./g, ""), 10);

                    if (isNaN(VolumenD111Editado) && modo === "terminar") {
                        alert("Introduzca un volumen para el depósito");
                        return;
                    }

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
        const contenedorPesoFinal = document.querySelector("#mezcladores .peso-final");
        btnCrear.textContent = "Transferir";

        inicializarFormulario(modo, producto, datosTransferir)
            .then(() => {
                divPesoFinalMezclador.style.display = "block";
                btnCrear.addEventListener("click", (e) => {
                    e.preventDefault();

                    const PesoInicialEditado = parseInt(peso_inicial_mezclador.value.replace(/\./g, ""), 10);
                    const PesoFinalEditado = parseInt(peso_final_mezclador.value.replace(/\./g, ""), 10);

                    // === Fechas de Inicio y Final producción
                    const fechaHoraInicio = datosTransferir.FechaInicio;

                    /*const ahora = new Date();
                    const fechaHoraFinal = ahora.getFullYear() + "-" +
                        String(ahora.getMonth() + 1).padStart(2, '0') + "-" +
                        String(ahora.getDate()).padStart(2, '0') + " " +
                        String(ahora.getHours()).padStart(2, '0') + ":" +
                        String(ahora.getMinutes()).padStart(2, '0') + ":" +
                        String(ahora.getSeconds()).padStart(2, '0');*/


                    if (!PesoInicialEditado || isNaN(PesoInicialEditado)) {
                        alert("Falta peso inicial");
                        return;
                    }

                    if (!PesoFinalEditado || isNaN(PesoFinalEditado)) {
                        alert("Falta peso final");
                        return;
                    }

                    if (sacasEstado === 0) {
                        alert("Las sacas no están dosificadas. No se puede transferir.");
                        return;
                    }

                    const data = new FormData();
                    data.append("numeroProduccion", datosTransferir.NumeroFabricacion);
                    data.append("mezclador", mezcladorSeleccionado);
                    data.append("receta", recetaSeleccionada);
                    //data.append("fechaHoraInicio", fechaHoraInicio);
                    //data.append("fechaHoraFinal", fechaHoraFinal);
                    data.append("pesoInicialMezclador", PesoInicialEditado);
                    data.append("pesoFinalMezclador", PesoFinalEditado);
                    data.append("notas", txtNotas.value);
                    data.append("sacas", sacasEstado);
                    data.append("modo", modo);

                    /*const objeto = Object.fromEntries(data.entries());
                    console.log(objeto); debugger*/

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

    // MODO TERMINAR

    if (modo === "terminar") {
        console.log("Estamos en modo terminar...");
        datosTransferir = JSON.parse(localStorage.getItem("datosTransferencia"));
        divCantidadTransferida.style.display = "block";

        btnCrear.textContent = "Terminar";
        inicializarFormulario(modo, producto, datosTransferir)
            .then(() => {
                btnCrear.addEventListener("click", (e) => {
                    e.preventDefault();

                    const PesoInicialEditado = parseInt(peso_inicial_mezclador.value.replace(/\./g, ""), 10);
                    const PesoFinalEditado = parseInt(peso_final_mezclador.value.replace(/\./g, ""), 10);
                    const VolumenD111Editado = parseInt(volumen_D111.value.replace(/\./g, ""), 10);

                    if (isNaN(VolumenD111Editado)) {
                        alert("Introduzca un volumen para el depósito");
                        return;
                    }

                    const fechaHoraInicio = datosTransferir.FechaInicio;
                    const data = new FormData();
                    data.append("numeroProduccion", datosTransferir.NumeroFabricacion);
                    data.append("mezclador", mezcladorSeleccionado);
                    data.append("receta", recetaSeleccionada);
                    data.append("fechaHoraInicio", fechaHoraInicio);
                    data.append("pesoInicialMezclador", PesoInicialEditado);
                    data.append("pesoFinalMezclador", PesoFinalEditado);                    
                    data.append("volumenD111", VolumenD111Editado);
                    data.append("notas", txtNotas.value);
                    data.append("modo", modo);

                    const objeto = Object.fromEntries(data.entries());
                    console.log(objeto); debugger

                    fetch("index.php?c=Transferir&a=transferirFerrico", {
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
