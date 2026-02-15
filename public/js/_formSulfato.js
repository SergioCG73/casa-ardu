document.addEventListener("DOMContentLoaded", ()=> {

    const btnRetroceder = document.getElementById("btnRetroceder");    
    const btnCrear = document.getElementById("btnValidar");
    const btnTransferir = document.getElementById("btnTransferir");
    const displayProduccion = document.getElementById("displayProduccion");    
    const divReactores = document.getElementById("reactores");        
    const peso_inicial_reactor = document.getElementById("peso_inicial_reactor");
    const peso_final_reactor = document.getElementById("peso_final_reactor");

    let reactorSeleccionado;
    let recetaSeleccionada;
    let numeroProduccion;
    let fechaHoraInicio;

    let modo = localStorage.getItem("modo");    
    let producto = localStorage.getItem("producto");
    let datosEdicion;        

    btnTransferir.style.display = "none";

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
        window.location.href = "/HTML/public/index.php";
    }

    document.getElementById("btnAceptar").addEventListener("click", cerrarModal);

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

function formatearNumero(input) {
        let valor = input.value.replace(/\D/g, "");
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        input.value = valor;
}

// ===== FIN ZONA DE FUNCIONES ====== 


[peso_inicial_reactor, peso_final_reactor].forEach(input => {
        input.addEventListener("input", () => formatearNumero(input));
});

// ==== FUNCIONALIDAD DEL BOTON RETROCEDER====

btnRetroceder.addEventListener("click", ()=> {
    window.location.href = "/HTML/public/";
})

// ==== INICIO LÓGICA DE modo === "crear" ====

if (modo ==="crear") {
    console.log("Estamos en modo creación"); 

    const datos = new FormData();

    datos.append("modo", modo);
    datos.append("producto", producto);

    fetch("/HTML/app/models/leerdatos.php", {
        method: "POST",        
        body: datos
    })
        .then(response => response.json())
        .then(data => {
            console.log("data:", data);

    if (data.equipos.length > 0 && data.equipos[0].Estado === "En uso") {
        alert("No se puede fabricar Sulfato R202 ocupado");
        window.location.href = "/HTML/public/index.php";
    }

    peso_inicial_reactor.addEventListener("input", ()=> formatearNumero(peso_inicial_reactor));

    numeroProduccion = data.siguienteFabricacion;
    displayProduccion.innerHTML = numeroProduccion;
            
    //==== CREAR RADIOS REACTORES ====
    const listaEquipos = data.equipos;
    const contenedorReactores = document.querySelector("#reactores fieldset");
    generarRadiosReactores(listaEquipos, contenedorReactores, modo, datosEdicion);

    //==== CREAR RADIOS RECETAS ====
    const listaRecetas = data.recetas;
    const contenedorRecetas = document.querySelector("#recetas fieldset");            
    generarRadiosRecetas(listaRecetas, contenedorRecetas, modo, datosEdicion);

            document.addEventListener("change", function(e){
                if (e.target.name === "reactor") reactorSeleccionado = e.target.value;
                if (e.target.name === "receta") recetaSeleccionada = e.target.value;    
            })

            btnCrear.addEventListener("click", ()=> {
                const ahora = new Date();

                const fechaHoraInicio =
                    ahora.getFullYear() + "-" +
                    String(ahora.getMonth() + 1).padStart(2, '0') + "-" +
                    String(ahora.getDate()).padStart(2, '0') + " " +
                    String(ahora.getHours()).padStart(2, '0') + ":" +
                    String(ahora.getMinutes()).padStart(2, '0') + ":" +
                    String(ahora.getSeconds()).padStart(2, '0');                
                

                const reactorMarcado = document.querySelector("input[name='reactor']:checked");
                if (reactorMarcado) {
                    reactorSeleccionado = reactorMarcado.value;
                }

                if (!reactorSeleccionado) {
                    alert("Por favor, selecciona un reactor");
                    return;
                }

                const recetaMarcada = document.querySelector("input[name='receta']:checked");
                if (recetaMarcada) {
                    recetaSeleccionada = recetaMarcada.value;
                }

                if (!recetaSeleccionada) {
                    alert("Por favor, selecciona una receta");
                    return;
                }

                const pesoLimpio = peso_inicial_reactor.value.replace(/\./g, "");

                // ==== FETCH PARA HACER EL INSERT EN LA TABLA fabricaciones_en_curso ====

                const datosEnviar = new FormData();
                datosEnviar.append("numeroProduccion", numeroProduccion);                
                datosEnviar.append("fechaHoraInicio", fechaHoraInicio);
                datosEnviar.append("reactor", reactorSeleccionado);
                datosEnviar.append("receta", recetaSeleccionada);                
                datosEnviar.append("pesoInicialReactor", pesoLimpio);

                /*console.log("numeroProduccion", numeroProduccion);                
                console.log("fechaHoraInicio:", fechaHoraInicio);
                console.log("reactorSeleccionado", reactorSeleccionado);
                console.log("recetaSeleccionada", recetaSeleccionada); 
                console.log("peso_inicial_reactor: ", pesoLimpio); return;*/

                fetch("/HTML/app/models/insertarSulfato.php", {
                    method: "POST",
                    body: datosEnviar
                })
                .then(response => response.json())
                .then(json => {
                      if (json.ok) mostrarModal(json.message); 
                      else alert("Error: " + (json.error || "Error desconocido"));
                })                    
            });
        })        
                .catch(error => console.log("ERROR", error));
                }
// ==== INICIO lógica para EDITAR ====

            if (modo === "editar") {
                console.log("Estamos en modo edición");
                btnCrear.textContent = "Editar";
                datosEdicion = JSON.parse(localStorage.getItem("datosEditables"));
                const datos = new FormData();
                datos.append("modo", modo);
                datos.append("producto", producto);

                fetch("/HTML/app/models/leerdatos.php", {
                    method: "POST",        
                    body: datos
                })
                .then(response => response.json())
                .then(data => { 

                // === Nº FABRICACION
                const numeroProduccion = data.siguienteFabricacion;
                displayProduccion.innerHTML = numeroProduccion;

                //==== CREAR RADIOS REACTORES ====
                const listaEquipos = data.equipos;                
                const contenedorReactores = document.querySelector("#reactores fieldset");                
                generarRadiosReactores(listaEquipos, contenedorReactores, modo, datosEdicion);

                //==== CREAR RADIOS RECETAS ====
                const listaRecetas = data.recetas;
                const contenedorRecetas = document.querySelector("#recetas fieldset");            
                generarRadiosRecetas(listaRecetas, contenedorRecetas, modo, datosEdicion);

                document.addEventListener("change", function(e){
                    if (e.target.name === "reactor") reactorSeleccionado = e.target.value;
                    if (e.target.name === "receta") recetaSeleccionada = e.target.value;    
                })
                
                // Cargar pesos 
                peso_inicial_reactor.value = datosEdicion.PesoInicialReactor;
                formatearNumero(peso_inicial_reactor
                );
                });

                // === LISTENER radio buttons editar===
                document.addEventListener("change", function(e){            
                    if (e.target.name === "reactor") reactorSeleccionado = e.target.value;
                    if (e.target.name === "receta") recetaSeleccionada = e.target.value;
                });

                // === VALORES INICIALES ===        
                reactorSeleccionado = document.querySelector("input[name='reactor']:checked")?.value;
                recetaSeleccionada = document.querySelector("input[name='receta']:checked")?.value;    

                btnCrear.addEventListener("click", function(e){
                    e.preventDefault();                    

                    const pesoReactorEditado = parseInt(peso_inicial_reactor.value.replace(/\./g, ""), 10);                    

                    const data = new FormData();
                    data.append("numeroProduccion", datosEdicion.NumeroFabricacion);
                    //data.append("mezclador", mezcladorSeleccionado);
                    data.append("reactor", reactorSeleccionado);
                    data.append("receta", recetaSeleccionada);
                    //data.append("pesoInicialMezclador", pesoMezcladorEditado);
                    data.append("pesoInicialReactor", pesoReactorEditado);
                    //data.append("pesoFinalReactor", pesoFinalReactorEditado);
                    data.append("producto", producto);
                    data.append("modo", modo);
                    
                    fetch("../../app/models/actualizardatos.php", {
                        method: "POST",
                        body: data
                    })
                    .then(response => response.json())
                    .then(json => {
                        if (json.ok) mostrarModal("Producción actualizada correctamente");
                        else alert("Error: " + json.error);
                        console.log("JSON: ", json);
                    })
                    .catch(error => console.log("ERROR", error));
                    return;                    
                })
            }

            

                if (modo === "transferir") {
                    console.log("Estamos en modo transferir...");
                    btnCrear.style.display = "none";
                    btnTransferir.style.display = "block";
                    console.log("modo", modo);

                    datos = new FormData();

                    datos.append("modo", modo);
                    datos.append("producto", producto);

                    fetch("/HTML/app/models/leerdatos.php", {
                       method: "POST",        
                       body: datos
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log("data:", data);
                    // === Nº FABRICACION
                    const numeroProduccion = data.siguienteFabricacion;
                    displayProduccion.innerHTML = numeroProduccion;

                    //==== CREAR RADIOS REACTORES ====
                    const listaEquipos = data.equipos;                
                    const contenedorReactores = document.querySelector("#reactores fieldset");                
                    generarRadiosReactores(listaEquipos, contenedorReactores, modo, datosEdicion);
                    
                }); 



                    

                    //const pesoLimpio = peso_final_reactor.value.replace(/\./g, "");
                    console.log("pesoLimpio: ", producto); return;
                }
})