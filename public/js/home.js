document.addEventListener("DOMContentLoaded", init);

function init() {
    const btnP18 = document.getElementById("btnP18");
    const btnSulfato = document.getElementById("btnSulfato");
    const btnFerrico = document.getElementById("btnFerrico");
    const btnFiltrado = document.getElementById("btnFiltrado");
    const tabla = document.getElementById("tabla");
    const divProducciones = document.getElementById("producciones_en_curso");
    const displayM216 = document.getElementById("label_m216");
    
    localStorage.setItem("modo", "inicial");
    
    btnP18.addEventListener("click", () => {        
        localStorage.setItem("modo", "crear");
        localStorage.setItem("producto", "P18");        
        window.location.href = "index.php?c=Formulario&a=p18";
    });    

    btnSulfato.addEventListener("click", () => {        
        localStorage.setItem("modo", "crear");
        localStorage.setItem("producto", "Sulfato");        
        window.location.href = "index.php?c=Formulario&a=sulfato";
    });

    btnFerrico.addEventListener("click", () => {        
        localStorage.setItem("modo", "crear");
        localStorage.setItem("producto", "Ferrico");
        window.location.href = "index.php?c=Formulario&a=ferrico";
    })

    btnFiltrado.addEventListener("click", () => {
        localStorage.setItem("modo", "filtrar");
        localStorage.setItem("producto", "P18");
        window.location.href = "index.php?c=Formulario&a=filtrado";        
    })

    cargarProducciones(tabla, divProducciones, btnP18);
}

/* ============================================================
   CARGAR DATOS DESDE PHP
   ============================================================ */
function cargarProducciones(tabla, divProducciones) {    
    //console.log(cargarProducciones); debugger    
    fetch("index.php?c=Leer&a=lectura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "inicial" })
    })
    .then(response => response.json())
    .then(data => { //console.log(data); debugger
        if (!data.ok) return;
        tabla.innerHTML = generarEncabezado() + construirTabla(data);
        activarEventosTabla(tabla);        

        divProducciones.style.display = "block";

        if (data.producciones_sin_filtrar === 0) {
            displayM216.style.display = "none";
        } else {
            displayM216.style.display = "block";
            const textM216 = document.getElementById("label_m216");
            textM216.innerHTML = data.producciones_sin_filtrar;
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
        //Determinamos la clase según el Producto_id
        let claseEspecial = "";
        let claseMezclador = "";
        if (p.Producto_id === 'P18') {            
            claseEspecial = "p18_destacado";
        }
        else if (p.Producto_id === 'PP18') {
            claseEspecial = "papilla_destacado";
        }
        else if (p.Producto_id === "Sulfato") {            
            claseEspecial = "sulfato_destacado";
        }
        else if (p.Producto_id === "Ferrico") {
            claseEspecial = "ferrico_destacado";            
        }                

        if (p.Producto_id === "Ferrico" && p.Sacas === 1){
            claseMezclador = "M311_destacado";            
        }

        return `
        <tr>
            <td class="${claseEspecial} producto_${p.Producto_id}">
                ${p.Producto_id}
            </td>
            <td>${p.NumeroFabricacion}</td>
            <td>${p.FechaInicio}</td>            
            <td class="${claseMezclador}">${p.Mezclador}</td>
            <td>${p.Reactor}</td>
            <td>${p.Receta}</td>
            <td>
                <!--<img src="/HTML/public/images/editar_azul_icon_20x20.png"
                     class="icono-editar"
                     data-info='${JSON.stringify(p)}'
                     title="Editar fabricación">-->

                     <img src="images/editar_azul_icon_20x20.png"
                     class="icono-editar"
                     data-info='${JSON.stringify(p)}'
                     title="Editar fabricación">
            </td>
            <td>
                <!--<img src="/HTML/public/images/flecha_amarilla_icon_15x20.png"
                     class="icono-transferir"
                     data-info='${JSON.stringify(p)}'
                     title="Transferir fabricación">-->

                     <img src="images/flecha_amarilla_icon_15x20.png"
                     class="icono-transferir"
                     data-info='${JSON.stringify(p)}'
                     title="Transferir fabricación">
            </td>            
            <td>
                <!--<img src="/HTML/public/images/basura_rojo_icon_15x20.png"
                     class="icono-borrar"
                     data-info='${JSON.stringify(p)}'
                     title="Borrar fabricación">-->

                     <img src="images/basura_rojo_icon_15x20.png"
                     class="icono-borrar"
                     data-info='${JSON.stringify(p)}'
                     title="Borrar fabricación">
            </td>         
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
                window.location.href = "index.php?c=Formulario&a=sulfato";
            } else if (datos.Producto_id === "P18") {                
                window.location.href = "index.php?c=Formulario&a=p18";
            } else if (datos.Producto_id === "Ferrico") {                
                window.location.href = "index.php?c=Formulario&a=ferrico";
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
            .then(json => { //console.log(json); debugger
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
            const datosTransferir = JSON.parse(iconoTransferir.dataset.info);
            //console.log(datosTransferir); debugger
            localStorage.setItem("datosTransferencia", JSON.stringify(datosTransferir));            
            localStorage.setItem("modo", "transferir");
            if (datosTransferir.Producto_id === "P18") {
                window.location.href = "index.php?c=Formulario&a=p18";
            } else if (datosTransferir.Producto_id === "Sulfato") {
                window.location.href = "index.php?c=Formulario&a=sulfato";
            } else if (datosTransferir.Producto_id === "Ferrico") {
                window.location.href = "index.php?c=Formulario&a=ferrico";
            }

            return;            
        }
    });
}