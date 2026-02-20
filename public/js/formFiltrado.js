document.addEventListener("DOMContentLoaded", () => {

    const txtfabricaciones = document.querySelector("#fabricaciones h2");
    const btnFiltrar = document.querySelector("#btnFiltrar");
    txtfabricaciones.textContent = "Fabricaciones a filtrar: ";

    const modo = localStorage.getItem("modo");

    const data = new FormData();

    data.append("modo", modo);

    /*const objeto = Object.fromEntries(data.entries()); 
    console.log(objeto); debugger*/

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
    
    });
});
