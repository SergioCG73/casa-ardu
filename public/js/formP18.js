document.addEventListener("DOMContentLoaded", () => {
    // ===== ELEMENTOS DEL DOM =====
    const btnRetroceder = document.getElementById("btnRetroceder");    
    const btnCrear = document.getElementById("btnCrear");    
    const displayProduccion = document.getElementById("displayProduccion");
    const contenedorMezcladores = document.querySelector("#mezcladores fieldset");
    const contenedorPesoFinalMezclador = document.getElementById("peso_final_mezcla");    
    const peso_inicial_mezclador = document.getElementById("peso_inicial_mezclador");  
    const peso_final_mezclador = document.getElementById("peso_final_mezclador");

    // ===== VARIABLES GLOBALES =====
    let datosEdicion;
    let datosTransferencia;
    let mezcladorSeleccionado;
    let recetaSeleccionada;
    let numeroProduccion;   
    
    const modo = localStorage.getItem("modo");
    //const producto = "PP18";
    let producto = localStorage.getItem("producto");

    if (modo === "crear" && producto === "P18") {
        producto = "PP18";
    }   

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
            });

            label.appendChild(input);
            label.appendChild(document.createTextNode(receta.NombreReceta));
            contenedorRecetas.appendChild(label);
        });
    }

    function generarRadiosReactores(reactores, datosEdicion) {
        const contenedorReactores = document.querySelector("#reactores .radio-group");
        contenedorReactores.innerHTML = ""; // ← borrar los estáticos 

        reactores.forEach(reactor => {
            const id = "reactor_" + reactor.Equipo_id;
            const label = document.createElement("label");
            label.className = "radio-label";
            label.htmlFor = id;

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "reactor";
            input.id = id;
            input.value = reactor.Equipo_id;

            if (datosEdicion && datosEdicion.Reactor == reactor.Equipo_id) {
                input.checked = true;
            }

            label.appendChild(input);
            label.appendChild(document.createTextNode(reactor.Equipo_id));
            contenedorReactores.appendChild(label);
        });
    }

   function inicializarFormulario(modo, producto, datosEdicion = null) {
        const formData = new FormData();
        formData.append("modo", modo);
        formData.append("producto", producto);        

        //return fetch("/HTML/app/models/leerdatos.php", { method: "POST", body: formData })
        return fetch("/HTML/app/models/leerV2.php", { method: "POST", body: formData })
            .then(res => res.json())
            .then(data => {
                numeroProduccion = ((modo === "editar" || modo === "transferir") && datosEdicion)
                    ? data.ultimaEnCurso
                    : data.siguienteFabricacion;

                displayProduccion.textContent = numeroProduccion;

                generarRadiosMezcladores(
                    data.equipos.filter(e => e.Tipo === "Mezclador"),
                    datosEdicion                    
                );

                generarRadiosReactores(                    
                    data.reactores, datosEdicion
                );
                
                generarRadiosRecetas(data.recetas, datosEdicion);

                if (modo === "transferir") {
                    console.log("dr", data.recetas);
                    generarRadiosReactores(data.recetas, datosEdicion);
                }

                // Rellenar pesos si hay datos de edición
                if (datosEdicion) {
                    if (datosEdicion.PesoInicialMezclador !== undefined)
                        peso_inicial_mezclador.value = datosEdicion.PesoInicialMezclador;

                    if (datosEdicion.PesoFinalMezclador !== undefined)
                        peso_final_mezclador.value = datosEdicion.PesoFinalMezclador;

                    formatearNumero(peso_inicial_mezclador);
                    formatearNumero(peso_final_mezclador);
                }

                return data;
            });
    }

    [peso_inicial_mezclador, peso_final_mezclador].forEach(input => {
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
                datosEnviar.append("numeroProduccion", numeroProduccion);
                datosEnviar.append("fechaHoraInicio", fechaHoraInicio);
                datosEnviar.append("mezclador", mezcladorSeleccionado);
                datosEnviar.append("pesoInicialMezclador", peso_inicial_mezclador.value.replace(/\./g,""));
                datosEnviar.append("receta", recetaSeleccionada);
                datosEnviar.append("producto", producto);

                /*const objeto = Object.fromEntries(datosEnviar.entries()); 
                console.log("objeto", objeto); return;*/ //producto = PP18                

                fetch("/HTML/app/models/insertarP18.php", { method: "POST", body: datosEnviar })
                    .then(res => res.json())
                    .then(json => { 
                        if (json.ok) mostrarModal(json.message);
                        else alert(json.error); });
            });
        });
    }

    // ===== MODO EDITAR =====
if (modo === "editar") {
    console.log("Modo edición");         
    datosEdicion = JSON.parse(localStorage.getItem("datosEditables"));
    console.log("datosEdicion", datosEdicion);

    btnCrear.textContent = "Editar";

    inicializarFormulario(modo, producto, datosEdicion)
        .then(() => {

            // === MOSTRAR LO QUE QUIERES ===
            document.getElementById("mezcladores").style.display = "block";
            document.getElementById("peso_inicial_mezcla").style.display = "block";
            document.getElementById("recetas").style.display = "block";

            // === OCULTAR LO QUE NO QUIERES ===
            document.getElementById("peso_final_mezcla").style.display = "none";
            document.getElementById("reactores").style.display = "none";

            // === CLICK EDITAR ===
            btnCrear.addEventListener("click", (e) => {
                e.preventDefault();

                const data = new FormData();
                data.append("numeroProduccion", datosEdicion.NumeroFabricacion);
                data.append("mezclador", mezcladorSeleccionado);
                data.append("receta", recetaSeleccionada);
                data.append("pesoInicialMezclador", peso_inicial_mezclador.value.replace(/\./g,""));
                data.append("producto", producto);
                data.append("modo", modo);

                fetch("../../app/models/editarFabCurso.php", { method: "POST", body: data })
                    .then(res => res.json())
                    .then(json => {
                        if (json.ok) mostrarModal("Producción actualizada correctamente");
                        else alert(json.error); 
                    });
            });
        });
}

    // ==== MODO TRANSFERIR ====

    if (modo === "transferir") {
    console.log("Modo transferencia ...");
    console.log("datosEdicion Transferir", datosEdicion);

    btnCrear.textContent = "Transferir";

    // 1) Inicializar el formulario y ESPERAR a que termine
    inicializarFormulario(modo, producto, datosEdicion)
        .then(() => {

            document.getElementById("mezcladores").style.display = "block";
            document.getElementById("peso_inicial_mezcla").style.display = "block";
            document.getElementById("peso_final_mezcla").style.display = "block";
            
            btnCrear.addEventListener("click", (e) => {
                e.preventDefault();

                const data = new FormData();
                data.append("numeroProduccion", datosEdicion.NumeroFabricacion);
                data.append("modo", modo);
                data.append("producto", producto);
                data.append("receta", recetaSeleccionada);
                data.append("pesoInicialMezclador", datosEdicion.PesoInicialMezclador);
                data.append("pesoFinalMezclador", peso_final_mezclador.value.replace(/\./g,""));

                fetch("../../app/models/transferirFabCurso.php", { method: "POST", body: data })
                    .then(res => res.json())
                    .then(json => {
                        console.log("json 298", json);

                    });
            });

        });
}


});
