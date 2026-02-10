document.addEventListener("DOMContentLoaded", ()=> {
    const btnRetroceder = document.getElementById("btnRetroceder");    
    const btnValidar = document.getElementById("btnValidar");
    const displayProduccion = document.getElementById("displayProduccion");    
    const divReactores = document.getElementById("reactores");        
    const peso_inicial_reactor = document.getElementById("peso_inicial_reactor");
    
    let reactorSeleccionado;
    let recetaSeleccionada;
    let numeroProduccion;   
    let tipoReceta;
    let contenedorRecetas;     

    let modo = localStorage.getItem("modo");    
    let producto = localStorage.getItem("producto");
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
        window.location.href = "/HTML/public/index.php";
    }

    document.getElementById("btnAceptar").addEventListener("click", cerrarModal);

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
// ===== FIN ZONA DE FUNCIONES ======

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
        })
        .catch(error => console.log("ERROR", error));
}




    
})