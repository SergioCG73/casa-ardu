document.addEventListener("DOMContentLoaded", init);

function init() {
    const btnP18 = document.getElementById("btnP18");
    const btnSulfato = document.getElementById("btnSulfato");
    const btnFerrico = document.getElementById("btnFerrico");
    //const btnFiltrado = document.getElementById("btnFiltrado");
    const tabla = document.getElementById("tabla");
    const divProducciones = document.getElementById("producciones_en_curso");
    const displayM216 = document.getElementById("displayM216");

    localStorage.setItem("modo", "inicial");

    if (ROL_USUARIO === "LAB") {
        console.log("MODO LABORATORIO");
        window.location.href = "index.php?c=Formulario&a=laboratorio";
    }

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

    cargarProducciones(tabla, divProducciones);

    setInterval(() => {
        console.log("setInterval");
        cargarProducciones(tabla, divProducciones);
    }, 600000); //600.000 ms son 10 minutos
}

/* ============================================================
   CARGAR DATOS DESDE PHP
   ============================================================ */
function cargarProducciones(tabla, divProducciones) {    
    fetch("index.php?c=Leer&a=lectura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "inicial" })
    })
        .then(response => response.json())
        .then(data => {
            //console.log(data); debugger
            if (!data.ok) return;
            tabla.innerHTML = generarEncabezado() + construirTabla(data);
            let existeFiltrado = data.producciones_en_curso.some(p => p.Producto_id === "Filtrado");
            localStorage.setItem("existeFiltrado", existeFiltrado ? "1" : "0");

            activarEventosTabla(tabla);

            divProducciones.style.display = "block";

            let claseEspecial = null;

            if (data.volumen_M216 === 0) {
                displayM216.style.display = "none";
            } else {
                displayM216.style.display = "block";
                const textM216 = document.getElementById("label_m216");
                volumenMaximoM216 = 60000;
                volumenUsado = Math.round((data.volumen_M216 / volumenMaximoM216) * 100);

                textM216.innerHTML = volumenUsado + "%";

                const valorM216 = Number(textM216.innerHTML);
                textM216.innerHTML = volumenUsado + "%";

                if (volumenUsado >= 0 && volumenUsado <= 50) {
                    claseEspecial = "M216_Green";
                } else if (volumenUsado > 50 && volumenUsado <= 70) {
                    claseEspecial = "M216_Yellow";
                } else if (volumenUsado > 70 && volumenUsado <= 80) {
                    claseEspecial = "M216_Orange";
                } else if (volumenUsado > 80) {
                    claseEspecial = "M216_Red";
                }

                textM216.classList.remove("M216_Green", "M216_Yellow", "M216_Red");
                textM216.classList.add(claseEspecial);
            }
        })
        .catch(err => console.error("Error cargando producciones:", err));
}

/* =======
   TABLA
   ======= */
function generarEncabezado() {
    return `
        <tr>
            <th>Producto</th>
            <th>Nº Fabricación</th>
            <th>Fecha/Hora Inicio</th>
            <th>Mezclador</th>
            <th>Reactor</th>
            <th>Receta</th>
            <th>Notas</th>            
            <th></th>
            <th></th>
            <th></th>
        </tr>`;
}

