document.addEventListener("DOMContentLoaded", async () => {
    const divFormulario = document.getElementById("filtros");
    const selectMostrar = document.getElementById("cantidad");
    const btnBuscar = document.getElementById("btnBuscar");
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

    // Obtener productos fabricados    
    const data = await cargarProductos();
    const productos = data.productos;
    // Generar checkboxes
    generarCheckBoxesProductos(productos);

    // Obtener archivo config.json
    const config = await CargarConfig();    
    const min = config.limitesSelect.inferior;
    const max = config.limitesSelect.superior;

    // Generar select
    configurarSelectCantidad(config);    

    btnBuscar.addEventListener("click", () => {
        const productosSeleccionados = [...document.querySelectorAll("input[name='producto']:checked")].map(cb => cb.value);
        const limite = selectMostrar.value;
        
        cargarAnaliticas(productosSeleccionados, limite);
    });

    
});