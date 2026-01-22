document.addEventListener("DOMContentLoaded", function(){
    const btnRetroceder = document.getElementById("btnRetroceder");
    const btnIniciarProduccion = document.getElementById("btnIniciarProduccion");
    const displayProduccion = document.getElementById("displayProduccion");
    const peso_inicial_mezclador = document.getElementById("peso_inicial_mezclador");
    const peso_inicial_reactor = document.getElementById("peso_inicial_reactor");
    let mezcladorSeleccionado;
    let reactorSeleccionado;
    let recetaSeleccionada;
    let numeroProduccion;

    const producto = "P18";    

    function mostrarModal(mensaje) {
        document.getElementById("mensajeModal").textContent = mensaje;
        document.getElementById("miModal").style.display = "flex";

        document.getElementById("btnAceptar").onclick = function () {
            window.location.href = "inicio.php";
        };
    }

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
        const fechaTransferenciaDate = new Date(fechaTransferenciaMezclador);
        const diferenciaHoras = (ahora - fechaTransferenciaDate) / (1000 * 60 * 60);        

        //CONDICIONES PARA MOSTRAR FORMULARIO PRODUCCIONES P18
        //Regla general
        if (
            (reactoresP18Disponibles.length >= 1 && mezcladoresDisponibles.length > 1) ||
            (reactoresP18Disponibles.length === 0 && diferenciaHoras >= 4)
        ) {
            sePuedeFabricarP18 = true;
        }

        // Casos con mezcladores averiados
        if (
            mezcladoresAveriados.length === 1 &&  //===1
            mezcladoresDisponibles.length >= 1 &&
            reactoresP18Disponibles.length === 1
        ) {
            sePuedeFabricarP18 = true;
        }

        if (
            mezcladoresAveriados.length >= 1 && // === 1
            mezcladoresDisponibles.length === 0 &&
            reactoresP18Disponibles.length <= 1 && //=== 1
            diferenciaHoras > 4
        ) {
            sePuedeFabricarP18 = false;
            mostrarModal("Hay un mezclador averiado y el otro está en un proceso");
        }

        if (
            mezcladoresAveriados.length === 1 &&
            mezcladoresDisponibles.length === 1 &&
            reactoresP18Disponibles.length > 1 &&
            diferenciaHoras > 4
        ) {
            sePuedeFabricarP18 = true;
        }

        //Reglas con 1 reactor averiado
        if (
            reactoresP18Averiados.length === 1 &&
            mezcladoresDisponibles.length === 2 &&
            reactoresP18Disponibles.length === 0
        ) {
            sePuedeFabricarP18 = false;
            mostrarModal("Hay un mezclador averiado y el otro está en un proceso");

        } else if (
            reactoresP18Averiados.length === 1 &&
            mezcladoresDisponibles.length === 2 &&
            reactoresP18Disponibles.length === 1
        ) {
            sePuedeFabricarP18 = true;

        } else if (
            reactoresP18Averiados.length === 1 &&
            mezcladoresDisponibles.length === 1
        ) {
            sePuedeFabricarP18 = false;
            mostrarModal("Hay un mezclador averiado y el otro está en un proceso");
        }

        //CONDICIÓN EXTRA¨: Para cuando están los reactores llenos

         if (mezcladoresDisponibles >=1 && reactoresSulfatoDisponibles >=1) {
            //Solo se permite si NO hay mezcladores en uso
            const hayMezcladoresEnUso = data.hayMezcladoresEnUso ?? false;

        if (!hayMezcladoresEnUso) {
                sePuedeFabricarSulfato = true;
            }
        }
        
        if (!sePuedeFabricarP18) {
            mostrarModal("Hay un mezclador averiado y el otro está en un proceso");
        }        
        
        if (!sePuedeFabricarSulfato) {
            console.log("No se puede fabricar Sulfato porque hay un mezclador en uso.");
        }

        //console.logs para comprobar las condiciones de las CONDICIONES DE MOSTRAR FORMULARIO P18
            //console.log("Mezcladores disponibles:" , mezcladoresDisponibles);            
            //console.log("Mezcladores averiados: ", mezcladoresAveriados);
            //console.log("Reactores P18 disponibles: ", reactoresP18Disponibles);
            //console.log("Reactores averidados: ", reactoresP18Averiados);
            //console.log("Reactores Sulfato disponibles: ", reactoresSulfatoDisponibles);            
            //console.log("Ahora: ", ahora);
            //console.log("Fecha Transferencia:", fechaTransferenciaMezclador);
            //console.log("Diferencia tiempo:", diferenciaHoras);
            //console.log("Se puede fabricar P18: ", sePuedeFabricarP18);
        //return;
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

        //Contenedor de reactores
        const contenedorReactores = document.querySelector("#reactores fieldset");

        //Crear dinámicamente los radios de reactores
        listaReactores.forEach((reactor) => {
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

        //Manejar las recetas
        const listaRecetas = data.recetas;
        console.log("Recetas recibidas: ", listaRecetas);

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
    btnIniciarProduccion.addEventListener("click", function(){
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

        //Validación estricta del peso_inicial_reactor
        /*if (!peso_inicial_reactor.value.trim() || isNaN(pesoReactorInt)) {    
            alert("Debe ingresar un PESO válido para el reactor");
            return; // Detiene el proceso 
        }*/

        
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
        .then(json => console.log("Dasos enviados:", json))
        .catch(error => console.log("Error al enviar los datos: ", error))


    })
})