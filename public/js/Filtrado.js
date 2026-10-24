document.addEventListener("DOMContentLoaded", () => {
    const divfabricaciones = document.querySelector("#fabricaciones h2"); //<div>    
    const btnFiltrar = document.querySelector("#btnFiltrar"); //
    const btnRetroceder = document.querySelector("#btnRetroceder"); //
    const inputDensidad = document.querySelector("#densidad"); //<input>
    const inputRiqueza = document.querySelector("#riqueza"); //<input>
    const inputVolumenInicial = document.querySelector("#volumen_inicial"); //<input>
    const inputVolumenAgua = document.querySelector("#volumen_agua"); //<input>
    const inputRestos = document.querySelector("#input-restos");
    const labelRestos = document.querySelector("#label-restos");
    const txtNotas = document.getElementById("txtnotas"); //<textarea>
    const modo = localStorage.getItem("modo");
    let datosEdicion = JSON.parse(localStorage.getItem("datosTransferencia"));
    let depositoSeleccionado;
    let fabricaciones;
    let lista;

    btnRetroceder.addEventListener("click", () => { window.location.href = "index.php?c=Formulario&a=home"; });

    divfabricaciones.textContent = "Fabricaciones a filtrar: ";

    function inicializarFormulario(modo, datosEdicion) {
        //console.log(modo, datosEdicion);
        datosEdicion.modo = modo;
        //console.log(datosEdicion); debugger

        /*const data = new FormData();
        data.append("modo", modo);*/

        if (modo === "crear") {
            console.log(datosEdicion.M216);
            if (Array.isArray(datosEdicion.M216) && datosEdicion.M216.length > 0) {
                lista = datosEdicion.M216.map(f => f.NumeroFabricacion);
                const hayRestos = lista.includes("0000");
                lista = lista.filter(f => f !== "0000");

                if (hayRestos) {
                    lista.push("Restos");
                }

                divfabricaciones.textContent = `Fabricaciones a filtrar: ${ordenarFabricaciones(lista)}`;

            } else {
                divfabricaciones.textContent = "Sin fabricaciones que filtrar";
            }
        }

        if (modo === "editar") {
            console.log("Modo editar");
            btnFiltrar.textContent = "Editar";
            inputDensidad.disabled = false;
            inputRiqueza.disabled = false;
            inputVolumenAgua.disabled = false;
            divfabricaciones.textContent = `Fabricaciones a filtrar: ` + datosEdicion.filtraciones[0].Fab_Filtradas;
            inputDensidad.value = datosEdicion.filtraciones[0].Densidad;
            inputRiqueza.value = datosEdicion.filtraciones[0].Riqueza;
            inputVolumenAgua.value = formatearMiles(datosEdicion.filtraciones[0].Volumen_Agua);
            inputVolumenInicial.value = formatearMiles(datosEdicion.filtraciones[0].PesoInicialMezclador) //Es el volumen inicial en el formulario
            txtNotas.value = datosEdicion.filtraciones[0].NotasLab;
        }

        if (modo === "finalizar") {
            console.log("finalizar");
            console.log(datosEdicion);

            //Desactivar los input                    
            document.querySelectorAll("#contenedor input, #contenedor select, #contenedor input[type='radio']")
                .forEach(elemento => elemento.disabled = true);

            document.getElementById("input-restos").disabled = false;

            btnFiltrar.textContent = "Finalizar";
            inputDensidad.disabled = false;
            inputRiqueza.disabled = false;
            inputVolumenAgua.disabled = false;
            divfabricaciones.textContent = `Fabricaciones filtradas: ` + datosEdicion.filtraciones[0].Fab_Filtradas;
            inputDensidad.value = datosEdicion.filtraciones[0].Densidad;
            inputRiqueza.value = datosEdicion.filtraciones[0].Riqueza;
            inputVolumenAgua.value = formatearMiles(datosEdicion.filtraciones[0].Volumen_Agua);
            inputVolumenInicial.value = formatearMiles(datosEdicion.filtraciones[0].PesoInicialMezclador) //Es el volumen inicial en el formulario
            txtNotas.value = datosEdicion.filtraciones[0].NotasLab;
        }

        if (modo !== "finalizar") {    //MODIFICAR Y PONER IGUALES PARA EVITAR ERRORES
            inputRestos.style.display = "none";
            labelRestos.style.display = "none";
        }

        generarRadiosDepositos(datosEdicion);

        //---- LISTENER -----
        document.addEventListener("change", function (e) {
            if (e.target.name === "deposito") depositoSeleccionado = e.target.value;
            //console.log(depositoSeleccionado);                    
        });

        [inputVolumenInicial, inputVolumenAgua, inputRestos].forEach(input => {
            input.addEventListener("input", () => formatearNumero(input));
        });
    }  //FIN FUNCION inicializarFormulario

    function generarRadiosDepositos(datosEdicion) {
        //console.log("generarRadiosDepositos");
        console.log(datosEdicion);
        const contenedorDepositos = document.querySelector("#depositos fieldset");
        contenedorDepositos.innerHTML = "<legend>Depósitos</legend>";

        // Validación correcta
        /*if (!data.Depositos || data.Depositos.length === 0) {
            contenedorDepositos.textContent = "No hay depósitos disponibles";
            return;
        }*/

        if (!datosEdicion.Depositos || datosEdicion.Depositos.length === 0) {
            contenedorDepositos.textContent = "No hay depósitos disponibles";
            return;
        }

        //Generar radios
        const depositoEnUso = datosEdicion.Depositos.find(dep => dep.Estado == "En uso");         

        //console.log(datosEdicion.Depositos.find(dep => dep.Estado === "En uso")); debugger
        console.log(depositoEnUso?.Equipo_id);

        //data.Depositos.forEach(dep => {
        datosEdicion.Depositos.forEach(dep => {
            const id = `dep_${dep.Equipo_id}`;

            const label = document.createElement("label");
            label.className = "radio-label";
            label.htmlFor = id;

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "deposito";
            input.id = id;
            input.value = dep.Equipo_id;
            
            // ✔ Marcar el depósito que coincide con datosEdicion.Reactor            
            if (depositoEnUso && depositoEnUso.Equipo_id === dep.Equipo_id) {
                input.checked = true;
                depositoSeleccionado = dep.Equipo_id;
            }

            label.appendChild(input);
            label.appendChild(document.createTextNode(dep.NombreEquipo));
            contenedorDepositos.appendChild(label);
            contenedorDepositos.appendChild(document.createElement("br"));
        });
    }

    document.getElementById("btnAceptar").addEventListener("click", cerrarModal);

    function ordenarFabricaciones(lista) { //Ordenar las fabricaciones para mostrarlas en el formulario
        // Filtrar solo números (evita "Restos")        
        let nums = lista.filter(f => !isNaN(f)).map(Number);

        // Ordenar
        nums.sort((a, b) => a - b);

        // Si existe "Restos", lo añadimos al final
        if (lista.includes("Restos")) {
            nums.push("Restos");
        }

        // Devolver el texto final
        return nums.join(" + ");
    }

    //---------------------- MODO CREAR ---------------------------------//    
    //if (modo === "filtrado") {
    if (modo === "crear") {
        console.log("Crear filtrado");

        const datos = new FormData();
        datos.append("modo", modo);

        fetch("index.php?c=Leer&a=leerfiltrado", {
            method: "POST",
            body: datos
        })
            .then(response => response.json())
            .then(json => {
                datosEdicion = json;
                //console.log(datosEdicion);
                inicializarFormulario(modo, datosEdicion);
            })
            .catch(err => console.log("Error:", err.message));


        btnFiltrar.textContent = "Crear";

        btnFiltrar.addEventListener("click", () => {
            const densidad = inputDensidad.value;
            const riqueza = inputRiqueza.value;
            const vol_inicial_m216 = inputVolumenInicial.value;
            const vol_agua = inputVolumenAgua.value;
            const notas = txtNotas.value;

            lista = lista.sort((a, b) => a - b)
                .join(" + ");

            const datos = new FormData();
            datos.append("densidad", densidad);
            datos.append("riqueza", riqueza);
            datos.append("vol_inicial_m216", vol_inicial_m216.replace(/\./g, ""));
            datos.append("vol_agua", vol_agua.replace(/\./g, ""));
            datos.append("notas", notas);
            datos.append("fabricaciones", lista);
            datos.append("deposito", depositoSeleccionado);

            /*const objeto = Object.fromEntries(datos.entries());
            console.log(objeto); debugger*/

            fetch("index.php?c=Crear&a=filtrado", {
                method: "POST",
                body: datos
            })
                .then(response => response.json())
                .then(json => {
                    console.log(json);
                    if (json.ok) {
                        mostrarModal("Datos guardados correctamente")
                    } else {
                        console.log("json no ok");
                        alert(json.error)
                    }
                })
                .catch(err => console.log("Error:", err.message))
        })
    }

    // ---------------------- MODO EDITAR ---------------- //
    if (modo === "editar") {
        console.log("Modo EDITAR");

        const datos = new FormData();
        datos.append("modo", modo);

        fetch("index.php?c=Leer&a=leerfiltrado", {
            method: "POST",
            body: datos
        })
            .then(response => response.json())
            .then(json => {
                //console.log(json);
                datosEdicion = json;
                inicializarFormulario(modo, datosEdicion);
            })
            .catch(error => console.error("Error al leer datos:", error));

        btnFiltrar.addEventListener("click", () => {
            const densidad = inputDensidad.value;
            const riqueza = inputRiqueza.value;
            const vol_inicial_m216 = parseInt(inputVolumenInicial.value.replace(/\./g, ""), 10);
            const vol_agua = parseInt(inputVolumenAgua.value.replace(/\./g, ""), 10);
            const notas = txtNotas.value;           

            const datos = new FormData();
            datos.append("densidad", densidad);
            datos.append("riqueza", riqueza);
            datos.append("vol_inicial_M216", vol_inicial_m216);
            datos.append("deposito", depositoSeleccionado);
            datos.append("notas", notas);
            datos.append("volAgua", vol_agua);
            datos.append("volInicialMezclador", vol_inicial_m216);

            /*const objeto = Object.fromEntries(datos.entries());
            console.log(objeto); debugger*/

            fetch("index.php?c=Editar&a=filtrado", {
                method: "POST",
                body: datos
            })
                .then(response => response.json())
                .then(json => {
                    console.log(json);
                    if (json.ok) {
                        mostrarModal("Datos guardados correctamente")
                    } else {
                        console.log("json no ok");
                        alert(json.error)
                    }
                })
                .catch(err => console.log("Error:", err.message));
        });
    }

    // ---------------------- MODO FINALIZAR FILTRACIÓN ------------------- //
    //if (modo === "transferir") {
    if (modo === "finalizar") {
        console.log("Finalizar Filtrado");

        datos = new FormData();
        datos.append("modo", modo);

        fetch("index.php?c=Leer&a=leerfiltrado", {
            method: "POST",
            body: datos
        })
            .then(response => response.json())
            .then(json => {
                datosEdicion = json;
                console.log(datosEdicion);
                inicializarFormulario(modo, datosEdicion);
            })
            .catch(error => console.error("Error al leer datos:", error));

        btnFiltrar.addEventListener("click", () => {
            datos = new FormData();
            datos.append("restos", formatearNumero(inputRestos).replace(/\./g, ""));
            datos.append("id", datosEdicion.filtraciones[0].NumeroFabricacion);
            datos.append("fabricaciones", datosEdicion.filtraciones[0].Fab_Filtradas);
            datos.append("vol_inicial_m216", inputVolumenInicial.value.replace(/\./g, ""));
            datos.append("vol_agua", inputVolumenAgua.value.replace(/\./g, ""));
            datos.append("deposito", depositoSeleccionado);
            datos.append("densidad", inputDensidad.value);
            datos.append("valoracion", datosEdicion.filtraciones[0].EstadoAnalitica);     
            datos.append("notas", txtNotas.value);            

            /*const objeto = Object.fromEntries(datos.entries());
            console.log(objeto); debugger*/

            fetch("index.php?c=Transferir&a=filtrado", {
                method: "POST",
                body: datos
            })
                .then(response => response.json())
                .then(json => {
                    console.log(json);

                    if (json.ok) {
                        mostrarModal("Datos guardados correctamente");
                    } else {
                        alert(json.error);
                    }
                })
                .catch(err => console.log("Error:" + err.message));
        })
    }
});
