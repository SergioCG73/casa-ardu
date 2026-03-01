document.addEventListener("DOMContentLoaded", init);

function init() {
    const btnP18 = document.getElementById("btnP18");
    const btnSulfato = document.getElementById("btnSulfato");
    const btnFerrico = document.getElementById("btnFerrico");
    const btnFiltrado = document.getElementById("btnFiltrado");    
    const divProducciones = document.getElementById("producciones_en_curso");
    const displayM216 = document.getElementById("label_m216");
    const tabla = document.getElementById("tabla");
    
    localStorage.setItem("modo", "inicial");
    
    btnP18.addEventListener("click", () => {        
        localStorage.setItem("modo", "crear");
        localStorage.setItem("producto", "P18");       
        window.location.href = "index.php?c=Formulario&a=p18";
    });

    btnSulfato.addEventListener("click", () => {        
        localStorage.setItem("modo", "crear");
        localStorage.setItem("producto", "Sulfato");        
        window.location.href = "/index.php?c=Formulario&a=sulfato";
    });

    btnFerrico.addEventListener("click", () => {
        localStorage.setItem("modo", "crear");
        localStorage.setItem("producto", "Ferrico");
        window.location.href = "/index.php?c=Formulario&a=ferrico";
    });

    btnFiltrado.addEventListener("click", () => {
        localStorage.setItem("modo", "filtrar");
        localStorage.setItem("producto", "P18");
        window.location.href = "/index.php?c=Formulario&a=filtrado";   
    });

    cargarProducciones(tabla, divProducciones, btnP18);
}

/* ============================================================
   CARGAR DATOS DESDE PHP
   ============================================================ */
function cargarProducciones(tabla, divProducciones) {    
    fetch("/index.php?c=Leer&a=leerV2", {
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

        const displayM216 = document.getElementById("label_m216");
        if (data.producciones_sin_filtrar === 0) {
            displayM216.style.display = "none";
        } else {
            displayM216.style.display = "block";
            displayM216.innerHTML = data.producciones_sin_filtrar;
        }

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
            <th></th>
        </tr>`;
}

function construirTabla(data) {                
    return data.producciones_en_curso.map(p => {
        let claseEspecial = "";
        if (p.Producto_id === 'P18') claseEspecial = "p18_destacado";
        else if (p.Producto_id === 'PP18') claseEspecial = "papilla_destacado";
        else if (p.Producto_id === "Sulfato") claseEspecial = "sulfato_destacado";
        else if (p.Producto_id === "Ferrico") claseEspecial = "ferrico_destacado";

        return `
        <tr>
            <td class="${claseEspecial} producto_${p.Producto_id}">${p.Producto_id}</td>
            <td>${p.NumeroFabricacion}</td>
            <td>${p.FechaInicio}</td>
            <td>${p.Mezclador}</td>
            <td>${p.Reactor ?? ""}</td>
            <td>${p.Receta}</td>
            <td><img src="/images/editar_azul_icon_20x20.png" class="icono-editar" data-info='${JSON.stringify(p)}'></td>            
            <td><img src="/images/flecha_amarilla_icon_15x20.png" class="icono-transferir" data-info='${JSON.stringify(p)}'></td>
            <td><img src="/images/basura_rojo_icon_15x20.png" class="icono-borrar" data-info='${JSON.stringify(p)}'></td>            
        </tr>`;
    }).join("");
}

function activarEventosTabla(tabla) {
    tabla.addEventListener("click", e => {
        const iconoEditar = e.target.closest(".icono-editar");
        if (iconoEditar) {
            const datos = JSON.parse(iconoEditar.dataset.info);            
            localStorage.setItem("datosEditables", JSON.stringify(datos));            
            localStorage.setItem("modo", "editar");                    
            if (datos.Producto_id === "Sulfato") {                
                window.location.href = "/index.php?c=Formulario&a=sulfato";
            } else {               
                window.location.href = "/index.php?c=Formulario&a=p18";
            }            
            return;
        }

        const iconoBorrar = e.target.closest(".icono-borrar");
        if (iconoBorrar) { 
            if(confirm("¿Estás seguro de que deseas eliminar esta producción?")) {
                const datos = JSON.parse(iconoBorrar.dataset.info);
                localStorage.setItem("datosBorrables", JSON.stringify(datos));
                localStorage.setItem("modo", "borrar");
                
                fetch("index.php?c=Borrar&a=borrarFabricacion", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(datos)
                })
                .then(response => response.json())
                .then(json => { 
                    if(json.ok) {
                        alert("Producción eliminada correctamente");                    
                        window.location.href = "index.php";
                    } else alert("ERROR: " + json.error);
                })
                .catch(error => console.log("ERROR", error));                
            } else {
                console.log("Eliminación cancelada");
            }
        }

        const iconoTransferir = e.target.closest(".icono-transferir");
        if (iconoTransferir) {
            const datos = JSON.parse(iconoTransferir.dataset.info);            
            localStorage.setItem("datosEditables", JSON.stringify(datos));            
            localStorage.setItem("datosTransferencia", JSON.stringify(datos));            
            localStorage.setItem("modo", "transferir");
            
            if (datos.Producto_id === "P18"){
                //window.location.href = "/HTML/app/views/formP18.php";
                window.location.href = "/index.php?c=Formulario&a=p18";
            } else if (datos.Producto_id === "Sulfato"){
                window.location.href = "/HTML/app/views/formSulfato.php";
            }            
            return;
            
        }
    });
    
}
