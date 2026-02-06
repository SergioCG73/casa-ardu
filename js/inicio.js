document.addEventListener("DOMContentLoaded", init);

function init() {
    const btnP18 = document.getElementById("btnP18");
    const btnSulfato = document.getElementById("btnSulfato");
    const btnFerrico = document.getElementById("btnFerrico");
    const tabla = document.getElementById("tabla");
    const divProducciones = document.getElementById("producciones_en_curso");

    //localStorage.clear();
    localStorage.setItem("modo", "inicial");
    console.log("localStorage: ", localStorage);

    btnP18.addEventListener("click", () => {
        localStorage.removeItem("editarP18");        
        localStorage.removeItem("modoP18");
        localStorage.setItem("modo", "crear");
        localStorage.setItem("producto", "p18");                
        //window.location.href = "formularioP18.html";
        window.location.href = "formulario.html";
    });

    btnSulfato.addEventListener("click", () => {
        localStorage.removeItem("editarSulfato");
        localStorage.removeItem("modoSulfato");
        localStorage.setItem("modo", "crear");
        localStorage.setItem("producto", "sulfato");
        //window.location.href = "formularioP18.html";
        window.location.href = "formulario.html";
    });

    btnFerrico.addEventListener("click", () => {
        localStorage.removeItem("editarFerrico"); //ATENTO AL RESULTADO DE HACER ESTO
        localStorage.removeItem("modoFerrico");
        localStorage.setItem("modo", "crear");
        localStorage.setItem("producto", "ferrico");
        window.location.href = "formulario.html";
    })

    cargarProducciones(tabla, divProducciones, btnP18);
}

/* ============================================================
   CARGAR DATOS DESDE PHP
   ============================================================ */
function cargarProducciones(tabla, divProducciones) {
    fetch("models/leer.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "inicial" })
    })
    .then(response => response.json())
    .then(data => {        
        if (!data.ok) return;        

        tabla.innerHTML = generarEncabezado() + construirTabla(data);
        activarEventosTabla(tabla);        

        divProducciones.style.display = "block";
    })
    .catch(err => console.error("Error cargando producciones:", err));
}

/* ============================================================
   TABLA
   ============================================================ */
function generarEncabezado() {
    return `
        <tr>
            <th>Producto</th>
            <th>Nº Fabricación</th>
            <th>Fecha/Hora Inicio</th>
            <th>Mezclador</th>
            <th>Reactor</th>
            <th>Receta</th>
            <th></th>
            <th></th>
        </tr>`;
}

function construirTabla(data) {
    return data.producciones_en_curso.map(p => {
        //Determinamos la clase según el Producto_id
        let claseEspecial = "";
        if (p.Producto_id === 'P18') {
            claseEspecial = "p18_destacado";
        }
        else if (p.Producto_id === "Sulfato") {
            claseEspecial = "sulfato_destacado";
        }
        else if (p.Producto_id === "Ferrico") {
            claseEspecial = "ferrico_destacado";
        }

        return `
        <tr>
            <td class="${claseEspecial} producto_${p.Producto_id}">
                ${p.Producto_id}
            </td>
            <td>${p.NumeroFabricacion}</td>
            <td>${p.FechaInicio}</td>
            <td>${p.Mezclador}</td>
            <td>${p.Reactor}</td>
            <td>${p.Receta}</td>
            <td><img src="images/editar_azul_icon_20x20.png" class="icono-editar" data-info='${JSON.stringify(p)}'></td>
            <td><img src="images/basura_rojo_icon_15x20.png" class="icono-borrar"></td>
        </tr>
    `;
    }).join("");
}


/* ============================================================
   EVENTOS DE LA TABLA (DELEGACIÓN)
   ============================================================ */
/*function activarEventosTabla(tabla) {
    tabla.addEventListener("click", e => {
        if (e.target.classList.contains("icono-editar")) {
            const datos = JSON.parse(e.target.dataset.info);
            localStorage.setItem("editar", JSON.stringify(datos)); //Guarda en el localStorage el objeto en formato JSON con el nombrfe editarP18
            localStorage.setItem("modo", "editar");            
            window.location.href = "formulario.html";
        }

        if (e.target.classList.contains("icono-borrar")) {
            console.log("Se ha pulsado borrar");
        }
    });
}*/

function activarEventosTabla(tabla) {
    tabla.addEventListener("click", e => {
        const iconoEditar = e.target.closest(".icono-editar");
        if (iconoEditar) {
            const datos = JSON.parse(iconoEditar.dataset.info);
            localStorage.setItem("datosEditables", JSON.stringify(datos));            
            localStorage.setItem("modo", "editar");            
            window.location.href = "formulario.html";
            return;
        }

        const iconoBorrar = e.target.closest(".icono-borrar");
        if (iconoBorrar) {
            console.log("Se ha pulsado borrar");
        }
    });
}

