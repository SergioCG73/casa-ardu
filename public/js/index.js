document.addEventListener("DOMContentLoaded", init);

function init() {
    const btnP18 = document.getElementById("btnP18");
    const btnSulfato = document.getElementById("btnSulfato");
    const btnFerrico = document.getElementById("btnFerrico");
    const tabla = document.getElementById("tabla");
    const divProducciones = document.getElementById("producciones_en_curso");
    
    localStorage.setItem("modo", "inicial");
    
    btnP18.addEventListener("click", () => {        
        localStorage.setItem("modo", "crear");
        localStorage.setItem("producto", "P18");
        window.location.href = "/HTML/public/index.php?c=Formulario&a=mostrar";

    });

    btnSulfato.addEventListener("click", () => {        
        localStorage.setItem("modo", "crear");
        localStorage.setItem("producto", "Sulfato");        
        window.location.href = "/HTML/public/index.php?c=Formulario&a=sulfato";
    });

    btnFerrico.addEventListener("click", () => {
        localStorage.removeItem("editarFerrico"); //ATENTO AL RESULTADO DE HACER ESTO
        localStorage.removeItem("modoFerrico");
        localStorage.setItem("modo", "crear");
        localStorage.setItem("producto", "Ferrico");
        window.location.href = "/HTML/public/index.php?c=Formulario&a=ferrico";
    })

    cargarProducciones(tabla, divProducciones, btnP18);
}

/* ============================================================
   CARGAR DATOS DESDE PHP
   ============================================================ */
function cargarProducciones(tabla, divProducciones) {
    fetch("/HTML/app/models/leer.php", {
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
        else if (p.Producto_id === 'Papilla P18') {
            claseEspecial = "papilla_destacado";
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
            <td><img src="/HTML/public/images/editar_azul_icon_20x20.png" class="icono-editar" data-info='${JSON.stringify(p)}'></td>
            <td><img src="/HTML/public/images/basura_rojo_icon_15x20.png" class="icono-borrar" data-info='${JSON.stringify(p)}'></td>
            <td><img src="/HTML/public/images/flecha_amarilla_icon_15x20.png" class="icono-transferir" data-info='${JSON.stringify(p)}'></td>
        </tr>
    `;
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
                console.log("Formulario Sulfato");                
                window.location.href = "/HTML/app/views/formSulfato.php";
            } else {
                console.log("Formulario P18");                
                window.location.href = "/HTML/app/views/formP18.php";
            }
            
            return;
        }

        const iconoBorrar = e.target.closest(".icono-borrar");
        if (iconoBorrar) {
            const datos = JSON.parse(iconoBorrar.dataset.info);
            localStorage.setItem("datosBorrables", JSON.stringify(datos));
            localStorage.setItem("modo", "borrar");

            fetch("/HTML/app/models/borrarFabCurso.php", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(datos)
            })
            .then(response => response.json())
            .then(json => {
                if(json.ok) {
                    alert("Producción eliminada correctamente");
                    window.location.href = "/HTML/app/views/home.php";
                } else alert("ERROR: " + json.error);
            })         
            
            .catch(error => console.log("ERROR", error));                
        }

        const iconoTransferir = e.target.closest(".icono-transferir");
        if (iconoTransferir) {
            const datos = JSON.parse(iconoTransferir.dataset.info);
            localStorage.setItem("datosTransferencia", JSON.stringify(datos));
            localStorage.setItem("modo", "transferir");
            console.log("Se ha pulsado transferir"); 
            window.location.href = "/HTML/app/views/formSulfato.php";
        }
    });
}

