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

    btnRetroceder.addEventListener("click", () => { window.location.href = "index.php"; });

    divfabricaciones.textContent = "Fabricaciones a filtrar: ";

    function inicializarFormulario(modo, datosEdicion) {
        //console.log(datosEdicion); debugger        
        const data = new FormData();
        data.append("modo", modo);

        return fetch("index.php?c=Leer&a=leerfiltrado", {
            method: "POST",
            body: data
        })
            .then(response => response.json())
            .then(data => {
                //console.log(data); debugger

                if (modo === "crear") {
                    if (Array.isArray(data.M216) && data.M216.length > 0) {
                        lista = data.M216.map(f => f.NumeroFabricacion);
                        const hayRestos = lista.includes("0000");
                        lista = lista.filter(f => f !== "0000");

                        if (hayRestos) {
                            lista.push("Restos");
                        }

                        //divfabricaciones.textContent = `Fabricaciones a filtrar: ${lista.join(" + ")}`;                     
                        divfabricaciones.textContent = `Fabricaciones a filtrar: ${ordenarFabricaciones(lista)}`;

                    } else {
                        divfabricaciones.textContent = "Sin fabricaciones que filtrar";
                    }
                }

                if (modo === "editar" || modo === "transferir") {
                    inputDensidad.value = datosEdicion.Densidad;
                    inputRiqueza.value = datosEdicion.Riqueza;
                    inputVolumenInicial.value = formatearMiles(datosEdicion.PesoInicialMezclador) //Es el volumen inicial en el formulario
                    inputVolumenAgua.value = formatearMiles(datosEdicion.PesoFinalMezclador) //Es el volumen de agua en el formulario
                    txtNotas.value = datosEdicion.Notas;
                }

                if (modo !== "transferir") {
                    inputRestos.style.display = "none";
                    labelRestos.style.display = "none";
                }

                if (modo === "transferir") {
                    //Desactivar los input                    
                    document.querySelectorAll("#contenedor input, #contenedor select, #contenedor input[type='radio']")
                        .forEach(elemento => elemento.disabled = true);

                    document.getElementById("input-restos").disabled = false;
                }

                //console.log(data); debugger
                generarRadiosDepositos(data);

                //---- LISTENER -----

                document.addEventListener("change", function (e) {
                    if (e.target.name === "deposito") depositoSeleccionado = e.target.value;
                    //console.log(depositoSeleccionado);                    
                });

                [inputVolumenInicial, inputVolumenAgua, inputRestos].forEach(input => {
                    input.addEventListener("input", () => formatearNumero(input));
                });

            });
    }

function generarRadiosDepositos(data) {
        //console.log(data); debugger
        const contenedorDepositos = document.querySelector("#depositos fieldset");
        contenedorDepositos.innerHTML = "<legend>Depósitos</legend>";
        //console.log(data.Depositos); debugger;

        // Validación correcta
        if (!data.Depositos || data.Depositos.length === 0) {
            contenedorDepositos.textContent = "No hay depósitos disponibles";
            return;
        }

        //Generar radios
        data.Depositos.forEach(dep => {
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
            if (datosEdicion.Reactor === dep.Equipo_id) {
                input.checked = true;
                depositoSeleccionado = dep.Equipo_id;
            }

            label.appendChild(input);
            label.appendChild(document.createTextNode(dep.NombreEquipo));
            contenedorDepositos.appendChild(label);
            contenedorDepositos.appendChild(document.createElement("br"));
        });
    }

    function formatearNumero(input) {
        //console.log(input); debugger
        let valor = input.value.replace(/\D/g, "");
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        input.value = valor;
        return valor;
    }

    function formatearMiles(num) {
        return num
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function mostrarModal(mensaje) {
        //console.log(mensaje); debugger
        const modal = document.getElementById("modal");
        document.getElementById("modalMsg").textContent = mensaje;
        modal.hidden = false;
        modal.style.display = "flex";
    }

    function cerrarModal() {
        const modal = document.getElementById("modal");
        modal.hidden = true;
        modal.style.display = "none";
        window.location.href = "index.php";
    }

    document.getElementById("btnAceptar").addEventListener("click", cerrarModal);

    function ordenarFabricaciones(lista) {
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



    //---------------------- MODO CREAR ---------------------------------------//
    if (modo === "crear") {
        inicializarFormulario(modo);

        btnFiltrar.textContent = "Crear";

        btnFiltrar.addEventListener("click", () => {
            const densidad = inputDensidad.value;
            const riqueza = inputRiqueza.value;
            const vol_inicial_m216 = inputVolumenInicial.value;
            const vol_agua = inputVolumenAgua.value;
            const notas = txtNotas.value;

            lista = lista.sort((a, b) => a - b)
                .join(" + ");
            //console.log(lista); debugger

            datos = new FormData();
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
                    console.log(json)
                    if (json.ok) {
                        mostrarModal("Datos guardados correctamente")
                    } else {
                        console.log("json.no ok"); debugger
                        alert(json.error)
                    }
                })
                .catch(err => console.log("Error:", err.message))

        })
    }

    if (modo === "editar") {
        console.log("Editar filtrado");

        datosEdicion = JSON.parse(localStorage.getItem("datosEditables"));

        inicializarFormulario(modo, datosEdicion);

        btnFiltrar.textContent = "Editar";

        btnFiltrar.addEventListener("click", () => {
            datos = new FormData();

            //console.log(inputVolumenInicial);
            datos.append("densidad", inputDensidad.value);
            datos.append("riqueza", inputRiqueza.value);
            datos.append("notas", txtNotas.value);
            datos.append("deposito", depositoSeleccionado);
            datos.append("vol_inicial_M216", formatearNumero(inputVolumenInicial).replace(/\./g, ""));
            datos.append("vol_agua", formatearNumero(inputVolumenAgua).replace(/\./g, ""));

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
                        mostrarModal("Filtración editada correctamente");
                    } else {
                        alert(json.error);
                    }
                })
                .catch(err => console.log("Error:" + err.message));
        });
    }

    if (modo === "transferir") {
        console.log("Transferir");
        //console.log(datosEdicion); debugger

        inicializarFormulario(modo, datosEdicion);

        btnFiltrar.textContent = "Finalizar";

        btnFiltrar.addEventListener("click", () => {
            datos = new FormData();
            datos.append("restos", formatearNumero(inputRestos).replace(/\./g, ""));
            datos.append("id", datosEdicion.NumeroFabricacion);
            datos.append("fabricaciones", datosEdicion.Mezclador);  //Si lo sé que es Mezclador, pero se usaron campos para recoger datos aunque no tuvieran que ver con el nombre del campo
            datos.append("volumenInicial", datosEdicion.PesoInicialMezclador);
            datos.append("volumenAgua", datosEdicion.PesoFinalMezclador);
            datos.append("deposito", datosEdicion.Reactor);

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
