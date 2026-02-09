document.addEventListener("DOMContentLoaded", () => {

    const btnRetroceder = document.getElementById("btnRetroceder");    
    const btnValidar = document.getElementById("btnValidar");
    const displayProduccion = document.getElementById("displayProduccion");
    const divMezcladores = document.getElementById("mezcladores");
    const peso_inicial_mezclador = document.getElementById("peso_inicial_mezclador");    
    const peso_inicial_reactor = document.getElementById("peso_inicial_reactor");

    let mezcladorSeleccionado;
    let reactorSeleccionado;
    let recetaSeleccionada;
    let numeroProduccion;   
    let tipoReceta;
    let contenedorRecetas;
     

    let modo = localStorage.getItem("modo");    
    let datosEdicion;    

    if (modo === "crear") {        
        producto = localStorage.getItem("producto");        
        displayProduccion.innerHTML = "...";
    }

    function desactivarValidaciones() {
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
        window.location.href = "/HTML/public/index.php";
    }

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

    function generarRadiosReactores(tipoReactor, contenedorReactores, modo, datosEdicion) {

    tipoReactor.forEach(reactor => {
        const id = "reactor_" + reactor.Equipo_id;

        const label = document.createElement("label");
        label.className = "radio-label";
        label.htmlFor = id;

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "reactor";
        input.id = id;
        input.value = reactor.Equipo_id;

        // MARCAR AUTOMÁTICAMENTE EN MODO EDITAR
        if (modo === "editar" && datosEdicion.Reactor == reactor.Equipo_id) {
            input.checked = true;
            reactorSeleccionado = reactor.Equipo_id;
            console.log("reactorSeleccionado:", reactor.Equipo_id);
        }

        label.appendChild(input);
        label.appendChild(document.createTextNode(reactor.Equipo_id));

        contenedorReactores.appendChild(label);
    });
}

   function generarRadioRecetas(tipoReceta, contenedorRecetas, modo, datosEdicion) {

    tipoReceta.forEach((receta, index) => {
        const id = `R${index + 1}_p18`;

        const label = document.createElement("label");
        label.className = "radio-label";
        label.htmlFor = id;

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "receta";
        input.id = id;
        input.value = receta.NombreReceta;

        // MARCAR AUTOMÁTICAMENTE EN MODO EDITAR
        if (modo === "editar" && datosEdicion.Receta == receta.NombreReceta) {                
                input.checked = true;
                recetaSeleccionada = receta.NombreReceta;
                console.log("recetaSeleccionada:", receta.NombreReceta);
        }

        label.appendChild(input);
        label.appendChild(document.createTextNode(receta.NombreReceta));

        contenedorRecetas.appendChild(label);
    });
}

    
    

    document.getElementById("btnAceptar").addEventListener("click", cerrarModal);    

    if (modo === "crear" && producto === "Sulfato") {                   
        divMezcladores.style.display = "none";
        const tituloFormulario = document.getElementById("titulo-formulario");
        tituloFormulario.innerHTML = "Sulfato";
    }

    if (modo === "crear") {
        console.log("Estamos en modo crear"); 
        const datos = new FormData();

        datos.append("producto", producto);         
        datos.append("modo", modo);       
        

        //fetch("/HTML/app/models/read.php", {
        fetch("/HTML/app/models/leer.php", {
            method: "POST",
            body: datos
        })
        .then(response => response.json())
        .then(data => {

            // --- NUMERO DE PRODUCCION ---- //
            if (modo === "crear") {
                let ultimoNumero = parseInt(data.ultimoNumero, 10); 
                const ultimaFabricacionEnCurso = Math.max( ...data.producciones_en_curso.map(item => parseInt(item.NumeroFabricacion, 10)) ); ultimoNumero = Math.max(ultimoNumero, ultimaFabricacionEnCurso); numeroProduccion = isNaN(ultimoNumero) ? 1 : ultimoNumero + 1; displayProduccion.innerHTML = numeroProduccion; 
            }
            // --- GENERAR MEZCLADORES --- //

            const listaEquipos = data.lista_de_equipos;
            const mezcladoresP18 = listaEquipos.filter(e => e.Tipo === "Mezclador" && e.ProductoFabricado === "P18");

            const contenedorMezcladores = document.querySelector("#mezcladores fieldset");

            if (producto === "Sulfato") {
                contenedorMezcladores.style.display = "none";
            } else {
                contenedorMezcladores.style.display = "block";

            }

            generarRadiosMezcladores(mezcladoresP18, contenedorMezcladores, modo, datosEdicion);

            //--- GENERAR REACTORES --- //

            const reactoresP18 = listaEquipos.filter(e => e.Tipo === "Reactor" && e.ProductoFabricado === "P18");
            const reactoresSulfato = listaEquipos.filter(e => e.Tipo === "Reactor" && e.ProductoFabricado === "Sulfato");

            const contenedorReactores = document.querySelector("#reactores fieldset");
            let tipoReactor = producto === "P18" ? reactoresP18 : reactoresSulfato;

            generarRadiosReactores(tipoReactor, contenedorReactores, modo, datosEdicion);            

            // --- GENERAR RECETAS --- //

            const listaRecetas = data.lista_de_recetas;
            const recetasP18 = listaRecetas.filter(r => r.ProductoFabricado === "P18");
            const recetasSulfato = listaRecetas.filter(r => r.ProductoFabricado === "Sulfato");

            contenedorRecetas = document.querySelector("#recetas fieldset");
            tipoReceta = producto === "P18" ? recetasP18 : recetasSulfato;

            generarRadioRecetas(tipoReceta, contenedorRecetas, modo, datosEdicion);
            
        })
        .catch(error => console.log("Error en fetch leer.php:", error));
    } 

    document.addEventListener("change", function(e){  //LIstener modo CREAR
            if (e.target.name === "mezclador") mezcladorSeleccionado = e.target.value;
            if (e.target.name === "reactor") reactorSeleccionado = e.target.value;
            if (e.target.name === "receta") recetaSeleccionada = e.target.value;
    });
        

    function formatearNumero(input) {
        let valor = input.value.replace(/\D/g, "");
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        input.value = valor;
    }

    [peso_inicial_mezclador, peso_inicial_reactor].forEach(input => {
        input.addEventListener("input", () => formatearNumero(input));
    });

    btnRetroceder.addEventListener("click", function(){
        window.location.href="/HTML/public/index.php";
    });

    if (modo === "editar") {
        datosEdicion = JSON.parse(localStorage.getItem("datosEditables"));
        producto = datosEdicion.Producto_id;
        numeroProduccion = datosEdicion.NumeroFabricacion;

        displayProduccion.innerHTML = numeroProduccion;        

        // Cargar recetas igual que en modo crear
        const datos = new FormData();
        datos.append("producto", producto);
        datos.append("modo", "editar");

        //fetch("/HTML/app/models/read.php", {
        fetch("/HTML/app/models/leer.php", {
            method: "POST",
            body: datos
        })
        .then(r => r.json())
        .then(data => {

            // Preparar lista de Ëquipos
            const listaEquipos = data.lista_de_equipos;

            // ============================
            //   MEZCLADORES (solo si P18)
            // ============================
            const divMezcladores = document.getElementById("mezcladores");
            const contenedorMezcladores = divMezcladores.querySelector("fieldset");

            if (producto === "Sulfato") {
                // Ocultar mezcladores en modo editar
                divMezcladores.style.display = "none";
            } else {
                // Mostrar y generar mezcladores
                divMezcladores.style.display = "block";

                const mezcladoresP18 = listaEquipos.filter(
                    e => e.Tipo === "Mezclador" && e.ProductoFabricado === "P18"
                );

                generarRadiosMezcladores( mezcladoresP18, contenedorMezcladores, modo, datosEdicion);
            }            

            // REACTORES
            const reactoresP18 = listaEquipos.filter(e => e.Tipo === "Reactor" && e.ProductoFabricado === "P18"); 
            const reactoresSulfato = listaEquipos.filter(e => e.Tipo === "Reactor" && e.ProductoFabricado === "Sulfato");

            const contenedorReactores = document.querySelector("#reactores fieldset");
            let tipoReactor = producto === "P18" ? reactoresP18 : reactoresSulfato;

            generarRadiosReactores(tipoReactor, contenedorReactores, modo, datosEdicion);

            // Preparar recetas
            const listaRecetas = data.lista_de_recetas;
            const recetasP18 = listaRecetas.filter(r => r.ProductoFabricado === "P18");
            const recetasSulfato = listaRecetas.filter(r => r.ProductoFabricado === "Sulfato");

            contenedorRecetas = document.querySelector("#recetas fieldset");
            tipoReceta = producto === "P18" ? recetasP18 : recetasSulfato;

            // Generar radios de recetas 
            generarRadioRecetas(tipoReceta, contenedorRecetas, modo, datosEdicion);

            // Cargar pesos iniciales
            peso_inicial_mezclador.value = datosEdicion.PesoInicialMezclador;
            formatearNumero(peso_inicial_mezclador);

            peso_inicial_reactor.value = datosEdicion.PesoInicialReactor;
            formatearNumero(peso_inicial_reactor);

            desactivarValidaciones();                        
    });
    
    // === LISTENER radio buttons editar===
    document.addEventListener("change", function(e){
        if (e.target.name === "mezclador") mezcladorSeleccionado = e.target.value;
        if (e.target.name === "reactor") reactorSeleccionado = e.target.value;
        if (e.target.name === "receta") recetaSeleccionada = e.target.value;
    });
    

    // === VALORES INICIALES ===
        mezcladorSeleccionado = document.querySelector("input[name='mezclador']:checked")?.value;
        reactorSeleccionado = document.querySelector("input[name='reactor']:checked")?.value;
        recetaSeleccionada = document.querySelector("input[name='receta']:checked")?.value;    
    }
    
       

    if (datosEdicion && modo === "editar") {  
        console.log("Estamos en modo edición....");

        peso_inicial_mezclador.value = datosEdicion.PesoInicialMezclador;
        formatearNumero(peso_inicial_mezclador);        

        peso_inicial_reactor.value = datosEdicion.PesoInicialReactor;
        formatearNumero(peso_inicial_reactor);        
        
        //desactivarValidaciones();
    } 
     

    btnValidar.addEventListener("click", function(e){

        if (modo === "editar") {
            e.preventDefault();

            const pesoMezcladorEditado = parseInt(peso_inicial_mezclador.value.replace(/\./g, ""), 10);
            const pesoReactorEditado = parseInt(peso_inicial_reactor.value.replace(/\./g, ""), 10);

            const data = new FormData();
            data.append("numeroProduccion", datosEdicion.NumeroFabricacion);
            data.append("mezclador", mezcladorSeleccionado);
            data.append("reactor", reactorSeleccionado);
            data.append("receta", recetaSeleccionada);
            data.append("pesoInicialMezclador", pesoMezcladorEditado);
            data.append("pesoInicialReactor", pesoReactorEditado);
            data.append("producto", producto);            

            fetch("../../app/models/actualizardatos.php", { 
                method: "POST",
                body: data
            })
            .then(response => response.json())
            .then(json => {                
                if (json.ok) mostrarModal("Producción actualizada correctamente");
                else alert("Error: " + json.error);
            })
            .catch(error => console.log("ERROR", error));

            return;
        }

        const ahora = new Date();
        const fechaHoraInicio =
            ahora.getFullYear() + "-" +
            String(ahora.getMonth() + 1).padStart(2, '0') + "-" +
            String(ahora.getDate()).padStart(2, '0') + " " +
            String(ahora.getHours()).padStart(2, '0') + ":" +
            String(ahora.getMinutes()).padStart(2, '0') + ":" +
            String(ahora.getSeconds()).padStart(2, '0');

        const pesoMezcladorInt = parseInt(peso_inicial_mezclador.value.replace(/\./g, ""), 10);
        const pesoReactorInt = parseInt(peso_inicial_reactor.value.replace(/\./g, ""), 10);

        if (!mezcladorSeleccionado && producto === "P18") {
            alert("Debe seleccionar un Mezclador");
            return;
        }

        if (producto !== "Sulfato" && (!peso_inicial_mezclador.value.trim() || isNaN(pesoMezcladorInt))) {
            alert("Debe ingresar un PESO válido para el mezclador");
            return;
        }

        if (!peso_inicial_reactor.value.trim() || isNaN(pesoReactorInt)) {
            alert("Debe ingresar un PESO válido para el reactor");
            return;
        }

        if (!reactorSeleccionado) {
            alert("Debe seleccionar un Reactor");
            return;
        }

        if (!recetaSeleccionada) {
            alert("Debe seleccionar una Receta");
            return;
        }

    // fetch para cuando modo != "editar"
        const data = new FormData();

        data.append("numeroProduccion", numeroProduccion);
        data.append("fechaHoraInicio", fechaHoraInicio);
        data.append("mezclador", mezcladorSeleccionado);
        data.append("reactor", reactorSeleccionado);
        data.append("receta", recetaSeleccionada);
        data.append("pesoInicialMezclador", pesoMezcladorInt);
        data.append("pesoInicialReactor", pesoReactorInt);
        data.append("producto", producto);

        fetch("/HTML/app/models/enviardatos.php", {  //"../../app/models/enviardatos.php"
            method: "POST",
            body: data
        })
        .then(response => response.json())
        .then(json => {
            if (json.ok) mostrarModal(json.message);
            else alert("Error: " + (json.error || "Error desconocido"));
        })
        .catch(error => console.log("Error al enviar los datos: ", error));
    });

});
