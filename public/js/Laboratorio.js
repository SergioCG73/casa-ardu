document.addEventListener("DOMContentLoaded", async () => {
    const divFormulario = document.getElementById("filtros");
    const selectMostrar = document.getElementById("cantidad");
    const btnBuscar = document.getElementById("btnBuscar");
    const DateDesde = document.getElementById("desde");
    const DateHasta = document.getElementById("hasta");
    const tabla = document.getElementById("tabla");

    function activarEventosIconos() {
        const iconos = document.querySelectorAll(".icono-editar");

        iconos.forEach(icono => {
            icono.addEventListener("click", () => {
                const info = JSON.parse(icono.dataset.info);
                //console.log(info); debugger
                abrirModalSegunProducto(info);
            });
        });
    }

    function renderizarTabla(analiticas) {
        const tabla = document.getElementById("tabla");

        tabla.querySelectorAll("tr:not(:first-child)").forEach(tr => tr.remove());

        for (const producto in analiticas) {
            const filas = analiticas[producto];
            const nombreMostrar = nombres[producto.toLowerCase()] ?? producto;

            // CASO ESPECIAL: STRING (P18)
            if (typeof filas === "string") {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${nombreMostrar}</td>
                <td>${filas}</td>
                <td></td>
                <td></td>
                <td>
                    <img src="images/editar_azul_icon_20x20.png"
                         class="icono-editar"
                         data-info='${JSON.stringify({ producto, producciones: filas })}'
                         title="Editar fabricación">
                </td>
            `;
                tabla.appendChild(tr);
                continue;
            }

            // CASO ERROR
            if (filas.error) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${nombreMostrar}</td>
                <td colspan="4" style="color:red;">${filas.error}</td>
            `;
                tabla.appendChild(tr);
                continue;
            }

            // 🔥 FILTRAR SOLO PRODUCCIONES SIN ANALÍTICA
            const pendientes = Array.isArray(filas)
                ? filas.filter(f => !f.Analitica || f.Analitica === 0)
                : [];

            // SI NO HAY PENDIENTES → NO MOSTRAR NADA
            if (pendientes.length === 0) {
                continue;
            }

            // CASO NORMAL (solo pendientes)
            pendientes.forEach(fila => {
                const fechaRaw = fila.Fecha ?? fila.Hora_Inicio ?? fila.Hora_Finalizacion ?? "";
                const fecha = formatearFecha(fechaRaw);

                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${nombreMostrar}</td>
                <td>${fila.NumeroFabricacion ?? ""}</td>
                <td>${fecha}</td>
                <td>${fila.Estado ?? ""}</td>
                <td>
                    <img src="images/editar_azul_icon_20x20.png"
                         class="icono-editar"
                         data-info='${JSON.stringify({ ...fila, producto })}'
                         title="Editar fabricación">
                </td>
            `;
                tabla.appendChild(tr);
            });
        }

        activarEventosIconos();
    }

    function abrirModalSegunProducto(info) {
        //console.log(info); debugger
        document.getElementById("productoAnalitica").value = info.producto ?? "";
        document.getElementById("fabricacionAnalitica").value = info.NumeroFabricacion ?? "";
        document.getElementById("produccionesAnalitica").value = info.producciones ?? "";


        const contenedor = document.getElementById("contenedorCamposAnalitica");
        contenedor.innerHTML = obtenerCamposAnalitica(info.producto);

        abrirModalGenerico("modalAnalitica");
    }

    document.getElementById("cerrarModalAnalitica").addEventListener("click", () => {
        cerrarModalGenerico("modalAnalitica");
    });


    document.getElementById("formAnalitica").addEventListener("submit", async (e) => {
        e.preventDefault();

        const producto = document.getElementById("productoAnalitica").value;
        const fabricacion = document.getElementById("fabricacionAnalitica").value;

        const datos = recogerDatosAnalitica(producto);
        datos.producto = producto;
        datos.numeroFabricacion = fabricacion;        

        const prod = producto.toLowerCase();

        if (prod === "ferrico") {
            await fetch("index.php?c=Transferir&a=guardarAnaliticaFerrico", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            })
                .then(response => response.json())
                .then(datos => console.log(datos));

        } else if (prod === "sulfato") {
            await fetch("index.php?c=Transferir&a=guardarAnaliticaSulfato", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            })
                .then(response => response.json())
                .then(datos => console.log(datos));
        } else if (prod === "p18") {
            await fetch("index.php?c=Transferir&a=guardarAnaliticaP18", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            })
                .then(response => response.json())
                .then(datos => console.log(datos));
        }

        cerrarModalGenerico("modalAnalitica");

        const resp = await fetch("index.php?c=Leer&a=leeranaliticas");
        const analiticasActualizadas = await resp.json();

        const respuesta = await obtenerAnaliticas();
        //console.log(respuesta); debugger
        renderizarTabla(analiticasActualizadas.analiticas);
    });


    DateDesde.addEventListener("change", () => {
        console.log(DateDesde.value);
    });

    DateHasta.addEventListener("change", () => {
        console.log(DateHasta.value);
    });

    // Obtener productos fabricados    
    /*const data = await cargarProductos();
    const productos = data.productos;*/

    // Generar checkboxes
    //generarCheckBoxesProductos(productos);
    generarCheckBoxesProductos();

    // Obtener archivo config.json
    /*const config = await CargarConfig();
    const min = config.limitesSelect.inferior;
    const max = config.limitesSelect.superior;*/

    // Generar select
    //configurarSelectCantidad(config);
    configurarSelectCantidad();

    btnBuscar.addEventListener("click", async () => {
        const productosSeleccionados = [...document.querySelectorAll("input[name='producto']:checked")]
            .map(cb => cb.value);

        const limite = selectMostrar.value;
        const desde = DateDesde.value;
        const hasta = DateHasta.value;

        // Llamada a tu función que obtiene analíticas con filtros
        const respuesta = await obtenerAnaliticas(productosSeleccionados, limite, desde, hasta);

        // Aquí refrescas la tabla como ya haces más abajo
        renderizarTabla(respuesta.analiticas);
    });

    const respuesta = await obtenerAnaliticas();
    //console.log(respuesta);
    renderizarTabla(respuesta.analiticas);

}); 