function construirTabla(data) {
    return data.producciones_en_curso.map(p => {
        //Determinamos la clase según el Producto_id        
        //Control de valores undefined/null con ternario
        //console.log(data.producciones_en_curso); debugger
        const reactor = (p.Reactor === "undefined" || p.Reactor === null) ? "" : p.Reactor;
        const mezclador = (p.Mezclador === "undefined" || p.Mezclador === null) ? "" : p.Mezclador; //28/03/26    
        const receta = (p.Receta === "undefined" || p.Receta === null) ? "" : p.Receta;
        const deposito = (p.Deposito === "undefined" || p.Deposito === null) ? "" : p.Deposito; //03/04/26                

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

        if (p.Producto_id === "Ferrico" && p.Sacas === 1) {

            claseMezclador = "M311_destacado";
        }

        if (p.Producto_id === "Filtrado") {
            claseEspecial = "filtrado"
        }

        let td = "";

        if (reactor === "") {
            campo = deposito;
        } else {
            campo = reactor;
        }

        if (p.Notas !== "" && p.Notas !== null) {
            td = `<td>
                      <img src="images/nota_amarillo_icon_20x20.png"
                      class="icono-nota"
                      data-info='${JSON.stringify(p)}'
                      title="Nota fabricación">
                  </td>`
        } else {
            td = `<td></td>`
        }

        return `
        <tr>
            <td class="${claseEspecial} producto_${p.Producto_id}">
                ${p.Producto_id}
            </td>
            <td>${p.NumeroFabricacion}</td>
            <td>${p.FechaInicio}</td>
            <td class="${claseMezclador}">${mezclador}</td> <!--26/03/2026-->
            <td>${reactor}</td>
            <!--<td>${campo}</td>-->
            <td>${receta}</td>                        
            ${td}
            <td>
                     <img src="images/editar_azul_icon_20x20.png"
                     class="icono-editar"
                     data-info='${JSON.stringify(p)}'
                     title="Editar fabricación">
            </td>
            <!--<td>
                     <img src="images/flecha_amarilla_icon_15x20.png"
                     class="icono-transferir"
                     data-info='${JSON.stringify(p)}'
                     title="Transferir fabricación">
            </td>-->
            
            <td>
                    <!--<img src="images/${p.FechaFinal ? 'flecha_negra_icon_15x20.png' : 'flecha_amarilla_icon_15x20.png'}"-->
                    <img src="images/${p.FechaFinal ? 'flag_finish.png' : 'flecha_amarilla_icon_15x20.png'}"
                    class="icono-transferir"
                    data-info='${JSON.stringify(p)}'
                    title="${p.FechaFinal ? 'Producción finalizada' : 'Transferir fabricación'}">
                    <!--<img src="images/${p.FechaFinal ? 'flag_finish.png' : 'flag_finish.png'}"
                    class="icono-transferir"
                    data-info='${JSON.stringify(p)}'
                    title="${p.FechaFinal ? 'Producción finalizada' : 'Transferir fabricación'}">-->
            </td>

            <td>
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
        const iconoEditar = e.target.closest(".icono-editar, .icono-nota");
        if (iconoEditar) {
            const datos = JSON.parse(iconoEditar.dataset.info);
            //console.log(datos); debugger
            localStorage.setItem("datosEditables", JSON.stringify(datos));
            localStorage.setItem("modo", "editar");
            if (datos.Producto_id === "Sulfato") {
                window.location.href = "index.php?c=Formulario&a=sulfato";
            } else if (datos.Producto_id === "P18") {
                window.location.href = "index.php?c=Formulario&a=p18";
            } else if (datos.Producto_id === "Ferrico") {
                window.location.href = "index.php?c=Formulario&a=ferrico";
            } else if (datos.Producto_id === "Filtrado") {
                window.location.href = "index.php?c=Formulario&a=filtrado";
            }
            return;
        }

        const iconoBorrar = e.target.closest(".icono-borrar");
        if (iconoBorrar) {
            if (confirm("¿Estás seguro de que deseas eliminar esta producción?")) {
                const datos = JSON.parse(iconoBorrar.dataset.info);
                localStorage.setItem("datosBorrables", JSON.stringify(datos));
                localStorage.setItem("modo", "borrar");

                fetch("index.php?c=Borrar&a=borrarFabricacion", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datos)
                })
                    .then(response => response.json())
                    .then(json => { //console.log(json); debugger
                        if (json.ok) {
                            alert("Producción eliminada correctamente");
                            window.location.href = "index.php?c=Formulario&a=home";
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
            localStorage.setItem("datosTransferencia", JSON.stringify(datosTransferir));            
            localStorage.setItem("modo", "transferir");
            if (datosTransferir.Producto_id === "P18") {
                window.location.href = "index.php?c=Formulario&a=p18";
            } else if (datosTransferir.Producto_id === "Sulfato" && datosTransferir.FechaFinal === null) {
                window.location.href = "index.php?c=Formulario&a=sulfato";
            } else if (datosTransferir.Producto_id === "Ferrico" && datosTransferir.FechaFinal === null) {
                window.location.href = "index.php?c=Formulario&a=ferrico";
            } else if (datosTransferir.Producto_id === "Filtrado") {
                window.location.href = "index.php?c=Formulario&a=filtrado";
            } else if (datosTransferir.Producto_id === "Sulfato" && datosTransferir.FechaFinal) {
                localStorage.setItem("modo", "terminar")
                window.location.href = "index.php?c=Formulario&a=sulfato";
            } else if (datosTransferir.Producto_id === "Ferrico" && datosTransferir.FechaFinal) {                
                localStorage.setItem("modo", "terminar");
                window.location.href = "index.php?c=Formulario&a=ferrico";
            }

            return;
        }
    });
}
