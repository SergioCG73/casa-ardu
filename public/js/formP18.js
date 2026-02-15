document.addEventListener("DOMContentLoaded", () => {
    const btnRetroceder = document.getElementById("btnRetroceder");    
    const btnCrear = document.getElementById("btnCrear");    
    const displayProduccion = document.getElementById("displayProduccion");
    const divMezcladores = document.getElementById("mezcladores");
    const divReactores = document.getElementById("reactores");    
    const peso_inicial_mezclador = document.getElementById("peso_inicial_mezclador");  
    const peso_final_mezclador = document.getElementById("peso_final_mezclador");
    const peso_inicial_reactor = document.getElementById("peso_inicial_reactor");
    const peso_final_reactor = document.getElementById("peso_final_reactor");

    let datosEdicion;
    let mezcladorSeleccionado;
    let reactorSeleccionado;
    let recetaSeleccionada;
    let numeroProduccion;   
    let tipoReceta;
    let contenedorRecetas;

    let modo = localStorage.getItem("modo");
    //let producto = localStorage.getItem("producto");
    producto = "PP18";

    // ===== INICIO ZONA DE FUNCIONES ======

    function desactivarValidaciones() {
        peso_final_mezclador.required = false;        
        peso_inicial_reactor.required = false;
        peso_final_reactor.required = false;
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

    function generarRadiosMezcladores(mezcladoresP18, contenedorMezcladores, modo, datosEdicion) {

        mezcladoresP18.forEach(mezclador => {
            const id = "mezclador_" + mezclador.Equipo_id;

            const label = document.createElement("label");
            label.className = "radio-label";
            label.htmlFor = id;

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "mezclador";
            input.id = id;
            input.value = mezclador.Equipo_id;

            // MARCAR AUTOMÁTICAMENTE EN MODO EDITAR
            if (modo === "editar" && datosEdicion.Mezclador == mezclador.Equipo_id) {
                input.checked = true;
                mezcladorSeleccionado = mezclador.Equipo_id;
                console.log("mezcladorSeleccionado: ", mezcladorSeleccionado);                
            }

            label.appendChild(input);
            label.appendChild(document.createTextNode(mezclador.Equipo_id));

            contenedorMezcladores.appendChild(label);
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

    // === Función InicializarFormulario === 

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

            //==== MEZCLADORES ====
            const contenedorMezcladores = document.querySelector("#mezcladores fieldset");
            //contenedorMezcladores.innerHTML = "";

            const mezcladores = data.equipos.filter(e => e.Tipo === "Mezclador");
            generarRadiosMezcladores(mezcladores, contenedorMezcladores, modo, datosEdicion);

            //==== REACTORES ====
            const contenedorReactores = document.querySelector("#reactores fieldset");
            const reactores = data.equipos.filter(e => e.Tipo === "Reactor");
            //contenedorReactores.innerHTML = "";
            //generarRadiosReactores(reactores, contenedorReactores, modo, datosEdicion);

            //==== RECETAS ====
            const contenedorRecetas = document.querySelector("#recetas fieldset");
            //contenedorRecetas.innerHTML = "";
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

    // ===== FIN ZONA DE FUNCIONES ======

    [peso_inicial_mezclador, peso_final_mezclador, peso_inicial_reactor, peso_final_reactor].forEach(input => {
        input.addEventListener("input", () => formatearNumero(input));
    });

    // ==== BOTÓN RETROCEDER ====

    btnRetroceder.addEventListener("click", () => {
        window.location.href = "/HTML/public/";
    });


    // ==== MODO CREAR ====

    if (modo === "crear") {
        console.log("Estamos en modo creación");
        const contenedorReactores = document.getElementById("reactores");    
        const pesoFinalMezcladores = document.getElementById("peso_final_mezcla");
        contenedorReactores.style.display = "none"; 
        pesoFinalMezcladores.style.display = "none";

        inicializarFormulario(modo, producto)
            .then(data => {
                btnCrear.addEventListener("click", () => {

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

                    if (peso_inicial_mezclador.value === "") {
                        alert("Por favor, selecciona un peso de mezclador");
                        return;
                    }                                       

                    const recetaMarcada = document.querySelector("input[name='receta']:checked");
                    if (recetaMarcada) recetaSeleccionada = recetaMarcada.value;

                    if (!recetaSeleccionada) {
                        alert("Por favor, selecciona una receta");
                        return;
                    }
                    
                    pesoInicialMezcladorLimpio = peso_inicial_mezclador.value.replace(/\./g, "");

                    /*const reactorMarcado = document.querySelector("input[name='reactor']:checked");
                    if (reactorMarcado) reactorSeleccionado = reactorMarcado.value;

                    if (!reactorSeleccionado) {
                        alert("Por favor, selecciona un reactor");
                        return;
                    }

                    const pesoLimpio = peso_inicial_reactor.value.replace(/\./g, "");*/

                    const datosEnviar = new FormData();
                    datosEnviar.append("numeroProduccion", numeroProduccion);
                    datosEnviar.append("fechaHoraInicio", fechaHoraInicio);
                    datosEnviar.append("mezclador", mezcladorSeleccionado);
                    datosEnviar.append("pesoInicialMezclador", pesoInicialMezcladorLimpio);
                    datosEnviar.append("receta", recetaMarcada.value);
                    datosEnviar.append("producto", "PP18");
                    
                    //console.log (Object.fromEntries(datosEnviar)); return;

                    fetch("/HTML/app/models/insertarP18.php", {
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

    
});