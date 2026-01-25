document.addEventListener("DOMContentLoaded", function(){
    const btnRetroceder = document.getElementById("btnRetroceder");
    //const btnIniciarProduccion = document.getElementById("btnIniciarProduccion");
    const btnValidar = document.getElementById("btnValidar");
    const displayProduccion = document.getElementById("displayProduccion");
    const peso_inicial_mezclador = document.getElementById("peso_inicial_mezclador");
    const peso_inicial_reactor = document.getElementById("peso_inicial_reactor");
    let mezcladorSeleccionado;
    let reactorSeleccionado;
    let recetaSeleccionada;
    let numeroProduccion;

    //const producto = "P18";    

    const modo = localStorage.getItem("modoP18");  // "crear" o "editar"
    //const datosEditar = localStorage.getItem("editarP18");
    const datosEdicion = JSON.parse(localStorage.getItem("editarP18"));    
    

    // === CARGAR DATOS SI VENIMOS DESDE EDITAR ===    

    if (datosEdicion && modo === "editar") {        
        console.log("Modo edición activado:", datosEdicion);        

        // Si quieres bloquear el número de fabricación:
        // document.getElementById("numeroFabricacion").readOnly = true;
        desactivarValidaciones();
    }

    function desactivarValidaciones() {
        console.log("Validaciones desactivadas (modo edición)");

    // Evitar validaciones de selección
        mezcladorSeleccionado = true;
        reactorSeleccionado = true;
        recetaSeleccionada = true;

    // Evitar validación de pesos
        peso_inicial_mezclador.required = false;
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
        window.location.href = "inicio.php";
    } 

    document.getElementById("btnAceptar").addEventListener("click", cerrarModal);

    //Obtener la última producción de P18 acabada o en curso, mezcladores disponibles, reactores dispones y recetas
    console.log("Obteniendo última producción de P18");
    const datos = new FormData();

    fetch("procesar.php", {
        method: "POST",
        body: datos
    })
    .then (response => response.json())
    .then (data => {
        const ultimoNumero = parseInt(data.ultimoNumero, 10); //Convertir el data a número entero        

        if (isNaN(ultimoNumero)) {
            console.error("Respuesta inválida del servidor:", data);
            return;
        }

        numeroProduccion = ultimoNumero + 1;
        //let mezcladores;
        displayProduccion.innerHTML = numeroProduccion; //Mostramos el número de producción 
        //console.log("Producción siguiente:", numeroProduccion);

        //Manejar los mezcladores
        const listaMezcladores = data.mezcladores;
        //console.log("Mezcladores recibidos: ", listaMezcladores);

        //Manejar los reactores
        const listaReactores = data.reactores;        
        //console.log("Reactores recibidos: ", listaReactores);

        //Manejar las fabricaciaones en curso
        const listaFabricacionesCurso = data.fechaTransferencia;
        //console.log("Producciones en curso:", listaFabricacionesCurso);
        

        //Manejar INICIO o NO de las producciones de P18      
        
        const mezcladoresDisponibles = listaMezcladores.filter(r=> r.Estado === "Vacio");
        const mezcladoresAveriados = listaMezcladores.filter(r => r.Estado === "Averiado");
        
        const reactoresDisponibles = listaReactores.length;
        const reactoresP18Disponibles = listaReactores.filter(r => r.ProductoFabricado === "P18");        
        const reactoresP18Averiados = listaReactores.filter(r => r.Estado === "Averiado");
        
        const reactoresSulfatoDisponibles = listaReactores.filter(r => r.ProductoFabricado === "Sulfato");
        
        const fechaTransferenciaMezclador = data.fechaTransferencia;                
                
        let sePuedeFabricarP18 = false;
        let sePuedeFabricarSulfato = false;
        const ahora = new Date();        
        
        if (fechaTransferenciaMezclador) {
            const fechaTransferenciaDate = new Date(fechaTransferenciaMezclador.replace(" ", "T"));
            const diferenciaHoras = (ahora - fechaTransferenciaDate) / (1000 * 60 * 60);        
        } else {
            console.log("No hay fecha de transferencia disponible");
        }

    //CONDICIONES PARA MOSTRAR FORMULARIO PRODUCCIONES P18 copilot
    // --------------------------------------------------

    // 1) Regla general
    if (
        (reactoresP18Disponibles.length >= 1 && mezcladoresDisponibles.length > 1) ||
        (reactoresP18Disponibles.length === 0 && diferenciaHoras >= 4)
    ) {
        sePuedeFabricarP18 = true;
    }

    // 2) Casos con mezcladores averiados (ordenados por prioridad)

    // Caso más restrictivo: mezclador averiado + ningún mezclador disponible + reactor ocupado
    if (
        mezcladoresAveriados.length === 1 &&
        mezcladoresDisponibles.length === 0 &&
        reactoresP18Disponibles.length <= 1 &&
        diferenciaHoras > 4
    ) {
        sePuedeFabricarP18 = false;
        mostrarModal("1No es posible iniciar P18: un mezclador está averiado y el otro está ocupado.");

    // Caso: 1 averiado + 1 disponible + varios reactores disponibles
    } else if (
        mezcladoresAveriados.length === 1 &&
        mezcladoresDisponibles.length === 1 &&
        reactoresP18Disponibles.length > 1 &&
        diferenciaHoras > 4
    ) {
        sePuedeFabricarP18 = true;

    // Caso: 1 averiado + 1 disponible + 1 reactor disponible
    } else if (
        mezcladoresAveriados.length === 1 &&
        mezcladoresDisponibles.length >= 1 &&
        reactoresP18Disponibles.length === 1
    ) {
        sePuedeFabricarP18 = true;
    }

    // 3) Reglas con 1 reactor averiado (ordenadas por prioridad)

    // Caso más restrictivo: 1 reactor averiado + 2 mezcladores disponibles + 0 reactores disponibles
    if (
        reactoresP18Averiados.length === 1 &&
        mezcladoresDisponibles.length === 2 &&
        reactoresP18Disponibles.length === 0
    ) {
        sePuedeFabricarP18 = false;
        mostrarModal("2No es posible iniciar P18: no hay ningún reactor disponible para recibir la producción.");


    // Caso: 1 reactor averiado + 2 mezcladores disponibles + 1 reactor disponible
    } else if (
        reactoresP18Averiados.length === 1 &&
        mezcladoresDisponibles.length === 2 &&
        reactoresP18Disponibles.length === 1
    ) {
        sePuedeFabricarP18 = true;

    // Caso: 1 reactor averiado + solo 1 mezclador disponible
    } else if (
        reactoresP18Averiados.length === 1 &&
        mezcladoresDisponibles.length === 1
    ) {
        sePuedeFabricarP18 = false;
        mostrarModal("3No es posible iniciar P18: un reactor está averiado y el único mezclador disponible está ocupado.");
    }

    // --------------------------------------------------
    // CONDICIÓN EXTRA: Para cuando están los reactores llenos (Sulfato)
    // --------------------------------------------------

    if (mezcladoresDisponibles >= 1 && reactoresSulfatoDisponibles >= 1) {

        const hayMezcladoresEnUso = data.hayMezcladoresEnUso ?? false;

        if (!hayMezcladoresEnUso) {
            sePuedeFabricarSulfato = true;
        }
    }
    // --------------------------------------------------
    // MENSAJES FINALES
    // --------------------------------------------------

    if (modo !== "editar" && !sePuedeFabricarP18) {
        mostrarModal("4No es posible iniciar P18 con la configuración actual de equipos.");
    }


    if (!sePuedeFabricarSulfato) {
        console.log("No se puede fabricar Sulfato porque hay un mezclador en uso.");
    }

    //Contenedor de mezcladores
        const contenedorMezcladores = document.querySelector("#mezcladores fieldset");

    //Crear dinámicamente los radios de mezcladores        
        listaMezcladores.forEach((mezclador) => {
            const id = "mezclador_" + mezclador.Equipo_id;

            const label = document.createElement("label");
            label.className = "radio-label"; // aplica el estilo flex
            label.htmlFor = id;

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "mezclador";
            input.id = id;
            input.value = mezclador.Equipo_id;

            label.appendChild(input);
            label.appendChild(document.createTextNode(mezclador.Equipo_id));

            contenedorMezcladores.appendChild(label);
        });

        if (modo === "editar" && datosEdicion){ //Marcar y asignar valor
            console.log ("LLegamos... 1");
            const radioMezclador = document.querySelector(`input[name="mezclador"][value="${datosEdicion.Mezclador}"]`);
            if (radioMezclador) {
                radioMezclador.checked = true;
                mezcladorSeleccionado = datosEdicion.Mezclador;
            }
        }

        //Contenedor de reactores
        const contenedorReactores = document.querySelector("#reactores fieldset");

        //Crear dinámicamente los radios de reactores
        //listaReactores.forEach((reactor) => {
        reactoresP18Disponibles.forEach((reactor) => {
            const id = "reactor_" + reactor.Equipo_id;

            const label = document.createElement("label");
            label.className = "radio-label"; // aplica el estilo flex
            label.htmlFor = id;

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "reactor";
            input.id = id;
            input.value = reactor.Equipo_id;

            label.appendChild(input);
            label.appendChild(document.createTextNode(reactor.Equipo_id));

            contenedorReactores.appendChild(label);
        });        

        if (modo === "editar" && datosEdicion) {
            console.log ("LLegamos... 2");
            const radioReactor = document.querySelector(`input[name="reactor"][value="${datosEdicion.Reactor}"]`);

            if (radioReactor) {
                radioReactor.checked = true;
                reactorSeleccionado = datosEdicion;
            }
        }

        //Manejar las recetas
        const listaRecetas = data.recetas;
        //console.log("Recetas recibidas: ", listaRecetas);

        //Contenedor de recetas
        const contenedorRecetas = document.querySelector("#recetas fieldset");

        //Crear dinámicamente los radios de recetas        
        listaRecetas.forEach((receta, index) => {
            const id = `R${index + 1}_p18`; // ahora sí funciona correctamente

            const label = document.createElement("label");
            label.className = "radio-label"; // aplica el estilo flex
            label.htmlFor = id;

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "receta";
            input.id = id;
            input.value = receta.NombreReceta;

            label.appendChild(input);
            label.appendChild(document.createTextNode(receta.NombreReceta));

            contenedorRecetas.appendChild(label);
        });     

        if (modo === "editar" && datosEdicion) {
            console.log ("LLegamos... 3");
            const radioReceta = document.querySelector(`input[name="receta"][value="${datosEdicion.Receta}"]`);
            if (radioReceta) {
                radioReceta.checked = true;
                recetaSeleccionada = datosEdicion.Receta;
            }
        }
    })

    //Agregar event listeners a los radio buttons de mezcladores
        document.addEventListener("change", function(e){
            if (e.target.name === "mezclador") {
                console.log("Mezclador seleccionado:", e.target.value);
                mezcladorSeleccionado = e.target.value;
            }
        });
    
    //Agregar event listeners a los radio buttons de reactores
        document.addEventListener("change", function(e){
                if (e.target.name === "reactor") {
                    console.log("Reactor seleccionado:", e.target.value);
                    reactorSeleccionado = e.target.value;
                }
            });

    //Agregar event listeners a los radio buttons de reactores
        document.addEventListener("change", function(e){
                if (e.target.name === "receta") {
                    console.log("Receta seleccionada:", e.target.value);
                    recetaSeleccionada = e.target.value;
                }
            });    

    // Función para formatear números con separador de miles
    function formatearNumero(input) {
        let valor = input.value.replace(/\D/g, ""); // Quitar todo lo que no sea número
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Formatear con puntos
        input.value = valor;
        console.log("Valor formateado:", valor);
    }

    // Seleccionamos los inputs
    const inputsPesos = [peso_inicial_mezclador, peso_inicial_reactor];

    // Asignamos el mismo listener a ambos
    inputsPesos.forEach(input => {
        input.addEventListener("input", () => formatearNumero(input));
    });

    //Acción para el botón Retroceder
    btnRetroceder.addEventListener("click", function(){
        window.location.href="inicio.php";
    })

    //Acción para el boton Iniciar
    btnValidar.addEventListener("click", function(e){

        if (modo==="editar") {
            e.preventDefault();
            alert("En modo edición no se valida ni se inicia producción");
            return;
        }
        const ahora = new Date();

        //Formato YYYY-MM-DD HH:MM:SS (ideal para MySQL)
        const fechaHoraInicio =
            ahora.getFullYear() + "-" +
            String(ahora.getMonth() + 1).padStart(2, '0') + "-" +
            String(ahora.getDate()).padStart(2, '0') + " " +
            String(ahora.getHours()).padStart(2, '0') + ":" +
            String(ahora.getMinutes()).padStart(2, '0') + ":" +
            String(ahora.getSeconds()).padStart(2, '0');
        
        // Convertir y limpiar el valor del peso 
        const pesoMezcladorInt = parseInt( peso_inicial_mezclador.value.replace(/\./g, ""), 10 );
        const pesoReactorInt = parseInt( peso_inicial_reactor.value.replace(/\./g, ""), 10 );        
        
        //Validación de que hay seleccionado un Mezclador
        if (!mezcladorSeleccionado) {
            alert("Debe seleccionar un Mezclador");
            return;
        }

        //Validación estricta del peso_inicial_mezclador
        if (!peso_inicial_mezclador.value.trim() || isNaN(pesoMezcladorInt)) {    
            alert("Debe ingresar un PESO válido para el mezclador");
            return; // Detiene el proceso 
        }

        //Validación de que hay seleccionado un Reactor
        if (!reactorSeleccionado) {
            alert("Debe seleccionar un Reactor");
            return;
        }

        //Validación de que hay seleccionada una Receta
        if (!recetaSeleccionada) {
            alert("Debe seleccionar una Receta");
            return;
        }
        
        //Mostrar en la consola los datos a enviar a la tabla produccion_en_curso        
        console.log("Nº Produccion:", numeroProduccion);
        console.log("Fecha y Hora Inicio: ", fechaHoraInicio);
        console.log("Mezclador: ", mezcladorSeleccionado);
        console.log("Reactor: ", reactorSeleccionado);
        console.log("Receta: ", recetaSeleccionada);            
        console.log("Peso Inicial Mezclador: ", pesoMezcladorInt);

        //Iniciar envio de datos a la tabla fabricaciones_en_curso mediante AJAX
        //Preparamos los datos para ser enviados por AJAX
        console.log("Preparando datos para enviarlos por AJAX...");
        const data = new FormData();

        data.append("fechaHoraInicio", fechaHoraInicio);
        data.append("mezclador", mezcladorSeleccionado);
        data.append("reactor", reactorSeleccionado);
        data.append("receta", recetaSeleccionada);
        data.append("numeroProduccion", numeroProduccion);
        data.append("producto", producto);

        fetch("enviardatos.php", {
            method: "POST",
            body: data
        })
        .then(response => response.json())        
        .then(json => {
            console.log("Dasos enviados:", json);
         
            if(json.ok) {
                console.log("json.ok")
                //Mostrar modal
                mostrarModal(json.message);
                
            } else {
                alert("Error: " + (json.error || "Error desconocido"));
            }
        })            
        .catch(error => console.log("Error al enviar los datos: ", error));
    })
})