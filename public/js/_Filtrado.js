document.addEventListener("DOMContentLoaded", () => {
    const divfabricaciones = document.querySelector("#fabricaciones h2"); //<div>    
    const btnFiltrar = document.querySelector("#btnFiltrar"); //
    const btnRetroceder = document.querySelector("#btnRetroceder"); //
    const inputDensidad = document.querySelector("#densidad"); //<input>
    const inputRiqueza = document.querySelector("#riqueza"); //<input>
    const inputVolumenInicial = document.querySelector("#volumen_inicial"); //<input>
    const inputVolumenAgua = document.querySelector("#volumen_agua"); //<input>
    const txtNotas = document.getElementById("txtnotas"); //<textarea>

    const modo = localStorage.getItem("modo");
    const datosEdicion = JSON.parse(localStorage.getItem("datosEditables"));

    //console.log(modo); debugger

    btnRetroceder.addEventListener("click", () => {
        window.location.href = "index.php";
    });

    let depositoSeleccionado;

    divfabricaciones.textContent = "Fabricaciones a filtrar: ";

    /*function bloquearTodoMenosAnalitica() {
        const contenedor = document.querySelector("#fila-superior");
        console.log(contenedor);
        contenedor.querySelectorAll("input, select").forEach(el => {
            el.disabled = true;
        })
        const analitica = document.querySelector("#analitica");
        analitica.querySelectorAll("input, select").forEach(el => {
            el.disabled = false;
        })
    }*/

    
    //data.append("modo", modo);

    /*const objeto = Object.fromEntries(data.entries()); 
    console.log(objeto); debugger*/

    function inicializarFormulario(modo, datosEdicion) {
        //console.log(modo); debugger
        /*inputVolumenInicial.value = datosEdicion.PesoInicialMezclador;        
        inputVolumenAgua.value = datosEdicion.PesoFinalMezclador;
        inputRiqueza.value = datosEdicion.Riqueza;
        inputDensidad.value = datosEdicion.Densidad;
        txtNotas.value = datosEdicion.Notas;*/

        const datosFiltrado = new FormData();
        data.append("modo", modo);

        return fetch("index.php?c=Leer&a=filtrado", {
            method: "POST",
            body: data
        })
            .then(response => response.json())
            .then(data => { console.log(data); debugger   
                if (data.M216.length > 0) {
                    let lista = data.M216.map(f => f.NumeroFabricacion);
                    const hayRestos = lista.includes("0000");
                    lista = lista.filter(f => f !== "0000");

                    if (hayRestos) {
                        lista.push("Restos");
                    }

                    divfabricaciones.textContent = `Fabricaciones a filtrar: ${lista.join(" + ")}`;

                } else {
                    divfabricaciones.textContent = "Sin fabricaciones que filtrar";
                }
            });
        }

/*        function generarRadiosDepositos(data) {
            //console.log(data); debugger
            const contenedorDepositos = document.querySelector("#depositos fieldset");
            contenedorDepositos.innerHTML = "<legend>Depósitos</legend>";
            //console.log(data.Depositos); debugger;

            // Validación correcta
            if (!data.Depositos || data.Depositos.length === 0) {
                contenedorDepositos.textContent = "No hay depósitos disponibles";
                return;
            }

            // Generar radios
            data.Depositos.forEach(dep => {
                const id = `dep_${dep.Equipo_id}`;

                contenedorDepositos.innerHTML += `
            <label for="${id}">
                <input type="radio" name="deposito" id="${id}" value="${dep.Equipo_id}">
                ${dep.Equipo_id}
            </label><br>
        `;
            });

            contenedorDepositos.addEventListener("change", () => {
                const deposito = document.querySelector('input[name="deposito"]:checked');
                if (deposito) {
                    console.log("Depósito seleccionado:", deposito);
                    depositoSeleccionado = deposito.value;
                }
            });
        }
    };*/
    /*function formatearNumero(input) {
        let valor = input.value.replace(/\D/g, "");
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        input.value = valor;
    }

    [inputVolumenInicial, inputVolumenAgua].forEach(input => {
        input.addEventListener("input", () => formatearNumero(input));
    });*/


    /*return fetch("index.php?c=Leer&a=filtrado", {
        method: "POST",
        body: data
    })
        .then(response => response.json())
        .then(data => { //console.log(data); debugger   
            if (data.M216.length > 0) {
                let lista = data.M216.map(f => f.NumeroFabricacion);
                const hayRestos = lista.includes("0000");
                lista = lista.filter(f => f !== "0000");
 
                if (hayRestos) {
                    lista.push("Restos");
                }
 
                divfabricaciones.textContent = `Fabricaciones a filtrar: ${lista.join(" + ")}`;
 
            } else {
                divfabricaciones.textContent = "Sin fabricaciones que filtrar";
            }*/

    //generarRadiosDepositos(data);

    /*btnFiltrar.addEventListener("click", () => {
        console.log("Has pulsado CREAR"); debugger

        const densidad = inputDensidad.value;
        const riqueza = inputRiqueza.value;
        const vol_inicial_m216 = inputVolumenInicial.value;
        const vol_agua = inputVolumenAgua.value;
        const notas = txtNotas.value;

        datos = new FormData();

        datos.append("densidad", densidad);
        datos.append("riqueza", riqueza);
        datos.append("vol_inicial_m216", vol_inicial_m216.replace(/\./g, ""));
        datos.append("vol_agua", vol_agua.replace(/\./g, ""));
        datos.append("notas", notas);
        datos.append("fabricaciones", divfabricaciones.textContent);
        datos.append("deposito", depositoSeleccionado);

        fetch("index.php?c=Crear&a=filtrado", {
            method: "POST",
            body: datos
        })
            .then(response => response.json())
            .then(json => console.log(json))
            .catch(err => console.error("Error en fetch:", err));
        
        const objeto = Object.fromEntries(datos.entries());
        console.log(objeto); debugger
        window.location.href = "index.php";
    })*/


    // -------------- MODO: CREAR ---------------------
    /*if (modo === "crear") {
        console.log("crear filtrado");
        inicializarFormulario(modo, datosEdicion);

    }*/


    // --------------------- EDITAR ---------------------            
    if (modo === "editar") {
        console.log("editar filtrado");
        //console.log(datosEdicion); debugger

        /*fetch("index.php?c=Leer&a=leerfiltrado", {
            method: "POST",
            body: JSON.stringify({modo:"editar"})                    
        })                
        .then(response => response.json())
        .then(json => console.log(json))
        .catch(err => console.log("Error:", err.message));*/

        //console.log(json); debugger

        datosFiltrado = new FormData();

        datosFiltrado.append("numeroProduccion", datosEdicion.NumeroFabricacion);
        datosFiltrado.append("volInicialMezclador", datosEdicion.PesoInicialMezclador);
        datosFiltrado.append("volAgua", datosEdicion.PesoFinalMezclador);
        datosFiltrado.append("notas", datosEdicion.Notas);
        //datosFiltrado.append("deposito")

        /*objeto = Object.fromEntries(datosFiltrado.entries());
        console.log(objeto); debugger*/

        fetch("index.php?c=Editar&a=filtrado", {
            method: "POST",
            body: datosFiltrado
        })
            .then(response => response.json())
            .then(json => console.log(json))
            .catch(err => console.log("Error:", err.message));
    }

    inicializarFormulario(datosEdicion);

    /*if (usuario === "laboratorio") {
        console.log("usuario: ", usuario); 
        bloquearTodoMenosAnalitica();
    }*/

});
