document.addEventListener("DOMContentLoaded", () => {
    const divfabricaciones = document.querySelector("#fabricaciones h2"); //<div>    const btnFiltrar = document.querySelector("#btnFiltrar"); //        
    const inputDensidad = document.querySelector("#densidad"); //<input>
    const inputRiqueza = document.querySelector("#riqueza"); //<input>
    const inputVolumenInicial = document.querySelector("#volumen_inicial"); //<input>
    const inputVolumenAgua = document.querySelector("#volumen_agua"); //<input>
    const txtNotas = document.getElementById("txtnotas"); //<textarea>

    //const modo = localStorage.getItem("modo");

    let depositoSeleccionado;

    divfabricaciones.textContent = "Fabricaciones a filtrar: ";

    function bloquearTodoMenosAnalitica() {
        const contenedor = document.querySelector("#fila-superior");
        console.log(contenedor);
        contenedor.querySelectorAll("input, select").forEach(el => {
            el.disabled = true;
        })
        const analitica = document.querySelector("#analitica");
        analitica.querySelectorAll("input, select").forEach(el => {
            el.disabled = false;
        })
    }

    const data = new FormData();
    //data.append("modo", modo);

    /*const objeto = Object.fromEntries(data.entries()); 
    console.log(objeto); debugger*/

    //function generarRadiosDepositos(modo, data) {
    function generarRadiosDepositos(data) {
        const contenedorDepositos = document.querySelector("#depositos fieldset");
        contenedorDepositos.innerHTML = "<legend>Depósitos</legend>";
        //console.log(data.depositos); return;

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

    return fetch("/HTML/app/models/leerFiltrado.php", {
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
            }

            generarRadiosDepositos(data);

            btnFiltrar.addEventListener("click", () => {
                console.log("Has pulsado Filtrar");

                const densidad = inputDensidad.value;
                const riqueza = inputRiqueza.value;
                const vol_inicial_m216 = inputVolumenInicial.value;
                const vol_agua = inputVolumenAgua.value;
                const notas = txtNotas.value;

                datos = new FormData();

                datos.append("densidad", densidad);
                datos.append("riqueza", riqueza);
                datos.append("vol_inicial_m216", vol_inicial_m216);
                datos.append("vol_agua", vol_agua);
                datos.append("notas", notas);
                datos.append("modo", "filtrar");

                fetch("index.php?c=Leer&a=leerfiltrado", {
                    method: "POST",
                    body: datos
                })
                    .then(response => response.json())
                    .then(json => console.log(json))
                    .catch(err => console.error("Error en fetch:", err));


                /*console.log(densidad, riqueza, vol_inicial_m216, vol_agua, notas, depositoSeleccionado); debugger
                const objeto = Object.fromEntries(datos.entries());
                console.log(objeto);*/
            })



            /*if (usuario === "laboratorio") {
                console.log("usuario: ", usuario); 
                bloquearTodoMenosAnalitica();
            }*/

        });
});