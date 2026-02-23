document.addEventListener("DOMContentLoaded", () => {

    const txtfabricaciones = document.querySelector("#fabricaciones h2");
    const btnFiltrar = document.querySelector("#btnFiltrar");
    txtfabricaciones.textContent = "Fabricaciones a filtrar: ";

    console.log(depositos);

    const modo = localStorage.getItem("modo");
    //const usuario = "laboratorio";


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
    data.append("modo", modo);

    /*const objeto = Object.fromEntries(data.entries()); 
    console.log(objeto); debugger*/

    function generarRadiosDepositos(modo, data) {
        const contenedorDepositos = document.querySelector("#depositos fieldset");
        contenedorDepositos.innerHTML = "<legend>Depósitos</legend>";

        console.log(data.depositos); return;

        // Validación correcta
        if (!data.depositos || data.depositos.length === 0) {
            contenedorDepositos.textContent = "No hay depósitos disponibles";
            return;
        }

        // Generar radios
        data.depositos.forEach(dep => {
            const id = `dep_${dep.Equipo_id}`;

            contenedorDepositos.innerHTML += `
            <label for="${id}">
                <input type="radio" name="deposito" id="${id}" value="${dep.Equipo_id}">
                ${dep.Equipo_id}
            </label><br>
        `;
        });
    }    

    return fetch("/HTML/app/models/leerV2.php", {
        method: "POST",
        body: data
    })
        .then(response => response.json())
        .then(data => {
            if (data.fabricaciones.length > 0) {

                let lista = data.fabricaciones.map(f => f.NumeroFabricacion);
                const hayRestos = lista.includes("0000");
                lista = lista.filter(f => f !== "0000");

                if (hayRestos) {
                    lista.push("Restos");
                }
                txtfabricaciones.textContent = `Fabricaciones a filtrar: ${lista.join(" + ")}`;

            } else {
                txtfabricaciones.textContent = "Sin fabricaciones que filtrar";
            }

            generarRadiosDepositos(modo, data);

            if (usuario === "laboratorio") {
                console.log("usuario: ", usuario); 
                bloquearTodoMenosAnalitica();
            }

        });
});