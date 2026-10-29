document.addEventListener("DOMContentLoaded", () => {

    // === DECLARACION CONSTANTES ===
    const btnAceptar = document.getElementById("btnAceptar");
    const btnRetroceder = document.getElementById("btnRetroceder");
    const btnCrear = document.getElementById("btnCrear");
    const btnTransferir = document.getElementById("btnTransferir");
    const contenedorPesoFinal = document.getElementById("peso_final_mezclador");
    const contenedorMezcladores = document.querySelector("#mezcladores .radio-group");
    const contenedorRecetas = document.querySelector("#recetas .radio-group");
    const displayProduccion = document.getElementById("displayProduccion");
    const divCantidadTransferida = document.getElementById("contenedor_cantidad_transferida");
    const divPesoFinalMezclador = document.getElementById("peso_final");
    const divDepositos = document.getElementById("depositos");
    const peso_inicial_mezclador = document.getElementById("peso_inicial_mezclador");
    const peso_final_mezclador = document.getElementById("peso_final_mezclador");
    const txtNotas = document.getElementById("txtnotas"); //<textarea>
    const volumen_D111 = document.getElementById("volumen_D111");
    const datosTabla = JSON.parse(localStorage.getItem("datosEditables"));
    const inputSacas = document.getElementById("sacas");

    // === DECLARACION VARIABLES ===

    let datosEdicion;
    let depositoSeleccionado;
    let fechaHoraInicio;

    let mezcladorSeleccionado;
    let modo = localStorage.getItem("modo");
    let numeroProduccion;
    let producto;
    producto = datosTabla.Producto_id;
    let recetaSeleccionada;
    let sacas = document.querySelector(".sacas");
    let sacasEstado = null;

    // === VALORES INICIALES ===

    divCantidadTransferida.style.display = "none";
    divDepositos.style.display = "none";
    divPesoFinalMezclador.style.display = "none";

    //document.getElementById("btnAceptar").addEventListener("click", cerrarModal);

    // === FUNCIONES ===
    function inicializarFormulario(modo, producto, datosEdicion) {
        console.log("--- inicializarFormulario ---");

        // --- DATOS A CARGAR EN EL FORMULARIO 
        if (modo === "crear") {
            contenedorPesoFinal.style.display = "none";
            //sacasEstado = datosEdicion.sacas ? Number(datosEdicion.sacas.Sacas) : null
            sacasEstado = datosEdicion.sacas;   //sacasEstado = false

            numeroProduccion = Math.max(datosEdicion.ultimaAcabada, datosEdicion.ultimaEnCurso) + 1; //numeroProduccion = 485
            numeroProduccionActual = Number(numeroProduccion);
            displayProduccion.textContent = numeroProduccionActual;
        }

        if (modo === "editar") {
            btnCrear.textContent = "Editar";
            console.log("inicializarFormulario --> editar");
            contenedorPesoFinal.style.display = "none";
            sacasEstado = datosEdicion.produccionesEnCurso.Sacas;   //sacasEstado = false

            numeroProduccionActual = Number(datosTabla.NumeroFabricacion);
            displayProduccion.textContent = numeroProduccionActual;
        }

        // ===MARCAS CHECKBOX SACAS ===//        
        inputSacas.checked = Number(sacasEstado) === 1;

        // === GENERAR RADIOS MEZCLADORES ==== //
        contenedorMezcladores.innerHTML = "";
        listaMezcladores = datosEdicion.equipos.filter(m => m.Tipo === "Mezclador");
        generarRadiosMezcladores(listaMezcladores, contenedorMezcladores, modo);

        // === GENERAR RADIOS RECETAS === //
        contenedorRecetas.innerHTML = "";
        listaRecetas = datosEdicion.recetas.filter(r => r.ProductoFabricado === "Ferrico");
        generarRadiosRecetas(datosEdicion.recetas, contenedorRecetas, modo, datosEdicion);

        //==== LISTENERS ====
        document.addEventListener("change", function (e) {
            if (e.target.name === "mezclador") {
                mezcladorSeleccionado = e.target.value;
                console.log("mezcladorSeleccionado", mezcladorSeleccionado);
            }

            if (e.target.name === "receta") {
                recetaSeleccionada = e.target.value;
                console.log("recetaSeleccionada", recetaSeleccionada);
            }

            if (e.target.name === "deposito") {
                depositoSeleccionado = e.target.value;
                console.log("depositoSeleccionado", depositoSeleccionado);
            }

            if (e.target.name === "sacas") {
                sacasEstado = e.target.checked ? 1 : 0;
                sacas.value = sacasEstado;
            }
        });

        //==== CARGAR DATOS EN EL FORMULARIO ====        
        if (modo === "editar" || modo === "transferir") {
            console.log(`${modo}`); debugger
            console.log(datosEdicion);
            console.log(datosEdicion.produccionesEnCurso.Sacas);
            peso_inicial_mezclador.value = datosEdicion.produccionesEnCurso.PesoInicialMezclador;
            txtNotas.value = datosEdicion.produccionesEnCurso.Notas;
            //sacas.value = datosEdicion.produccionesEnCurso.Sacas;            
        };

        //=== ACCION AL PULSAR CLICK en CREAR O EDITAR ===//

        if (modo === "crear" | modo === "editar") {

            btnCrear.addEventListener("click", () => {
                console.log(`click en botón ${modo.toUpperCase()}`);

                //Obtener el mezclador seleccionado
                const mezcladorSeleccionado = document.querySelector("input[name='mezclador']:checked");

                //Validar peso inicial
                if (peso_inicial_mezclador.value === "") {
                    alert("Introduzca un peso válido");
                    return;
                }

                //Validar el mezclador
                if (!mezcladorSeleccionado) {
                    alert("Seleccione un mezclador");
                    return;
                }

                //Obtener y validar la receta seleccionada
                const recetaSeleccionada = document.querySelector("input[name='receta']:checked");

                if (!recetaSeleccionada) {
                    alert("Seleccione una receta");
                    return;
                }

                //Crear los datos del formulario
                datos = new FormData();
                datos.append("numeroProduccion", numeroProduccionActual);
                datos.append("mezclador", mezcladorSeleccionado.value);
                datos.append("pesoInicialMezclador", quitarPuntoMiles(peso_inicial_mezclador.value));
                datos.append("receta", recetaSeleccionada.value);
                datos.append("sacas", sacasEstado);  //Envia false si no está seleccionado el checkbox y envia 1 si está seleccionado el checkbox
                datos.append("notas", txtNotas.value);
                datos.append("producto", producto);

                /*const objeto = Object.fromEntries(datos.entries());
                console.log(objeto); debugger*/

                //Seleccionar la URL según el modo                
                const url = modo === "crear"
                    ? "index.php?c=Crear&a=ferrico"
                    : "index.php?c=Editar&a=fabCurso";

                console.log(`fetch ${modo}`);

                //Enviar datos al servidor
                fetch(url, {
                    method: "POST",
                    body: datos
                })
                    .then(response => response.json())
                    .then(json => {
                        console.log(json);
                        window.location.href = "index.php?c=Formulario&a=home";
                    })
                    .catch(error => {
                        console.log("error ", error);
                    });
            });
        }
    }

    // ===== FIN ZONA DE FUNCIONES ======

    [peso_inicial_mezclador, peso_final_mezclador, volumen_D111].forEach(input => {
        input.addEventListener("input", () => formatearNumero(input));
    });

    // === BOTONES ACEPTAR Y RETROCER ===
    btnAceptar.addEventListener("click", cerrarModal);

    btnRetroceder.addEventListener("click", () => {
        window.location.href = "index.php?c=Formulario&a=home";
    });

    // ==== MODO CREAR ====
    if (modo === "crear") {
        console.log("modo crear...");

        const datos = new FormData();
        datos.append("modo", modo);
        datos.append("producto", producto);

        fetch("index.php?c=Ferrico&a=leer", {
            method: "POST",
            body: datos
        })
            .then(response => response.json())
            .then(json => {
                datosEdicion = json;
                console.log(datosEdicion);

                if (datosEdicion.ok) {
                    console.log("datosEdicion.ok");
                } else {
                    alert("Error: " + datosEdicion.error);
                }

                return inicializarFormulario(modo, producto, datosEdicion);
            })
            .catch(error => {
                console.log("ERROR", error);
            });
    }

    //=== MODO EDITAR ===
    if (modo === "editar") {
        console.log("modo editar...");
        console.log(datosTabla);

        const datos = new FormData();
        datos.append("modo", modo);
        datos.append("producto", producto);
        datos.append("numeroProduccion", datosTabla.NumeroFabricacion);
        datos.append("receta", datosTabla.Receta);

        /*const objeto = Object.fromEntries(datos.entries());
        console.log(objeto); debugger*/

        fetch("index.php?c=Ferrico&a=leer", {
            method: "POST",
            body: datos
        })
            .then(response => response.json())
            .then(json => {
                //console.log (json)
                datosEdicion = json;
                //console.log(datosEdicion); debugger

                if (datosEdicion.ok) {
                    console.log("datosEdicion.ok");
                } else {
                    alert("Error: " + datosEdicion.error);
                }

                return inicializarFormulario(modo, producto, datosEdicion);
            })
            .catch(error => {
                console.log("ERROR", error);
            });
    }

    //=== MODO TRANSFERIR ===
    if (modo === "transferir") {
        console.log(`${modo}`);
        console.log(datosTabla);

        const datos = new FormData();
        datos.append("modo", modo);
        datos.append("producto", producto);
        datos.append("numeroProduccion", datosTabla.NumeroFabricacion);
        datos.append("receta", datosTabla.Receta);

        /*const objeto = Object.fromEntries(datos.entries());
        console.log(objeto);*/

        fetch("index.php?c=Ferrico&a=transferir", {
            

        })


        debugger
    }

});
