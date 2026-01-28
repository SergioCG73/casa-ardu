document.addEventListener("DOMContentLoaded", function(){
    const btnRetroceder = document.getElementById("btnRetroceder");    
    const btnValidar = document.getElementById("btnValidar");
    const displayProduccion = document.getElementById("displayProduccion");
    const peso_inicial_mezclador = document.getElementById("peso_inicial_mezclador");    
    const peso_inicial_reactor = document.getElementById("peso_inicial_reactor");
    let mezcladorSeleccionado;
    let reactorSeleccionado;
    let recetaSeleccionada;
    let numeroProduccion;
    let pesoInicialMezclador;

    const producto = localStorage.getItem("producto");
    const modo = localStorage.getItem("modoP18");  // "crear" o "editar"    
    const datosEdicion = JSON.parse(localStorage.getItem("editarP18"));
    
    console.log("producto: ", producto);
    console.log("modo: ", modo);
    console.log("datosEdicion: ", datosEdicion);


    // === CARGAR DATOS SI VENIMOS DESDE EDITAR ===    

    if (datosEdicion && modo === "editar") {        
        console.log("Modo edición activado:", datosEdicion); //return;  

        // Si quieres bloquear el número de fabricación:
        // document.getElementById("numeroFabricacion").readOnly = true;
        desactivarValidaciones();
    }

    //Función desactivarValidaciones()
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

    // Función mostrarModal
    function mostrarModal(mensaje) {
        const modal = document.getElementById("modal");
        document.getElementById("modalMsg").textContent = mensaje;
        modal.hidden = false;
        modal.style.display = "flex";
    }

    // Función cerrarModal    
    function cerrarModal() {
        const modal = document.getElementById("modal");
        modal.hidden = true;
        modal.style.display = "none";
        window.location.href = "inicio.php";
    } 

    // Escuchador para el btnAceptar
    document.getElementById("btnAceptar").addEventListener("click", cerrarModal);

    if(modo === "crear" && producto === "p18") {
        console.log ("Crear P18");
    }

    // Obtener la última producción de P18 acabada o en curso, mezcladores disponibles, reactores dispones, recetas, pesos
    console.log("Obteniendo última producción de P18");
    const datos = new FormData();

    fetch("models/test.php", {
        method: "POST",
        body: datos
    })
    .then (response => response.json())
    .then (data => {        
        if (!data.ok) return;
        
        const ultimoNumero = parseInt(data.ultimoNumero, 10); //Convertir el data a número entero        

        if (isNaN(ultimoNumero)) {
            console.error("Respuesta inválida del servidor:", data);
            return;            
        }
        
        numeroProduccion = ultimoNumero + 1; 
        console.log("numeroProduccion: ", numeroProduccion); 

        if (data.producciones_en_curso.length === 0) {
            console.log("Sin datos en la tabla fabricaciones_en_curso");
            return;
        } 

        
        console.log("data: ", data.producciones_en_curso);
        const pesoInicialMezclador = data.producciones_en_curso[0].PesoInicialMezclador;         
        console.log("pesoInicialMezclador: ", pesoInicialMezclador);

        //Manejo del número de producción
        displayProduccion.innerHTML = numeroProduccion; //Mostramos el número de producción 
            //console.log("Producción siguiente:", numeroProduccion);
                

        //Manejar los mezcladores
        const listaEquipos = data.equipos;
        console.log("Equipos: ", listaEquipos);               

        const mezcladoresP18 = listaEquipos.filter(equipo => equipo.Tipo === "Mezclador" && equipo.ProductoFabricado === "P18");
            console.log("Mezcladores P18: ", mezcladoresP18);             

        //Manejar los reactores
        const reactoresP18 = listaEquipos.filter(equipo => equipo.Tipo === "Reactor" && equipo.ProductoFabricado === "P18");
            console.log("Reactores P18: ", reactoresP18);         
        
        
        //Manejar las fabricaciones en curso
        const listaFabricacionesCurso = data.producciones_en_curso;
            console.log("Producciones en curso:", listaFabricacionesCurso);
    
    
    // --------------------------------------------------
    // MENSAJES FINALES
    // --------------------------------------------------

    /*if (modo !== "editar" && !sePuedeFabricarP18) {
        mostrarModal("4No es posible iniciar P18 con la configuración actual de equipos.");
    }


    if (!sePuedeFabricarSulfato) {
        console.log("No se puede fabricar Sulfato porque hay un mezclador en uso.");
    }*/

    // ----------------------------------------------------------------------------------
    // Mostrar en pantalla los valores recogidos en la consulta
    // ----------------------------------------------------------------------------------

    //Contenedor de mezcladores
        const contenedorMezcladores = document.querySelector("#mezcladores fieldset");        

    //Crear dinámicamente los radios de mezcladores        
        mezcladoresP18.forEach((mezclador) => {
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
            const radioMezclador = document.querySelector(`input[name="mezclador"][value="${datosEdicion.Mezclador}"]`);
            if (radioMezclador) {
                radioMezclador.checked = true;
                mezcladorSeleccionado = datosEdicion.Mezclador;
            }
        }        

        //Contenedor de reactores
        const contenedorReactores = document.querySelector("#reactores fieldset");        

        //Crear dinámicamente los radios de reactores                
        //reactoresP18Disponibles.forEach((reactor) => {            
        reactoresP18.forEach((reactor) => {
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
            const radioReactor = document.querySelector(`input[name="reactor"][value="${datosEdicion.Reactor}"]`);

            if (radioReactor) {
                radioReactor.checked = true;
                reactorSeleccionado = datosEdicion;
            }
        }

        //Manejar las recetas
        const listaRecetas = data.recetas;            
        const recetasP18 = listaRecetas.filter(recetas => recetas.ProductoFabricado === "P18");
            console.log("Recetas P18: ", recetasP18); 

        //Contenedor de recetas
        const contenedorRecetas = document.querySelector("#recetas fieldset");
        

        //Crear dinámicamente los radios de recetas        
        recetasP18.forEach((receta, index) => {
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
            const radioReceta = document.querySelector(`input[name="receta"][value="${datosEdicion.Receta}"]`);
            if (radioReceta) {
                radioReceta.checked = true;
                recetaSeleccionada = datosEdicion.Receta;
            }
        }

    // Mostrar los pesos iniciales en formulario        
        peso_inicial_mezclador.value = pesoInicialMezclador;       

        formatearNumero(peso_inicial_mezclador);

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
        input.value = valor + " Kg";
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

    //Acción para el btnValidar
    btnValidar.addEventListener("click", function(e){

        if (modo==="editar") {
            e.preventDefault();
            //alert("En modo edición no se valida ni se inicia producción"); return;

            const data = new FormData();

            data.append("numeroProduccion", numeroProduccion);
            data.append("mezclador", mezcladorSeleccionado);            
            data.append("reactor", reactorSeleccionado);
            data.append("receta", recetaSeleccionada);    
            data.append("pesoInicialMezclador", pesoInicialMezclador); //NUEVO
            data.append("producto", producto);

            /*for (let pair of data.entries()) {
            console.log(pair[0] + ": " + pair[1]);            
            }
            return;*/

            fetch("models/actualizardatos.php", {
                method: "POST",
                body: data
            })
            .then(response => response.json())
            .then(json => {
                console.log("datos enviados a actualizardatos.php:", json)             
            })
            .catch(error => {
                console.log("ERROR", error);
            });

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

        data.append("numeroProduccion", numeroProduccion);
        data.append("fechaHoraInicio", fechaHoraInicio);
        data.append("mezclador", mezcladorSeleccionado);
        data.append("reactor", reactorSeleccionado);
        data.append("receta", recetaSeleccionada);        
        data.append("pesoInicialMezclador", pesoMezcladorInt); //NUEVO
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