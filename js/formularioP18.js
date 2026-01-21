document.addEventListener("DOMContentLoaded", function(){
    const btnRetroceder = document.getElementById("btnRetroceder");
    const btnIniciarProduccion = document.getElementById("btnIniciarProduccion");
    const displayProduccion = document.getElementById("displayProduccion");
    const peso_inicial_mezclador = document.getElementById("peso_inicial_mezclador");
    const peso_inicial_reactor = document.getElementById("peso_inicial_reactor");
    let mezcladorSeleccionado;
    let reactorSeleccionado;
    let recetaSeleccionada;

    const producto = "P18"; 

    //Obtener la última producción de P18 acabada o en curso
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

        window.numeroProduccion = ultimoNumero + 1;
        //let mezcladores;
        displayProduccion.innerHTML = numeroProduccion; //Mostramos el número de producción 
        console.log("Producción siguiente:", numeroProduccion);

        //Manejar los mezcladores
        const listaMezcladores = data.mezcladores;
        console.log("Mezcladores recibidos: ", listaMezcladores);                

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

        //Manejar los reactores
        const listaReactores = data.reactores;
        console.log("Reactores recibidos: ", listaReactores);

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
        const fechaHora =
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

         //Validación estricta del peso_inicial_mezclador
        if (!peso_inicial_reactor.value.trim() || isNaN(pesoReactorInt)) {    
            alert("Debe ingresar un PESO válido para el reactor");
            return; // Detiene el proceso 
        }

        



        
            //Mostrar en la consola los datos a enviar a la tabla produccion_en_curso        
            console.log("Fecha y Hora Inicio: ", fechaHora);
            console.log("Mezclador: ", mezcladorSeleccionado);
            console.log("Reactor: ", reactorSeleccionado);
            console.log("Receta: ", recetaSeleccionada);
            console.log("Peso Inicial Mezclador: ", pesoMezcladorInt);
                


    })
})