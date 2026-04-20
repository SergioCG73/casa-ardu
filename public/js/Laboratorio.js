document.addEventListener("DOMContentLoaded", async () => {
    const divFormulario = document.getElementById("filtros");    
    const DateDesde = document.getElementById("desde");    
    const DateHasta = document.getElementById("hasta");

    DateDesde.addEventListener("change", () => {
        console.log(DateDesde.value);        
    })

    DateHasta.addEventListener("change", () => {        
        console.log(DateHasta.value);
    })

    if (DateHasta.value < DateDesde.value) {
        alert("debe elegir una fecha Hasta mayor que Desde");
    }
    

    // Obtener produtos fabricados
    const data = await cargarProductos();
    const productos = data.productos;
    // Generar checkboxes
    generarCheckBoxesProductos(productos);

    const dateDesde = document.getElementById("desde");


});